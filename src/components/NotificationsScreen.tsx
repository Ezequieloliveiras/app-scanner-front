import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { StockRequest } from "../types/product";

export type AppNotification = {
  id: string;
  title: string;
  text: string;
  tone: "info" | "warning" | "error";
  createdAt?: string;
};

type NotificationRow =
  | { type: "section"; id: string; label: string }
  | { type: "pending"; id: string; request: StockRequest }
  | { type: "answered"; id: string; request: StockRequest }
  | { type: "notice"; id: string; notification: AppNotification }
  | { type: "empty"; id: string };

export function NotificationsScreen({
  notifications,
  stockRequests = [],
  canAnalyzeStockRequests = false,
  loading = false,
  onApproveStockRequest,
  onRejectStockRequest
}: {
  notifications: AppNotification[];
  stockRequests?: StockRequest[];
  canAnalyzeStockRequests?: boolean;
  loading?: boolean;
  onApproveStockRequest?: (id: string) => void;
  onRejectStockRequest?: (id: string) => void;
}) {
  const pendingRequests = canAnalyzeStockRequests
    ? stockRequests.filter((request) => request.status === "pending")
    : [];
  const answeredRequests = canAnalyzeStockRequests
    ? []
    : stockRequests.filter((request) => request.status === "approved" || request.status === "rejected");
  const totalNotifications = notifications.length + pendingRequests.length + answeredRequests.length;
  const rows = buildNotificationRows(pendingRequests, answeredRequests, notifications);

  return (
    <View style={notificationStyles.root}>
      <View style={notificationStyles.summaryBar}>
        <Ionicons name="notifications-outline" size={14} color="#64748B" />
        <Text style={notificationStyles.summaryText}>
          <Text style={notificationStyles.summaryCount}>{totalNotifications}</Text> avisos no momento
        </Text>
      </View>

      <FlatList
        data={rows}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          if (item.type === "section") {
            return <Text style={notificationStyles.sectionLabel}>{item.label}</Text>;
          }

          if (item.type === "pending") {
            return (
              <PendingRequestCard
                request={item.request}
                loading={loading}
                onApprove={() => onApproveStockRequest?.(item.request._id)}
                onReject={() => onRejectStockRequest?.(item.request._id)}
              />
            );
          }

          if (item.type === "answered") {
            return <AnsweredRequestCard request={item.request} />;
          }

          if (item.type === "notice") {
            return <NoticeCard notification={item.notification} />;
          }

          return <Text style={notificationStyles.emptyText}>Nenhuma notificação agora.</Text>;
        }}
        style={notificationStyles.list}
        contentContainerStyle={notificationStyles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

function buildNotificationRows(
  pendingRequests: StockRequest[],
  answeredRequests: StockRequest[],
  notifications: AppNotification[]
): NotificationRow[] {
  const rows: NotificationRow[] = [];

  if (pendingRequests.length > 0) {
    rows.push({ type: "section", id: "pending-section", label: "AÇÕES PENDENTES" });
    rows.push(...pendingRequests.map((request) => ({ type: "pending" as const, id: `pending-${request._id}`, request })));
  }

  if (answeredRequests.length > 0 || notifications.length > 0) {
    rows.push({ type: "section", id: "notice-section", label: "AVISOS" });
    rows.push(...answeredRequests.map((request) => ({ type: "answered" as const, id: `answered-${request._id}`, request })));
    rows.push(...notifications.map((notification) => ({ type: "notice" as const, id: `notice-${notification.id}`, notification })));
  }

  if (rows.length === 0) {
    rows.push({ type: "empty", id: "empty" });
  }

  return rows;
}

function PendingRequestCard({
  request,
  loading,
  onApprove,
  onReject
}: {
  request: StockRequest;
  loading: boolean;
  onApprove: () => void;
  onReject: () => void;
}) {
  const requester = request.requesterName || "Não identificado";

  return (
    <View style={notificationStyles.pendingCard}>
      <View style={notificationStyles.pendingTop}>
        <View style={notificationStyles.iconBoxBlue}>
          <Ionicons name="cube-outline" size={18} color="#2563EB" />
        </View>
        <View style={notificationStyles.pendingTextArea}>
          <Text style={notificationStyles.cardTitle}>Solicitação de estoque</Text>
          <Text style={notificationStyles.cardDescription} numberOfLines={2}>
            {requester} solicitou {formatQuantity(request.quantity)} un. de {request.productName}
          </Text>
          <Text style={notificationStyles.cardDate}>{formatNotificationDate(request.createdAt)}</Text>
        </View>
      </View>

      <View style={notificationStyles.actionRow}>
        <Pressable
          style={({ pressed }) => [notificationStyles.rejectButton, loading && notificationStyles.disabledButton, pressed && !loading && notificationStyles.pressed]}
          disabled={loading}
          onPress={onReject}
          accessibilityRole="button"
          accessibilityLabel={`Recusar solicitação de ${requester}`}
        >
          {loading ? <ActivityIndicator color="#EF4444" size="small" /> : <Ionicons name="close-outline" size={15} color="#DC2626" />}
          <Text style={notificationStyles.rejectText}>Recusar</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [notificationStyles.approveButton, loading && notificationStyles.disabledButton, pressed && !loading && notificationStyles.pressed]}
          disabled={loading}
          onPress={onApprove}
          accessibilityRole="button"
          accessibilityLabel={`Aceitar solicitação de ${requester}`}
        >
          {loading ? <ActivityIndicator color="#FFFFFF" size="small" /> : <Ionicons name="checkmark-outline" size={15} color="#FFFFFF" />}
          <Text style={notificationStyles.approveText}>Aceitar</Text>
        </Pressable>
      </View>
    </View>
  );
}

