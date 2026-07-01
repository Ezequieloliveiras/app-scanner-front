import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { Alert, Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Product, StockEntry } from "../types/product";

type Props = {
  products: Product[];
  onRegisterMissingDelivered: (productId: string, quantity: number, observation?: string) => Promise<void>;
  onCreateStockRequest: (productId: string, quantity: number, observation?: string) => Promise<void>;
};

type ExpandedAction = "missing" | "withdraw" | null;
type HistoryTypeFilter = "all" | "entry" | "divergence" | "withdrawal" | "rejected" | "adjustment" | "other";
type HistoryDateFilter = "all" | "today" | "week" | "month" | "custom";
type HistorySortMode = "recent" | "oldest" | "quantity_desc" | "quantity_asc";
type DateRangeShortcut = "today" | "yesterday" | "last_7" | "last_30" | "this_month" | "last_month" | "custom";

const DATE_FILTERS: Array<{ label: string; value: HistoryDateFilter }> = [
  { label: "Todos", value: "all" },
  { label: "Hoje", value: "today" },
  { label: "Esta semana", value: "week" },
  { label: "Este mês", value: "month" },
  { label: "Personalizado", value: "custom" }
];

const TYPE_FILTERS: Array<{ label: string; value: HistoryTypeFilter }> = [
  { label: "Todos", value: "all" },
  { label: "Entrada", value: "entry" },
  { label: "Divergência", value: "divergence" },
  { label: "Retirada", value: "withdrawal" },
  { label: "Reprovada", value: "rejected" },
  { label: "Ajuste", value: "adjustment" },
  { label: "Outros", value: "other" }
];

const SORT_OPTIONS: Array<{ label: string; value: HistorySortMode }> = [
  { label: "Mais recentes", value: "recent" },
  { label: "Mais antigas", value: "oldest" },
  { label: "Maior quantidade", value: "quantity_desc" },
  { label: "Menor quantidade", value: "quantity_asc" }
];

const DATE_RANGE_SHORTCUTS: Array<{ label: string; value: DateRangeShortcut }> = [
  { label: "Hoje", value: "today" },
  { label: "Ontem", value: "yesterday" },
  { label: "Últimos 7 dias", value: "last_7" },
  { label: "Últimos 30 dias", value: "last_30" },
  { label: "Este mês", value: "this_month" },
  { label: "Mês passado", value: "last_month" },
  { label: "Personalizado", value: "custom" }
];

const WEEKDAY_LABELS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
const MONTH_LABELS = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro"
];

