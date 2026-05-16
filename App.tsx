import { BarcodeScanningResult, useCameraPermissions } from "expo-camera";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, AppState, Linking, Text, View } from "react-native";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";
import { api } from "./src/api/client";
import { AccessManagementScreen } from "./src/components/AccessManagementScreen";
import { AppHeader } from "./src/components/AppHeader";
import { AuthScreen } from "./src/components/AuthScreen";
import { BottomNav } from "./src/components/BottomNav";
import { BranchScreen } from "./src/components/BranchScreen";
import { CertificateScreen } from "./src/components/CertificateScreen";
import { DashboardScreen } from "./src/components/DashboardScreen";
import { HomeScreen } from "./src/components/HomeScreen";
import { InvoiceReviewModal } from "./src/components/InvoiceReviewModal";
import { AppNotification, NotificationsScreen } from "./src/components/NotificationsScreen";
import { ProductsScreen } from "./src/components/ProductsScreen";
import { ProfileScreen } from "./src/components/ProfileScreen";
import { PlansScreen } from "./src/components/PlansScreen";
import { ScanScreen } from "./src/components/ScanScreen";
import { SideMenu } from "./src/components/SideMenu";
import { StockRequestsScreen } from "./src/components/StockRequestsScreen";
import { styles } from "./src/styles/appStyles";
import {
  AppModule,
  AuthUser,
  BranchOption,
  CertificateStatus,
  CreateManagedUserPayload,
  EditableInvoiceProduct,
  PlanDefinition,
  RegisterCredentials,
  Screen,
  UpdateProfilePayload,
  UpsertCertificatePayload,
  UserPlan,
  UserRole
} from "./src/types/app";
import { BranchTransfer, BranchTransferStatus, InvoiceResult, Product, StockRequest } from "./src/types/product";
import { FALLBACK_PLANS, canAccessModule, canManageAccess, canManageCertificate, formatQuantity, getScreenTitle, parseQuantity } from "./src/utils/appHelpers";
import { getExpoPushToken } from "./src/utils/pushNotifications";

const BRANCH_OPTIONS: BranchOption[] = [
  { code: "CENTRAL", name: "Estoque central" },
  { code: "FILIAL-01", name: "Filial 01" },
  { code: "FILIAL-02", name: "Filial 02" },
  { code: "FILIAL-03", name: "Filial 03" }
];

const LIVE_SYNC_INTERVAL_MS = 15000;