function AnsweredRequestCard({ request }: { request: StockRequest }) {
  const approved = request.status === "approved";
  const title = approved ? "Retirada aprovada" : "Retirada reprovada";
  const badge = approved ? "Aprovada" : "Recusada";
  const reviewer = request.reviewerName || "analista não identificado";
  const id = formatRequestId(request._id);

  return (
    <View style={notificationStyles.noticeCard}>
      <View style={approved ? notificationStyles.iconBoxGreen : notificationStyles.iconBoxRed}>
        <Ionicons name={approved ? "checkmark-circle-outline" : "close-circle-outline"} size={17} color={approved ? "#16A34A" : "#EF4444"} />
      </View>
      <View style={notificationStyles.noticeTextArea}>
        <View style={notificationStyles.noticeTitleRow}>
          <Text style={notificationStyles.cardTitle}>{title}</Text>
          <StatusBadge label={badge} tone={approved ? "success" : "error"} />
        </View>
        <Text style={notificationStyles.cardDescription} numberOfLines={2}>
          Sua solicitação {id} foi {approved ? "aprovada" : "recusada"} por {reviewer}
        </Text>
        <Text style={notificationStyles.cardDate}>{formatNotificationDate(request.reviewedAt || request.createdAt)}</Text>
      </View>
    </View>
  );
}

function NoticeCard({ notification }: { notification: AppNotification }) {
  const tone = notification.tone === "error" ? "warning" : notification.tone;
  const warning = tone === "warning";

  return (
    <View style={notificationStyles.noticeCard}>
      <View style={warning ? notificationStyles.iconBoxWarning : notificationStyles.iconBoxBlueNotice}>
        <Ionicons
          name={warning ? "warning-outline" : "information-circle-outline"}
          size={17}
          color={warning ? "#F59E0B" : "#2563EB"}
        />
      </View>
      <View style={notificationStyles.noticeTextArea}>
        <View style={notificationStyles.noticeTitleRow}>
          <Text style={notificationStyles.cardTitle} numberOfLines={1}>{notification.title}</Text>
          <StatusBadge label={warning ? "Atenção" : "Aviso"} tone={warning ? "warning" : "info"} />
        </View>
        <Text style={notificationStyles.cardDescription} numberOfLines={2}>{notification.text}</Text>
        {notification.createdAt && <Text style={notificationStyles.cardDate}>{formatNotificationDate(notification.createdAt)}</Text>}
      </View>
    </View>
  );
}

