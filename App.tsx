import { Ionicons } from "@expo/vector-icons";
import { BarcodeScanningResult, CameraView, useCameraPermissions } from "expo-camera";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useState } from "react";
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
import { InvoicePreviewProduct, InvoiceResult, Product } from "./src/types/product";

type Screen = "home" | "scan" | "products";

type EditableInvoiceProduct = InvoicePreviewProduct & {
  quantityInput: string;
};

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

  useEffect(() => {
    loadProducts().catch(() => {
      setError("Nao consegui conectar na API. Confira se o backend esta rodando.");
    });
  }, [loadProducts]);

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
  onSimulate
}: {
  productsCount: number;
  pendingCount: number;
  onScan: () => void;
  onProducts: () => void;
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
  onSimulate,
  topInset
}: {
  visible: boolean;
  onClose: () => void;
  onHome: () => void;
  onScan: () => void;
  onProducts: () => void;
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

function getScreenTitle(screen: Screen, pendingInvoice: InvoiceResult | null) {
  if (screen === "scan") return "Scannear nota";
  if (screen === "products" && pendingInvoice) return "Revisar entrada";
  if (screen === "products") return "Produtos";
  return "Home";
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