export function ProductList({ products, onRegisterMissingDelivered, onCreateStockRequest }: Props) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantityInput, setQuantityInput] = useState("");
  const [observationInput, setObservationInput] = useState("");
  const [withdrawQuantityInput, setWithdrawQuantityInput] = useState("");
  const [withdrawObservationInput, setWithdrawObservationInput] = useState("");
  const [expandedAction, setExpandedAction] = useState<ExpandedAction>(null);
  const [saving, setSaving] = useState(false);
  const [historyQuery, setHistoryQuery] = useState("");
  const [historyTypeFilter, setHistoryTypeFilter] = useState<HistoryTypeFilter>("all");
  const [historyDateFilter, setHistoryDateFilter] = useState<HistoryDateFilter>("all");
  const [historyCustomStart, setHistoryCustomStart] = useState("");
  const [historyCustomEnd, setHistoryCustomEnd] = useState("");
  const [historySortMode, setHistorySortMode] = useState<HistorySortMode>("recent");
  const [sortOptionsVisible, setSortOptionsVisible] = useState(false);
  const [dateRangePickerVisible, setDateRangePickerVisible] = useState(false);
  const [draftRangeStart, setDraftRangeStart] = useState("");
  const [draftRangeEnd, setDraftRangeEnd] = useState("");
  const [visibleCalendarMonth, setVisibleCalendarMonth] = useState(startOfMonth(new Date()));
  const activeProduct = selectedProduct
    ? products.find((product) => product._id === selectedProduct._id) ?? selectedProduct
    : null;
  const historyEntries = [...(activeProduct?.stockEntries ?? [])].sort(
    (first, second) => getEntryTimestamp(second) - getEntryTimestamp(first)
  );
  const filteredHistoryEntries = useMemo(
    () =>
      filterAndSortHistory(historyEntries, {
        query: historyQuery,
        type: historyTypeFilter,
        date: historyDateFilter,
        customStart: historyCustomStart,
        customEnd: historyCustomEnd,
        sort: historySortMode
      }),
    [historyCustomEnd, historyCustomStart, historyDateFilter, historyEntries, historyQuery, historySortMode, historyTypeFilter]
  );
  const historySummary = useMemo(() => getHistorySummary(historyEntries), [historyEntries]);

  if (!products.length) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyTitle}>Nenhum produto no estoque</Text>
        <Text style={styles.emptyText}>Leia uma nota ou simule um XML para registrar entradas.</Text>
      </View>
    );
  }

  function openProduct(product: Product) {
    setSelectedProduct(product);
    setQuantityInput("");
    setObservationInput("");
    setWithdrawQuantityInput("");
    setWithdrawObservationInput("");
    setExpandedAction(null);
    setHistoryQuery("");
    setHistoryTypeFilter("all");
    setHistoryDateFilter("all");
    setHistoryCustomStart("");
    setHistoryCustomEnd("");
    setHistorySortMode("recent");
    setSortOptionsVisible(false);
    setDateRangePickerVisible(false);
    setDraftRangeStart("");
    setDraftRangeEnd("");
    setVisibleCalendarMonth(startOfMonth(new Date()));
  }

  function openDateRangePicker() {
    const start = parseDateInput(historyCustomStart);
    const end = parseDateInput(historyCustomEnd);

    setDraftRangeStart(historyCustomStart);
    setDraftRangeEnd(historyCustomEnd);
    setVisibleCalendarMonth(startOfMonth(start ?? end ?? new Date()));
    setHistoryDateFilter("custom");
    setDateRangePickerVisible(true);
  }

  function applyDateRangePicker() {
    setHistoryCustomStart(draftRangeStart);
    setHistoryCustomEnd(draftRangeEnd);
    setHistoryDateFilter("custom");
    setDateRangePickerVisible(false);
  }

  function cancelDateRangePicker() {
    setDraftRangeStart(historyCustomStart);
    setDraftRangeEnd(historyCustomEnd);
    setDateRangePickerVisible(false);
  }

  function selectDateRangeShortcut(shortcut: DateRangeShortcut) {
    if (shortcut === "custom") {
      setDraftRangeStart("");
      setDraftRangeEnd("");
      setVisibleCalendarMonth(startOfMonth(new Date()));
      return;
    }

    const range = getShortcutRange(shortcut);
    setDraftRangeStart(formatDateInput(range.start));
    setDraftRangeEnd(formatDateInput(range.end));
    setVisibleCalendarMonth(startOfMonth(range.start));
  }

  function selectCalendarDate(date: Date) {
    const currentStart = parseDateInput(draftRangeStart);
    const currentEnd = parseDateInput(draftRangeEnd);
    const selected = startOfDay(date);

    if (!currentStart || currentEnd) {
      setDraftRangeStart(formatDateInput(selected));
      setDraftRangeEnd("");
      return;
    }

    if (selected < currentStart) {
      setDraftRangeStart(formatDateInput(selected));
      setDraftRangeEnd(formatDateInput(currentStart));
      return;
    }

    setDraftRangeEnd(formatDateInput(selected));
  }

  function moveCalendarMonth(offset: number) {
    setVisibleCalendarMonth((current) => new Date(current.getFullYear(), current.getMonth() + offset, 1));
  }

  async function registerMissingDelivered() {
    if (!activeProduct || saving) return;

    const quantity = parseQuantity(quantityInput);

    if (quantity <= 0) {
      Alert.alert("Quantidade inválida", "Informe a quantidade entregue depois.");
      return;
    }

    try {
      setSaving(true);
      await onRegisterMissingDelivered(activeProduct._id, quantity, observationInput.trim() || "Entrada faltante entregue");
      setQuantityInput("");
      setObservationInput("");
      setExpandedAction(null);
      Alert.alert("Entrada registrada", "A entrega faltante foi adicionada ao estoque.");
    } catch (error) {
      Alert.alert("Não foi possível registrar", error instanceof Error ? error.message : "Tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  async function createStockRequest() {
    if (!activeProduct || saving) return;

    const quantity = parseQuantity(withdrawQuantityInput);

    if (quantity <= 0) {
      Alert.alert("Quantidade inválida", "Informe a quantidade para retirada.");
      return;
    }

    try {
      setSaving(true);
      await onCreateStockRequest(
        activeProduct._id,
        quantity,
        withdrawObservationInput.trim() || "Solicitação de retirada de estoque"
      );
      setWithdrawQuantityInput("");
      setWithdrawObservationInput("");
      setExpandedAction(null);
      Alert.alert("Solicitação enviada", "A retirada de estoque foi enviada para análise.");
    } catch (error) {
      Alert.alert("Não foi possível solicitar", error instanceof Error ? error.message : "Tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  function renderActions() {
    return (
      <View style={styles.actionArea}>
        <ActionHeader
          title="Incluir faltante"
          icon="add-circle-outline"
          expanded={expandedAction === "missing"}
          onPress={() => setExpandedAction(expandedAction === "missing" ? null : "missing")}
        />
        {expandedAction === "missing" && (
          <View style={styles.actionBody}>
            <TextInput
              value={quantityInput}
              onChangeText={setQuantityInput}
              keyboardType="decimal-pad"
              placeholder="Quantidade entregue"
              returnKeyType="next"
              style={styles.input}
            />
            <TextInput
              value={observationInput}
              onChangeText={setObservationInput}
              placeholder="Observação da entrega faltante"
              style={[styles.input, styles.textArea]}
              multiline
              returnKeyType="done"
            />
            <Pressable style={[styles.saveButton, saving && styles.disabledButton]} disabled={saving} onPress={registerMissingDelivered}>
              <Ionicons name="add-circle-outline" size={18} color="#ffffff" />
              <Text style={styles.saveButtonText}>Adicionar ao estoque</Text>
            </Pressable>
          </View>
        )}

        <ActionHeader
          title="Solicitar retirada de estoque"
          icon="file-tray-full-outline"
          expanded={expandedAction === "withdraw"}
          onPress={() => setExpandedAction(expandedAction === "withdraw" ? null : "withdraw")}
        />
        {expandedAction === "withdraw" && (
          <View style={styles.actionBody}>
            <TextInput
              value={withdrawQuantityInput}
              onChangeText={setWithdrawQuantityInput}
              keyboardType="decimal-pad"
              placeholder="Quantidade para retirada"
              returnKeyType="next"
              style={styles.input}
            />
            <TextInput
              value={withdrawObservationInput}
              onChangeText={setWithdrawObservationInput}
              placeholder="Observação da solicitação"
              style={[styles.input, styles.textArea]}
              multiline
              returnKeyType="done"
            />
            <Pressable style={[styles.saveButton, saving && styles.disabledButton]} disabled={saving} onPress={createStockRequest}>
              <Ionicons name="send-outline" size={18} color="#ffffff" />
              <Text style={styles.saveButtonText}>Enviar solicitação</Text>
            </Pressable>
          </View>
        )}
      </View>
    );
  }

  if (activeProduct) {
    return (
      <View style={styles.detailScreen}>
        <View style={styles.detailHeader}>
          <Pressable style={styles.backButton} onPress={() => setSelectedProduct(null)}>
            <Ionicons name="arrow-back-outline" size={23} color="#1f2937" />
          </Pressable>
          <View style={styles.titleArea}>
            <Text style={styles.detailTitle}>{activeProduct.name}</Text>
            <Text style={styles.detailSubtitle}>EAN: {activeProduct.ean}</Text>
          </View>
        </View>

        <View style={styles.detailSummary}>
          <DetailMetric icon="cube-outline" value={activeProduct.quantity || 0} label="em estoque" />
          <View style={styles.summaryDivider} />
          <DetailMetric icon="file-tray-stacked-outline" value={historyEntries.length} label="entradas" />
        </View>

        {renderActions()}

        <View style={styles.historySection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Histórico completo</Text>
            <Text style={styles.sectionCount}>{filteredHistoryEntries.length}/{historyEntries.length} registro(s)</Text>
          </View>

          {historyEntries.length === 0 ? (
            <View style={styles.emptyHistory}>
              <Ionicons name="time-outline" size={20} color="#64748b" />
              <Text style={styles.emptyHistoryText}>Nenhuma movimentação registrada para este produto.</Text>
            </View>
          ) : (
            <>
              <View style={styles.historyPanel}>
                <View style={styles.historySearchBox}>
                  <Ionicons name="search-outline" size={17} color="#64748b" />
                  <TextInput
                    value={historyQuery}
                    onChangeText={setHistoryQuery}
                    placeholder="Pesquisar movimentações..."
                    placeholderTextColor="#8a95a5"
                    returnKeyType="search"
                    style={styles.historySearchInput}
                  />
                </View>

                <View style={styles.historySummaryGrid}>
                  <HistorySummaryCard value={historySummary.entries} label="Entradas" color={ui.success} backgroundColor={ui.successSoft} />
                  <HistorySummaryCard value={historySummary.divergences} label="Divergências" color={ui.warning} backgroundColor={ui.warningSoft} />
                  <HistorySummaryCard value={historySummary.withdrawals} label="Retiradas" color={ui.primary} backgroundColor="#DBEAFE" />
                  <HistorySummaryCard value={historySummary.adjustments} label="Ajustes" color={ui.purple} backgroundColor={ui.purpleSoft} />
                </View>

                <View style={styles.historyFilterGroup}>
                  <Text style={styles.historyFilterLabel}>Período</Text>
                  <View style={styles.historyChipRow}>
                    {DATE_FILTERS.map((filter) => (
                      <HistoryFilterChip
                        key={filter.value}
                        label={filter.label}
                        selected={historyDateFilter === filter.value}
                        onPress={() => {
                          setHistoryDateFilter(filter.value);
                          if (filter.value === "custom") {
                            openDateRangePicker();
                          }
                        }}
                      />
                    ))}
                  </View>
                </View>

                {historyDateFilter === "custom" && (
                  <Pressable style={styles.dateRangeField} onPress={openDateRangePicker}>
                    <View style={styles.dateRangeFieldIcon}>
                      <Ionicons name="calendar-outline" size={18} color="#3b82f6" />
                    </View>
                    <View style={styles.dateRangeFieldText}>
                      <Text style={styles.dateRangeFieldLabel}>Período</Text>
                      <Text style={styles.dateRangeFieldValue}>{formatDateRangeLabel(historyCustomStart, historyCustomEnd)}</Text>
                    </View>
                    <Ionicons name="chevron-forward-outline" size={18} color="#64748b" />
                  </Pressable>
                )}

                <View style={styles.historyFilterGroup}>
                  <Text style={styles.historyFilterLabel}>Tipo</Text>
                  <View style={styles.historyChipRow}>
                    {TYPE_FILTERS.map((filter) => (
                      <HistoryFilterChip
                        key={filter.value}
                        label={filter.label}
                        selected={historyTypeFilter === filter.value}
                        onPress={() => setHistoryTypeFilter(filter.value)}
                      />
                    ))}
                  </View>
                </View>

                <View style={styles.historySortArea}>
                  <Pressable style={styles.historySortButton} onPress={() => setSortOptionsVisible((current) => !current)}>
                    <Ionicons name="swap-vertical-outline" size={16} color="#3b82f6" />
                    <Text style={styles.historySortText}>
                      {SORT_OPTIONS.find((option) => option.value === historySortMode)?.label ?? "Mais recentes"}
                    </Text>
                    <Ionicons name={sortOptionsVisible ? "chevron-up-outline" : "chevron-down-outline"} size={16} color="#3b82f6" />
                  </Pressable>
                  {sortOptionsVisible && (
                    <View style={styles.historySortOptions}>
                      {SORT_OPTIONS.map((option) => (
                        <HistoryFilterChip
                          key={option.value}
                          label={option.label}
                          selected={historySortMode === option.value}
                          onPress={() => {
                            setHistorySortMode(option.value);
                            setSortOptionsVisible(false);
                          }}
                        />
                      ))}
                    </View>
                  )}
                </View>
              </View>

              {filteredHistoryEntries.length === 0 ? (
                <View style={styles.emptyHistory}>
                  <Ionicons name="filter-outline" size={20} color="#64748b" />
                  <Text style={styles.emptyHistoryText}>Nenhum registro encontrado com os filtros atuais.</Text>
                </View>
              ) : (
                <View style={styles.historyInner}>
                  {filteredHistoryEntries.map((entry, index) => (
                    <HistoryEntryCard key={`${entry.createdAt}-${index}`} entry={entry} />
                  ))}
                </View>
              )}
            </>
          )}
        </View>

        <DateRangePickerModal
          visible={dateRangePickerVisible}
          visibleMonth={visibleCalendarMonth}
          startValue={draftRangeStart}
          endValue={draftRangeEnd}
          onCancel={cancelDateRangePicker}
          onApply={applyDateRangePicker}
          onSelectDate={selectCalendarDate}
          onSelectShortcut={selectDateRangeShortcut}
          onMoveMonth={moveCalendarMonth}
        />

        {/*
        <View style={styles.actionArea}>
          <ActionHeader
            title="Incluir faltante"
            icon="add-circle-outline"
            expanded={expandedAction === "missing"}
            onPress={() => setExpandedAction(expandedAction === "missing" ? null : "missing")}
          />
          {expandedAction === "missing" && (
            <View style={styles.actionBody}>
              <TextInput
                value={quantityInput}
                onChangeText={setQuantityInput}
                keyboardType="decimal-pad"
                placeholder="Quantidade entregue"
                returnKeyType="next"
                style={styles.input}
              />
              <TextInput
                value={observationInput}
                onChangeText={setObservationInput}
                placeholder="Observação da entrega faltante"
                style={[styles.input, styles.textArea]}
                multiline
                returnKeyType="done"
              />
              <Pressable style={[styles.saveButton, saving && styles.disabledButton]} disabled={saving} onPress={registerMissingDelivered}>
                <Ionicons name="add-circle-outline" size={18} color="#ffffff" />
                <Text style={styles.saveButtonText}>Adicionar ao estoque</Text>
              </Pressable>
            </View>
          )}

          <ActionHeader
            title="Solicitar retirada de estoque"
            icon="file-tray-full-outline"
            expanded={expandedAction === "withdraw"}
            onPress={() => setExpandedAction(expandedAction === "withdraw" ? null : "withdraw")}
          />
          {expandedAction === "withdraw" && (
            <View style={styles.actionBody}>
              <TextInput
                value={withdrawQuantityInput}
                onChangeText={setWithdrawQuantityInput}
                keyboardType="decimal-pad"
                placeholder="Quantidade para retirada"
                returnKeyType="next"
                style={styles.input}
              />
              <TextInput
                value={withdrawObservationInput}
                onChangeText={setWithdrawObservationInput}
                placeholder="Observação da solicitação"
                style={[styles.input, styles.textArea]}
                multiline
                returnKeyType="done"
              />
              <Pressable style={[styles.saveButton, saving && styles.disabledButton]} disabled={saving} onPress={createStockRequest}>
                <Ionicons name="send-outline" size={18} color="#ffffff" />
                <Text style={styles.saveButtonText}>Enviar solicitação</Text>
              </Pressable>
            </View>
          )}
        </View>
        */}
      </View>
    );
  }

  return (
    <View style={styles.list}>
      {products.map((product) => (
        <View key={product._id} style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleArea}>
              <Text style={styles.productName}>{product.name}</Text>
              <Text style={styles.meta}>EAN: {product.ean}</Text>
            </View>
            <Text style={styles.quantity}>{product.quantity}</Text>
            <Pressable style={styles.detailButton} onPress={() => openProduct(product)}>
              <Ionicons name="chevron-forward-outline" size={22} color="#3b82f6" />
            </Pressable>
          </View>
          <Text style={styles.meta}>Entradas: {product.stockEntries?.length || 0}</Text>
        </View>
      ))}
    </View>
  );
}

function DetailMetric({
  icon,
  value,
  label
}: {
  icon: keyof typeof Ionicons.glyphMap;
  value: number | string;
  label: string;
}) {
  return (
    <View style={styles.detailMetric}>
      <Ionicons name={icon} size={18} color="#3b82f6" />
      <Text style={styles.summaryValue}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
}

function HistorySummaryCard({
  value,
  label,
  color,
  backgroundColor
}: {
  value: number;
  label: string;
  color: string;
  backgroundColor: string;
}) {
  return (
    <View style={styles.historySummaryCard}>
      <View style={[styles.historySummaryDot, { backgroundColor }]} />
      <Text style={[styles.historySummaryValue, { color }]}>{value}</Text>
      <Text style={styles.historySummaryLabel} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

function HistoryFilterChip({
  label,
  selected,
  onPress
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.historyFilterChip,
        selected && styles.historyFilterChipSelected,
        pressed && styles.historyFilterChipPressed
      ]}
    >
      <Text style={[styles.historyFilterChipText, selected && styles.historyFilterChipTextSelected]}>{label}</Text>
    </Pressable>
  );
}

function DateRangePickerModal({
  visible,
  visibleMonth,
  startValue,
  endValue,
  onCancel,
  onApply,
  onSelectDate,
  onSelectShortcut,
  onMoveMonth
}: {
  visible: boolean;
  visibleMonth: Date;
  startValue: string;
  endValue: string;
  onCancel: () => void;
  onApply: () => void;
  onSelectDate: (date: Date) => void;
  onSelectShortcut: (shortcut: DateRangeShortcut) => void;
  onMoveMonth: (offset: number) => void;
}) {
  const selectedStart = parseDateInput(startValue);
  const selectedEnd = parseDateInput(endValue);
  const calendarDays = getCalendarMonthDays(visibleMonth);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.datePickerOverlay}>
        <Pressable style={styles.datePickerBackdrop} onPress={onCancel} />
        <View style={styles.datePickerSheet}>
          <View style={styles.datePickerHandle} />

          <View style={styles.datePickerHeader}>
            <View style={styles.datePickerHeaderText}>
              <Text style={styles.datePickerTitle}>Selecionar período</Text>
              <Text style={styles.datePickerSubtitle}>{formatDateRangeLabel(startValue, endValue)}</Text>
            </View>
            <Pressable style={styles.datePickerIconButton} onPress={onCancel}>
              <Ionicons name="close-outline" size={22} color="#1f2937" />
            </Pressable>
          </View>

          <View style={styles.datePickerShortcutRow}>
            {DATE_RANGE_SHORTCUTS.map((shortcut) => (
              <HistoryFilterChip
                key={shortcut.value}
                label={shortcut.label}
                selected={isShortcutSelected(shortcut.value, selectedStart, selectedEnd)}
                onPress={() => onSelectShortcut(shortcut.value)}
              />
            ))}
          </View>

          <View style={styles.datePickerCalendar}>
            <View style={styles.datePickerMonthHeader}>
              <Pressable style={styles.datePickerIconButton} onPress={() => onMoveMonth(-1)}>
                <Ionicons name="chevron-back-outline" size={21} color="#3b82f6" />
              </Pressable>
              <Text style={styles.datePickerMonthTitle}>
                {MONTH_LABELS[visibleMonth.getMonth()]} {visibleMonth.getFullYear()}
              </Text>
              <Pressable style={styles.datePickerIconButton} onPress={() => onMoveMonth(1)}>
                <Ionicons name="chevron-forward-outline" size={21} color="#3b82f6" />
              </Pressable>
            </View>

            <View style={styles.datePickerWeekRow}>
              {WEEKDAY_LABELS.map((day) => (
                <Text key={day} style={styles.datePickerWeekday}>
                  {day}
                </Text>
              ))}
            </View>

            <View style={styles.datePickerDaysGrid}>
              {calendarDays.map((date) => {
                const inCurrentMonth = date.getMonth() === visibleMonth.getMonth();
                const selected = isSameDate(date, selectedStart) || isSameDate(date, selectedEnd);
                const inRange = isDateInsideRange(date, selectedStart, selectedEnd);

                return (
                  <Pressable
                    key={date.toISOString()}
                    style={styles.datePickerDay}
                    onPress={() => onSelectDate(date)}
                  >
                    <View
                      style={[
                        styles.datePickerDayBubble,
                        inRange && styles.datePickerDayInRange,
                        selected && styles.datePickerDaySelected
                      ]}
                    >
                      <Text
                        style={[
                          styles.datePickerDayText,
                          !inCurrentMonth && styles.datePickerDayTextMuted,
                          inRange && styles.datePickerDayTextInRange,
                          selected && styles.datePickerDayTextSelected
                        ]}
                      >
                        {date.getDate()}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.datePickerFooter}>
            <Pressable style={styles.datePickerCancelButton} onPress={onCancel}>
              <Text style={styles.datePickerCancelText}>Cancelar</Text>
            </Pressable>
            <Pressable style={styles.datePickerApplyButton} onPress={onApply}>
              <Text style={styles.datePickerApplyText}>Aplicar</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function HistoryEntryCard({ entry }: { entry: StockEntry }) {
  const meta = getHistoryEventMeta(entry);
  const summaryChips = getHistorySummaryChips(entry, meta);

  return (
    <Pressable
      android_ripple={{ color: "rgba(59,130,246,0.08)" }}
      onPress={() => undefined}
      style={({ pressed }) => [
        styles.historyItem,
        { borderLeftColor: meta.accent },
        pressed && styles.historyItemPressed
      ]}
    >
      <View style={styles.historyTopRow}>
        <View style={[styles.historyIconBox, { backgroundColor: meta.softBackground }]}>
          <Ionicons name={meta.icon} size={18} color={meta.accent} />
        </View>
        <View style={styles.historyTitleArea}>
          <Text style={styles.historyType} numberOfLines={2}>
            {meta.title}
          </Text>
          <Text style={styles.historyMeta}>{formatDate(entry.createdAt)}</Text>
        </View>
        <View style={styles.historyBadges}>
          <View style={[styles.historyBadge, { backgroundColor: meta.softBackground }]}>
            <Text style={[styles.historyBadgeText, { color: meta.textColor }]}>{meta.badge}</Text>
          </View>
          <View style={[styles.historyQuantityBadge, { backgroundColor: meta.softBackground }]}>
            <Text style={[styles.historyQuantity, { color: meta.textColor }]}>{getEntryQuantity(entry)}</Text>
          </View>
        </View>
      </View>

      {entry.invoiceKey && (
        <View style={styles.historyKeyRow}>
          <Ionicons name="key-outline" size={14} color="#64748b" />
          <Text style={styles.historyKeyText}>Chave: {entry.invoiceKey}</Text>
        </View>
      )}

      <View style={styles.historyDivider} />

      <View style={styles.historyChipRow}>
        {summaryChips.map((chip) => (
          <View key={`${chip.label}-${chip.value}`} style={[styles.historySummaryChip, { backgroundColor: chip.backgroundColor }]}>
            <Text style={[styles.historySummaryChipText, { color: chip.color }]}>
              {chip.label} {chip.value}
            </Text>
          </View>
        ))}
      </View>

      {!!entry.observation?.trim() && (
        <View style={styles.historyObservation}>
          <Ionicons name="chatbubble-ellipses-outline" size={15} color="#64748b" />
          <Text style={styles.historyObservationText}>{entry.observation}</Text>
        </View>
      )}
    </Pressable>
  );
}

function ActionHeader({
  title,
  icon,
  expanded,
  onPress
}: {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  expanded: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.actionHeader} onPress={onPress}>
      <View style={styles.actionHeaderTitle}>
        <Ionicons name={icon} size={20} color="#3b82f6" />
        <Text style={styles.actionHeaderText}>{title}</Text>
      </View>
      <Ionicons name={expanded ? "chevron-up-outline" : "chevron-down-outline"} size={20} color="#3b82f6" />
    </Pressable>
  );
}

type HistoryEventMeta = {
  title: string;
  badge: string;
  icon: keyof typeof Ionicons.glyphMap;
  accent: string;
  textColor: string;
  softBackground: string;
};

type HistorySummaryChip = {
  label: string;
  value: string;
  color: string;
  backgroundColor: string;
};

type HistoryKind = "entry" | "divergence" | "withdrawal" | "approved" | "rejected" | "adjustment" | "other";

function filterAndSortHistory(
  entries: StockEntry[],
  filters: {
    query: string;
    type: HistoryTypeFilter;
    date: HistoryDateFilter;
    customStart: string;
    customEnd: string;
    sort: HistorySortMode;
  }
) {
  const normalizedQuery = normalizeSearch(filters.query);
  const filtered = entries.filter((entry) => {
    const kind = getHistoryKind(entry);
    const matchesType =
      filters.type === "all" ||
      kind === filters.type ||
      (filters.type === "withdrawal" && (kind === "withdrawal" || kind === "approved"));
    const matchesDate = matchesDateFilter(entry, filters.date, filters.customStart, filters.customEnd);
    const matchesQuery = !normalizedQuery || getHistorySearchText(entry).includes(normalizedQuery);

    return matchesType && matchesDate && matchesQuery;
  });

  return [...filtered].sort((first, second) => {
    if (filters.sort === "oldest") {
      return getEntryTimestamp(first) - getEntryTimestamp(second);
    }

    if (filters.sort === "quantity_desc") {
      return Math.abs(second.quantity) - Math.abs(first.quantity);
    }

    if (filters.sort === "quantity_asc") {
      return Math.abs(first.quantity) - Math.abs(second.quantity);
    }

    return getEntryTimestamp(second) - getEntryTimestamp(first);
  });
}

function getHistorySummary(entries: StockEntry[]) {
  return entries.reduce(
    (summary, entry) => {
      const kind = getHistoryKind(entry);

      if (kind === "entry") summary.entries += 1;
      if (kind === "divergence") summary.divergences += 1;
      if (kind === "withdrawal" || kind === "approved" || kind === "rejected") summary.withdrawals += 1;
      if (kind === "adjustment") summary.adjustments += 1;

      return summary;
    },
    { entries: 0, divergences: 0, withdrawals: 0, adjustments: 0 }
  );
}

function getHistorySearchText(entry: StockEntry) {
  const parts = [
    getEntryLabel(entry),
    getHistoryEventMeta(entry).badge,
    entry.invoiceKey,
    entry.observation,
    entry.source,
    String(entry.quantity),
    String(entry.invoiceQuantity ?? ""),
    String(entry.countedQuantity ?? ""),
    formatDate(entry.createdAt)
  ];

  return normalizeSearch(parts.filter(Boolean).join(" "));
}

function normalizeSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function formatDateRangeLabel(startValue: string, endValue: string) {
  if (startValue && endValue) {
    return `${startValue} → ${endValue}`;
  }

  if (startValue) {
    return `${startValue} → selecione a data final`;
  }

  return "Toque para selecionar";
}

function formatDateInput(date: Date) {
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
}

function getShortcutRange(shortcut: DateRangeShortcut) {
  const today = startOfDay(new Date());

  if (shortcut === "yesterday") {
    const yesterday = addDays(today, -1);
    return { start: yesterday, end: yesterday };
  }

  if (shortcut === "last_7") {
    return { start: addDays(today, -6), end: today };
  }

  if (shortcut === "last_30") {
    return { start: addDays(today, -29), end: today };
  }

  if (shortcut === "this_month") {
    return { start: new Date(today.getFullYear(), today.getMonth(), 1), end: today };
  }

  if (shortcut === "last_month") {
    const start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const end = new Date(today.getFullYear(), today.getMonth(), 0);
    return { start, end };
  }

  return { start: today, end: today };
}

function getCalendarMonthDays(month: Date) {
  const firstDay = startOfMonth(month);
  const mondayIndex = (firstDay.getDay() + 6) % 7;
  const start = addDays(firstDay, -mondayIndex);

  return Array.from({ length: 42 }, (_, index) => addDays(start, index));
}

function isShortcutSelected(shortcut: DateRangeShortcut, start: Date | null, end: Date | null) {
  if (shortcut === "custom" || !start || !end) return false;

  const range = getShortcutRange(shortcut);
  return isSameDate(start, range.start) && isSameDate(end, range.end);
}

function isSameDate(first: Date | null, second: Date | null) {
  if (!first || !second) return false;

  return (
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate()
  );
}

function isDateInsideRange(date: Date, start: Date | null, end: Date | null) {
  if (!start || !end) return false;

  const time = startOfDay(date).getTime();
  return time >= startOfDay(start).getTime() && time <= startOfDay(end).getTime();
}

function matchesDateFilter(entry: StockEntry, filter: HistoryDateFilter, customStart: string, customEnd: string) {
  if (filter === "all") return true;

  const timestamp = getEntryTimestamp(entry);
  if (!timestamp) return false;

  const entryDate = new Date(timestamp);
  const now = new Date();

  if (filter === "today") {
    const start = startOfDay(now);
    return entryDate >= start;
  }

  if (filter === "week") {
    const start = startOfWeek(now);
    return entryDate >= start;
  }

  if (filter === "month") {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    return entryDate >= start;
  }

  const start = parseDateInput(customStart);
  const end = parseDateInput(customEnd);
  const endOfRange = end ? endOfDay(end) : null;

  if (!start && !endOfRange) return true;
  if (start && entryDate < start) return false;
  if (endOfRange && entryDate > endOfRange) return false;

  return true;
}

function parseDateInput(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    return new Date(Number(isoMatch[1]), Number(isoMatch[2]) - 1, Number(isoMatch[3]));
  }

  const brMatch = trimmed.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (brMatch) {
    return new Date(Number(brMatch[3]), Number(brMatch[2]) - 1, Number(brMatch[1]));
  }

  return null;
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
}

function addDays(date: Date, amount: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

function startOfWeek(date: Date) {
  const start = startOfDay(date);
  const day = start.getDay();
  const diff = day === 0 ? 6 : day - 1;
  start.setDate(start.getDate() - diff);
  return start;
}

function getHistoryEventMeta(entry: StockEntry): HistoryEventMeta {
  const kind = getHistoryKind(entry);

  if (kind === "divergence") {
    return {
      title: "Entrada divergente",
      badge: "Divergência",
      icon: "warning-outline",
      accent: ui.warningAccent,
      textColor: ui.warning,
      softBackground: ui.warningSoft
    };
  }

  if (kind === "withdrawal") {
    return {
      title: "Retirada solicitada",
      badge: "Retirada",
      icon: "arrow-forward-circle-outline",
      accent: ui.primary,
      textColor: "#1D4ED8",
      softBackground: "#DBEAFE"
    };
  }

  if (kind === "approved") {
    return {
      title: "Retirada aprovada",
      badge: "Aprovada",
      icon: "checkmark-circle-outline",
      accent: ui.successAccent,
      textColor: ui.success,
      softBackground: ui.successSoft
    };
  }

  if (kind === "rejected") {
    return {
      title: "Retirada reprovada",
      badge: "Reprovada",
      icon: "close-circle-outline",
      accent: ui.dangerAccent,
      textColor: ui.danger,
      softBackground: ui.dangerSoft
    };
  }

  if (kind === "adjustment") {
    return {
      title: getEntryLabel(entry),
      badge: "Ajuste",
      icon: "construct-outline",
      accent: ui.purple,
      textColor: ui.purple,
      softBackground: ui.purpleSoft
    };
  }

  if (kind === "other") {
    return {
      title: getEntryLabel(entry),
      badge: "Outro",
      icon: "ellipse-outline",
      accent: "#94A3B8",
      textColor: "#475569",
      softBackground: "#F1F5F9"
    };
  }

  return {
    title: getEntryLabel(entry),
    badge: "Entrada",
    icon: "checkmark-circle-outline",
    accent: ui.successAccent,
    textColor: ui.success,
    softBackground: ui.successSoft
  };
}

function getHistorySummaryChips(entry: StockEntry, meta: HistoryEventMeta): HistorySummaryChip[] {
  const kind = getHistoryKind(entry);

  if (kind === "divergence") {
    const invoiceQuantity = entry.invoiceQuantity ?? entry.quantity;
    const countedQuantity = entry.countedQuantity ?? entry.quantity;
    const divergenceQuantity = entry.divergenceQuantity ?? countedQuantity - invoiceQuantity;
    const divergenceLabel = divergenceQuantity < 0 ? "Faltante" : "Sobra";

    return [
      makeHistoryChip(divergenceLabel, Math.abs(divergenceQuantity), ui.warning, ui.warningSoft),
      makeHistoryChip("NF", invoiceQuantity, "#475569", "#F1F5F9"),
      makeHistoryChip("Entrada", countedQuantity, ui.success, ui.successSoft)
    ];
  }

  if (kind === "withdrawal") {
    return [makeHistoryChip("Solicitado", entry.quantity, meta.textColor, meta.softBackground)];
  }

  if (kind === "approved") {
    return [makeHistoryChip("Retirada", entry.quantity, meta.textColor, meta.softBackground)];
  }

  if (kind === "rejected") {
    return [makeHistoryChip("Reprovada", entry.quantity, meta.textColor, meta.softBackground)];
  }

  if (kind === "adjustment") {
    return [makeHistoryChip("Ajuste", entry.quantity, meta.textColor, meta.softBackground)];
  }

  if (kind === "other") {
    return [makeHistoryChip("Movimento", entry.quantity, meta.textColor, meta.softBackground)];
  }

  return [makeHistoryChip("Entrada", entry.quantity, meta.textColor, meta.softBackground)];
}

function makeHistoryChip(label: string, value: number | string, color: string, backgroundColor: string): HistorySummaryChip {
  return {
    label,
    value: typeof value === "number" ? formatQuantity(value) : value,
    color,
    backgroundColor
  };
}

function getEntryLabel(entry: StockEntry) {
  if (entry.type === "missing_delivered" || entry.source === "faltante_entregue") {
    return "Faltante entregue";
  }

  if (entry.type === "stock_withdraw_requested") {
    return "Retirada solicitada";
  }

  if (entry.type === "stock_withdraw_approved") {
    return "Retirada aprovada";
  }

  if (entry.type === "stock_withdraw_rejected") {
    return "Retirada reprovada";
  }

  if (isInvoiceDivergent(entry)) {
    return "Entrada divergente";
  }

  return "Entrada da nota";
}

function getHistoryKind(entry: StockEntry): HistoryKind {
  if (isInvoiceDivergent(entry)) return "divergence";

  if (entry.type === "stock_withdraw_requested") return "withdrawal";
  if (entry.type === "stock_withdraw_approved") return "approved";
  if (entry.type === "stock_withdraw_rejected") return "rejected";
  if (isAdjustmentEntry(entry)) return "adjustment";

  if (entry.type === "invoice_entry" || entry.type === "missing_delivered" || entry.source === "faltante_entregue") {
    return "entry";
  }

  return "other";
}

function isAdjustmentEntry(entry: StockEntry) {
  const source = entry.source.toLowerCase();
  const type = entry.type?.toLowerCase() ?? "";

  return source.includes("ajuste") || source.includes("adjust") || type.includes("adjust");
}

function isWithdrawalApproved(entry: StockEntry) {
  return entry.type === "stock_withdraw_approved";
}

function isInvoiceDivergent(entry: StockEntry) {
  return entry.type === "invoice_entry" && Number(entry.divergenceQuantity || 0) !== 0;
}

function getEntryQuantity(entry: StockEntry) {
  if (isWithdrawalApproved(entry)) {
    return `-${entry.quantity}`;
  }

  if (entry.type === "stock_withdraw_requested" || entry.type === "stock_withdraw_rejected") {
    return `${entry.quantity}`;
  }

  return `+${entry.quantity}`;
}

function formatQuantity(value: number) {
  return Number.isInteger(value) ? String(value) : String(value).replace(".", ",");
}

function getEntryTimestamp(entry: StockEntry) {
  const timestamp = new Date(entry.createdAt).getTime();
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Horário não informado";
  }

  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function parseQuantity(value: string) {
  const parsed = Number(value.replace(",", ".").trim());
  return Number.isFinite(parsed) ? parsed : 0;
}

const ui = {
  primary: "#3b82f6",
  primarySoft: "#eaf4ff",
  surface: "#ffffff",
  surfaceMuted: "#f8fafc",
  border: "#edf2f7",
  borderStrong: "#dbe4f0",
  text: "#1f2937",
  muted: "#64748b",
  warning: "#B45309",
  warningSoft: "#FFF4D6",
  warningAccent: "#F59E0B",
  success: "#15803D",
  successSoft: "#DCFCE7",
  successAccent: "#22C55E",
  danger: "#B91C1C",
  dangerSoft: "#FEE2E2",
  dangerAccent: "#EF4444",
  purple: "#8B5CF6",
  purpleSoft: "#F3E8FF",
  purpleAccent: "#A855F7",
  radius: 16,
  controlRadius: 14
};

const softShadow = {
  shadowColor: "#0f172a",
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.05,
  shadowRadius: 18,
  elevation: 2
};

const styles = StyleSheet.create({
  list: {
    width: "100%",
    gap: 12,
    paddingBottom: 24
  },
  card: {
    width: "100%",
    borderWidth: 1,
    borderColor: ui.border,
    borderRadius: ui.radius,
    padding: 14,
    backgroundColor: ui.surface,
    ...softShadow
  },
  cardHeader: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    alignItems: "flex-start"
  },
  cardTitleArea: {
    flex: 1,
    minWidth: 0
  },
  productName: {
    color: ui.text,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "800"
  },
  quantity: {
    minWidth: 44,
    textAlign: "right",
    color: "#3b82f6",
    fontSize: 18,
    fontWeight: "900"
  },
  detailButton: {
    width: 40,
    height: 40,
    borderRadius: ui.controlRadius,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#eaf4ff"
  },
  meta: {
    marginTop: 6,
    color: "#5b6472",
    fontSize: 13
  },
  emptyState: {
    width: "100%",
    borderWidth: 1,
    borderColor: ui.border,
    borderRadius: ui.radius,
    padding: 18,
    backgroundColor: ui.surface,
    ...softShadow
  },
  emptyTitle: {
    color: "#1f2937",
    fontSize: 16,
    fontWeight: "800"
  },
  emptyText: {
    marginTop: 6,
    color: "#5b6472",
    fontSize: 14,
    lineHeight: 20
  },
  detailScreen: {
    width: "100%",
    gap: 12,
    paddingBottom: 24
  },
  detailHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: ui.controlRadius,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f1f5f9"
  },
  titleArea: {
    flex: 1,
    minWidth: 0
  },
  detailTitle: {
    color: "#1f2937",
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "900"
  },
  detailSubtitle: {
    marginTop: 2,
    color: "#64748b",
    fontSize: 13,
    fontWeight: "700"
  },
  detailSummary: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: ui.border,
    borderRadius: ui.radius,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: ui.surface
  },
  detailMetric: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "baseline",
    gap: 7
  },
  summaryDivider: {
    width: 1,
    height: 28,
    backgroundColor: "#e2e8f0"
  },
  summaryValue: {
    color: "#3b82f6",
    fontSize: 18,
    fontWeight: "900"
  },
  summaryLabel: {
    flexShrink: 1,
    color: "#5d6f82",
    fontSize: 12,
    fontWeight: "800"
  },
  historySection: {
    gap: 10
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10
  },
  sectionTitle: {
    color: "#1f2937",
    fontSize: 16,
    fontWeight: "900"
  },
  sectionCount: {
    color: "#64748b",
    fontSize: 12,
    fontWeight: "800"
  },
  historyPanel: {
    gap: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: ui.radius,
    padding: 12,
    backgroundColor: ui.surface,
    ...softShadow
  },
  historySearchBox: {
    minHeight: 44,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: ui.controlRadius,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FBFDFF"
  },
  historySearchInput: {
    flex: 1,
    minHeight: 42,
    paddingVertical: 0,
    color: ui.text,
    fontSize: 14,
    fontWeight: "600"
  },
  historySummaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  historySummaryCard: {
    flexGrow: 1,
    flexBasis: "23%",
    minWidth: 72,
    minHeight: 58,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 9,
    paddingVertical: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8FAFC"
  },
  historySummaryDot: {
    width: 16,
    height: 3,
    borderRadius: 2
  },
  historySummaryValue: {
    marginTop: 5,
    fontSize: 17,
    fontWeight: "900"
  },
  historySummaryLabel: {
    marginTop: 1,
    color: ui.muted,
    fontSize: 10,
    textAlign: "center",
    fontWeight: "800"
  },
  historyFilterGroup: {
    gap: 8
  },
  historyFilterLabel: {
    color: "#596579",
    fontSize: 12,
    fontWeight: "800"
  },
  historyFilterChip: {
    minHeight: 32,
    borderWidth: 1,
    borderColor: "#E5EBF3",
    borderRadius: 16,
    paddingHorizontal: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F7F9FC"
  },
  historyFilterChipSelected: {
    borderColor: ui.primary,
    backgroundColor: ui.primary
  },
  historyFilterChipPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.98 }]
  },
  historyFilterChipText: {
    color: "#5F6D7D",
    fontSize: 12,
    fontWeight: "800"
  },
  historyFilterChipTextSelected: {
    color: "#FFFFFF"
  },
  dateRangeField: {
    minHeight: 54,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: ui.controlRadius,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#FBFDFF"
  },
  dateRangeFieldIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: ui.primarySoft
  },
  dateRangeFieldText: {
    flex: 1,
    minWidth: 0
  },
  dateRangeFieldLabel: {
    color: ui.muted,
    fontSize: 11,
    fontWeight: "800"
  },
  dateRangeFieldValue: {
    marginTop: 2,
    color: ui.text,
    fontSize: 14,
    fontWeight: "900"
  },
  datePickerOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(15,23,42,0.36)"
  },
  datePickerBackdrop: {
    ...StyleSheet.absoluteFillObject
  },
  datePickerSheet: {
    maxHeight: "92%",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 16,
    gap: 14,
    backgroundColor: ui.surface
  },
  datePickerHandle: {
    alignSelf: "center",
    width: 58,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#CBD5E1"
  },
  datePickerHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  datePickerHeaderText: {
    flex: 1,
    minWidth: 0
  },
  datePickerTitle: {
    color: ui.text,
    fontSize: 18,
    fontWeight: "900"
  },
  datePickerSubtitle: {
    marginTop: 3,
    color: ui.muted,
    fontSize: 13,
    fontWeight: "700"
  },
  datePickerIconButton: {
    width: 38,
    height: 38,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1F5F9"
  },
  datePickerShortcutRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  datePickerCalendar: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 18,
    padding: 10,
    gap: 10,
    backgroundColor: "#FFFFFF"
  },
  datePickerMonthHeader: {
    minHeight: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10
  },
  datePickerMonthTitle: {
    flex: 1,
    color: ui.text,
    fontSize: 15,
    textAlign: "center",
    fontWeight: "900"
  },
  datePickerWeekRow: {
    flexDirection: "row"
  },
  datePickerWeekday: {
    flex: 1,
    color: ui.muted,
    fontSize: 11,
    textAlign: "center",
    fontWeight: "900"
  },
  datePickerDaysGrid: {
    flexDirection: "row",
    flexWrap: "wrap"
  },
  datePickerDay: {
    width: "14.2857%",
    height: 36,
    padding: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent"
  },
  datePickerDayBubble: {
    width: 34,
    height: 34,
    borderRadius: 17,
    padding: 0,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    backgroundColor: "transparent"
  },
  datePickerDayInRange: {
    borderRadius: 17,
    overflow: "hidden",
    backgroundColor: "#EAF4FF"
  },
  datePickerDaySelected: {
    borderRadius: 17,
    overflow: "hidden",
    backgroundColor: ui.primary
  },
  datePickerDayText: {
    color: ui.text,
    fontSize: 13,
    lineHeight: 34,
    width: 34,
    height: 34,
    padding: 0,
    textAlign: "center",
    textAlignVertical: "center",
    includeFontPadding: false,
    fontWeight: "800"
  },
  datePickerDayTextMuted: {
    color: "#CBD5E1"
  },
  datePickerDayTextInRange: {
    color: "#1D4ED8"
  },
  datePickerDayTextSelected: {
    color: "#FFFFFF"
  },
  datePickerFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10
  },
  datePickerCancelButton: {
    minHeight: 42,
    borderRadius: ui.controlRadius,
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1F5F9"
  },
  datePickerCancelText: {
    color: ui.muted,
    fontSize: 13,
    fontWeight: "900"
  },
  datePickerApplyButton: {
    minHeight: 42,
    borderRadius: ui.controlRadius,
    paddingHorizontal: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: ui.primary
  },
  datePickerApplyText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "900"
  },
  historySortArea: {
    gap: 8
  },
  historySortButton: {
    alignSelf: "flex-start",
    minHeight: 36,
    borderWidth: 1,
    borderColor: "#DBEAFE",
    borderRadius: 18,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: "#EAF4FF"
  },
  historySortText: {
    color: ui.primary,
    fontSize: 12,
    fontWeight: "900"
  },
  historySortOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  historyInner: {
    gap: 10
  },
  emptyHistory: {
    minHeight: 74,
    borderWidth: 1,
    borderColor: ui.border,
    borderRadius: ui.radius,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#f8fafc"
  },
  emptyHistoryText: {
    flex: 1,
    color: "#64748b",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "700"
  },
  historyItem: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderLeftWidth: 4,
    borderRadius: ui.radius,
    padding: 12,
    gap: 10,
    backgroundColor: ui.surface,
    ...softShadow
  },
  historyItemPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.992 }]
  },
  historyTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 8
  },
  historyIconBox: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center"
  },
  historyTitleArea: {
    flex: 1,
    minWidth: 0,
    gap: 3
  },
  historyType: {
    color: "#1f2937",
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "700"
  },
  historyBadges: {
    alignItems: "flex-end",
    gap: 6
  },
  historyBadge: {
    minHeight: 26,
    borderRadius: 13,
    paddingHorizontal: 9,
    alignItems: "center",
    justifyContent: "center"
  },
  historyBadgeText: {
    fontSize: 11,
    fontWeight: "900"
  },
  historyQuantityBadge: {
    minHeight: 26,
    minWidth: 42,
    borderRadius: 13,
    paddingHorizontal: 9,
    alignItems: "center",
    justifyContent: "center"
  },
  historyQuantity: {
    fontSize: 13,
    fontWeight: "900"
  },
  historyMeta: {
    color: "#64748b",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "600"
  },
  historyKeyRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6
  },
  historyKeyText: {
    flex: 1,
    color: "#53657a",
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "600"
  },
  historyDivider: {
    height: 1,
    backgroundColor: "#E2E8F0"
  },
  historyChipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7
  },
  historySummaryChip: {
    minHeight: 28,
    borderRadius: 14,
    paddingHorizontal: 10,
    alignItems: "center",
    justifyContent: "center"
  },
  historySummaryChipText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "800"
  },
  historyObservation: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 7,
    backgroundColor: ui.surfaceMuted,
  },
  historyObservationText: {
    flex: 1,
    color: ui.muted,
    fontSize: 13,
    lineHeight: 18
  },
  actionArea: {
    gap: 8,
    borderWidth: 1,
    borderColor: ui.border,
    borderRadius: ui.radius,
    padding: 12,
    backgroundColor: ui.surface,
    ...softShadow
  },
  actionHeader: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: ui.border,
    borderRadius: ui.controlRadius,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    backgroundColor: "#f8fafc"
  },
  actionHeaderTitle: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  actionHeaderText: {
    flex: 1,
    color: "#1f2937",
    fontSize: 14,
    fontWeight: "900"
  },
  actionBody: {
    gap: 8
  },
  input: {
    minHeight: 44,
    borderWidth: 1,
    borderColor: ui.borderStrong,
    borderRadius: ui.controlRadius,
    paddingHorizontal: 12,
    color: ui.text,
    backgroundColor: "#fbfdff",
    fontSize: 15
  },
  textArea: {
    minHeight: 76,
    paddingTop: 10,
    textAlignVertical: "top"
  },
  saveButton: {
    minHeight: 46,
    borderRadius: ui.controlRadius,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#3b82f6"
  },
  saveButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "900"
  },
  disabledButton: {
    opacity: 0.65
  }
});
