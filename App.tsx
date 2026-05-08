import { BarcodeScanningResult, useCameraPermissions } from "expo-camera";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useState } from "react";
import { Alert, Text, View } from "react-native";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";
import { api } from "./src/api/client";
import { AppHeader } from "./src/components/AppHeader";
import { BottomNav } from "./src/components/BottomNav";
import { BranchScreen } from "./src/components/BranchScreen";
import { HomeScreen } from "./src/components/HomeScreen";
import { ObservationModal } from "./src/components/ObservationModal";
import { ProductsScreen } from "./src/components/ProductsScreen";
import { ScanScreen } from "./src/components/ScanScreen";
import { SideMenu } from "./src/components/SideMenu";
import { styles } from "./src/styles/appStyles";
import { BranchOption, EditableInvoiceProduct, Screen } from "./src/types/app";
import { BranchTransfer, BranchTransferStatus, InvoiceResult, Product } from "./src/types/product";
import { formatQuantity, getScreenTitle, parseQuantity } from "./src/utils/appHelpers";

const BRANCH_OPTIONS: BranchOption[] = [
  { code: "CENTRAL", name: "Estoque central" },
  { code: "FILIAL-01", name: "Filial 01" },
  { code: "FILIAL-02", name: "Filial 02" },
  { code: "FILIAL-03", name: "Filial 03" }
];

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
  const [screen, setScreen] = useState<Screen>("home");
  const [menuOpen, setMenuOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [branchTransfers, setBranchTransfers] = useState<BranchTransfer[]>([]);
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
  const [loading, setLoading] = useState(false);
  const [scannerEnabled, setScannerEnabled] = useState(true);

  const loadProducts = useCallback(async () => {
    const data = await api.listProducts();
    setProducts(data);
  }, []);

  const loadBranchTransfers = useCallback(async () => {
    const data = await api.listBranchTransfers();
    setBranchTransfers(data);
  }, []);

  useEffect(() => {
    loadProducts().catch(() => {
      setError("Nao consegui conectar na API. Confira se o backend esta rodando.");
    });
    loadBranchTransfers().catch(() => undefined);
  }, [loadProducts, loadBranchTransfers]);

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
      setScreen("products");
      setScannerEnabled(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao processar nota.";
      setError(message);
      Alert.alert("Leitura nao concluida", message);
    } finally {
      setLoading(false);
    }
  }

  function handleBarcodeScanned(result: BarcodeScanningResult) {
    if (!scannerEnabled || loading) return;
    setScannerEnabled(false);
    handleInvoicePreview(() => api.scanInvoice(result.data));
  }

  function goToScan() {
    setError(null);
    setMenuOpen(false);
    setScannerEnabled(true);
    setScreen("scan");
  }

  function goToProducts() {
    setError(null);
    setMenuOpen(false);
    setScreen("products");
    loadProducts().catch(() => setError("Nao consegui atualizar os produtos."));
  }

  function goToBranches() {
    setError(null);
    setMenuOpen(false);
    setScreen("branches");
    Promise.all([loadProducts(), loadBranchTransfers()]).catch(() => setError("Nao consegui atualizar filial."));
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
      Alert.alert("Quantidade invalida", `Confira a quantidade de ${invalidProduct.name}.`);
      return;
    }

    Alert.alert(
      "Enviar para o estoque?",
      "Tem certeza que deseja enviar para o estoque? Apos essa acao nao podera ser desfeita.",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Enviar", style: "destructive", onPress: commitStock }
      ]
    );
  }

  async function commitStock() {
    if (!pendingInvoice) return;

    try {
      setLoading(true);
      setError(null);

      await api.commitStock({
        invoiceKey: pendingInvoice.invoiceKey,
        source: pendingInvoice.source,
        products: pendingProducts.map((product) => ({
          name: product.name,
          ean: product.ean,
          quantity: parseQuantity(product.quantityInput),
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
      Alert.alert("Entrada nao concluida", message);
    } finally {
      setLoading(false);
    }
  }

  async function registerMissingDelivered(productId: string, quantity: number, observation?: string) {
    await api.registerMissingDelivered(productId, {
      quantity,
      observation
    });
    await loadProducts();
  }

  async function createBranchTransfer() {
    const quantity = parseQuantity(branchQuantity);

    if (!branchProductId || !targetBranch || quantity <= 0) {
      Alert.alert("Dados incompletos", "Escolha produto, filial destino e quantidade para reservar.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await api.createBranchTransfer({
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
      Alert.alert("Reserva nao concluida", message);
    } finally {
      setLoading(false);
    }
  }

  async function updateBranchTransferStatus(id: string, status: Exclude<BranchTransferStatus, "reserved">) {
    try {
      setLoading(true);
      setError(null);
      await api.updateBranchTransferStatus(id, status);
      await Promise.all([loadProducts(), loadBranchTransfers()]);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao movimentar filial.";
      setError(message);
      Alert.alert("Movimentacao nao concluida", message);
    } finally {
      setLoading(false);
    }
  }

  function confirmCancelBranchTransfer(id: string) {
    Alert.alert(
      "Cancelar movimentacao?",
      "O estoque reservado sera devolvido para a filial de origem.",
      [
        { text: "Voltar", style: "cancel" },
        {
          text: "Cancelar movimentacao",
          style: "destructive",
          onPress: () => cancelBranchTransfer(id)
        }
      ]
    );
  }

  async function cancelBranchTransfer(id: string) {
    try {
      setLoading(true);
      setError(null);
      await api.cancelBranchTransfer(id);
      await Promise.all([loadProducts(), loadBranchTransfers()]);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao cancelar movimentacao.";
      setError(message);
      Alert.alert("Cancelamento nao concluido", message);
    } finally {
      setLoading(false);
    }
  }

  const editingProduct = editingProductIndex === null ? null : pendingProducts[editingProductIndex];

  return (
    <View style={styles.safeArea}>
      <StatusBar style={screen === "scan" ? "light" : "dark"} />
      <AppHeader
        title={getScreenTitle(screen, pendingInvoice)}
        onMenuPress={() => setMenuOpen(true)}
        loading={loading}
        topInset={insets.top}
        hasNotification={pendingProducts.length > 0 || !!error}
      />

      <View style={styles.screenBody}>
        {error && <Text style={styles.errorText}>{error}</Text>}

        {screen === "home" && (
          <HomeScreen
            productsCount={products.length}
            pendingCount={pendingProducts.length}
            onScan={goToScan}
            onProducts={goToProducts}
            onBranches={goToBranches}
            onSimulate={() => handleInvoicePreview(api.simulateInvoice)}
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
            onSimulate={() => handleInvoicePreview(api.simulateInvoice)}
          />
        )}

        {screen === "products" && (
          <ProductsScreen
            pendingInvoice={pendingInvoice}
            pendingProducts={pendingProducts}
            products={products}
            loading={loading}
            onUpdateProduct={updatePendingProduct}
            onEditProduct={setEditingProductIndex}
            onCommit={confirmCommitStock}
            onScan={goToScan}
            onSimulate={() => handleInvoicePreview(api.simulateInvoice)}
            onRegisterMissingDelivered={registerMissingDelivered}
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
      </View>

      <BottomNav
        activeScreen={screen}
        bottomInset={insets.bottom}
        onHome={() => {
          setError(null);
          setScreen("home");
        }}
        onScan={goToScan}
        onProducts={goToProducts}
      />

      <SideMenu
        visible={menuOpen}
        onClose={() => setMenuOpen(false)}
        onHome={() => {
          setScreen("home");
          setMenuOpen(false);
        }}
        onScan={goToScan}
        onProducts={goToProducts}
        onBranches={goToBranches}
        onSimulate={() => {
          setMenuOpen(false);
          handleInvoicePreview(api.simulateInvoice);
        }}
        topInset={insets.top}
      />

      <ObservationModal
        product={editingProduct}
        visible={!!editingProduct}
        onClose={() => setEditingProductIndex(null)}
        onChange={(observation) => {
          if (editingProductIndex !== null) {
            updatePendingProduct(editingProductIndex, { observation });
          }
        }}
      />
    </View>
  );
}
