import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { api } from "../api/client";
import { styles } from "../styles/appStyles";
import { DashboardProduct, DashboardProductStatus, InventoryDashboard } from "../types/app";

type Props = {
  token: string;
};

const STATUS_META: Record<DashboardProductStatus, { label: string; color: string; backgroundColor: string; icon: keyof typeof Ionicons.glyphMap }> = {
  out_of_stock: { label: "Sem estoque", color: "#991b1b", backgroundColor: "#fee2e2", icon: "alert-circle-outline" },
  without_movement: { label: "Sem movimento", color: "#475569", backgroundColor: "#e2e8f0", icon: "help-circle-outline" },
  stopped: { label: "Parado", color: "#B45309", backgroundColor: "#FFF4D6", icon: "pause-circle-outline" },
  attention: { label: "Atenção", color: "#1d4ed8", backgroundColor: "#dbeafe", icon: "time-outline" },
  healthy: { label: "Giro recente", color: "#3b82f6", backgroundColor: "#dbeafe", icon: "checkmark-circle-outline" }
};

const BUCKET_LABELS = {
  sem_estoque: "Sem estoque",
  sem_movimentacao: "Sem movimento",
  "0_7": "0-7 dias",
  "8_30": "8-30 dias",
  "31_60": "31-60 dias",
  "61_90": "61-90 dias",
  "90_plus": "+90 dias"
};

const DEFAULT_STOPPED_DAYS = 30;

