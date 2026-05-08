import { Ionicons } from "@expo/vector-icons";
import { BarcodeScanningResult, CameraView, useCameraPermissions } from "expo-camera";
import { StatusBar } from "expo-status-bar";
import { ReactNode, useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";
import { api } from "./src/api/client";
import { ProductList } from "./src/components/ProductList";
import { BranchTransfer, BranchTransferStatus, InvoicePreviewProduct, InvoiceResult, Product } from "./src/types/product";

type Screen = "home" | "scan" | "products" | "branches";

type EditableInvoiceProduct = InvoicePreviewProduct & {
  quantityInput: string;
};

type BranchOption = {
  code: string;
  name: string;
};

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

function AppHeader({
  title,
  loading,
  topInset,
  hasNotification,
  onMenuPress
}: {
  title: string;
  loading: boolean;
  topInset: number;
  hasNotification: boolean;
  onMenuPress: () => void;
}) {
  return (
    <View style={[styles.header, { paddingTop: topInset + 8 }]}>
      <Pressable style={styles.headerIconButton} onPress={onMenuPress}>
        <Ionicons name="menu-outline" size={26} color="#1f2937" />
      </Pressable>
      <View style={styles.headerTitleArea}>
        <Text style={styles.headerTitle}>{title}</Text>
        <Text style={styles.headerSubtitle}>Scanner de notas e estoque</Text>
      </View>
      <View style={styles.headerActions}>
        <Pressable style={styles.headerIconButton}>
          <Ionicons name="notifications-outline" size={22} color="#1f2937" />
          {hasNotification && <View style={styles.notificationDot} />}
        </Pressable>
        <View style={styles.headerStatus}>{loading ? <ActivityIndicator color="#0f766e" /> : null}</View>
      </View>
    </View>
  );
}

function BottomNav({
  activeScreen,
  bottomInset,
  onHome,
  onScan,
  onProducts
}: {
  activeScreen: Screen;
  bottomInset: number;
  onHome: () => void;
  onScan: () => void;
  onProducts: () => void;
}) {
  return (
    <View style={[styles.bottomNav, { paddingBottom: Math.max(bottomInset, 10) }]}>
      <BottomNavItem icon="home-outline" label="Home" active={activeScreen === "home"} onPress={onHome} />
      <BottomNavItem icon="camera-outline" label="Camera" active={activeScreen === "scan"} onPress={onScan} />
      <BottomNavItem icon="cube-outline" label="Produtos" active={activeScreen === "products"} onPress={onProducts} />
    </View>
  );
}

function BottomNavItem({
  icon,
  label,
  active,
  onPress
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable style={[styles.bottomNavItem, active && styles.bottomNavItemActive]} onPress={onPress}>
      <Ionicons name={icon} size={22} color={active ? "#ffffff" : "#64748b"} />
      <Text style={[styles.bottomNavLabel, active && styles.bottomNavLabelActive]}>{label}</Text>
    </Pressable>
  );
}

function HomeScreen({
  productsCount,
  pendingCount,
  onScan,
  onProducts,
  onBranches,
  onSimulate
}: {
  productsCount: number;
  pendingCount: number;
  onScan: () => void;
  onProducts: () => void;
  onBranches: () => void;
  onSimulate: () => void;
}) {
  return (
    <ScrollView style={styles.content} contentContainerStyle={styles.homeInner}>
      <View style={styles.homeHero}>
        <Text style={styles.homeEyebrow}>Entrada inteligente</Text>
        <Text style={styles.homeTitle}>Controle a entrada antes de gravar no estoque.</Text>
        <View style={styles.metricRow}>
          <View style={styles.metricBox}>
            <Text style={styles.metricValue}>{productsCount}</Text>
            <Text style={styles.metricLabel}>produtos</Text>
          </View>
          <View style={styles.metricBox}>
            <Text style={styles.metricValue}>{pendingCount}</Text>
            <Text style={styles.metricLabel}>pendentes</Text>
          </View>
        </View>
      </View>

      <View style={styles.quickGrid}>
        <HomeAction icon="camera-outline" title="Camera" text="Escannear nota" onPress={onScan} />
        <HomeAction icon="cube-outline" title="Produtos" text="Ver estoque" onPress={onProducts} />
        <HomeAction icon="git-compare-outline" title="Filial" text="Movimentar estoque" onPress={onBranches} />
        <HomeAction icon="document-text-outline" title="XML" text="Simular leitura" onPress={onSimulate} />
      </View>
    </ScrollView>
  );
}

function HomeAction({
  icon,
  title,
  text,
  onPress
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  text: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.homeAction} onPress={onPress}>
      <View style={styles.homeActionIcon}>
        <Ionicons name={icon} size={26} color="#0f766e" />
      </View>
      <Text style={styles.homeActionTitle}>{title}</Text>
      <Text style={styles.homeActionText}>{text}</Text>
    </Pressable>
  );
}