export default function App() {
  return (
    <SafeAreaProvider>
      <MainApp />
    </SafeAreaProvider>
  );
}
function MainApp() {
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [managedUsers, setManagedUsers] = useState<AuthUser[]>([]);
  const [certificateStatus, setCertificateStatus] = useState<CertificateStatus | null>(null);
  const [plans, setPlans] = useState<PlanDefinition[]>(FALLBACK_PLANS);
  const [screen, setScreen] = useState<Screen>("home");
  const [menuOpen, setMenuOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [branchTransfers, setBranchTransfers] = useState<BranchTransfer[]>([]);
  const [stockRequests, setStockRequests] = useState<StockRequest[]>([]);
  const stockRequestStatusRef = useRef<Record<string, StockRequest["status"]>>({});
  const liveSyncInFlightRef = useRef(false);
  const registeredPushTokenRef = useRef<string | null>(null);
  const [branchProductId, setBranchProductId] = useState("");
  const [branchProductSearch, setBranchProductSearch] = useState("");
  const [sourceBranch, setSourceBranch] = useState<BranchOption>(BRANCH_OPTIONS[0]);
  const [sourceBranchSearch, setSourceBranchSearch] = useState("");
  const [targetBranch, setTargetBranch] = useState<BranchOption | null>(null);
  const [targetBranchSearch, setTargetBranchSearch] = useState("");
  const [branchQuantity, setBranchQuantity] = useState("");
  const [branchLot, setBranchLot] = useState("");
  const [branchObservation, setBranchObservation] = useState("");
  const [pendingInvoice, setPendingInvoice] = useState<InvoiceResult | null>(null);
  const [pendingProducts, setPendingProducts] = useState<EditableInvoiceProduct[]>([]);
  const [editingProductIndex, setEditingProductIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [liveNotifications, setLiveNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [homeRefreshing, setHomeRefreshing] = useState(false);
  const [scannerEnabled, setScannerEnabled] = useState(true);

  const loadProducts = useCallback(async () => {
    if (!authToken) return;
    const data = await api.listProducts(authToken);
    setProducts(data);
  }, [authToken]);

  const loadBranchTransfers = useCallback(async () => {
    if (!authToken) return;
    const data = await api.listBranchTransfers(authToken);
    setBranchTransfers(data);
  }, [authToken]);

  const loadStockRequests = useCallback(async () => {
    if (!authToken) return;
    const data = await api.listStockRequests(authToken);
    setStockRequests(data);
  }, [authToken]);

  const loadPlans = useCallback(async () => {
    const data = await api.listPlans();
    setPlans(data);
  }, []);

  useEffect(() => {
    loadPlans().catch(() => undefined);
  }, [loadPlans]);

  const loadManagedUsers = useCallback(async () => {
    if (!authToken) return;
    const users = await api.listUsers(authToken);
    setManagedUsers(users);
  }, [authToken]);

  const loadCertificateStatus = useCallback(async () => {
    if (!authToken) return;
    const status = await api.getCertificateStatus(authToken);
    setCertificateStatus(status);
  }, [authToken]);

  useEffect(() => {
    if (!currentUser) return;

    loadProducts().catch(() => {
      setError("Não consegui conectar na API. Confira se o backend está rodando.");
    });
    loadStockRequests().catch(() => undefined);
    if (canAccessModule(currentUser, "branches")) {
      loadBranchTransfers().catch(() => undefined);
    }
    if (canManageCertificate(currentUser)) {
      loadCertificateStatus().catch(() => undefined);
    }
  }, [currentUser, loadProducts, loadBranchTransfers, loadStockRequests, loadCertificateStatus]);

  const refreshHome = useCallback(async () => {
    if (!currentUser) return;

    try {
      setHomeRefreshing(true);
      setError(null);

      const tasks = [loadProducts(), loadStockRequests(), loadPlans()];

      if (canAccessModule(currentUser, "branches")) {
        tasks.push(loadBranchTransfers());
      }

      if (canManageAccess(currentUser)) {
        tasks.push(loadManagedUsers());
      }

      if (canManageCertificate(currentUser)) {
        tasks.push(loadCertificateStatus());
      }

      await Promise.all(tasks);
    } catch {
      setError("Nao consegui atualizar a tela inicial.");
    } finally {
      setHomeRefreshing(false);
    }
  }, [currentUser, loadProducts, loadStockRequests, loadPlans, loadBranchTransfers, loadManagedUsers, loadCertificateStatus]);

  useEffect(() => {
    if (
      !currentUser ||
      !authToken ||
      (!canAccessModule(currentUser, "products") && !canAccessModule(currentUser, "stock_requests"))
    ) {
      return;
    }

    let cancelled = false;

    const refreshLiveData = async () => {
      if (cancelled || liveSyncInFlightRef.current) return;

      liveSyncInFlightRef.current = true;

      try {
        await loadStockRequests();
      } finally {
        liveSyncInFlightRef.current = false;
      }
    };

    const interval = setInterval(() => {
      if (AppState.currentState === "active") {
        refreshLiveData().catch(() => undefined);
      }
    }, LIVE_SYNC_INTERVAL_MS);

    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        refreshLiveData().catch(() => undefined);
      }
    });

    return () => {
      cancelled = true;
      clearInterval(interval);
      subscription.remove();
    };
  }, [authToken, currentUser?._id, currentUser?.role, currentUser?.plan, currentUser?.modules, loadStockRequests]);

  useEffect(() => {
    if (!currentUser) return;

    const previousStatuses = stockRequestStatusRef.current;
    const nextStatuses: Record<string, StockRequest["status"]> = {};
    const statusNotifications: AppNotification[] = [];

    for (const request of stockRequests) {
      nextStatuses[request._id] = request.status;

      const previousStatus = previousStatuses[request._id];
      const isRequester = request.requester === currentUser._id;

      if (!previousStatus || previousStatus === request.status || !isRequester) {
        continue;
      }

      if (request.status === "approved" || request.status === "rejected") {
        const approved = request.status === "approved";

        statusNotifications.push({
          id: `stock-request-${request._id}-${request.status}`,
          title: approved ? "Retirada aprovada" : "Retirada reprovada",
          text: `${request.productName}: ${request.quantity} unidade(s). ${
            request.reviewerName ? `${approved ? "Aprovada" : "Reprovada"} por ${request.reviewerName}.` : ""
          }`.trim(),
          tone: approved ? "info" : "warning"
        });
      }
    }

    stockRequestStatusRef.current = nextStatuses;

    if (statusNotifications.length) {
      setLiveNotifications((current) => [
        ...statusNotifications.filter((notification) => !current.some((item) => item.id === notification.id)),
        ...current
      ]);

      if (canAccessModule(currentUser, "products")) {
        loadProducts().catch(() => undefined);
      }
    }
  }, [currentUser, stockRequests, loadProducts]);

  useEffect(() => {
    if (!authToken || !currentUser) return;

    let cancelled = false;

    getExpoPushToken()
      .then(async (expoPushToken) => {
        if (!expoPushToken || cancelled || registeredPushTokenRef.current === expoPushToken) {
          return;
        }

        await api.registerPushToken(authToken, expoPushToken);
        registeredPushTokenRef.current = expoPushToken;
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [authToken, currentUser?._id]);

  async function handleLogin(email: string, password: string) {
    try {
      setLoading(true);
      setError(null);
      const session = await api.login({ email, password });
      setAuthToken(session.token);
      setCurrentUser(session.user);
      setScreen("home");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao entrar.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(payload: RegisterCredentials) {
    try {
      setLoading(true);
      setError(null);
      const session = await api.register(payload);
      setAuthToken(session.token);
      setCurrentUser(session.user);
      setScreen("home");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao criar acesso.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    setAuthToken(null);
    setCurrentUser(null);
    setManagedUsers([]);
    setCertificateStatus(null);
    setStockRequests([]);
    stockRequestStatusRef.current = {};
    registeredPushTokenRef.current = null;
    setLiveNotifications([]);
    setPendingInvoice(null);
    setPendingProducts([]);
    setEditingProductIndex(null);
    setMenuOpen(false);
    setScreen("home");
    setError(null);
  }

  function ensureModule(module: AppModule) {
    if (canAccessModule(currentUser, module)) return true;
    Alert.alert("Acesso bloqueado", "Seu usuário não tem acesso a este módulo.");
    return false;
  }

  async function handleInvoicePreview(action: () => Promise<InvoiceResult>) {
    try {
      setLoading(true);
      setError(null);
      const result = await action();
      setPendingInvoice(result);
      setPendingProducts(
        result.products.map((product) => ({
          ...product,
          quantityInput: formatQuantity(product.quantity),
          observation: ""
        }))
      );
      setScannerEnabled(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao processar nota.";
      setError(message);
      Alert.alert("Leitura não concluída", message);
    } finally {
      setLoading(false);
    }
  }

  function handleBarcodeScanned(result: BarcodeScanningResult) {
    if (!authToken || !scannerEnabled || loading) return;
    setScannerEnabled(false);
    handleInvoicePreview(() => api.scanInvoice(authToken, result.data));
  }

  function handleManualInvoiceKey(value: string) {
    if (!authToken || loading) return;
    const accessKey = value.replace(/\D/g, "");

    if (accessKey.length !== 44) {
      Alert.alert("Chave invalida", "A chave de acesso da nota precisa ter 44 digitos.");
      return;
    }

    setScannerEnabled(false);
    handleInvoicePreview(() => api.scanInvoice(authToken, accessKey));
  }

  function handleCaptureWithAi() {
    Alert.alert(
      "Captura com IA",
      "A foto foi capturada. O proximo passo e conectar OCR/IA no backend para extrair a chave de acesso."
    );
  }

  function goToScan() {
    if (!ensureModule("scan")) return;
    setError(null);
    setMenuOpen(false);
    setScannerEnabled(true);
    setScreen("scan");
  }

  function goToProducts() {
    if (!ensureModule("products")) return;
    setError(null);
    setMenuOpen(false);
    setScreen("products");
    loadProducts().catch(() => setError("Não consegui atualizar os produtos."));
    loadStockRequests().catch(() => undefined);
  }

  function goToDashboard() {
    if (!ensureModule("dashboard")) return;
    setError(null);
    setMenuOpen(false);
    setScreen("dashboard");
  }

  function goToBranches() {
    if (!ensureModule("branches")) return;
    setError(null);
    setMenuOpen(false);
    setScreen("branches");
    Promise.all([loadProducts(), loadBranchTransfers()]).catch(() => setError("Não consegui atualizar filial."));
  }

  function goToStockRequests() {
    if (!ensureModule("stock_requests")) return;
    setError(null);
    setMenuOpen(false);
    setScreen("stock_requests");
    loadStockRequests().catch(() => setError("Nao consegui atualizar as solicitacoes."));
  }

  function goToAccess() {
    if (!canManageAccess(currentUser)) {
      Alert.alert("Acesso bloqueado", "Apenas usuários principal ou master gerenciam acessos.");
      return;
    }

    setError(null);
    setMenuOpen(false);
    setScreen("access");
    loadManagedUsers().catch(() => setError("Não consegui carregar os usuários."));
  }

  function goToCertificate() {
    if (!canManageCertificate(currentUser)) {
      Alert.alert("Acesso bloqueado", "Apenas usuários main ou master gerenciam o certificado.");
      return;
    }

    setError(null);
    setMenuOpen(false);
    setScreen("certificate");
    loadCertificateStatus().catch(() => setError("Não consegui carregar o certificado."));
  }

  function goToProfile() {
    setError(null);
    setMenuOpen(false);
    setScreen("profile");
  }

  function goToBilling() {
    setError(null);
    setMenuOpen(false);
    setScreen("billing");
    loadPlans().catch(() => setPlans(FALLBACK_PLANS));
  }

  function simulateInvoice() {
    if (!authToken || !ensureModule("scan")) return;
    handleInvoicePreview(() => api.simulateInvoice(authToken));
  }

  function closeInvoiceReview() {
    setPendingInvoice(null);
    setPendingProducts([]);
    setEditingProductIndex(null);
    setScannerEnabled(true);
  }

  function backToScannerFromReview() {
    closeInvoiceReview();
    goToScan();
  }

  function updatePendingProduct(index: number, changes: Partial<EditableInvoiceProduct>) {
    setPendingProducts((current) =>
      current.map((product, productIndex) => (productIndex === index ? { ...product, ...changes } : product))
    );
  }

  function confirmCommitStock() {
    if (!pendingInvoice || loading) return;

    const invalidProduct = pendingProducts.find((product) => parseQuantity(product.quantityInput) <= 0);

    if (invalidProduct) {
      Alert.alert("Quantidade inválida", `Confira a quantidade de ${invalidProduct.name}.`);
      return;
    }

    Alert.alert(
      "Enviar para o estoque?",
      "Tem certeza que deseja enviar para o estoque? Após essa ação não poderá ser desfeita.",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Enviar", style: "destructive", onPress: commitStock }
      ]
    );
  }

  async function commitStock() {
    if (!pendingInvoice || !authToken) return;

    try {
      setLoading(true);
      setError(null);

      await api.commitStock(authToken, {
        invoiceKey: pendingInvoice.invoiceKey,
        source: pendingInvoice.source,
        products: pendingProducts.map((product) => ({
          name: product.name,
          ean: product.ean,
          quantity: parseQuantity(product.quantityInput),
          invoiceQuantity: product.quantity,
          observation: product.observation?.trim() || undefined
        }))
      });

      setPendingInvoice(null);
      setPendingProducts([]);
      setEditingProductIndex(null);
      await loadProducts();
      Alert.alert("Entrada registrada", "Os produtos foram enviados para o estoque.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao enviar produtos ao estoque.";
      setError(message);
      Alert.alert("Entrada não concluída", message);
    } finally {
      setLoading(false);
    }
  }

  async function registerMissingDelivered(productId: string, quantity: number, observation?: string) {
    if (!authToken) return;

    await api.registerMissingDelivered(authToken, productId, {
      quantity,
      observation
    });
    await loadProducts();
  }

  async function createStockRequest(productId: string, quantity: number, observation?: string) {
    if (!authToken) return;

    await api.createStockRequest(authToken, {
      productId,
      quantity,
      observation
    });
    await Promise.all([loadProducts(), loadStockRequests()]);
  }

  function confirmStockRequestStatus(id: string, status: "approved" | "rejected") {
    const approved = status === "approved";

    Alert.alert(
      approved ? "Aceitar retirada?" : "Recusar retirada?",
      approved ? "O estoque será baixado do produto." : "A solicitação será marcada como recusada.",
      [
        { text: "Voltar", style: "cancel" },
        {
          text: approved ? "Aceitar" : "Recusar",
          style: approved ? "default" : "destructive",
          onPress: () => updateStockRequestStatus(id, status)
        }
      ]
    );
  }

  async function updateStockRequestStatus(id: string, status: "approved" | "rejected") {
    if (!authToken) return;

    try {
      setLoading(true);
      setError(null);
      await api.updateStockRequestStatus(authToken, id, status);
      await Promise.all([loadProducts(), loadStockRequests()]);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao analisar solicitação.";
      setError(message);
      Alert.alert("Solicitação não atualizada", message);
    } finally {
      setLoading(false);
    }
  }

  async function createBranchTransfer() {
    if (!authToken) return;

    const quantity = parseQuantity(branchQuantity);

    if (!branchProductId || !targetBranch || quantity <= 0) {
      Alert.alert("Dados incompletos", "Escolha produto, filial destino e quantidade para reservar.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await api.createBranchTransfer(authToken, {
        productId: branchProductId,
        sourceBranch: sourceBranch.name,
        sourceBranchCode: sourceBranch.code,
        targetBranch: targetBranch.name,
        targetBranchCode: targetBranch.code,
        quantity,
        lot: branchLot.trim() || undefined,
        observation: branchObservation.trim() || undefined
      });
      setBranchProductId("");
      setBranchProductSearch("");
      setSourceBranch(BRANCH_OPTIONS[0]);
      setSourceBranchSearch("");
      setTargetBranch(null);
      setTargetBranchSearch("");
      setBranchQuantity("");
      setBranchLot("");
      setBranchObservation("");
      await Promise.all([loadProducts(), loadBranchTransfers()]);
      Alert.alert("Estoque reservado", `Produto reservado para a filial ${targetBranch.name}.`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao reservar estoque.";
      setError(message);
      Alert.alert("Reserva não concluída", message);
    } finally {
      setLoading(false);
    }
  }

  async function updateBranchTransferStatus(id: string, status: Exclude<BranchTransferStatus, "reserved">) {
    if (!authToken) return;

    try {
      setLoading(true);
      setError(null);
      await api.updateBranchTransferStatus(authToken, id, status);
      await Promise.all([loadProducts(), loadBranchTransfers()]);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao movimentar filial.";
      setError(message);
      Alert.alert("Movimentação não concluída", message);
    } finally {
      setLoading(false);
    }
  }

  function confirmCancelBranchTransfer(id: string) {
    Alert.alert(
      "Cancelar movimentação?",
      "O estoque reservado será devolvido para a filial de origem.",
      [
        { text: "Voltar", style: "cancel" },
        {
          text: "Cancelar movimentação",
          style: "destructive",
          onPress: () => cancelBranchTransfer(id)
        }
      ]
    );
  }

  async function cancelBranchTransfer(id: string) {
    if (!authToken) return;

    try {
      setLoading(true);
      setError(null);
      await api.cancelBranchTransfer(authToken, id);
      await Promise.all([loadProducts(), loadBranchTransfers()]);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao cancelar movimentação.";
      setError(message);
      Alert.alert("Cancelamento não concluído", message);
    } finally {
      setLoading(false);
    }
  }

  async function updateManagedUser(user: AuthUser, changes: Partial<AuthUser>) {
    if (!authToken) return;

    try {
      setLoading(true);
      setError(null);
      const updatedUser = await api.updateUserAccess(authToken, user._id, {
        role: changes.role,
        plan: changes.plan,
        enabled: changes.enabled,
        modules: changes.modules
      });
      setManagedUsers((current) => current.map((item) => (item._id === updatedUser._id ? updatedUser : item)));
      if (currentUser?._id === updatedUser._id) {
        setCurrentUser(updatedUser);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao atualizar acesso.";
      setError(message);
      Alert.alert("Acesso não atualizado", message);
    } finally {
      setLoading(false);
    }
  }

  function toggleUserEnabled(user: AuthUser) {
    updateManagedUser(user, { enabled: !user.enabled });
  }

  function toggleUserModule(user: AuthUser, module: AppModule) {
    const modules = user.modules.includes(module)
      ? user.modules.filter((item) => item !== module)
      : [...user.modules, module];

    updateManagedUser(user, { modules });
  }

  function changeUserRole(user: AuthUser, role: UserRole) {
    if (user.role === role) return;

    const message =
      role === "master"
        ? "Tem certeza que deseja transformar este usuário em master? Ele terá acesso a todos os módulos e poderá gerenciar usuários padrão conforme o plano."
        : "Tem certeza que deseja alterar a função deste usuário?";

    Alert.alert("Alterar função?", message, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Confirmar",
        style: role === "master" ? "destructive" : "default",
        onPress: () => updateManagedUser(user, { role })
      }
    ]);
  }

  function changeUserPlan(user: AuthUser, plan: UserPlan) {
    updateManagedUser(user, { plan });
  }

  async function createManagedUser(payload: CreateManagedUserPayload) {
    if (!authToken) return;

    try {
      setLoading(true);
      setError(null);
      const createdUser = await api.createUser(authToken, payload);
      setManagedUsers((current) => [createdUser, ...current]);
      Alert.alert("Acesso cadastrado", `Usuário ${createdUser.email} foi cadastrado.`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao cadastrar usuário.";
      setError(message);
      Alert.alert("Cadastro não concluído", message);
    } finally {
      setLoading(false);
    }
  }

  async function updateProfile(payload: UpdateProfilePayload) {
    if (!authToken) return;

    try {
      setLoading(true);
      setError(null);
      const updatedUser = await api.updateProfile(authToken, payload);
      setCurrentUser(updatedUser);
      Alert.alert("Perfil atualizado", "Suas informações foram salvas.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao atualizar perfil.";
      setError(message);
      Alert.alert("Perfil não atualizado", message);
    } finally {
      setLoading(false);
    }
  }

  async function saveCertificate(payload: UpsertCertificatePayload) {
    if (!authToken) return;

    try {
      setLoading(true);
      setError(null);
      const certificate = await api.saveCertificate(authToken, payload);
      setCertificateStatus({ configured: Boolean(certificate), certificate });
      Alert.alert("Certificado salvo", "O certificado A1 foi vinculado a esta organizacão.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao salvar certificado.";
      setError(message);
      Alert.alert("Certificado não salvo", message);
    } finally {
      setLoading(false);
    }
  }

  async function deleteCertificate() {
    if (!authToken) return;

    try {
      setLoading(true);
      setError(null);
      await api.deleteCertificate(authToken);
      setCertificateStatus({ configured: false, certificate: null });
      Alert.alert("Certificado removido", "O certificado A1 foi removido desta organização.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao remover certificado.";
      setError(message);
      Alert.alert("Certificado não removido", message);
    } finally {
      setLoading(false);
    }
  }

  async function requestPlanCheckout(plan: UserPlan) {
    if (!authToken) return;

    try {
      setLoading(true);
      setError(null);
      const result = await api.requestPlanCheckout(authToken, plan);
      const updatedUser = await api.getProfile(authToken);
      setCurrentUser(updatedUser);

      if (result.checkoutUrl) {
        Alert.alert("Upgrade iniciado", result.message, [
          { text: "Depois", style: "cancel" },
          { text: "Abrir pagamento", onPress: () => Linking.openURL(result.checkoutUrl!) }
        ]);
        return;
      }

      Alert.alert("Planos", result.message);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao iniciar upgrade.";
      setError(message);
      Alert.alert("Upgrade nao iniciado", message);
    } finally {
      setLoading(false);
    }
  }

  async function requestPasswordReset(email: string) {
    try {
      setLoading(true);
      setError(null);
      const result = await api.requestPasswordReset(email);
      Alert.alert("Redefinição solicitada", result.resetToken ? `${result.message}\nToken dev: ${result.resetToken}` : result.message);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao solicitar redefinição.";
      setError(message);
      Alert.alert("Redefinição não solicitada", message);
    } finally {
      setLoading(false);
    }
  }

  async function adminResetPassword(user: AuthUser, password: string) {
    if (!authToken) return;

    try {
      setLoading(true);
      setError(null);
      await api.adminResetPassword(authToken, user._id, password);
      Alert.alert("Senha atualizada", `A senha de ${user.email} foi redefinida.`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao redefinir senha.";
      setError(message);
      Alert.alert("Senha não atualizada", message);
    } finally {
      setLoading(false);
    }
  }

  const canAnalyzeStockRequests = canAccessModule(currentUser, "stock_requests");
  const pendingStockRequests = canAnalyzeStockRequests
    ? stockRequests.filter((request) => request.status === "pending")
    : [];
  const notifications: AppNotification[] = [
    ...liveNotifications,
    ...(error
      ? [
          {
            id: "error",
            title: "Atenção",
            text: error,
            tone: "error" as const
          }
        ]
      : []),
    ...(pendingProducts.length > 0
      ? [
          {
            id: "pending-products",
            title: "Entrada pendente",
            text: `${pendingProducts.length} produto(s) aguardando envio ao estoque.`,
            tone: "warning" as const
          }
        ]
      : [])
  ];
  const hasNotifications = notifications.length + pendingStockRequests.length > 0;

  if (!currentUser) {
    return (
      <View style={styles.safeArea}>
        <StatusBar style="dark" />
        <AuthScreen
          loading={loading}
          error={error}
          onLogin={handleLogin}
          onRegister={handleRegister}
          onRequestPasswordReset={requestPasswordReset}
        />
      </View>
    );
  }

  return (
    <View style={styles.safeArea}>
      <StatusBar style={screen === "scan" ? "light" : "dark"} />
      <AppHeader
        title={getScreenTitle(screen, pendingInvoice)}
        onMenuPress={() => setMenuOpen(true)}
        onNotificationPress={() => {
          setError(null);
          setLiveNotifications([]);
          setScreen("notifications");
        }}
        loading={loading}
        topInset={insets.top}
        hasNotification={hasNotifications}
      />

      <View style={styles.screenBody}>
        {error && <Text style={styles.errorText}>{error}</Text>}

        {screen === "home" && (
          <HomeScreen
            productsCount={products.length}
            pendingCount={pendingProducts.length}
            pendingStockRequestsCount={pendingStockRequests.length}
            refreshing={homeRefreshing}
            user={currentUser}
            onRefresh={refreshHome}
            onScan={goToScan}
            onDashboard={goToDashboard}
            onProducts={goToProducts}
            onBranches={goToBranches}
            onStockRequests={goToStockRequests}
            onAccess={goToAccess}
            onCertificate={goToCertificate}
            onBilling={goToBilling}
            onSimulate={simulateInvoice}
          />
        )}

        {screen === "scan" && (
          <ScanScreen
            permissionGranted={permission?.granted}
            loading={loading}
            scannerEnabled={scannerEnabled}
            topInset={insets.top}
            onRequestPermission={requestPermission}
            onBarcodeScanned={handleBarcodeScanned}
            onManualSubmit={handleManualInvoiceKey}
            onCaptureWithAi={handleCaptureWithAi}
            onSimulate={simulateInvoice}
          />
        )}

        {screen === "dashboard" && authToken && (
          <DashboardScreen token={authToken} />
        )}

        {screen === "products" && (
          <ProductsScreen
            products={products}
            onScan={goToScan}
            onSimulate={simulateInvoice}
            onRegisterMissingDelivered={registerMissingDelivered}
            onCreateStockRequest={createStockRequest}
          />
        )}

        {screen === "branches" && (
          <BranchScreen
            products={products}
            transfers={branchTransfers}
            selectedProductId={branchProductId}
            productSearch={branchProductSearch}
            branchOptions={BRANCH_OPTIONS}
            sourceBranch={sourceBranch}
            sourceBranchSearch={sourceBranchSearch}
            targetBranch={targetBranch}
            targetBranchSearch={targetBranchSearch}
            quantity={branchQuantity}
            lot={branchLot}
            observation={branchObservation}
            loading={loading}
            onSelectProduct={setBranchProductId}
            onChangeProductSearch={setBranchProductSearch}
            onSelectSourceBranch={setSourceBranch}
            onChangeSourceBranchSearch={setSourceBranchSearch}
            onSelectTargetBranch={setTargetBranch}
            onChangeTargetBranchSearch={setTargetBranchSearch}
            onChangeQuantity={setBranchQuantity}
            onChangeLot={setBranchLot}
            onChangeObservation={setBranchObservation}
            onCreateTransfer={createBranchTransfer}
            onUpdateStatus={updateBranchTransferStatus}
            onCancelTransfer={confirmCancelBranchTransfer}
          />
        )}

        {screen === "stock_requests" && (
          <StockRequestsScreen
            requests={stockRequests}
            loading={loading}
            onApprove={(id) => confirmStockRequestStatus(id, "approved")}
            onReject={(id) => confirmStockRequestStatus(id, "rejected")}
          />
        )}

        {screen === "access" && (
          <AccessManagementScreen
            currentUser={currentUser}
            users={managedUsers}
            loading={loading}
            onCreateUser={createManagedUser}
            onToggleEnabled={toggleUserEnabled}
            onToggleModule={toggleUserModule}
            onChangeRole={changeUserRole}
            onChangePlan={changeUserPlan}
            onAdminResetPassword={adminResetPassword}
          />
        )}

        {screen === "certificate" && (
          <CertificateScreen
            status={certificateStatus}
            loading={loading}
            onRefresh={loadCertificateStatus}
            onSave={saveCertificate}
            onDelete={deleteCertificate}
          />
        )}

        {screen === "billing" && (
          <PlansScreen
            user={currentUser}
            plans={plans}
            loading={loading}
            onSelectPlan={requestPlanCheckout}
          />
        )}

        {screen === "profile" && (
          <ProfileScreen
            user={currentUser}
            loading={loading}
            onUpdateProfile={updateProfile}
            onUpgradePlan={goToBilling}
          />
        )}

        {screen === "notifications" && (
          <NotificationsScreen
            notifications={notifications}
            stockRequests={stockRequests}
            canAnalyzeStockRequests={canAnalyzeStockRequests}
            loading={loading}
            onApproveStockRequest={(id) => confirmStockRequestStatus(id, "approved")}
            onRejectStockRequest={(id) => confirmStockRequestStatus(id, "rejected")}
          />
        )}
      </View>

      <BottomNav
        activeScreen={screen}
        bottomInset={insets.bottom}
        user={currentUser}
        onHome={() => {
          setError(null);
          setScreen("home");
        }}
        onDashboard={goToDashboard}
        onScan={goToScan}
        onProducts={goToProducts}
      />

      <SideMenu
        visible={menuOpen}
        user={currentUser}
        onClose={() => setMenuOpen(false)}
        onHome={() => {
          setScreen("home");
          setMenuOpen(false);
        }}
        onDashboard={goToDashboard}
        onScan={goToScan}
        onProducts={goToProducts}
        onBranches={goToBranches}
        onStockRequests={goToStockRequests}
        onBilling={goToBilling}
        onCertificate={goToCertificate}
        onProfile={goToProfile}
        onAccess={goToAccess}
        onLogout={logout}
        hasPendingStockRequests={pendingStockRequests.length > 0}
        onSimulate={() => {
          setMenuOpen(false);
          simulateInvoice();
        }}
        topInset={insets.top}
      />

      <InvoiceReviewModal
        visible={!!pendingInvoice}
        pendingInvoice={pendingInvoice}
        pendingProducts={pendingProducts}
        editingProductIndex={editingProductIndex}
        loading={loading}
        onUpdateProduct={updatePendingProduct}
        onEditProduct={setEditingProductIndex}
        onCloseEdit={() => setEditingProductIndex(null)}
        onCommit={confirmCommitStock}
        onClose={closeInvoiceReview}
        onBackToScan={backToScannerFromReview}
      />

    </View>
  );
}
