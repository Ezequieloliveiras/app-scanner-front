import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { styles } from "../styles/appStyles";
import { StockRequest, StockRequestStatus } from "../types/product";

type Props = {
  requests: StockRequest[];
  loading: boolean;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
};

type PeriodFilter = "all" | "today" | "7d" | "30d" | "month";

const PERIOD_FILTERS: Array<{ label: string; value: PeriodFilter }> = [
  { label: "Todos", value: "all" },
  { label: "Hoje", value: "today" },
  { label: "7 dias", value: "7d" },
  { label: "30 dias", value: "30d" },
  { label: "Mes", value: "month" }
];

export function StockRequestsScreen({ requests, loading, onApprove, onReject }: Props) {
  const [search, setSearch] = useState("");
  const [period, setPeriod] = useState<PeriodFilter>("all");
  const [expandedRequestId, setExpandedRequestId] = useState<string | null>(null);

  const filteredRequests = useMemo(() => filterStockRequests(requests, search, period), [period, requests, search]);
  const pendingRequests = filteredRequests.filter((request) => request.status === "pending");
  const reviewedRequests = filteredRequests.filter((request) => request.status !== "pending");
  const hasActiveFilter = !!search.trim() || period !== "all";

  function toggleRequest(id: string) {
    setExpandedRequestId((current) => (current === id ? null : id));
  }

  return (
    <ScrollView style={styles.content} contentContainerStyle={styles.contentInner} keyboardShouldPersistTaps="handled">
      <View style={localStyles.filterPanel}>
        <View style={localStyles.searchBox}>
          <Ionicons name="search-outline" size={18} color="#64748b" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Buscar produto, EAN ou ID"
            placeholderTextColor="#8a95a5"
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
            style={localStyles.searchInput}
          />
          {!!search && (
            <Pressable style={localStyles.clearButton} onPress={() => setSearch("")} accessibilityLabel="Limpar busca">
              <Ionicons name="close-outline" size={18} color="#64748b" />
            </Pressable>
          )}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={localStyles.periodRow}>
          {PERIOD_FILTERS.map((filter) => (
            <Pressable
              key={filter.value}
              style={[localStyles.periodChip, period === filter.value && localStyles.periodChipActive]}
              onPress={() => setPeriod(filter.value)}
            >
              <Text style={[localStyles.periodChipText, period === filter.value && localStyles.periodChipTextActive]}>
                {filter.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <View style={styles.pendingHeader}>
        {pendingRequests.length > 0 && <Text style={styles.pendingCount}>{pendingRequests.length}</Text>}
      </View>

      {requests.length === 0 ? (
        <Text style={styles.mutedText}>Nenhuma solicitacao de estoque encontrada.</Text>
      ) : filteredRequests.length === 0 ? (
        <Text style={styles.mutedText}>Nenhuma solicitacao encontrada com os filtros atuais.</Text>
      ) : (
        <>
          <View style={styles.pendingSection}>
            <Text style={styles.fieldLabel}>Pendentes</Text>
            {pendingRequests.length === 0 ? (
              <Text style={styles.mutedText}>{hasActiveFilter ? "Nenhuma pendente no filtro atual." : "Nenhuma solicitacao pendente."}</Text>
            ) : (
              pendingRequests.map((request) => (
                <StockRequestCard
                  key={request._id}
                  request={request}
                  expanded={expandedRequestId === request._id}
                  loading={loading}
                  onToggle={() => toggleRequest(request._id)}
                  onApprove={onApprove}
                  onReject={onReject}
                />
              ))
            )}
          </View>

          {reviewedRequests.length > 0 && (
            <View style={styles.pendingSection}>
              <Text style={styles.fieldLabel}>Historico</Text>
              {reviewedRequests.map((request) => (
                <StockRequestCard
                  key={request._id}
                  request={request}
                  expanded={expandedRequestId === request._id}
                  loading={loading}
                  onToggle={() => toggleRequest(request._id)}
                  onApprove={onApprove}
                  onReject={onReject}
                />
              ))}
            </View>
          )}
        </>
      )}
    </ScrollView>
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
    <Pressable style={styles.stockRequestCard} onPress={onToggle}>
      <View style={styles.pendingTopRow}>
        <View style={styles.pendingTitleArea}>
          <Text style={styles.branchProductName} numberOfLines={2} ellipsizeMode="tail">
            {request.productName}
          </Text>
          <Text style={styles.branchProductMeta}>
            {request.requesterName} solicitou {request.quantity} unidade(s).
          </Text>
        </View>
        <View style={localStyles.cardRight}>
          <Text style={[styles.stockRequestStatus, getStatusStyle(request.status)]}>{getStatusLabel(request.status)}</Text>
          <Ionicons name={expanded ? "chevron-up-outline" : "chevron-down-outline"} size={20} color="#3b82f6" />
        </View>
      </View>

      {expanded && (
        <>
          <Text style={styles.branchProductMeta}>EAN: {request.ean}</Text>
          <Text selectable style={styles.branchProductMeta}>
            ID: {request._id}
          </Text>
          {request.observation && <Text style={styles.stockRequestObservation}>{request.observation}</Text>}
          {request.reviewerName && (
            <Text style={styles.branchProductMeta}>
              Analisado por {request.reviewerName}
              {request.reviewedAt ? ` em ${formatDate(request.reviewedAt)}` : ""}
            </Text>
          )}
          {request.reviewObservation && <Text style={styles.branchProductMeta}>{request.reviewObservation}</Text>}
        </>
      )}

      {pending && expanded && (
        <View style={styles.notificationActions}>
          <Pressable
            style={[styles.notificationActionButton, loading && styles.disabledButton]}
            disabled={loading}
            onPress={() => onApprove(request._id)}
          >
            <Ionicons name="checkmark-circle-outline" size={18} color="#ffffff" />
            <Text style={styles.notificationActionText}>Aceitar</Text>
          </Pressable>
          <Pressable
            style={[styles.notificationRejectButton, loading && styles.disabledButton]}
            disabled={loading}
            onPress={() => onReject(request._id)}
          >
            <Ionicons name="close-circle-outline" size={18} color="#991b1b" />
            <Text style={styles.notificationRejectText}>Recusar</Text>
          </Pressable>
        </View>
      )}
    </Pressable>
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
  if (status === "approved") return styles.stockRequestApproved;
  if (status === "rejected") return styles.stockRequestRejected;
  return styles.stockRequestPending;
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "sem horario";
  }

  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}

const localStyles = StyleSheet.create({
  filterPanel: {
    gap: 8
  },
  searchBox: {
    minHeight: 42,
    borderWidth: 1,
    borderColor: "#dbe7f5",
    borderRadius: 14,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#ffffff"
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    color: "#1f2937",
    fontSize: 14,
    fontWeight: "700"
  },
  clearButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f1f5f9"
  },
  periodRow: {
    gap: 8,
    paddingRight: 12
  },
  periodChip: {
    minHeight: 32,
    borderWidth: 1,
    borderColor: "#dbe7f5",
    borderRadius: 16,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff"
  },
  periodChipActive: {
    borderColor: "#3b82f6",
    backgroundColor: "#3b82f6"
  },
  periodChipText: {
    color: "#64748b",
    fontSize: 12,
    fontWeight: "900"
  },
  periodChipTextActive: {
    color: "#ffffff"
  },
  cardRight: {
    alignItems: "flex-end",
    gap: 8
  }
});