function ScanScreen({
  permissionGranted,
  loading,
  scannerEnabled,
  onRequestPermission,
  onBarcodeScanned,
  onSimulate,
  topInset
}: {
  permissionGranted?: boolean;
  loading: boolean;
  scannerEnabled: boolean;
  topInset: number;
  onRequestPermission: () => void;
  onBarcodeScanned: (result: BarcodeScanningResult) => void;
  onSimulate: () => void;
}) {
  if (!permissionGranted) {
    return (
      <View style={styles.permissionPanel}>
        <Ionicons name="camera-outline" size={42} color="#0f766e" />
        <Text style={styles.permissionTitle}>Permitir camera</Text>
        <Text style={styles.mutedText}>Libere a camera para ler o QR Code da NF-e/NFC-e.</Text>
        <Pressable style={styles.primaryButton} onPress={onRequestPermission}>
          <Ionicons name="key-outline" size={18} color="#ffffff" />
          <Text style={styles.primaryButtonText}>Liberar camera</Text>
        </Pressable>
        <Pressable style={styles.secondaryButton} onPress={onSimulate}>
          <Ionicons name="document-text-outline" size={18} color="#0f766e" />
          <Text style={styles.secondaryButtonText}>Siimular leitura de XML</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.scanPage}>
      <CameraView
        style={styles.camera}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
        onBarcodeScanned={scannerEnabled && !loading ? onBarcodeScanned : undefined}
      />
      <View style={[styles.scannerOverlay, { paddingTop: topInset }]}>
        <View style={styles.scanBox} />
        <Text style={styles.scanText}>Aponte para o QR Code da nota</Text>
        <Pressable style={styles.scanSimulateButton} onPress={onSimulate}>
          <Ionicons name="document-text-outline" size={18} color="#ffffff" />
          <Text style={styles.scanSimulateText}>Siimular leitura de XML</Text>
        </Pressable>
      </View>
    </View>
  );
}

function ProductsScreen({
  pendingInvoice,
  pendingProducts,
  products,
  loading,
  onUpdateProduct,
  onEditProduct,
  onCommit,
  onScan,
  onSimulate,
  onRegisterMissingDelivered
}: {
  pendingInvoice: InvoiceResult | null;
  pendingProducts: EditableInvoiceProduct[];
  products: Product[];
  loading: boolean;
  onUpdateProduct: (index: number, changes: Partial<EditableInvoiceProduct>) => void;
  onEditProduct: (index: number) => void;
  onCommit: () => void;
  onScan: () => void;
  onSimulate: () => void;
  onRegisterMissingDelivered: (productId: string, quantity: number, observation?: string) => Promise<void>;
}) {
  return (
    <ScrollView style={styles.content} contentContainerStyle={styles.contentInner}>
      <View style={styles.actions}>
        <Pressable style={styles.primaryButton} onPress={onScan}>
          <Ionicons name="camera-outline" size={18} color="#ffffff" />
          <Text style={styles.primaryButtonText}>Escannear</Text>
        </Pressable>
        <Pressable style={styles.secondaryButton} onPress={onSimulate}>
          <Ionicons name="document-text-outline" size={18} color="#0f766e" />
          <Text style={styles.secondaryButtonText}>Siimular leitura de XML</Text>
        </Pressable>
      </View>

      {pendingInvoice ? (
        <View style={styles.pendingSection}>
          <View style={styles.pendingHeader}>
            <View>
              <Text style={styles.sectionTitle}>Produtos lidos</Text>
              <Text style={styles.sectionSubtitle}>Ajuste quantidades e use o lapis para observacoes.</Text>
            </View>
            <Text style={styles.pendingCount}>{pendingProducts.length}</Text>
          </View>

          {pendingInvoice.invoiceKey && <Text style={styles.invoiceKey}>Chave: {pendingInvoice.invoiceKey}</Text>}

          {pendingProducts.map((product, index) => (
            <View key={`${product.ean}-${index}`} style={styles.pendingCard}>
              <View style={styles.pendingTopRow}>
                <View style={styles.pendingTitleArea}>
                  <Text style={styles.pendingName}>{product.name}</Text>
                  <Text style={styles.eanBadge}>{product.ean}</Text>
                </View>
                <Pressable style={styles.editButton} onPress={() => onEditProduct(index)}>
                  <Ionicons name="pencil-outline" size={20} color="#0f766e" />
                </Pressable>
              </View>

              <Text style={styles.fieldLabel}>Quantidade que entrou</Text>
              <TextInput
                value={product.quantityInput}
                onChangeText={(value) => onUpdateProduct(index, { quantityInput: value })}
                keyboardType="decimal-pad"
                style={styles.quantityInput}
                placeholder="0"
              />

              {!!product.observation?.trim() && (
                <View style={styles.inlineAlert}>
                  <Ionicons name="alert-circle-outline" size={18} color="#92400e" />
                  <Text style={styles.inlineAlertText}>Este produto tem observacao.</Text>
                </View>
              )}
            </View>
          ))}

          <Pressable style={[styles.commitButton, loading && styles.disabledButton]} disabled={loading} onPress={onCommit}>
            <Ionicons name="send-outline" size={18} color="#ffffff" />
            <Text style={styles.commitButtonText}>Enviar para o estoque</Text>
          </Pressable>
        </View>
      ) : (
        <ProductList products={products} onRegisterMissingDelivered={onRegisterMissingDelivered} />
      )}
    </ScrollView>
  );
}

function SideMenu({
  visible,
  onClose,
  onHome,
  onScan,
  onProducts,
  onBranches,
  onSimulate,
  topInset
}: {
  visible: boolean;
  onClose: () => void;
  onHome: () => void;
  onScan: () => void;
  onProducts: () => void;
  onBranches: () => void;
  onSimulate: () => void;
  topInset: number;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.menuOverlay}>
        <Pressable style={styles.menuBackdrop} onPress={onClose} />
        <View style={[styles.sideMenu, { paddingTop: topInset + 18 }]}>
          <View style={styles.sideMenuHeader}>
            <Text style={styles.sideMenuTitle}>Menu</Text>
            <Pressable style={styles.headerIconButton} onPress={onClose}>
              <Ionicons name="close-outline" size={24} color="#1f2937" />
            </Pressable>
          </View>
          <MenuItem icon="home-outline" label="Home" onPress={onHome} />
          <MenuItem icon="camera-outline" label="Scannear" onPress={onScan} />
          <MenuItem icon="cube-outline" label="Ver produtos" onPress={onProducts} />
          <MenuItem icon="git-compare-outline" label="Filial" onPress={onBranches} />
          <MenuItem icon="document-text-outline" label="Siimular XML" onPress={onSimulate} />
        </View>
      </View>
    </Modal>
  );
}

