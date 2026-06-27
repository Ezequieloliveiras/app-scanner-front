import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
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
  stopped: { label: "Parado", color: "#92400e", backgroundColor: "#fef3c7", icon: "pause-circle-outline" },
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

export function DashboardScreen({ token }: Props) {
  const [dashboard, setDashboard] = useState<InventoryDashboard | null>(null);
  const [productQuery, setProductQuery] = useState("");
  const [minStoppedDays, setMinStoppedDays] = useState("30");
  const [onlyStopped, setOnlyStopped] = useState(false);
  const [onlyWithStock, setOnlyWithStock] = useState(true);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const query = useMemo(
    () => ({
      product: productQuery.trim() || undefined,
      minStoppedDays: onlyStopped ? Number(minStoppedDays.replace(/\D/g, "") || 0) : undefined,
      onlyWithStock,
      sortBy: "daysStopped",
      sortDir: "desc",
      limit: 100
    }),
    [minStoppedDays, onlyStopped, onlyWithStock, productQuery]
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

  return (
    <ScrollView
      style={styles.content}
      contentContainerStyle={styles.contentInner}
      keyboardShouldPersistTaps="handled"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadDashboard("refresh")} />}
    >
      <View style={localStyles.hero}>
        <View style={localStyles.heroIcon}>
          <Ionicons name="analytics-outline" size={24} color="#3b82f6" />
        </View>
        <View style={localStyles.heroText}>
          <Text style={localStyles.heroTitle}>Gestão de estoque</Text>
          <Text style={localStyles.heroSubtitle}>Veja produtos parados, risco de encalhe e giro por tempo sem movimentação.</Text>
        </View>
      </View>

      <View style={localStyles.filterPanel}>
        <Text style={styles.fieldLabel}>Produto</Text>
        <TextInput
          value={productQuery}
          onChangeText={setProductQuery}
          placeholder="Filtrar por nome ou EAN"
          returnKeyType="search"
          style={styles.selectInput}
          onSubmitEditing={() => loadDashboard()}
        />

        <View style={localStyles.filterRow}>
          <Pressable
            style={[localStyles.filterToggle, onlyStopped && localStyles.filterToggleActive]}
            onPress={() => setOnlyStopped((current) => !current)}
          >
            <Ionicons name="pause-circle-outline" size={18} color={onlyStopped ? "#ffffff" : "#3b82f6"} />
            <Text style={[localStyles.filterToggleText, onlyStopped && localStyles.filterToggleTextActive]}>Parados</Text>
          </Pressable>

          <TextInput
            value={minStoppedDays}
            onChangeText={(value) => setMinStoppedDays(value.replace(/\D/g, ""))}
            placeholder="Dias"
            keyboardType="number-pad"
            style={[styles.selectInput, localStyles.daysInput]}
          />

          <Pressable
            style={[localStyles.filterToggle, onlyWithStock && localStyles.filterToggleActive]}
            onPress={() => setOnlyWithStock((current) => !current)}
          >
            <Ionicons name="cube-outline" size={18} color={onlyWithStock ? "#ffffff" : "#3b82f6"} />
            <Text style={[localStyles.filterToggleText, onlyWithStock && localStyles.filterToggleTextActive]}>Com estoque</Text>
          </Pressable>
        </View>

        <Pressable style={styles.primaryButton} onPress={() => loadDashboard()} disabled={loading}>
          {loading ? <ActivityIndicator color="#ffffff" /> : <Ionicons name="search-outline" size={18} color="#ffffff" />}
          <Text style={styles.primaryButtonText}>Aplicar filtros</Text>
        </Pressable>
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}

      {dashboard && (
        <>
          <View style={localStyles.metricsGrid}>
            <MetricCard label="Produtos" value={dashboard.metrics.totalProducts} icon="cube-outline" />
            <MetricCard label="Unidades" value={dashboard.metrics.totalUnitsInStock} icon="layers-outline" />
            <MetricCard label="Parados" value={dashboard.metrics.stoppedProducts} icon="pause-circle-outline" tone="warning" />
            <MetricCard label="Média parada" value={`${dashboard.metrics.averageStoppedDays}d`} icon="time-outline" />
          </View>

          {dashboard.metrics.oldestProduct && (
            <View style={localStyles.insightCard}>
              <View style={localStyles.insightIcon}>
                <Ionicons name="trending-down-outline" size={22} color="#92400e" />
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
      <View style={[localStyles.metricIcon, tone === "warning" && localStyles.metricIconWarning]}>
        <Ionicons name={icon} size={20} color={tone === "warning" ? "#92400e" : "#3b82f6"} />
      </View>
      <Text style={localStyles.metricNumber}>{value}</Text>
      <Text style={localStyles.metricText}>{label}</Text>
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
        <Ionicons name="bulb-outline" size={17} color="#92400e" />
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
  hero: {
    minHeight: 110,
    borderRadius: 8,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#17263a"
  },
  heroIcon: {
    width: 50,
    height: 50,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#eaf4ff"
  },
  heroText: {
    flex: 1
  },
  heroTitle: {
    color: "#ffffff",
    fontSize: 22,
    fontWeight: "900"
  },
  heroSubtitle: {
    marginTop: 4,
    color: "#cbd5e1",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "700"
  },
  filterPanel: {
    gap: 10,
    borderWidth: 1,
    borderColor: "#d8dee9",
    borderRadius: 8,
    padding: 14,
    backgroundColor: "#ffffff"
  },
  filterRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center"
  },
  filterToggle: {
    flex: 1,
    minHeight: 44,
    borderWidth: 1,
    borderColor: "#3b82f6",
    borderRadius: 8,
    paddingHorizontal: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#ffffff"
  },
  filterToggleActive: {
    backgroundColor: "#3b82f6"
  },
  filterToggleText: {
    color: "#3b82f6",
    fontSize: 12,
    fontWeight: "900"
  },
  filterToggleTextActive: {
    color: "#ffffff"
  },
  daysInput: {
    width: 74,
    flex: 0,
    textAlign: "center"
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10
  },
  metricCard: {
    width: "48%",
    minHeight: 118,
    borderWidth: 1,
    borderColor: "#d8dee9",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#ffffff"
  },
  metricIcon: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#eaf4ff"
  },
  metricIconWarning: {
    backgroundColor: "#fef3c7"
  },
  metricNumber: {
    marginTop: 10,
    color: "#1f2937",
    fontSize: 24,
    fontWeight: "900"
  },
  metricText: {
    marginTop: 2,
    color: "#64748b",
    fontSize: 12,
    fontWeight: "800"
  },
  insightCard: {
    borderWidth: 1,
    borderColor: "#fde68a",
    borderRadius: 8,
    padding: 12,
    flexDirection: "row",
    gap: 10,
    backgroundColor: "#fffbeb"
  },
  insightIcon: {
    width: 38,
    height: 38,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fef3c7"
  },
  insightText: {
    flex: 1
  },
  insightTitle: {
    color: "#78350f",
    fontSize: 14,
    fontWeight: "900"
  },
  insightBody: {
    marginTop: 3,
    color: "#92400e",
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
    gap: 10,
    borderWidth: 1,
    borderColor: "#d8dee9",
    borderRadius: 8,
    padding: 14,
    backgroundColor: "#ffffff"
  },
  productTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 10
  },
  productTitleArea: {
    flex: 1
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
    gap: 8
  },
  smallNumber: {
    flex: 1,
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
    borderLeftWidth: 4,
    borderLeftColor: "#f59e0b",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexDirection: "row",
    gap: 8,
    backgroundColor: "#fffbeb"
  },
  hintText: {
    flex: 1,
    color: "#78350f",
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