function StatusBadge({ label, tone }: { label: string; tone: "success" | "warning" | "error" | "info" }) {
  return (
    <Text
      style={[
        notificationStyles.statusBadge,
        tone === "success" && notificationStyles.statusSuccess,
        tone === "warning" && notificationStyles.statusWarning,
        tone === "error" && notificationStyles.statusError,
        tone === "info" && notificationStyles.statusInfo
      ]}
    >
      {label}
    </Text>
  );
}

function formatNotificationDate(value: string) {
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

function formatQuantity(value: number) {
  return Number.isInteger(value) ? String(value) : String(value).replace(".", ",");
}

function formatRequestId(id: string) {
  return id.length > 8 ? `SOL-${id.slice(-3).toUpperCase()}` : id;
}

const notificationStyles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#F7F9FC"
  },
  summaryBar: {
    minHeight: 42,
    borderBottomWidth: 1,
    borderBottomColor: "#DCE3EE",
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FFFFFF"
  },
  summaryText: {
    color: "#0F172A",
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "600"
  },
  summaryCount: {
    fontWeight: "900"
  },
  list: {
    flex: 1,
    backgroundColor: "#F7F9FC"
  },
  listContent: {
    paddingBottom: 96
  },
  sectionLabel: {
    marginTop: 15,
    marginBottom: 8,
    marginHorizontal: 13,
    color: "#64748B",
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "800",
    letterSpacing: 0
  },
  pendingCard: {
    marginHorizontal: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#DCE3EE",
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingTop: 14,
    paddingBottom: 15,
    backgroundColor: "#FFFFFF",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2
  },
  pendingTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 11
  },
  iconBoxBlue: {
    width: 32,
    height: 32,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EAF2FF"
  },
  pendingTextArea: {
    flex: 1,
    minWidth: 0
  },
  cardTitle: {
    color: "#020617",
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "900"
  },
  cardDescription: {
    marginTop: 2,
    color: "#64748B",
    fontSize: 12,
    lineHeight: 15,
    fontWeight: "500"
  },
  cardDate: {
    marginTop: 5,
    color: "#8BA0B7",
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "600"
  },
  actionRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 11
  },
  rejectButton: {
    flex: 1,
    minHeight: 32,
    borderWidth: 1,
    borderColor: "#FCA5A5",
    borderRadius: 7,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#FFF1F2"
  },
  rejectText: {
    color: "#DC2626",
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
    gap: 6,
    backgroundColor: "#2563EB",
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 8,
    elevation: 2
  },
  approveText: {
    color: "#FFFFFF",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "900"
  },
  noticeCard: {
    marginHorizontal: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#DCE3EE",
    borderRadius: 12,
    padding: 14,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 11,
    backgroundColor: "#FFFFFF",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2
  },
  noticeTextArea: {
    flex: 1,
    minWidth: 0
  },
  noticeTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8
  },
  iconBoxGreen: {
    width: 32,
    height: 32,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#DCFCE7"
  },
  iconBoxRed: {
    width: 32,
    height: 32,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FEE2E2"
  },
  iconBoxWarning: {
    width: 32,
    height: 32,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF7ED"
  },
  iconBoxBlueNotice: {
    width: 32,
    height: 32,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EAF2FF"
  },
  statusBadge: {
    borderRadius: 999,
    paddingHorizontal: 7,
    paddingVertical: 3,
    overflow: "hidden",
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "900"
  },
  statusSuccess: {
    color: "#16A34A",
    backgroundColor: "#DCFCE7"
  },
  statusWarning: {
    color: "#B45309",
    backgroundColor: "#FEF3C7"
  },
  statusError: {
    color: "#DC2626",
    backgroundColor: "#FEE2E2"
  },
  statusInfo: {
    color: "#2563EB",
    backgroundColor: "#DBEAFE"
  },
  emptyText: {
    paddingTop: 24,
    color: "#64748B",
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
