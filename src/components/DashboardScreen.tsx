import { Ionicons } from "@expo/vector-icons";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
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

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export function DashboardScreen({ token }: Props) {
  const [dashboard, setDashboard] = useState<InventoryDashboard | null>(null);
  const [productQuery, setProductQuery] = useState("");
  const [debouncedProductQuery, setDebouncedProductQuery] = useState("");
  const [onlyStopped, setOnlyStopped] = useState(false);
  const [onlyWithStock, setOnlyWithStock] = useState(true);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchFocused, setSearchFocused] = useState(false);
  const [expandedProductId, setExpandedProductId] = useState<string | null>(null);
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [indicatorsExpanded, setIndicatorsExpanded] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState("");
  const [datePreset, setDatePreset] = useState<DatePreset>("all");
  const [sortOption, setSortOption] = useState<SortOption>("stopped_desc");
  const searchFocusAnim = useRef(new Animated.Value(0)).current;

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

  const filteredProducts = useMemo(
    () => filterDashboardProducts(dashboard?.products ?? [], debouncedProductQuery),
    [dashboard?.products, debouncedProductQuery]
  );
  const branchOptions = useMemo(() => getBranchOptions(dashboard?.products ?? [], selectedBranch), [dashboard?.products, selectedBranch]);

  const toggleExpandedProduct = useCallback((productId: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedProductId((current) => (current === productId ? null : productId));
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
      style={styles.content}
      contentContainerStyle={[styles.contentInner, styles.productListScreenInner]}
      keyboardShouldPersistTaps="handled"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadDashboard("refresh")} />}
      initialNumToRender={12}
      maxToRenderPerBatch={12}
      updateCellsBatchingPeriod={45}
      windowSize={8}
      removeClippedSubviews
      extraData={expandedProductId}
      ListHeaderComponent={
        <View style={localStyles.dashboardHeader}>
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
            placeholder="Buscar produto..."
            placeholderTextColor="#8a95a5"
            returnKeyType="search"
            style={localStyles.searchInput}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            onSubmitEditing={() => setDebouncedProductQuery(productQuery)}
          />
          {!!productQuery && (
            <Pressable style={localStyles.clearSearchButton} onPress={() => setProductQuery("")} accessibilityLabel="Limpar busca">
              <Ionicons name="close-outline" size={18} color="#64748b" />
            </Pressable>
          )}
        </Animated.View>

        <Pressable style={localStyles.filtersTrigger} onPress={() => setFiltersVisible(true)}>
          <Ionicons name="options-outline" size={18} color="#3b82f6" />
          <Text style={localStyles.filtersTriggerText}>Filtros</Text>
        </Pressable>

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

      {loading && !dashboard && (
        <View style={localStyles.loadingState}>
          <ActivityIndicator color="#3b82f6" />
        </View>
      )}

      {dashboard && (
        <>
          <View style={localStyles.metricsGrid}>
            <MetricCard label="Produtos" value={dashboard.metrics.totalProducts} icon="cube-outline" />
            <MetricCard label="Parados" value={dashboard.metrics.stoppedProducts} icon="pause-circle-outline" tone="warning" />
            <MetricCard label="Média parada" value={`${dashboard.metrics.averageStoppedDays}d`} icon="time-outline" />
            <MetricCard label="Unidades" value={dashboard.metrics.totalUnitsInStock} icon="layers-outline" />
          </View>

          {dashboard.metrics.oldestProduct && (
            <View style={[localStyles.insightCard, localStyles.hiddenSection]}>
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

              <View style={localStyles.hiddenSection}>
                <Text style={styles.sectionTitle}>Tempo parado</Text>
                <ScrollView
                  horizontal
                  nestedScrollEnabled
                  directionalLockEnabled
                  keyboardShouldPersistTaps="handled"
                  showsHorizontalScrollIndicator={false}
                  style={localStyles.bucketScroller}
                  contentContainerStyle={localStyles.bucketChipRow}
                >
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

          <View style={localStyles.listHeader}>
            <View>
              <Text style={styles.sectionTitle}>Produtos analisados</Text>
              <Text style={styles.sectionSubtitle}>{filteredProducts.length} item(ns) no filtro atual</Text>
            </View>
            <Text style={styles.meta}>{formatDateTime(dashboard.generatedAt)}</Text>
          </View>
        </>
      )}
        </View>
      }
      ListEmptyComponent={
        dashboard && !loading ? (
          <View style={localStyles.emptyState}>
            <Ionicons name="search-outline" size={28} color="#64748b" />
            <Text style={localStyles.emptyTitle}>Nenhum produto encontrado</Text>
            <Text style={styles.mutedText}>Ajuste a busca ou os filtros do dashboard.</Text>
          </View>
        ) : null
      }
      ListFooterComponent={null}
      /*
      ListFooterComponent={
        dashboard ? (
          <View style={localStyles.indicatorsAccordion}>
            <Pressable
              style={localStyles.indicatorsHeader}
              onPress={() => {
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                setIndicatorsExpanded((current) => !current);
              }}
            >
              <View style={localStyles.indicatorsTitleRow}>
                <Ionicons name="analytics-outline" size={18} color="#3b82f6" />
                <Text style={localStyles.indicatorsTitle}>Indicadores</Text>
              </View>
              <Ionicons name={indicatorsExpanded ? "chevron-up-outline" : "chevron-down-outline"} size={19} color="#3b82f6" />
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
                  <ScrollView
                    horizontal
                    nestedScrollEnabled
                    directionalLockEnabled
                    keyboardShouldPersistTaps="handled"
                    showsHorizontalScrollIndicator={false}
                    style={localStyles.bucketScroller}
                    contentContainerStyle={localStyles.bucketChipRow}
                  >
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
        ) : null
      }
      */
    />
    <Modal visible={filtersVisible} transparent animationType="slide" onRequestClose={() => setFiltersVisible(false)}>
      <Pressable style={localStyles.sheetBackdrop} onPress={() => setFiltersVisible(false)}>
        <Pressable style={localStyles.filterSheet} onPress={(event) => event.stopPropagation()}>
          <View style={localStyles.sheetHandle} />
          <View style={localStyles.sheetHeader}>
            <Text style={localStyles.sheetTitle}>Filtros</Text>
            <Pressable style={localStyles.sheetCloseButton} onPress={() => setFiltersVisible(false)} accessibilityLabel="Fechar filtros">
              <Ionicons name="close-outline" size={21} color="#64748b" />
            </Pressable>
          </View>

          <View style={localStyles.sheetSection}>
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

          <View style={localStyles.sheetSection}>
            <Text style={localStyles.groupLabel}>Filial</Text>
            <View style={localStyles.chipRow}>
              <FilterChip label="Todas" icon="git-branch-outline" selected={!selectedBranch} onPress={() => setSelectedBranch("")} />
              {branchOptions.map((branch) => (
                <FilterChip
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
            <View style={localStyles.chipRow}>
              {DATE_PRESETS.map((preset) => (
                <FilterChip
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
            <View style={localStyles.chipRow}>
              {SORT_OPTIONS.map((option) => (
                <FilterChip
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
                  <Ionicons name="analytics-outline" size={18} color="#3b82f6" />
                  <Text style={localStyles.indicatorsTitle}>Indicadores</Text>
                </View>
                <Ionicons name={indicatorsExpanded ? "chevron-up-outline" : "chevron-down-outline"} size={19} color="#3b82f6" />
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
                    <ScrollView
                      horizontal
                      nestedScrollEnabled
                      directionalLockEnabled
                      keyboardShouldPersistTaps="handled"
                      showsHorizontalScrollIndicator={false}
                      style={localStyles.bucketScroller}
                      contentContainerStyle={localStyles.bucketChipRow}
                    >
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
    <Pressable style={[localStyles.productCard, expanded && localStyles.productCardExpanded]} onPress={handleToggle}>
      <View style={localStyles.productTop}>
        <View style={localStyles.productTitleArea}>
          <View style={localStyles.productTitleRow}>
            <Text style={localStyles.productName} numberOfLines={2} ellipsizeMode="tail">
              {product.name}
            </Text>
            <Text style={localStyles.productMeta} numberOfLines={1}>
              EAN {product.ean}
            </Text>
          </View>
        </View>
        <View style={localStyles.compactSummary}>
          
          <View style={[localStyles.statusBadge, { backgroundColor: status.backgroundColor }]}>
            <Ionicons name={status.icon} size={13} color={status.color} />
            <Text style={[localStyles.statusText, { color: status.color }]} numberOfLines={1}>
              {status.label}
            </Text>
          </View>
        
          <View style={localStyles.expandButton}>
            <Ionicons name={expanded ? "chevron-up-outline" : "chevron-down-outline"} size={18} color="#3b82f6" />
          </View>
        </View>
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
            <Ionicons name="bulb-outline" size={17} color="#B45309" />
            <Text style={localStyles.hintText}>{product.managementHint}</Text>
          </View>

          {!!product.lastMovementAt && (
            <Text style={localStyles.detailMeta}>Última movimentação: {formatDateTime(product.lastMovementAt)}</Text>
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
      )}
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

function filterDashboardProducts(products: DashboardProduct[], query: string) {
  const normalizedQuery = normalizeSearch(query);

  if (!normalizedQuery) {
    return products;
  }

  return products.filter((product) => getDashboardProductSearchText(product).includes(normalizedQuery));
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

const localStyles = StyleSheet.create({
  dashboardHeader: {
    gap: 8
  },
  filterPanel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  filterHeader: {
    display: "none",
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
    flex: 1,
    minHeight: 42,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
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
    minWidth: 0,
    minHeight: 40,
    paddingVertical: 0,
    color: "#1f2937",
    fontSize: 14,
    fontWeight: "600"
  },
  clearSearchButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#eef4fb"
  },
  filtersTrigger: {
    minHeight: 42,
    borderWidth: 1,
    borderColor: "#dbe7f5",
    borderRadius: 14,
    paddingHorizontal: 11,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    backgroundColor: "#ffffff"
  },
  filtersTriggerText: {
    color: "#3b82f6",
    fontSize: 12,
    fontWeight: "900"
  },
  statusGroup: {
    display: "none",
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
    display: "none",
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
    borderWidth: 0,
    borderRadius: 12,
    paddingHorizontal: 2,
    paddingVertical: 4,
    backgroundColor: "#ffffff"
  },
  metricCard: {
    width: "25%",
    minHeight: 42,
    paddingHorizontal: 1,
    paddingVertical: 4,
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
    fontSize: 14,
    fontWeight: "900"
  },
  metricText: {
    marginTop: 2,
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
    gap: 8
  },
  bucketScroller: {
    width: "100%"
  },
  bucketChipRow: {
    flexDirection: "row",
    gap: 8,
    paddingRight: 28
  },
  bucketChip: {
    minWidth: 86,
    minHeight: 46,
    borderWidth: 1,
    borderColor: "#d8dee9",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 7,
    justifyContent: "center",
    backgroundColor: "#ffffff"
  },
  bucketValue: {
    color: "#3b82f6",
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
  hiddenSection: {
    display: "none"
  },
  loadingState: {
    minHeight: 96,
    alignItems: "center",
    justifyContent: "center"
  },
  productCard: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#d8dee9",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    backgroundColor: "#ffffff",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 14,
    elevation: 1
  },
  productCardExpanded: {
    borderColor: "#bfdbfe"
  },
  productTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8
  },
  productTitleArea: {
    flex: 1,
    minWidth: 0
  },
  productTitleRow: {
    flexDirection: "row",
    alignItems: "baseline",
    flexWrap: "wrap",
    columnGap: 8,
    rowGap: 2
  },
  productName: {
    color: "#1f2937",
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "900",
    flexShrink: 1,
    minWidth: "48%",
    maxWidth: "100%"
  },
  productMeta: {
    color: "#64748b",
    fontSize: 10,
    lineHeight: 14,
    fontWeight: "800",
    flexShrink: 1,
    maxWidth: "100%"
  },
  detailMeta: {
    color: "#64748b",
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "800"
  },
  compactSummary: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 6
  },
  compactQuantity: {
    minWidth: 28,
    color: "#3b82f6",
    fontSize: 17,
    lineHeight: 21,
    textAlign: "right",
    fontWeight: "900"
  },
  statusBadge: {
    minHeight: 26,
    borderRadius: 8,
    paddingHorizontal: 7,
    flexDirection: "row",
    alignItems: "center",
    gap: 4
  },
  statusText: {
    fontSize: 10,
    fontWeight: "900"
  },
  daysBadge: {
    minHeight: 26,
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingTop: 5,
    overflow: "hidden",
    color: "#1f2937",
    backgroundColor: "#f1f5f9",
    fontSize: 11,
    fontWeight: "900"
  },
  expandButton: {
    width: 30,
    height: 30,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#eaf4ff"
  },
  productDetails: {
    gap: 10,
    marginTop: 10
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
  },
  indicatorsAccordion: {
    marginTop: 8,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#dbe7f5",
    borderRadius: 12,
    backgroundColor: "#ffffff",
    overflow: "hidden"
  },
  indicatorsHeader: {
    minHeight: 44,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  indicatorsTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  indicatorsTitle: {
    color: "#1f2937",
    fontSize: 15,
    fontWeight: "900"
  },
  indicatorsBody: {
    gap: 10,
    paddingHorizontal: 12,
    paddingBottom: 12
  },
  indicatorsSubtitle: {
    color: "#1f2937",
    fontSize: 13,
    fontWeight: "900"
  },
  sheetBackdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(15, 23, 42, 0.28)"
  },
  filterSheet: {
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 22,
    gap: 14,
    backgroundColor: "#ffffff"
  },
  sheetHandle: {
    alignSelf: "center",
    width: 42,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#d8e1ee"
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  sheetTitle: {
    color: "#1f2937",
    fontSize: 18,
    fontWeight: "900"
  },
  sheetCloseButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f1f5f9"
  },
  sheetSection: {
    gap: 8
  },
  compactOption: {
    minHeight: 38,
    borderWidth: 1,
    borderColor: "#e5ebf3",
    borderRadius: 12,
    paddingHorizontal: 12,
    justifyContent: "center",
    backgroundColor: "#f8fafc"
  },
  compactOptionText: {
    color: "#64748b",
    fontSize: 12,
    fontWeight: "800"
  },
  sheetApplyButton: {
    minHeight: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#3b82f6"
  },
  sheetApplyButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "900"
  }
});
