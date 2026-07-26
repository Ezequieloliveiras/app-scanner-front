import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { StockRequest, StockRequestStatus } from "../types/product";

type Props = {
  requests: StockRequest[];
  loading: boolean;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
};

type PeriodFilter = "all" | "today" | "7d" | "30d" | "month";
type RequestTab = "pending" | "history";

const PERIOD_FILTERS: Array<{ label: string; value: PeriodFilter }> = [
  { label: "Todos", value: "all" },
  { label: "Hoje", value: "today" },
  { label: "7 dias", value: "7d" },
  { label: "30 dias", value: "30d" },
  { label: "Mês", value: "month" }
];

export function StockRequestsScreen({ requests, loading, onApprove, onReject }: Props) {
  const [search, setSearch] = useState("");
  const [period, setPeriod] = useState<PeriodFilter>("all");
  const [activeTab, setActiveTab] = useState<RequestTab>("pending");
  const [expandedRequestId, setExpandedRequestId] = useState<string | null | "none">(null);

  const filteredRequests = useMemo(() => filterStockRequests(requests, search, period), [period, requests, search]);
  const pendingRequests = filteredRequests.filter((request) => request.status === "pending");
  const reviewedRequests = filteredRequests.filter((request) => request.status !== "pending");
  const visibleRequests = activeTab === "pending" ? pendingRequests : reviewedRequests;
  const effectiveExpandedId = expandedRequestId === null ? visibleRequests[0]?._id ?? null : expandedRequestId === "none" ? null : expandedRequestId;

  function toggleRequest(id: string) {
    setExpandedRequestId((current) => {
      const currentExpandedId = current === null ? visibleRequests[0]?._id ?? null : current === "none" ? null : current;
      return currentExpandedId === id ? "none" : id;
    });
  }

  function selectTab(tab: RequestTab) {
    setActiveTab(tab);
    setExpandedRequestId(null);
  }

  return (
    <View style={requestStyles.root}>
      <View style={requestStyles.topArea}>
        <View style={requestStyles.searchBox}>
          <Ionicons name="search-outline" size={17} color="#94a3b8" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Buscar produto, EAN ou ID"
            placeholderTextColor="#94a3b8"
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
            style={requestStyles.searchInput}
          />
          {!!search && (
            <Pressable style={requestStyles.clearButton} onPress={() => setSearch("")} accessibilityLabel="Limpar busca">
              <Ionicons name="close-outline" size={17} color="#64748b" />
            </Pressable>
          )}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={requestStyles.periodRow}>
          {PERIOD_FILTERS.map((filter) => {
            const selected = period === filter.value;

            return (
              <Pressable
                key={filter.value}
                style={({ pressed }) => [requestStyles.periodChip, selected && requestStyles.periodChipActive, pressed && requestStyles.pressed]}
                onPress={() => setPeriod(filter.value)}
              >
                <Text style={[requestStyles.periodChipText, selected && requestStyles.periodChipTextActive]}>{filter.label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={requestStyles.tabRow}>
          <RequestTabButton
            icon="time-outline"
            label="Pendentes"
            active={activeTab === "pending"}
            badge={pendingRequests.length}
            onPress={() => selectTab("pending")}
          />
          <RequestTabButton
            icon="refresh-outline"
            label="Histórico"
            active={activeTab === "history"}
            onPress={() => selectTab("history")}
          />
        </View>
      </View>

      <ScrollView style={requestStyles.list} contentContainerStyle={requestStyles.listContent} keyboardShouldPersistTaps="handled">
        {requests.length === 0 ? (
          <Text style={requestStyles.emptyText}>Nenhuma solicitação de estoque encontrada.</Text>
        ) : visibleRequests.length === 0 ? (
          <Text style={requestStyles.emptyText}>
            {activeTab === "pending" ? "Nenhuma solicitação pendente." : "Nenhuma solicitação no histórico."}
          </Text>
        ) : (
          visibleRequests.map((request) => (
            <StockRequestCard
              key={request._id}
              request={request}
              expanded={effectiveExpandedId === request._id}
              loading={loading}
              onToggle={() => toggleRequest(request._id)}
              onApprove={onApprove}
              onReject={onReject}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

function RequestTabButton({
  icon,
  label,
  active,
  badge,
  onPress
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  active: boolean;
  badge?: number;
  onPress: () => void;
}) {
  return (
    <Pressable style={[requestStyles.tabButton, active && requestStyles.tabButtonActive]} onPress={onPress}>
      <Ionicons name={icon} size={15} color={active ? "#2563eb" : "#94a3b8"} />
      <Text style={[requestStyles.tabText, active && requestStyles.tabTextActive]}>{label}</Text>
      {Boolean(badge) && (
        <View style={requestStyles.tabBadge}>
          <Text style={requestStyles.tabBadgeText}>{badge}</Text>
        </View>
      )}
    </Pressable>
  );
}

function StockRequestCard({
  request,
  expanded,
  loading,
  onToggle,
  onApprove,
  onReject
}: {
  request: StockRequest;
  expanded: boolean;
  loading: boolean;
  onToggle: () => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}) {
  const pending = request.status === "pending";

  return (
    <View style={requestStyles.card}>
      <Pressable style={({ pressed }) => [requestStyles.cardPressArea, pressed && requestStyles.pressed]} onPress={onToggle}>
        <View style={requestStyles.cardHeader}>
          <View style={requestStyles.cardTitleArea}>
            <Text style={requestStyles.productName} numberOfLines={2}>
              {request.productName}
            </Text>
            <View style={requestStyles.metaRow}>
              <Text style={[requestStyles.statusBadge, getStatusStyle(request.status)]}>{getStatusLabel(request.status)}</Text>
              <Text style={requestStyles.requesterText} numberOfLines={1}>{request.requesterName || "Não identificado"}</Text>
              <Text style={requestStyles.quantityText}>·</Text>
              <Text style={requestStyles.quantityText}>{formatQuantity(request.quantity)} un.</Text>
            </View>
          </View>
          <Ionicons name={expanded ? "chevron-up-outline" : "chevron-down-outline"} size={18} color="#8aa0ba" />
        </View>
      </Pressable>

      {expanded && (
        <View style={requestStyles.expandedBody}>
          <View style={requestStyles.detailGrid}>
            <View style={requestStyles.detailItem}>
              <Text style={requestStyles.detailLabel}>ID</Text>
              <Text selectable style={requestStyles.detailValue}>{formatRequestId(request._id)}</Text>
            </View>
            <View style={requestStyles.detailItem}>
              <Text style={requestStyles.detailLabel}>EAN</Text>
              <Text selectable style={requestStyles.detailValue}>{request.ean}</Text>
            </View>
            <View style={requestStyles.detailItem}>
              <Text style={requestStyles.detailLabel}>Data</Text>
              <Text style={requestStyles.detailValue}>{formatDateTime(request.createdAt)}</Text>
            </View>
          </View>

          {request.observation && <Text style={requestStyles.observationText}>"{request.observation}"</Text>}

          {request.reviewerName && (
            <Text style={requestStyles.reviewText}>
              Analisado por {request.reviewerName}
              {request.reviewedAt ? ` em ${formatDateTime(request.reviewedAt)}` : ""}
            </Text>
          )}
          {request.reviewObservation && <Text style={requestStyles.reviewText}>{request.reviewObservation}</Text>}

          {pending && (
            <View style={requestStyles.actionRow}>
              <Pressable
                style={({ pressed }) => [requestStyles.rejectButton, loading && requestStyles.disabledButton, pressed && !loading && requestStyles.pressed]}
                disabled={loading}
                onPress={() => onReject(request._id)}
              >
                {loading ? <ActivityIndicator color="#ef4444" size="small" /> : <Ionicons name="close-outline" size={17} color="#ef4444" />}
                <Text style={requestStyles.rejectText}>Recusar</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [requestStyles.approveButton, loading && requestStyles.disabledButton, pressed && !loading && requestStyles.pressed]}
                disabled={loading}
                onPress={() => onApprove(request._id)}
              >
                {loading ? <ActivityIndicator color="#ffffff" size="small" /> : <Ionicons name="checkmark-outline" size={17} color="#ffffff" />}
                <Text style={requestStyles.approveText}>Aceitar</Text>
              </Pressable>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

function filterStockRequests(requests: StockRequest[], search: string, period: PeriodFilter) {
  const normalizedSearch = normalizeSearch(search);

  return requests.filter((request) => {
    const searchable = normalizeSearch(
      `${request._id} ${request.product} ${request.productName} ${request.ean} ${request.requesterName} ${request.reviewerName ?? ""}`
    );
    const matchesSearch = normalizedSearch ? searchable.includes(normalizedSearch) : true;
    const matchesPeriod = isInPeriod(request.reviewedAt || request.createdAt, period);

    return matchesSearch && matchesPeriod;
  });
}

function isInPeriod(value: string, period: PeriodFilter) {
  if (period === "all") return true;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;

  const now = new Date();

  if (period === "today") {
    return date.toDateString() === now.toDateString();
  }

  if (period === "month") {
    return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
  }

  const start = new Date(now);
  start.setDate(now.getDate() - (period === "7d" ? 7 : 30));
  start.setHours(0, 0, 0, 0);

  return date >= start;
}

function normalizeSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function getStatusLabel(status: StockRequestStatus) {
  if (status === "approved") return "Aceita";
  if (status === "rejected") return "Recusada";
  return "Pendente";
}

function getStatusStyle(status: StockRequestStatus) {
  if (status === "approved") return requestStyles.statusApproved;
  if (status === "rejected") return requestStyles.statusRejected;
  return requestStyles.statusPending;
}

function formatDateTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Não identificado";
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day} ${hour}:${minute}`;
}

function formatRequestId(id: string) {
  return id.length > 8 ? `SOL-${id.slice(-3).toUpperCase()}` : id;
}

function formatQuantity(value: number) {
  return Number.isInteger(value) ? String(value) : String(value).replace(".", ",");
}

const requestStyles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#f7f9fc"
  },
  topArea: {
    borderBottomWidth: 1,
    borderBottomColor: "#e5edf6",
    paddingHorizontal: 14,
    paddingTop: 12,
    backgroundColor: "#ffffff"
  },
  searchBox: {
    minHeight: 38,
    borderWidth: 1,
    borderColor: "#d9e2ef",
    borderRadius: 9,
    paddingHorizontal: 11,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#f8fafc"
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    minHeight: 36,
    paddingVertical: 0,
    color: "#020617",
    fontSize: 13,
    fontWeight: "500"
  },
  clearButton: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#edf2f7"
  },
  periodRow: {
    gap: 9,
    paddingTop: 12,
    paddingBottom: 10
  },
  periodChip: {
    minHeight: 27,
    borderRadius: 14,
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#eef2f7"
  },
  periodChipActive: {
    backgroundColor: "#2563eb"
  },
  periodChipText: {
    color: "#475569",
    fontSize: 12,
    lineHeight: 15,
    fontWeight: "800"
  },
  periodChipTextActive: {
    color: "#ffffff"
  },
  tabRow: {
    height: 31,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 18
  },
  tabButton: {
    height: 31,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderBottomWidth: 1,
    borderBottomColor: "transparent"
  },
  tabButtonActive: {
    borderBottomColor: "#2563eb"
  },
  tabText: {
    color: "#94a3b8",
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "800"
  },
  tabTextActive: {
    color: "#2563eb"
  },
  tabBadge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 5,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2563eb"
  },
  tabBadgeText: {
    color: "#ffffff",
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "900"
  },
  list: {
    flex: 1,
    backgroundColor: "#f7f9fc"
  },
  listContent: {
    gap: 8,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 98
  },
  card: {
    borderWidth: 1,
    borderColor: "#d9e2ef",
    borderRadius: 11,
    backgroundColor: "#ffffff",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 9,
    elevation: 1,
    overflow: "hidden"
  },
  cardPressArea: {
    paddingHorizontal: 15,
    paddingVertical: 13
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10
  },
  cardTitleArea: {
    flex: 1,
    minWidth: 0,
    gap: 6
  },
  productName: {
    color: "#020617",
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "900"
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7
  },
  statusBadge: {
    borderRadius: 7,
    paddingHorizontal: 7,
    paddingVertical: 3,
    overflow: "hidden",
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "900"
  },
  statusPending: {
    color: "#b45309",
    backgroundColor: "#fff4d6"
  },
  statusApproved: {
    color: "#2563eb",
    backgroundColor: "#dbeafe"
  },
  statusRejected: {
    color: "#991b1b",
    backgroundColor: "#fee2e2"
  },
  requesterText: {
    maxWidth: 105,
    color: "#64748b",
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "600"
  },
  quantityText: {
    color: "#020617",
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "900"
  },
  expandedBody: {
    borderTopWidth: 1,
    borderTopColor: "#edf2f7",
    paddingHorizontal: 15,
    paddingTop: 12,
    paddingBottom: 14,
    gap: 11
  },
  detailGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: 10
  },
  detailItem: {
    width: "50%",
    gap: 3
  },
  detailLabel: {
    color: "#94a3b8",
    fontSize: 12,
    lineHeight: 15,
    fontWeight: "700"
  },
  detailValue: {
    color: "#020617",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "700"
  },
  observationText: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    overflow: "hidden",
    color: "#334155",
    backgroundColor: "#f8fafc",
    fontSize: 12,
    lineHeight: 17,
    fontStyle: "italic"
  },
  reviewText: {
    color: "#64748b",
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "600"
  },
  actionRow: {
    flexDirection: "row",
    gap: 8
  },
  rejectButton: {
    flex: 1,
    minHeight: 32,
    borderWidth: 1,
    borderColor: "#fecaca",
    borderRadius: 7,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    backgroundColor: "#fff1f2"
  },
  rejectText: {
    color: "#dc2626",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "900"
  },
  approveButton: {
    flex: 1,
    minHeight: 32,
    borderRadius: 7,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    backgroundColor: "#2563eb",
    shadowColor: "#2563eb",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 9,
    elevation: 2
  },
  approveText: {
    color: "#ffffff",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "900"
  },
  emptyText: {
    paddingTop: 18,
    color: "#64748b",
    fontSize: 13,
    lineHeight: 18,
    textAlign: "center",
    fontWeight: "700"
  },
  disabledButton: {
    opacity: 0.65
  },
  pressed: {
    opacity: 0.82
  }
});