function MenuItem({
  icon,
  label,
  onPress
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.menuItem} onPress={onPress}>
      <Ionicons name={icon} size={22} color="#0f766e" />
      <Text style={styles.menuItemText}>{label}</Text>
      <Ionicons name="chevron-forward-outline" size={18} color="#94a3b8" />
    </Pressable>
  );
}

function ObservationModal({
  visible,
  product,
  onClose,
  onChange
}: {
  visible: boolean;
  product: EditableInvoiceProduct | null;
  onClose: () => void;
  onChange: (observation: string) => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.observationModal}>
          <View style={styles.modalHeader}>
            <View style={styles.modalTitleArea}>
              <Text style={styles.modalTitle}>Observacao</Text>
              <Text style={styles.modalSubtitle}>{product?.name}</Text>
            </View>
            <Pressable style={styles.headerIconButton} onPress={onClose}>
              <Ionicons name="close-outline" size={24} color="#1f2937" />
            </Pressable>
          </View>
          <TextInput
            value={product?.observation || ""}
            onChangeText={onChange}
            style={styles.observationInput}
            placeholder="Ex: faltaram 2 unidades na entrega"
            multiline
            autoFocus
          />
          {!!product?.observation?.trim() && (
            <View style={styles.inlineAlert}>
              <Ionicons name="alert-circle-outline" size={18} color="#92400e" />
              <Text style={styles.inlineAlertText}>Essa observacao sera vinculada a entrada deste produto.</Text>
            </View>
          )}
          <Pressable style={styles.primaryButton} onPress={onClose}>
            <Ionicons name="checkmark-outline" size={18} color="#ffffff" />
            <Text style={styles.primaryButtonText}>Salvar observacao</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function BranchScreen({
  products,
  transfers,
  selectedProductId,
  productSearch,
  branchOptions,
  sourceBranch,
  sourceBranchSearch,
  targetBranch,
  targetBranchSearch,
  quantity,
  lot,
  observation,
  loading,
  onSelectProduct,
  onChangeProductSearch,
  onSelectSourceBranch,
  onChangeSourceBranchSearch,
  onSelectTargetBranch,
  onChangeTargetBranchSearch,
  onChangeQuantity,
  onChangeLot,
  onChangeObservation,
  onCreateTransfer,
  onUpdateStatus,
  onCancelTransfer
}: {
  products: Product[];
  transfers: BranchTransfer[];
  selectedProductId: string;
  productSearch: string;
  branchOptions: BranchOption[];
  sourceBranch: BranchOption;
  sourceBranchSearch: string;
  targetBranch: BranchOption | null;
  targetBranchSearch: string;
  quantity: string;
  lot: string;
  observation: string;
  loading: boolean;
  onSelectProduct: (productId: string) => void;
  onChangeProductSearch: (value: string) => void;
  onSelectSourceBranch: (branch: BranchOption) => void;
  onChangeSourceBranchSearch: (value: string) => void;
  onSelectTargetBranch: (branch: BranchOption | null) => void;
  onChangeTargetBranchSearch: (value: string) => void;
  onChangeQuantity: (value: string) => void;
  onChangeLot: (value: string) => void;
  onChangeObservation: (value: string) => void;
  onCreateTransfer: () => void;
  onUpdateStatus: (id: string, status: Exclude<BranchTransferStatus, "reserved">) => void;
  onCancelTransfer: (id: string) => void;
}) {
  const [selectModal, setSelectModal] = useState<"product" | "source" | "target" | "filterSource" | "filterTarget" | null>(null);
  const [openSection, setOpenSection] = useState<"reserve" | "movements" | null>(null);
  const [movementIdSearch, setMovementIdSearch] = useState("");
  const [filterSourceBranch, setFilterSourceBranch] = useState<BranchOption | null>(null);
  const [filterTargetBranch, setFilterTargetBranch] = useState<BranchOption | null>(null);
  const selectedProduct = products.find((product) => product._id === selectedProductId);
  const productResults = filterProducts(products, productSearch).slice(0, 6);
  const sourceBranchResults = filterBranches(branchOptions, sourceBranchSearch).filter(
    (branch) => branch.code !== targetBranch?.code
  );
  const targetBranchResults = filterBranches(branchOptions, targetBranchSearch).filter(
    (branch) => branch.code !== sourceBranch.code
  );
  const filteredTransfers = filterTransfers(transfers, movementIdSearch, filterSourceBranch, filterTargetBranch);

  return (
    <ScrollView style={styles.content} contentContainerStyle={styles.contentInner}>
      <View style={styles.branchPanel}>
        <Pressable style={styles.accordionHeader} onPress={() => setOpenSection(openSection === "reserve" ? null : "reserve")}>
          <View style={styles.accordionTitleArea}>
            <Text style={styles.sectionTitle}>Reservar estoque para filial</Text>
            <Text style={styles.sectionSubtitle}>Busque produto e filiais por nome ou codigo antes de reservar.</Text>
          </View>
          <Ionicons name={openSection === "reserve" ? "chevron-up-outline" : "chevron-down-outline"} size={22} color="#0f766e" />
        </Pressable>

        {openSection === "reserve" && (
          <View style={styles.accordionBody}>

        <Text style={styles.fieldLabel}>Produto</Text>
        <View style={styles.selectInputRow}>
          <TextInput
            value={productSearch}
            onChangeText={(value) => {
              onChangeProductSearch(value);
              onSelectProduct("");
            }}
            placeholder="Buscar produto por nome ou EAN"
            style={styles.selectInput}
          />
          <Pressable style={styles.selectButton} onPress={() => setSelectModal("product")}>
            <Ionicons name="list-outline" size={22} color="#0f766e" />
          </Pressable>
        </View>
        {!!productSearch.trim() && !selectedProduct && (
          <View style={styles.branchProductGrid}>
            {productResults.length === 0 ? (
              <Text style={styles.mutedText}>Nenhum produto encontrado.</Text>
            ) : (
              productResults.map((product) => (
                <Pressable
                  key={product._id}
                  style={styles.branchProductOption}
                  onPress={() => {
                    onSelectProduct(product._id);
                    onChangeProductSearch(`${product.name} - ${product.ean}`);
                  }}
                >
                  <Text style={styles.branchProductName}>{product.name}</Text>
                  <Text style={styles.branchProductMeta}>EAN {product.ean} | Central: {product.quantity}</Text>
                </Pressable>
              ))
            )}
          </View>
        )}

        {selectedProduct && <Text style={styles.invoiceKey}>Produto selecionado: {selectedProduct.ean}</Text>}

        <Text style={styles.fieldLabel}>Filial origem</Text>
        <View style={styles.selectInputRow}>
          <TextInput
            value={sourceBranchSearch || `${sourceBranch.code} - ${sourceBranch.name}`}
            onChangeText={onChangeSourceBranchSearch}
            placeholder="Buscar filial origem por nome ou codigo"
            style={styles.selectInput}
          />
          <Pressable style={styles.selectButton} onPress={() => setSelectModal("source")}>
            <Ionicons name="business-outline" size={21} color="#0f766e" />
          </Pressable>
        </View>
        {!!sourceBranchSearch.trim() && (
          <BranchOptionList branches={sourceBranchResults} onSelect={onSelectSourceBranch} onClearSearch={onChangeSourceBranchSearch} />
        )}

        <Text style={styles.fieldLabel}>Filial destino</Text>
        <View style={styles.selectInputRow}>
          <TextInput
            value={targetBranchSearch || (targetBranch ? `${targetBranch.code} - ${targetBranch.name}` : "")}
            onChangeText={(value) => {
              onChangeTargetBranchSearch(value);
              onSelectTargetBranch(null);
            }}
            placeholder="Buscar filial destino por nome ou codigo"
            style={styles.selectInput}
          />
          <Pressable style={styles.selectButton} onPress={() => setSelectModal("target")}>
            <Ionicons name="business-outline" size={21} color="#0f766e" />
          </Pressable>
        </View>
        {!!targetBranchSearch.trim() && (
          <BranchOptionList branches={targetBranchResults} onSelect={onSelectTargetBranch} onClearSearch={onChangeTargetBranchSearch} />
        )}

        <TextInput
          value={quantity}
          onChangeText={onChangeQuantity}
          placeholder="Quantidade"
          keyboardType="decimal-pad"
          style={styles.quantityInput}
        />
        <TextInput
          value={lot}
          onChangeText={onChangeLot}
          placeholder="Lote"
          style={styles.quantityInput}
        />
        <TextInput
          value={observation}
          onChangeText={onChangeObservation}
          placeholder="Observacao da reserva"
          multiline
          style={[styles.quantityInput, styles.branchObservationInput]}
        />

        <Pressable style={[styles.primaryButton, loading && styles.disabledButton]} disabled={loading} onPress={onCreateTransfer}>
          <Ionicons name="lock-closed-outline" size={18} color="#ffffff" />
          <Text style={styles.primaryButtonText}>Reservar para filial</Text>
        </Pressable>
          </View>
        )}
      </View>

      <View style={styles.branchPanel}>
        <Pressable style={styles.accordionHeader} onPress={() => setOpenSection(openSection === "movements" ? null : "movements")}>
          <View style={styles.accordionTitleArea}>
            <Text style={styles.sectionTitle}>Movimentacoes entre filiais</Text>
            <Text style={styles.sectionSubtitle}>Acompanhe reservado, a caminho e entrada na filial.</Text>
          </View>
          <Ionicons name={openSection === "movements" ? "chevron-up-outline" : "chevron-down-outline"} size={22} color="#0f766e" />
        </Pressable>

        {openSection === "movements" && (
          <View style={styles.accordionBody}>

        <Text style={styles.fieldLabel}>Pesquisar movimentacao pelo ID</Text>
        <TextInput
          value={movementIdSearch}
          onChangeText={setMovementIdSearch}
          placeholder="Digite o ID da movimentacao"
          style={styles.quantityInput}
        />

        <Text style={styles.fieldLabel}>Filtrar filial origem</Text>
        <View style={styles.selectInputRow}>
          <TextInput
            value={filterSourceBranch ? `${filterSourceBranch.code} - ${filterSourceBranch.name}` : ""}
            editable={false}
            placeholder="Todas as origens"
            style={styles.selectInput}
          />
          <Pressable style={styles.selectButton} onPress={() => setSelectModal("filterSource")}>
            <Ionicons name="business-outline" size={21} color="#0f766e" />
          </Pressable>
        </View>

        <Text style={styles.fieldLabel}>Filtrar filial destino</Text>
        <View style={styles.selectInputRow}>
          <TextInput
            value={filterTargetBranch ? `${filterTargetBranch.code} - ${filterTargetBranch.name}` : ""}
            editable={false}
            placeholder="Todos os destinos"
            style={styles.selectInput}
          />
          <Pressable style={styles.selectButton} onPress={() => setSelectModal("filterTarget")}>
            <Ionicons name="business-outline" size={21} color="#0f766e" />
          </Pressable>
        </View>

        {(movementIdSearch || filterSourceBranch || filterTargetBranch) && (
          <Pressable
            style={styles.clearFilterButton}
            onPress={() => {
              setMovementIdSearch("");
              setFilterSourceBranch(null);
              setFilterTargetBranch(null);
            }}
          >
            <Ionicons name="close-outline" size={18} color="#475569" />
            <Text style={styles.clearFilterText}>Limpar filtros</Text>
          </Pressable>
        )}

        {filteredTransfers.length === 0 ? (
          <Text style={styles.mutedText}>Nenhuma movimentacao de filial ainda.</Text>
        ) : (
          filteredTransfers.map((transfer) => (
            <View key={transfer._id} style={styles.transferCard}>
              <Text style={styles.transferId}>ID da movimentacao: {transfer._id}</Text>
              <View style={styles.pendingTopRow}>
                <View style={styles.pendingTitleArea}>
                  <Text style={styles.pendingName}>{transfer.productName}</Text>
                  <Text style={styles.eanBadge}>{getTransferStatusLabel(transfer.status)}</Text>
                </View>
                <Text style={styles.quantity}>{transfer.quantity}</Text>
              </View>
              <Text style={styles.meta}>
                {transfer.sourceBranch || "Estoque central"} → {transfer.targetBranch}
              </Text>
              <Text style={styles.meta}>EAN: {transfer.ean}</Text>
              {transfer.lot && <Text style={styles.meta}>Lote: {transfer.lot}</Text>}
              {transfer.history?.map((item, index) => (
                <Text key={`${item.status}-${index}`} style={styles.transferHistory}>
                  {getTransferHistoryText(transfer, item)} - {formatDateTime(item.createdAt)}
                </Text>
              ))}

              {transfer.status === "reserved" && (
                <View style={styles.transferActions}>
                  <Pressable style={styles.secondaryButton} onPress={() => onUpdateStatus(transfer._id, "in_transit")}>
                    <Ionicons name="car-outline" size={18} color="#0f766e" />
                    <Text style={styles.secondaryButtonText}>Produto a caminho</Text>
                  </Pressable>
                  <Pressable style={styles.cancelButton} onPress={() => onCancelTransfer(transfer._id)}>
                    <Ionicons name="close-circle-outline" size={18} color="#991b1b" />
                    <Text style={styles.cancelButtonText}>Cancelar movimentacao</Text>
                  </Pressable>
                </View>
              )}

              {transfer.status === "in_transit" && (
                <View style={styles.transferActions}>
                  <Pressable style={styles.primaryButton} onPress={() => onUpdateStatus(transfer._id, "received")}>
                    <Ionicons name="checkmark-circle-outline" size={18} color="#ffffff" />
                    <Text style={styles.primaryButtonText}>Dar entrada na filial</Text>
                  </Pressable>
                  <Pressable style={styles.cancelButton} onPress={() => onCancelTransfer(transfer._id)}>
                    <Ionicons name="close-circle-outline" size={18} color="#991b1b" />
                    <Text style={styles.cancelButtonText}>Cancelar movimentacao</Text>
                  </Pressable>
                </View>
              )}
            </View>
          ))
        )}
          </View>
        )}
      </View>

      <SelectorModal
        visible={selectModal === "product"}
        title="Selecionar produto"
        onClose={() => setSelectModal(null)}
      >
        {products.map((product) => (
          <Pressable
            key={product._id}
            style={styles.selectorItem}
            onPress={() => {
              onSelectProduct(product._id);
              onChangeProductSearch(`${product.name} - ${product.ean}`);
              setSelectModal(null);
            }}
          >
            <Text style={styles.branchProductName}>{product.name}</Text>
            <Text style={styles.branchProductMeta}>EAN {product.ean} | Central: {product.quantity}</Text>
          </Pressable>
        ))}
      </SelectorModal>

      <SelectorModal
        visible={selectModal === "source"}
        title="Selecionar origem"
        onClose={() => setSelectModal(null)}
      >
        {branchOptions
          .filter((branch) => branch.code !== targetBranch?.code)
          .map((branch) => (
            <Pressable
              key={branch.code}
              style={styles.selectorItem}
              onPress={() => {
                onSelectSourceBranch(branch);
                onChangeSourceBranchSearch("");
                setSelectModal(null);
              }}
            >
              <Text style={styles.branchProductName}>{branch.name}</Text>
              <Text style={styles.branchProductMeta}>Codigo: {branch.code}</Text>
            </Pressable>
          ))}
      </SelectorModal>

      <SelectorModal
        visible={selectModal === "target"}
        title="Selecionar destino"
        onClose={() => setSelectModal(null)}
      >
        {branchOptions
          .filter((branch) => branch.code !== sourceBranch.code)
          .map((branch) => (
            <Pressable
              key={branch.code}
              style={styles.selectorItem}
              onPress={() => {
                onSelectTargetBranch(branch);
                onChangeTargetBranchSearch("");
                setSelectModal(null);
              }}
            >
              <Text style={styles.branchProductName}>{branch.name}</Text>
              <Text style={styles.branchProductMeta}>Codigo: {branch.code}</Text>
            </Pressable>
          ))}
      </SelectorModal>

      <SelectorModal
        visible={selectModal === "filterSource"}
        title="Filtrar origem"
        onClose={() => setSelectModal(null)}
      >
        <Pressable
          style={styles.selectorItem}
          onPress={() => {
            setFilterSourceBranch(null);
            setSelectModal(null);
          }}
        >
          <Text style={styles.branchProductName}>Todas as origens</Text>
          <Text style={styles.branchProductMeta}>Remover filtro de origem</Text>
        </Pressable>
        {branchOptions.map((branch) => (
          <Pressable
            key={branch.code}
            style={styles.selectorItem}
            onPress={() => {
              setFilterSourceBranch(branch);
              setSelectModal(null);
            }}
          >
            <Text style={styles.branchProductName}>{branch.name}</Text>
            <Text style={styles.branchProductMeta}>Codigo: {branch.code}</Text>
          </Pressable>
        ))}
      </SelectorModal>

      <SelectorModal
        visible={selectModal === "filterTarget"}
        title="Filtrar destino"
        onClose={() => setSelectModal(null)}
      >
        <Pressable
          style={styles.selectorItem}
          onPress={() => {
            setFilterTargetBranch(null);
            setSelectModal(null);
          }}
        >
          <Text style={styles.branchProductName}>Todos os destinos</Text>
          <Text style={styles.branchProductMeta}>Remover filtro de destino</Text>
        </Pressable>
        {branchOptions.map((branch) => (
          <Pressable
            key={branch.code}
            style={styles.selectorItem}
            onPress={() => {
              setFilterTargetBranch(branch);
              setSelectModal(null);
            }}
          >
            <Text style={styles.branchProductName}>{branch.name}</Text>
            <Text style={styles.branchProductMeta}>Codigo: {branch.code}</Text>
          </Pressable>
        ))}
      </SelectorModal>
    </ScrollView>
  );
}

function SelectorModal({
  visible,
  title,
  children,
  onClose
}: {
  visible: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.selectorModal}>
          <View style={styles.modalHeader}>
            <View style={styles.modalTitleArea}>
              <Text style={styles.modalTitle}>{title}</Text>
              <Text style={styles.modalSubtitle}>Toque em uma opcao para selecionar.</Text>
            </View>
            <Pressable style={styles.headerIconButton} onPress={onClose}>
              <Ionicons name="close-outline" size={24} color="#1f2937" />
            </Pressable>
          </View>
          <ScrollView style={styles.selectorList} contentContainerStyle={styles.selectorListInner}>
            {children}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function BranchOptionList({
  branches,
  onSelect,
  onClearSearch
}: {
  branches: BranchOption[];
  onSelect: (branch: BranchOption) => void;
  onClearSearch: (value: string) => void;
}) {
  if (branches.length === 0) {
    return <Text style={styles.mutedText}>Nenhuma filial encontrada.</Text>;
  }

  return (
    <View style={styles.branchProductGrid}>
      {branches.map((branch) => (
        <Pressable
          key={branch.code}
          style={styles.branchProductOption}
          onPress={() => {
            onSelect(branch);
            onClearSearch("");
          }}
        >
          <Text style={styles.branchProductName}>{branch.name}</Text>
          <Text style={styles.branchProductMeta}>Codigo: {branch.code}</Text>
        </Pressable>
      ))}
    </View>
  );
}

function getScreenTitle(screen: Screen, pendingInvoice: InvoiceResult | null) {
  if (screen === "scan") return "Scannear nota";
  if (screen === "branches") return "Filial";
  if (screen === "products" && pendingInvoice) return "Revisar entrada";
  if (screen === "products") return "Produtos";
  return "Home";
}

function getTransferStatusLabel(status: BranchTransferStatus) {
  if (status === "reserved") return "Reservado";
  if (status === "in_transit") return "A caminho";
  if (status === "cancelled") return "Cancelada";
  return "Entrada na filial";
}

function getTransferHistoryText(transfer: BranchTransfer, item: { status: BranchTransferStatus; observation?: string }) {
  if (item.status === "reserved") {
    return item.observation || `Produto reservado para a filial ${transfer.targetBranch}`;
  }

  if (item.status === "cancelled") {
    return item.observation || `Movimentacao cancelada. Estoque devolvido para ${transfer.sourceBranch}.`;
  }

  return item.observation || getTransferStatusLabel(item.status);
}

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "sem horario";
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function filterProducts(products: Product[], query: string) {
  const normalizedQuery = normalizeSearch(query);

  if (!normalizedQuery) {
    return [];
  }

  return products.filter((product) =>
    normalizeSearch(`${product.name} ${product.ean}`).includes(normalizedQuery)
  );
}

function filterBranches(branches: BranchOption[], query: string) {
  const normalizedQuery = normalizeSearch(query);

  if (!normalizedQuery) {
    return [];
  }

  return branches.filter((branch) =>
    normalizeSearch(`${branch.code} ${branch.name}`).includes(normalizedQuery)
  );
}

function filterTransfers(
  transfers: BranchTransfer[],
  movementId: string,
  sourceBranch: BranchOption | null,
  targetBranch: BranchOption | null
) {
  const normalizedId = normalizeSearch(movementId);

  return transfers.filter((transfer) => {
    const matchesId = normalizedId ? normalizeSearch(transfer._id).includes(normalizedId) : true;
    const matchesSource = sourceBranch
      ? transfer.sourceBranchCode === sourceBranch.code || transfer.sourceBranch === sourceBranch.name
      : true;
    const matchesTarget = targetBranch
      ? transfer.targetBranchCode === targetBranch.code || transfer.targetBranch === targetBranch.name
      : true;

    return matchesId && matchesSource && matchesTarget;
  });
}

function normalizeSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function formatQuantity(value: number) {
  return Number.isInteger(value) ? String(value) : String(value).replace(".", ",");
}

function parseQuantity(value: string) {
  const normalized = value.replace(",", ".").trim();
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f4f7f6"
  },
  screenBody: {
    flex: 1
  },
  header: {
    minHeight: 80,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#d8dee9",
    backgroundColor: "#ffffff"
  },
  headerIconButton: {
    width: 42,
    height: 42,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f1f5f9"
  },
  headerTitleArea: {
    flex: 1
  },
  headerTitle: {
    color: "#1f2937",
    fontSize: 20,
    fontWeight: "900"
  },
  headerSubtitle: {
    marginTop: 2,
    color: "#64748b",
    fontSize: 12,
    fontWeight: "700"
  },
  headerStatus: {
    width: 28,
    alignItems: "center"
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  notificationDot: {
    position: "absolute",
    top: 9,
    right: 9,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: "#ef4444"
  },
  bottomNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    gap: 8,
    paddingTop: 10,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderTopColor: "#d8dee9",
    backgroundColor: "#ffffff"
  },
  bottomNavItem: {
    flex: 1,
    minHeight: 52,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    gap: 3
  },
  bottomNavItemActive: {
    backgroundColor: "#0f766e"
  },
  bottomNavLabel: {
    color: "#64748b",
    fontSize: 11,
    fontWeight: "900"
  },
  bottomNavLabelActive: {
    color: "#ffffff"
  },
  content: {
    flex: 1
  },
  contentInner: {
    padding: 18,
    gap: 14
  },
  homeInner: {
    padding: 18,
    gap: 16
  },
  homeHero: {
    borderRadius: 8,
    padding: 18,
    backgroundColor: "#102521"
  },
  homeEyebrow: {
    color: "#99f6e4",
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  homeTitle: {
    marginTop: 8,
    color: "#ffffff",
    fontSize: 25,
    lineHeight: 31,
    fontWeight: "900"
  },
  metricRow: {
    marginTop: 18,
    flexDirection: "row",
    gap: 10
  },
  metricBox: {
    flex: 1,
    borderRadius: 8,
    padding: 12,
    backgroundColor: "rgba(255,255,255,0.10)"
  },
  metricValue: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "900"
  },
  metricLabel: {
    marginTop: 2,
    color: "#cbd5e1",
    fontSize: 12,
    fontWeight: "700"
  },
  quickGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10
  },
  homeAction: {
    width: "48%",
    minHeight: 142,
    borderWidth: 1,
    borderColor: "#d8dee9",
    borderRadius: 8,
    padding: 14,
    backgroundColor: "#ffffff"
  },
  homeActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#e8f3f0"
  },
  homeActionTitle: {
    marginTop: 14,
    color: "#1f2937",
    fontSize: 17,
    fontWeight: "900"
  },
  homeActionText: {
    marginTop: 4,
    color: "#64748b",
    fontSize: 13,
    fontWeight: "700"
  },
  scanPage: {
    flex: 1,
    backgroundColor: "#101820"
  },
  camera: {
    ...StyleSheet.absoluteFillObject
  },
  scannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.18)"
  },
  scanBox: {
    width: 230,
    height: 230,
    borderWidth: 3,
    borderColor: "#ffffff",
    borderRadius: 8
  },
  scanText: {
    marginTop: 14,
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "800"
  },
  scanSimulateButton: {
    marginTop: 18,
    minHeight: 46,
    borderRadius: 8,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(15,118,110,0.92)"
  },
  scanSimulateText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "900"
  },
  permissionPanel: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
    padding: 24
  },
  permissionTitle: {
    color: "#1f2937",
    fontSize: 20,
    fontWeight: "900"
  },
  mutedText: {
    color: "#64748b",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20
  },
  actions: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap"
  },
  primaryButton: {
    minHeight: 46,
    borderRadius: 8,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#0f766e"
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "900"
  },
  secondaryButton: {
    minHeight: 46,
    borderRadius: 8,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#0f766e",
    backgroundColor: "#ffffff"
  },
  secondaryButtonText: {
    color: "#0f766e",
    fontSize: 14,
    fontWeight: "900"
  },
  disabledButton: {
    opacity: 0.65
  },
  errorText: {
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 8,
    padding: 12,
    color: "#991b1b",
    backgroundColor: "#fee2e2"
  },
  pendingSection: {
    gap: 12
  },
  pendingHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12
  },
  sectionTitle: {
    color: "#1f2937",
    fontSize: 19,
    fontWeight: "900"
  },
  sectionSubtitle: {
    marginTop: 3,
    color: "#5b6472",
    fontSize: 13
  },
  meta: {
    color: "#64748b",
    fontSize: 13,
    fontWeight: "700"
  },
  pendingCount: {
    minWidth: 38,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    overflow: "hidden",
    textAlign: "center",
    color: "#ffffff",
    backgroundColor: "#0f766e",
    fontWeight: "900"
  },
  invoiceKey: {
    color: "#3f4b5b",
    fontSize: 12
  },
  pendingCard: {
    borderWidth: 1,
    borderColor: "#d8dee9",
    borderRadius: 8,
    padding: 14,
    backgroundColor: "#ffffff",
    gap: 8
  },
  pendingTopRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start"
  },
  pendingTitleArea: {
    flex: 1,
    gap: 7
  },
  pendingName: {
    color: "#1f2937",
    fontSize: 16,
    fontWeight: "900",
    lineHeight: 22
  },
  quantity: {
    minWidth: 58,
    textAlign: "right",
    color: "#0f766e",
    fontSize: 18,
    fontWeight: "900"
  },
  editButton: {
    width: 42,
    height: 42,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#e8f3f0"
  },
  eanBadge: {
    alignSelf: "flex-start",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    overflow: "hidden",
    color: "#35524d",
    backgroundColor: "#e8f3f0",
    fontSize: 12,
    fontWeight: "800"
  },
  fieldLabel: {
    marginTop: 4,
    color: "#3f4b5b",
    fontSize: 13,
    fontWeight: "900"
  },
  quantityInput: {
    minHeight: 44,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 8,
    paddingHorizontal: 12,
    color: "#1f2937",
    backgroundColor: "#f8fafc",
    fontSize: 15
  },
  selectInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  selectInput: {
    flex: 1,
    minHeight: 44,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 8,
    paddingHorizontal: 12,
    color: "#1f2937",
    backgroundColor: "#f8fafc",
    fontSize: 15
  },
  selectButton: {
    width: 46,
    height: 44,
    borderWidth: 1,
    borderColor: "#0f766e",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#e8f3f0"
  },
  branchPanel: {
    gap: 12,
    borderWidth: 1,
    borderColor: "#d8dee9",
    borderRadius: 8,
    padding: 14,
    backgroundColor: "#ffffff"
  },
  accordionHeader: {
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12
  },
  accordionTitleArea: {
    flex: 1
  },
  accordionBody: {
    gap: 12
  },
  branchProductGrid: {
    gap: 8
  },
  branchProductOption: {
    borderWidth: 1,
    borderColor: "#d8dee9",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#f8fafc"
  },
  selectorModal: {
    maxHeight: "82%",
    gap: 12,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    padding: 18,
    backgroundColor: "#ffffff"
  },
  selectorList: {
    maxHeight: 420
  },
  selectorListInner: {
    gap: 8,
    paddingBottom: 8
  },
  selectorItem: {
    borderWidth: 1,
    borderColor: "#d8dee9",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#f8fafc"
  },
  branchProductOptionActive: {
    borderColor: "#0f766e",
    backgroundColor: "#e8f3f0"
  },
  branchProductName: {
    color: "#1f2937",
    fontSize: 14,
    fontWeight: "900"
  },
  branchProductNameActive: {
    color: "#0f766e"
  },
  branchProductMeta: {
    marginTop: 4,
    color: "#64748b",
    fontSize: 12,
    fontWeight: "800"
  },
  branchProductMetaActive: {
    color: "#35524d"
  },
  branchObservationInput: {
    minHeight: 76,
    paddingTop: 10,
    textAlignVertical: "top"
  },
  transferCard: {
    gap: 8,
    borderWidth: 1,
    borderColor: "#d8dee9",
    borderRadius: 8,
    padding: 14,
    backgroundColor: "#f8fafc"
  },
  transferId: {
    alignSelf: "flex-start",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
    overflow: "hidden",
    color: "#334155",
    backgroundColor: "#e2e8f0",
    fontSize: 12,
    fontWeight: "900"
  },
  transferHistory: {
    borderLeftWidth: 3,
    borderLeftColor: "#0f766e",
    paddingLeft: 8,
    color: "#475569",
    fontSize: 12,
    fontWeight: "800"
  },
  transferActions: {
    gap: 8
  },
  cancelButton: {
    minHeight: 46,
    borderRadius: 8,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#fecaca",
    backgroundColor: "#fee2e2"
  },
  cancelButtonText: {
    color: "#991b1b",
    fontSize: 14,
    fontWeight: "900"
  },
  clearFilterButton: {
    minHeight: 42,
    borderRadius: 8,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#e2e8f0"
  },
  clearFilterText: {
    color: "#475569",
    fontSize: 13,
    fontWeight: "900"
  },
  inlineAlert: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 8,
    padding: 10,
    backgroundColor: "#fffbeb"
  },
  inlineAlertText: {
    flex: 1,
    color: "#92400e",
    fontSize: 13,
    fontWeight: "800"
  },
  commitButton: {
    minHeight: 50,
    borderRadius: 8,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#b91c1c"
  },
  commitButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "900"
  },
  menuOverlay: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "rgba(15,23,42,0.35)"
  },
  menuBackdrop: {
    ...StyleSheet.absoluteFillObject
  },
  sideMenu: {
    width: 292,
    paddingHorizontal: 14,
    gap: 8,
    backgroundColor: "#ffffff"
  },
  sideMenuHeader: {
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8
  },
  sideMenuTitle: {
    color: "#1f2937",
    fontSize: 24,
    fontWeight: "900"
  },
  menuItem: {
    minHeight: 52,
    borderRadius: 8,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#f8fafc"
  },
  menuItemText: {
    flex: 1,
    color: "#1f2937",
    fontSize: 15,
    fontWeight: "900"
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(15,23,42,0.45)"
  },
  observationModal: {
    gap: 12,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    padding: 18,
    backgroundColor: "#ffffff"
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  modalTitleArea: {
    flex: 1
  },
  modalTitle: {
    color: "#1f2937",
    fontSize: 20,
    fontWeight: "900"
  },
  modalSubtitle: {
    marginTop: 3,
    color: "#64748b",
    fontSize: 13,
    fontWeight: "700"
  },
  observationInput: {
    minHeight: 128,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "#1f2937",
    backgroundColor: "#f8fafc",
    fontSize: 15,
    textAlignVertical: "top"
  }
});