export function DashboardScreen({ token }: Props) {
  const [dashboard, setDashboard] = useState<InventoryDashboard | null>(null);
  const [productQuery, setProductQuery] = useState("");
  const [onlyStopped, setOnlyStopped] = useState(false);
  const [onlyWithStock, setOnlyWithStock] = useState(true);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchFocused, setSearchFocused] = useState(false);
  const searchFocusAnim = useRef(new Animated.Value(0)).current;

  const query = useMemo(
    () => ({
      product: productQuery.trim() || undefined,
      minStoppedDays: onlyStopped ? DEFAULT_STOPPED_DAYS : undefined,
      onlyWithStock,
      sortBy: "daysStopped",
      sortDir: "desc",
      limit: 100
    }),
    [onlyStopped, onlyWithStock, productQuery]
  );

  const loadDashboard = useCallback(
    async (mode: "initial" | "refresh" = "initial") => {
      try {
        if (mode === "refresh") {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError(null);
        const data = await api.getInventoryDashboard(token, query);
        setDashboard(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Nao consegui carregar o dashboard.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [query, token]
  );

  useEffect(() => {
    loadDashboard().catch(() => undefined);
  }, [loadDashboard]);

  useEffect(() => {
    Animated.timing(searchFocusAnim, {
      toValue: searchFocused ? 1 : 0,
      duration: 180,
      useNativeDriver: false
    }).start();
  }, [searchFocusAnim, searchFocused]);

  const searchBorderColor = searchFocusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["#e4eaf2", "#8ab4ff"]
  });

  const searchShadowOpacity = searchFocusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.03, 0.1]
  });

  function showAllProducts() {
    setOnlyStopped(false);
    setOnlyWithStock(false);
  }

  return (
    <ScrollView
      style={styles.content}
      contentContainerStyle={[styles.contentInner, styles.productListScreenInner]}
      keyboardShouldPersistTaps="handled"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadDashboard("refresh")} />}
    >
      <View style={localStyles.filterPanel}>
        <View style={localStyles.filterHeader}>
          <Text style={localStyles.filterTitle}>Produto</Text>
          <Text style={localStyles.filterHint}>Filtros rápidos</Text>
        </View>

        <Animated.View
          style={[
            localStyles.searchBox,
            {
              borderColor: searchBorderColor,
              shadowOpacity: searchShadowOpacity
            }
          ]}
        >
          <Ionicons name="search-outline" size={18} color={searchFocused ? "#3b82f6" : "#8a95a5"} />
          <TextInput
            value={productQuery}
            onChangeText={setProductQuery}
            placeholder="Buscar produto ou EAN"
            placeholderTextColor="#8a95a5"
            returnKeyType="search"
            style={localStyles.searchInput}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            onSubmitEditing={() => loadDashboard()}
          />
        </Animated.View>

        <View style={localStyles.statusGroup}>
          <Text style={localStyles.groupLabel}>Status</Text>
          <View style={localStyles.chipRow}>
            <FilterChip label="Todos" icon="apps-outline" selected={!onlyStopped && !onlyWithStock} onPress={showAllProducts} />
            <FilterChip
              label="Parados"
              icon="pause-circle-outline"
              selected={onlyStopped}
              onPress={() => setOnlyStopped((current) => !current)}
            />
            <FilterChip
              label="Em estoque"
              icon="cube-outline"
              selected={onlyWithStock}
              onPress={() => setOnlyWithStock((current) => !current)}
            />
          </View>
        </View>

        <Pressable
          style={({ pressed }) => [
            localStyles.filterButton,
            pressed && !loading && localStyles.filterButtonPressed,
            loading && localStyles.filterButtonDisabled
          ]}
          onPress={() => loadDashboard()}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#ffffff" /> : <Ionicons name="search-outline" size={18} color="#ffffff" />}
          <Text style={localStyles.filterButtonText}>Aplicar filtros</Text>
        </Pressable>
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}

      {dashboard && (
        <>
          <View style={localStyles.metricsGrid}>
            <MetricCard label="Produtos" value={dashboard.metrics.totalProducts} icon="cube-outline" />
            <MetricCard label="Parados" value={dashboard.metrics.stoppedProducts} icon="pause-circle-outline" tone="warning" />
            <MetricCard label="Média parada" value={`${dashboard.metrics.averageStoppedDays}d`} icon="time-outline" />
            <MetricCard label="Unidades" value={dashboard.metrics.totalUnitsInStock} icon="layers-outline" />
          </View>

          {dashboard.metrics.oldestProduct && (
            <View style={localStyles.insightCard}>
              <View style={localStyles.insightIcon}>
                <Ionicons name="trending-down-outline" size={22} color="#B45309" />
              </View>
              <View style={localStyles.insightText}>
                <Text style={localStyles.insightTitle}>Maior tempo parado</Text>
                <Text style={localStyles.insightBody}>
                  {dashboard.metrics.oldestProduct.name} está parado há {dashboard.metrics.oldestProduct.daysStopped || 0} dias com{" "}
                  {dashboard.metrics.oldestProduct.totalQuantity} unidade(s) no estoque.
                </Text>
              </View>
            </View>
          )}

          <View style={localStyles.bucketPanel}>
            <Text style={styles.sectionTitle}>Tempo parado</Text>
            <View style={localStyles.bucketGrid}>
              {Object.entries(dashboard.agingBuckets).map(([key, value]) => (
                <View key={key} style={localStyles.bucketItem}>
                  <Text style={localStyles.bucketValue}>{value}</Text>
                  <Text style={localStyles.bucketLabel}>{BUCKET_LABELS[key as keyof typeof BUCKET_LABELS]}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={localStyles.listHeader}>
            <View>
              <Text style={styles.sectionTitle}>Produtos analisados</Text>
              <Text style={styles.sectionSubtitle}>{dashboard.products.length} item(ns) no filtro atual</Text>
            </View>
            <Text style={styles.meta}>{formatDateTime(dashboard.generatedAt)}</Text>
          </View>

          {dashboard.products.length === 0 ? (
            <View style={localStyles.emptyState}>
              <Ionicons name="search-outline" size={28} color="#64748b" />
              <Text style={localStyles.emptyTitle}>Nenhum produto encontrado</Text>
              <Text style={styles.mutedText}>Ajuste o filtro por produto ou dias parados.</Text>
            </View>
          ) : (
            dashboard.products.map((product) => <DashboardProductCard key={product.id} product={product} />)
          )}
        </>
      )}
    </ScrollView>
  );
}

function FilterChip({
  label,
  icon,
  selected,
  onPress
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        localStyles.filterChip,
        selected && localStyles.filterChipSelected,
        pressed && localStyles.filterChipPressed
      ]}
      onPress={onPress}
    >
      <Ionicons name={icon} size={15} color={selected ? "#ffffff" : "#5f6d7d"} />
      <Text style={[localStyles.filterChipText, selected && localStyles.filterChipTextSelected]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

function MetricCard({
  label,
  value,
  icon,
  tone = "default"
}: {
  label: string;
  value: number | string;
  icon: keyof typeof Ionicons.glyphMap;
  tone?: "default" | "warning";
}) {
  return (
    <View style={localStyles.metricCard}>
      <View style={localStyles.metricTop}>
        <View style={[localStyles.metricIcon, tone === "warning" && localStyles.metricIconWarning]}>
          <Ionicons name={icon} size={15} color={tone === "warning" ? "#B45309" : "#3b82f6"} />
        </View>
        <Text style={localStyles.metricNumber} numberOfLines={1} adjustsFontSizeToFit>
          {value}
        </Text>
      </View>
      <Text style={localStyles.metricText} numberOfLines={1} adjustsFontSizeToFit>
        {label}
      </Text>
    </View>
  );
}

function DashboardProductCard({ product }: { product: DashboardProduct }) {
  const status = STATUS_META[product.status];

  return (
    <View style={localStyles.productCard}>
      <View style={localStyles.productTop}>
        <View style={localStyles.productTitleArea}>
          <Text style={localStyles.productName}>{product.name}</Text>
          <Text style={localStyles.productMeta}>EAN {product.ean}</Text>
        </View>
        <View style={[localStyles.statusBadge, { backgroundColor: status.backgroundColor }]}>
          <Ionicons name={status.icon} size={15} color={status.color} />
          <Text style={[localStyles.statusText, { color: status.color }]}>{status.label}</Text>
        </View>
      </View>

      <View style={localStyles.productNumbers}>
        <SmallNumber label="Total" value={product.totalQuantity} />
        <SmallNumber label="Central" value={product.centralQuantity} />
        <SmallNumber label="Filiais" value={product.branchQuantity} />
        <SmallNumber label="Parado" value={product.daysStopped === null ? "--" : `${product.daysStopped}d`} />
      </View>

      <View style={localStyles.hintRow}>
        <Ionicons name="bulb-outline" size={17} color="#B45309" />
        <Text style={localStyles.hintText}>{product.managementHint}</Text>
      </View>

      {!!product.lastMovementAt && (
        <Text style={localStyles.productMeta}>Última movimentação: {formatDateTime(product.lastMovementAt)}</Text>
      )}

      {product.branchStocks.length > 0 && (
        <View style={localStyles.branchChips}>
          {product.branchStocks.map((branch) => (
            <Text key={branch.branchName} style={localStyles.branchChip}>
              {branch.branchName}: {branch.quantity}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
}

function SmallNumber({ label, value }: { label: string; value: number | string }) {
  return (
    <View style={localStyles.smallNumber}>
      <Text style={localStyles.smallNumberValue}>{value}</Text>
      <Text style={localStyles.smallNumberLabel}>{label}</Text>
    </View>
  );
}

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "sem data";

  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}

const localStyles = StyleSheet.create({
  filterPanel: {
    gap: 16,
    borderWidth: 1,
    borderColor: "#edf2f7",
    borderRadius: 18,
    padding: 16,
    backgroundColor: "#ffffff",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 18,
    elevation: 2
  },
  filterHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 8,
  },
  filterTitle: {
    color: "#1f2937",
    fontSize: 14,
    fontWeight: "600"
  },
  filterHint: {
    color: "#8a95a5",
    fontSize: 11,
    fontWeight: "600"
  },
  searchBox: {
    minHeight: 46,
    borderWidth: 1,
    borderRadius: 15,
    paddingHorizontal: 13,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    backgroundColor: "#fbfdff",
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 14,
    elevation: 1
  },
  searchInput: {
    flex: 1,
    minHeight: 44,
    paddingVertical: 0,
    color: "#1f2937",
    fontSize: 14,
    fontWeight: "600"
  },
  statusGroup: {
    gap: 10
  },
  groupLabel: {
    color: "#596579",
    fontSize: 12,
    fontWeight: "600"
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  filterChip: {
    minHeight: 34,
    borderWidth: 1,
    borderColor: "#e5ebf3",
    borderRadius: 17,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#f7f9fc"
  },
  filterChipSelected: {
    borderColor: "#3b82f6",
    backgroundColor: "#3b82f6",
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.16,
    shadowRadius: 10,
    elevation: 2
  },
  filterChipPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.98 }]
  },
  filterChipText: {
    color: "#5f6d7d",
    fontSize: 12,
    fontWeight: "700"
  },
  filterChipTextSelected: {
    color: "#ffffff"
  },
  filterButton: {
    minHeight: 46,
    borderRadius: 14,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#3b82f6",
    shadowColor: "#2563eb",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 14,
    elevation: 3
  },
  filterButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }]
  },
  filterButtonDisabled: {
    opacity: 0.65
  },
  filterButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "800"
  },
  metricsGrid: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#d8dee9",
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 8,
    backgroundColor: "#ffffff"
  },
  metricCard: {
    width: "25%",
    minHeight: 48,
    paddingHorizontal: 1,
    paddingVertical: 6,
    alignItems: "center",
    justifyContent: "center"
  },
  metricTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    gap: 3
  },
  metricIcon: {
    width: 18,
    height: 18,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#eaf4ff"
  },
  metricIconWarning: {
    backgroundColor: "#FFF4D6"
  },
  metricNumber: {
    color: "#1f2937",
    fontSize: 15,
    fontWeight: "900"
  },
  metricText: {
    marginTop: 3,
    color: "#64748b",
    width: "100%",
    fontSize: 8,
    textAlign: "center",
    fontWeight: "800"
  },
  insightCard: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderLeftWidth: 4,
    borderLeftColor: "#F59E0B",
    borderRadius: 8,
    padding: 12,
    flexDirection: "row",
    gap: 10,
    backgroundColor: "#ffffff",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 18,
    elevation: 2
  },
  insightIcon: {
    width: 38,
    height: 38,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF4D6"
  },
  insightText: {
    flex: 1
  },
  insightTitle: {
    color: "#1F2937",
    fontSize: 14,
    fontWeight: "900"
  },
  insightBody: {
    marginTop: 3,
    color: "#64748B",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "700"
  },
  bucketPanel: {
    gap: 10
  },
  bucketGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  bucketItem: {
    width: "31%",
    minHeight: 70,
    borderWidth: 1,
    borderColor: "#d8dee9",
    borderRadius: 8,
    padding: 10,
    backgroundColor: "#f8fafc"
  },
  bucketValue: {
    color: "#3b82f6",
    fontSize: 18,
    fontWeight: "900"
  },
  bucketLabel: {
    marginTop: 3,
    color: "#475569",
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "800"
  },
  listHeader: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 10
  },
  emptyState: {
    minHeight: 140,
    borderWidth: 1,
    borderColor: "#d8dee9",
    borderRadius: 8,
    padding: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8fafc"
  },
  emptyTitle: {
    marginTop: 8,
    color: "#1f2937",
    fontSize: 16,
    fontWeight: "900"
  },
  productCard: {
    width: "100%",
    gap: 10,
    borderWidth: 1,
    borderColor: "#d8dee9",
    borderRadius: 8,
    padding: 14,
    backgroundColor: "#ffffff"
  },
  productTop: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 10
  },
  productTitleArea: {
    flex: 1,
    minWidth: 0
  },
  productName: {
    color: "#1f2937",
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "900"
  },
  productMeta: {
    marginTop: 3,
    color: "#64748b",
    fontSize: 12,
    fontWeight: "800"
  },
  statusBadge: {
    alignSelf: "flex-start",
    minHeight: 30,
    borderRadius: 8,
    paddingHorizontal: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 5
  },
  statusText: {
    fontSize: 11,
    fontWeight: "900"
  },
  productNumbers: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  smallNumber: {
    flexGrow: 1,
    flexBasis: "23%",
    minWidth: 68,
    minHeight: 58,
    borderRadius: 8,
    padding: 8,
    backgroundColor: "#f8fafc"
  },
  smallNumberValue: {
    color: "#1f2937",
    fontSize: 15,
    fontWeight: "900"
  },
  smallNumberLabel: {
    marginTop: 2,
    color: "#64748b",
    fontSize: 10,
    fontWeight: "800"
  },
  hintRow: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderLeftWidth: 4,
    borderLeftColor: "#F59E0B",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexDirection: "row",
    gap: 8,
    backgroundColor: "#F8FAFC"
  },
  hintText: {
    flex: 1,
    color: "#64748B",
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "800"
  },
  branchChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6
  },
  branchChip: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
    overflow: "hidden",
    color: "#3b82f6",
    backgroundColor: "#eaf4ff",
    fontSize: 11,
    fontWeight: "900"
  }
});
