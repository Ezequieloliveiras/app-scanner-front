import { Ionicons } from "@expo/vector-icons";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  LayoutAnimation,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  UIManager,
  View
} from "react-native";
import { api } from "../api/client";
import { softShadow, styles } from "../styles/appStyles";
import { DashboardProduct, DashboardProductStatus, InventoryDashboard } from "../types/app";

type Props = {
  token: string;
};

type StatusFilter = "all" | "out_of_stock" | "without_movement" | "stopped";

const STATUS_META: Record<
  DashboardProductStatus,
  {
    label: string;
    color: string;
    backgroundColor: string;
    sideColor: string;
  }
> = {
  out_of_stock: {
    label: "Sem estoque",
    color: "#DC2626",
    backgroundColor: "#FEE2E2",
    sideColor: "#FF6B6B"
  },
  without_movement: {
    label: "Sem movimento",
    color: "#D97706",
    backgroundColor: "#FEF3C7",
    sideColor: "#FBBF24"
  },
  stopped: {
    label: "Parado",
    color: "#B45309",
    backgroundColor: "#FEF3C7",
    sideColor: "#FACC15"
  },
  attention: {
    label: "Atenção",
    color: "#D97706",
    backgroundColor: "#FFEDD5",
    sideColor: "#FB923C"
  },
  healthy: {
    label: "Giro recente",
    color: "#16A34A",
    backgroundColor: "#DCFCE7",
    sideColor: "#22C55E"
  }
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

const STATUS_CHIPS: Array<{ id: StatusFilter; label: string }> = [
  { id: "all", label: "Todos" },
  { id: "out_of_stock", label: "Sem estoque" },
  { id: "without_movement", label: "Sem movimento" },
  { id: "stopped", label: "Parado" }
];

const DEFAULT_STOPPED_DAYS = 30;
const DASHBOARD_PRODUCT_LIMIT = 500;
type DatePreset = "all" | "7d" | "30d" | "90d";
type SortOption = "stopped_desc" | "quantity_desc" | "name_asc";

const DATE_PRESETS: Array<{ id: DatePreset; label: string; days?: number }> = [
  { id: "all", label: "Todo o periodo" },
  { id: "7d", label: "Ultimos 7 dias", days: 7 },
  { id: "30d", label: "Ultimos 30 dias", days: 30 },
  { id: "90d", label: "Ultimos 90 dias", days: 90 }
];

const SORT_OPTIONS: Array<{ id: SortOption; label: string; sortBy: "daysStopped" | "quantity" | "name"; sortDir: "asc" | "desc" }> = [
  { id: "stopped_desc", label: "Maior tempo parado", sortBy: "daysStopped", sortDir: "desc" },
  { id: "quantity_desc", label: "Maior estoque", sortBy: "quantity", sortDir: "desc" },
  { id: "name_asc", label: "Nome A-Z", sortBy: "name", sortDir: "asc" }
];

const isNewArchitectureEnabled = Boolean((globalThis as { nativeFabricUIManager?: unknown }).nativeFabricUIManager);

if (Platform.OS === "android" && !isNewArchitectureEnabled && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export function DashboardScreen({ token }: Props) {
  const [dashboard, setDashboard] = useState<InventoryDashboard | null>(null);
  const [productQuery, setProductQuery] = useState("");
  const [debouncedProductQuery, setDebouncedProductQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [onlyStopped, setOnlyStopped] = useState(false);
  const [onlyWithStock, setOnlyWithStock] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedProductId, setExpandedProductId] = useState<string | null>(null);
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [indicatorsExpanded, setIndicatorsExpanded] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState("");
  const [datePreset, setDatePreset] = useState<DatePreset>("all");
  const [sortOption, setSortOption] = useState<SortOption>("stopped_desc");

  const selectedSort = SORT_OPTIONS.find((option) => option.id === sortOption) || SORT_OPTIONS[0];
  const movementFrom = useMemo(() => getPresetStartDate(datePreset), [datePreset]);
  const query = useMemo(
    () => ({
      branch: selectedBranch || undefined,
      movementFrom,
      minStoppedDays: onlyStopped ? DEFAULT_STOPPED_DAYS : undefined,
      onlyWithStock,
      sortBy: selectedSort.sortBy,
      sortDir: selectedSort.sortDir,
      limit: DASHBOARD_PRODUCT_LIMIT
    }),
    [movementFrom, onlyStopped, onlyWithStock, selectedBranch, selectedSort.sortBy, selectedSort.sortDir]
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
    const timer = setTimeout(() => setDebouncedProductQuery(productQuery), 220);

    return () => clearTimeout(timer);
  }, [productQuery]);

  const filteredProducts = useMemo(
    () => filterDashboardProducts(dashboard?.products ?? [], debouncedProductQuery, statusFilter),
    [dashboard?.products, debouncedProductQuery, statusFilter]
  );
  const branchOptions = useMemo(() => getBranchOptions(dashboard?.products ?? [], selectedBranch), [dashboard?.products, selectedBranch]);

  const toggleExpandedProduct = useCallback((productId: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedProductId((current) => (current === productId ? null : productId));
  }, []);

  const selectStatusFilter = useCallback((nextStatus: StatusFilter) => {
    setStatusFilter(nextStatus);
    setOnlyStopped(nextStatus === "stopped");
    if (nextStatus !== "all") {
      setOnlyWithStock(false);
    }
  }, []);

  const showAllProducts = useCallback(() => {
    setStatusFilter("all");
    setOnlyStopped(false);
    setOnlyWithStock(false);
  }, []);

  const renderProduct = useCallback(
    ({ item }: { item: DashboardProduct }) => (
      <DashboardProductCard product={item} expanded={expandedProductId === item.id} onToggle={toggleExpandedProduct} />
    ),
    [expandedProductId, toggleExpandedProduct]
  );

  const productKeyExtractor = useCallback((product: DashboardProduct) => product.id, []);

  return (
    <>
      <FlatList
        data={dashboard ? filteredProducts : []}
        renderItem={renderProduct}
        keyExtractor={productKeyExtractor}
        style={localStyles.screen}
        contentContainerStyle={localStyles.listContent}
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadDashboard("refresh")} tintColor="#2563EB" />}
        initialNumToRender={12}
        maxToRenderPerBatch={12}
        updateCellsBatchingPeriod={45}
        windowSize={8}
        removeClippedSubviews
        extraData={expandedProductId}
        ListHeaderComponent={
          <DashboardHeaderContent
            dashboard={dashboard}
            loading={loading}
            error={error}
            productQuery={productQuery}
            statusFilter={statusFilter}
            onChangeProductQuery={setProductQuery}
            onSubmitProductQuery={() => setDebouncedProductQuery(productQuery)}
            onClearProductQuery={() => setProductQuery("")}
            onOpenFilters={() => setFiltersVisible(true)}
            onSelectStatusFilter={selectStatusFilter}
          />
        }
        ListEmptyComponent={
          dashboard && !loading ? (
            <View style={localStyles.emptyState}>
              <Ionicons name="search-outline" size={26} color="#94A3B8" />
              <Text style={localStyles.emptyTitle}>Nenhum produto encontrado</Text>
              <Text style={localStyles.emptyText}>Ajuste a busca ou os filtros do dashboard.</Text>
            </View>
          ) : null
        }
      />

      <Modal visible={filtersVisible} transparent animationType="slide" onRequestClose={() => setFiltersVisible(false)}>
        <Pressable style={localStyles.sheetBackdrop} onPress={() => setFiltersVisible(false)}>
          <Pressable style={localStyles.filterSheet} onPress={(event) => event.stopPropagation()}>
            <View style={localStyles.sheetHandle} />
            <View style={localStyles.sheetHeader}>
              <Text style={localStyles.sheetTitle}>Filtros</Text>
              <Pressable style={localStyles.sheetCloseButton} onPress={() => setFiltersVisible(false)} accessibilityLabel="Fechar filtros">
                <Ionicons name="close-outline" size={21} color="#64748B" />
              </Pressable>
            </View>

            <View style={localStyles.sheetSection}>
              <Text style={localStyles.groupLabel}>Status</Text>
              <View style={localStyles.sheetChipRow}>
                <SheetChip label="Todos" icon="apps-outline" selected={statusFilter === "all" && !onlyStopped && !onlyWithStock} onPress={showAllProducts} />
                <SheetChip
                  label="Sem estoque"
                  icon="alert-circle-outline"
                  selected={statusFilter === "out_of_stock"}
                  onPress={() => selectStatusFilter("out_of_stock")}
                />
                <SheetChip
                  label="Sem movimento"
                  icon="remove-circle-outline"
                  selected={statusFilter === "without_movement"}
                  onPress={() => selectStatusFilter("without_movement")}
                />
                <SheetChip label="Parado" icon="pause-circle-outline" selected={statusFilter === "stopped"} onPress={() => selectStatusFilter("stopped")} />
                <SheetChip
                  label="Com estoque"
                  icon="cube-outline"
                  selected={onlyWithStock}
                  onPress={() => {
                    setOnlyWithStock((current) => !current);
                    setStatusFilter("all");
                  }}
                />
              </View>
            </View>

            <View style={localStyles.sheetSection}>
              <Text style={localStyles.groupLabel}>Filial</Text>
              <View style={localStyles.sheetChipRow}>
                <SheetChip label="Todas" icon="git-branch-outline" selected={!selectedBranch} onPress={() => setSelectedBranch("")} />
                {branchOptions.map((branch) => (
                  <SheetChip
                    key={branch}
                    label={branch}
                    icon="business-outline"
                    selected={selectedBranch === branch}
                    onPress={() => setSelectedBranch((current) => (current === branch ? "" : branch))}
                  />
                ))}
              </View>
            </View>

            <View style={localStyles.sheetSection}>
              <Text style={localStyles.groupLabel}>Datas</Text>
              <View style={localStyles.sheetChipRow}>
                {DATE_PRESETS.map((preset) => (
                  <SheetChip
                    key={preset.id}
                    label={preset.label}
                    icon="calendar-outline"
                    selected={datePreset === preset.id}
                    onPress={() => setDatePreset(preset.id)}
                  />
                ))}
              </View>
            </View>

            <View style={localStyles.sheetSection}>
              <Text style={localStyles.groupLabel}>Outros filtros</Text>
              <View style={localStyles.sheetChipRow}>
                {SORT_OPTIONS.map((option) => (
                  <SheetChip
                    key={option.id}
                    label={option.label}
                    icon="swap-vertical-outline"
                    selected={sortOption === option.id}
                    onPress={() => setSortOption(option.id)}
                  />
                ))}
              </View>
            </View>

            {dashboard && (
              <View style={localStyles.sheetSection}>
                <Pressable
                  style={localStyles.indicatorsHeader}
                  onPress={() => {
                    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                    setIndicatorsExpanded((current) => !current);
                  }}
                >
                  <View style={localStyles.indicatorsTitleRow}>
                    <Ionicons name="analytics-outline" size={18} color="#2563EB" />
                    <Text style={localStyles.indicatorsTitle}>Indicadores</Text>
                  </View>
                  <Ionicons name={indicatorsExpanded ? "chevron-up-outline" : "chevron-down-outline"} size={19} color="#2563EB" />
                </Pressable>

                {indicatorsExpanded && (
                  <View style={localStyles.indicatorsBody}>
                    {dashboard.metrics.oldestProduct && (
                      <View style={localStyles.insightCard}>
                        <View style={localStyles.insightIcon}>
                          <Ionicons name="trending-down-outline" size={20} color="#B45309" />
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
                      <Text style={localStyles.indicatorsSubtitle}>Tempo parado</Text>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={localStyles.bucketChipRow}>
                        {Object.entries(dashboard.agingBuckets).map(([key, value]) => (
                          <View key={key} style={localStyles.bucketChip}>
                            <Text style={localStyles.bucketValue}>{value}</Text>
                            <Text style={localStyles.bucketLabel} numberOfLines={1}>
                              {BUCKET_LABELS[key as keyof typeof BUCKET_LABELS]}
                            </Text>
                          </View>
                        ))}
                      </ScrollView>
                    </View>
                  </View>
                )}
              </View>
            )}

            <Pressable style={localStyles.sheetApplyButton} onPress={() => setFiltersVisible(false)}>
              <Text style={localStyles.sheetApplyButtonText}>Aplicar filtros</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

function DashboardHeaderContent({
  dashboard,
  loading,
  error,
  productQuery,
  statusFilter,
  onChangeProductQuery,
  onSubmitProductQuery,
  onClearProductQuery,
  onOpenFilters,
  onSelectStatusFilter
}: {
  dashboard: InventoryDashboard | null;
  loading: boolean;
  error: string | null;
  productQuery: string;
  statusFilter: StatusFilter;
  onChangeProductQuery: (value: string) => void;
  onSubmitProductQuery: () => void;
  onClearProductQuery: () => void;
  onOpenFilters: () => void;
  onSelectStatusFilter: (status: StatusFilter) => void;
}) {
  return (
    <View style={localStyles.dashboardHeader}>
      <Text style={localStyles.contextText}>VISÃO GERAL · {formatDashboardDate(dashboard?.generatedAt)}</Text>

      {dashboard && (
        <View style={localStyles.metricsRow}>
          <MetricCard label="Produtos" value={dashboard.metrics.totalProducts} icon="cube-outline" tone="blue" />
          <MetricCard label="Parados" value={dashboard.metrics.stoppedProducts} icon="trending-down-outline" tone="red" />
          <MetricCard label="Média\nparada" value={`${dashboard.metrics.averageStoppedDays}d`} icon="time-outline" tone="orange" />
        </View>
      )}

      {loading && !dashboard && (
        <View style={localStyles.loadingState}>
          <ActivityIndicator color="#2563EB" />
        </View>
      )}

      {error && <Text style={styles.errorText}>{error}</Text>}

      <View style={localStyles.searchRow}>
        <View style={localStyles.searchBox}>
          <Ionicons name="search-outline" size={17} color="#94A3B8" />
          <TextInput
            value={productQuery}
            onChangeText={onChangeProductQuery}
            placeholder="Buscar produto..."
            placeholderTextColor="#94A3B8"
            returnKeyType="search"
            style={localStyles.searchInput}
            onSubmitEditing={onSubmitProductQuery}
          />
          {!!productQuery && (
            <Pressable style={localStyles.clearSearchButton} onPress={onClearProductQuery} accessibilityRole="button" accessibilityLabel="Limpar busca">
              <Ionicons name="close-outline" size={17} color="#94A3B8" />
            </Pressable>
          )}
        </View>

        <Pressable style={({ pressed }) => [localStyles.filtersTrigger, pressed && localStyles.pressed]} onPress={onOpenFilters} accessibilityRole="button">
          <Ionicons name="options-outline" size={17} color="#071426" />
          <Text style={localStyles.filtersTriggerText}>Filtros</Text>
        </Pressable>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={localStyles.statusChipRow}
        keyboardShouldPersistTaps="handled"
      >
        {STATUS_CHIPS.map((chip) => (
          <StatusChip key={chip.id} label={chip.label} selected={statusFilter === chip.id} onPress={() => onSelectStatusFilter(chip.id)} />
        ))}
      </ScrollView>
    </View>
  );
}

function StatusChip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable
      style={({ pressed }) => [localStyles.statusChip, selected && localStyles.statusChipSelected, pressed && localStyles.pressed]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
    >
      <Text style={[localStyles.statusChipText, selected && localStyles.statusChipTextSelected]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

function SheetChip({
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
      style={({ pressed }) => [localStyles.sheetChip, selected && localStyles.sheetChipSelected, pressed && localStyles.pressed]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
    >
      <Ionicons name={icon} size={14} color={selected ? "#FFFFFF" : "#64748B"} />
      <Text style={[localStyles.sheetChipText, selected && localStyles.sheetChipTextSelected]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

function MetricCard({
  label,
  value,
  icon,
  tone
}: {
  label: string;
  value: number | string;
  icon: keyof typeof Ionicons.glyphMap;
  tone: "blue" | "red" | "orange";
}) {
  const toneStyle = tone === "red" ? localStyles.metricIconRed : tone === "orange" ? localStyles.metricIconOrange : localStyles.metricIconBlue;
  const iconColor = tone === "red" ? "#EF4444" : tone === "orange" ? "#F59E0B" : "#2563EB";

  return (
    <View style={localStyles.metricCard}>
      <View style={localStyles.metricHeader}>
        <Text style={localStyles.metricNumber} numberOfLines={1} adjustsFontSizeToFit>
          {value}
        </Text>
        <View style={[localStyles.metricIcon, toneStyle]}>
          <Ionicons name={icon} size={14} color={iconColor} />
        </View>
      </View>
      <Text style={localStyles.metricText}>{label}</Text>
    </View>
  );
}

const DashboardProductCard = memo(function DashboardProductCard({
  product,
  expanded,
  onToggle
}: {
  product: DashboardProduct;
  expanded: boolean;
  onToggle: (productId: string) => void;
}) {
  const status = STATUS_META[product.status];
  const stoppedLabel = product.daysStopped === null ? "--" : `${product.daysStopped}d`;
  const handleToggle = useCallback(() => onToggle(product.id), [onToggle, product.id]);

  return (
    <Pressable
      style={({ pressed }) => [localStyles.productCard, expanded && localStyles.productCardExpanded, pressed && localStyles.cardPressed]}
      onPress={handleToggle}
      accessibilityRole="button"
      accessibilityLabel={`Produto ${product.name}`}
    >
      <View style={[localStyles.statusRail, { backgroundColor: status.sideColor }]} />

      <View style={localStyles.productMain}>
        <Text style={localStyles.productName} numberOfLines={2} ellipsizeMode="tail">
          {product.name}
        </Text>

        <View style={localStyles.productMetaRow}>
          <View style={[localStyles.statusBadge, { backgroundColor: status.backgroundColor }]}>
            <Text style={[localStyles.statusText, { color: status.color }]} numberOfLines={1}>
              {status.label}
            </Text>
          </View>
          <Text style={localStyles.productCode} numberOfLines={1} ellipsizeMode="tail">
            {product.ean}
          </Text>
        </View>

        {expanded && (
          <View style={localStyles.productDetails}>
            <View style={localStyles.productNumbers}>
              <SmallNumber label="Total" value={product.totalQuantity} />
              <SmallNumber label="Central" value={product.centralQuantity} />
              <SmallNumber label="Filiais" value={product.branchQuantity} />
              <SmallNumber label="Parado" value={stoppedLabel} />
            </View>

            <View style={localStyles.hintRow}>
              <Ionicons name="bulb-outline" size={16} color="#B45309" />
              <Text style={localStyles.hintText}>{product.managementHint}</Text>
            </View>

            {!!product.lastMovementAt && <Text style={localStyles.detailMeta}>Última movimentação: {formatDateTime(product.lastMovementAt)}</Text>}

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
        )}
      </View>

      <View style={localStyles.quantityArea}>
        <Text style={localStyles.quantityText} numberOfLines={1} adjustsFontSizeToFit>
          {formatQuantity(product.totalQuantity)}
        </Text>
        <Text style={localStyles.unitText}>{getProductUnit(product)}</Text>
        <Ionicons name={expanded ? "chevron-up-outline" : "chevron-down-outline"} size={16} color="#8AA1C1" style={localStyles.expandIcon} />
      </View>
    </Pressable>
  );
});

function SmallNumber({ label, value }: { label: string; value: number | string }) {
  return (
    <View style={localStyles.smallNumber}>
      <Text style={localStyles.smallNumberValue}>{value}</Text>
      <Text style={localStyles.smallNumberLabel}>{label}</Text>
    </View>
  );
}

function filterDashboardProducts(products: DashboardProduct[], query: string, statusFilter: StatusFilter) {
  const normalizedQuery = normalizeSearch(query);

  return products.filter((product) => {
    const matchesStatus = statusFilter === "all" ? true : product.status === statusFilter;
    if (!matchesStatus) return false;
    if (!normalizedQuery) return true;
    return getDashboardProductSearchText(product).includes(normalizedQuery);
  });
}

function getPresetStartDate(preset: DatePreset) {
  const option = DATE_PRESETS.find((item) => item.id === preset);
  if (!option?.days) return undefined;

  const date = new Date();
  date.setDate(date.getDate() - option.days);
  date.setHours(0, 0, 0, 0);
  return date.toISOString();
}

function getBranchOptions(products: DashboardProduct[], selectedBranch: string) {
  const branches = new Set<string>();

  products.forEach((product) => {
    product.branchStocks.forEach((branch) => {
      if (branch.quantity > 0) {
        branches.add(branch.branchName);
      }
    });
  });

  if (selectedBranch) {
    branches.add(selectedBranch);
  }

  return Array.from(branches).sort((left, right) => left.localeCompare(right));
}

function getDashboardProductSearchText(product: DashboardProduct) {
  const status = STATUS_META[product.status];
  const branchText = product.branchStocks.map((branch) => `${branch.branchName} ${branch.quantity}`).join(" ");

  return normalizeSearch(
    [
      product.name,
      product.ean,
      status.label,
      product.status,
      product.agingBucket,
      branchText,
      product.managementHint,
      String(product.totalQuantity),
      product.daysStopped === null ? "" : `${product.daysStopped}d`
    ].join(" ")
  );
}

function normalizeSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
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

function formatDashboardDate(value?: string) {
  if (!value) return "--/--/----";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--/--/----";

  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
}

function formatQuantity(value: number) {
  return Number.isInteger(value) ? String(value) : String(value).replace(".", ",");
}

function getProductUnit(product: DashboardProduct) {
  const productWithUnit = product as DashboardProduct & {
    unit?: string;
    measureUnit?: string;
    unidade?: string;
  };

  return productWithUnit.unit || productWithUnit.measureUnit || productWithUnit.unidade || "un";
}

const localStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F7F9FC"
  },
  listContent: {
    paddingHorizontal: 11,
    paddingTop: 12,
    paddingBottom: 22,
    gap: 10
  },
  dashboardHeader: {
    gap: 10
  },
  contextText: {
    color: "#94A3B8",
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "900",
    letterSpacing: 0
  },
  metricsRow: {
    flexDirection: "row",
    gap: 8
  },
  metricCard: {
    flex: 1,
    minHeight: 73,
    borderWidth: 1,
    borderColor: "#DCE3EE",
    borderRadius: 11,
    paddingHorizontal: 11,
    paddingTop: 11,
    paddingBottom: 9,
    backgroundColor: "#FFFFFF",
    ...softShadow
  },
  metricHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 4
  },
  metricNumber: {
    flex: 1,
    minWidth: 0,
    color: "#020617",
    fontSize: 22,
    lineHeight: 25,
    fontWeight: "900"
  },
  metricIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center"
  },
  metricIconBlue: {
    backgroundColor: "#EAF2FF"
  },
  metricIconRed: {
    backgroundColor: "#FFECEE"
  },
  metricIconOrange: {
    backgroundColor: "#FFF7E6"
  },
  metricText: {
    marginTop: 2,
    color: "#64748B",
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "600"
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  searchBox: {
    flex: 1,
    minHeight: 38,
    borderWidth: 1,
    borderColor: "#DCE3EE",
    borderRadius: 11,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: "#FBFDFF"
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    minHeight: 36,
    paddingVertical: 0,
    color: "#071426",
    fontSize: 13,
    lineHeight: 16,
    fontWeight: "500"
  },
  clearSearchButton: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center"
  },
  filtersTrigger: {
    minHeight: 38,
    borderWidth: 1,
    borderColor: "#DCE3EE",
    borderRadius: 10,
    paddingHorizontal: 11,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    backgroundColor: "#FFFFFF"
  },
  filtersTriggerText: {
    color: "#071426",
    fontSize: 12,
    lineHeight: 15,
    fontWeight: "800"
  },
  statusChipRow: {
    flexDirection: "row",
    gap: 8,
    paddingRight: 2
  },
  statusChip: {
    minHeight: 28,
    borderRadius: 999,
    paddingHorizontal: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1F5F9"
  },
  statusChipSelected: {
    backgroundColor: "#2563EB"
  },
  statusChipText: {
    color: "#071426",
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "800"
  },
  statusChipTextSelected: {
    color: "#FFFFFF"
  },
  loadingState: {
    minHeight: 78,
    alignItems: "center",
    justifyContent: "center"
  },
  emptyState: {
    minHeight: 130,
    borderWidth: 1,
    borderColor: "#DCE3EE",
    borderRadius: 10,
    padding: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF"
  },
  emptyTitle: {
    marginTop: 8,
    color: "#020617",
    fontSize: 15,
    fontWeight: "900"
  },
  emptyText: {
    marginTop: 4,
    color: "#64748B",
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center"
  },
  productCard: {
    minHeight: 69,
    borderWidth: 1,
    borderColor: "#DCE3EE",
    borderRadius: 11,
    paddingHorizontal: 11,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: "#FFFFFF",
    ...softShadow
  },
  productCardExpanded: {
    borderColor: "#BFDBFE"
  },
  cardPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.995 }]
  },
  statusRail: {
    width: 6,
    minHeight: 37,
    borderRadius: 999,
    marginTop: 5
  },
  productMain: {
    flex: 1,
    minWidth: 0
  },
  productName: {
    color: "#020617",
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "900"
  },
  productMetaRow: {
    marginTop: 5,
    flexDirection: "row",
    alignItems: "center",
    gap: 7
  },
  statusBadge: {
    minHeight: 18,
    borderRadius: 999,
    paddingHorizontal: 7,
    alignItems: "center",
    justifyContent: "center"
  },
  statusText: {
    fontSize: 9,
    lineHeight: 12,
    fontWeight: "900"
  },
  productCode: {
    flex: 1,
    minWidth: 0,
    color: "#94A3B8",
    fontSize: 9,
    lineHeight: 12,
    fontWeight: "700"
  },
  quantityArea: {
    width: 39,
    alignItems: "center",
    paddingTop: 1
  },
  quantityText: {
    width: "100%",
    color: "#020617",
    fontSize: 17,
    lineHeight: 21,
    textAlign: "center",
    fontWeight: "900"
  },
  unitText: {
    marginTop: 1,
    color: "#8AA1C1",
    fontSize: 8,
    lineHeight: 10,
    fontWeight: "800",
    textAlign: "center"
  },
  expandIcon: {
    marginTop: 5
  },
  productDetails: {
    gap: 9,
    marginTop: 10
  },
  productNumbers: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7
  },
  smallNumber: {
    flexGrow: 1,
    flexBasis: "23%",
    minWidth: 62,
    minHeight: 52,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 7,
    backgroundColor: "#F8FAFC"
  },
  smallNumberValue: {
    color: "#020617",
    fontSize: 14,
    fontWeight: "900"
  },
  smallNumberLabel: {
    marginTop: 2,
    color: "#64748B",
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
  detailMeta: {
    color: "#64748B",
    fontSize: 11,
    lineHeight: 15,
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
    color: "#2563EB",
    backgroundColor: "#EAF2FF",
    fontSize: 11,
    fontWeight: "900"
  },
  groupLabel: {
    color: "#64748B",
    fontSize: 12,
    fontWeight: "800"
  },
  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.98 }]
  },
  sheetBackdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(15, 23, 42, 0.28)"
  },
  filterSheet: {
    maxHeight: "92%",
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 22,
    gap: 14,
    backgroundColor: "#FFFFFF"
  },
  sheetHandle: {
    alignSelf: "center",
    width: 42,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#D8E1EE"
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  sheetTitle: {
    color: "#020617",
    fontSize: 18,
    fontWeight: "900"
  },
  sheetCloseButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1F5F9"
  },
  sheetSection: {
    gap: 8
  },
  sheetChipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  sheetChip: {
    minHeight: 34,
    borderWidth: 1,
    borderColor: "#E5EBF3",
    borderRadius: 17,
    paddingHorizontal: 11,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F7F9FC"
  },
  sheetChipSelected: {
    borderColor: "#2563EB",
    backgroundColor: "#2563EB"
  },
  sheetChipText: {
    color: "#64748B",
    fontSize: 12,
    fontWeight: "800"
  },
  sheetChipTextSelected: {
    color: "#FFFFFF"
  },
  indicatorsHeader: {
    minHeight: 42,
    borderWidth: 1,
    borderColor: "#DCE3EE",
    borderRadius: 10,
    paddingHorizontal: 11,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF"
  },
  indicatorsTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  indicatorsTitle: {
    color: "#020617",
    fontSize: 14,
    fontWeight: "900"
  },
  indicatorsBody: {
    gap: 10
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
    backgroundColor: "#FFFFFF"
  },
  insightIcon: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF7E6"
  },
  insightText: {
    flex: 1
  },
  insightTitle: {
    color: "#020617",
    fontSize: 13,
    fontWeight: "900"
  },
  insightBody: {
    marginTop: 3,
    color: "#64748B",
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "700"
  },
  bucketPanel: {
    gap: 8
  },
  indicatorsSubtitle: {
    color: "#020617",
    fontSize: 13,
    fontWeight: "900"
  },
  bucketChipRow: {
    flexDirection: "row",
    gap: 8,
    paddingRight: 22
  },
  bucketChip: {
    minWidth: 84,
    minHeight: 46,
    borderWidth: 1,
    borderColor: "#DCE3EE",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
    justifyContent: "center",
    backgroundColor: "#FFFFFF"
  },
  bucketValue: {
    color: "#2563EB",
    fontSize: 16,
    lineHeight: 19,
    fontWeight: "900"
  },
  bucketLabel: {
    marginTop: 1,
    color: "#475569",
    fontSize: 10,
    lineHeight: 12,
    fontWeight: "800"
  },
  sheetApplyButton: {
    minHeight: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2563EB"
  },
  sheetApplyButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900"
  }
});
