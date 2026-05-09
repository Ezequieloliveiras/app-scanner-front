import { Ionicons } from "@expo/vector-icons";
import { Pressable, ScrollView, Text, View } from "react-native";
import { styles } from "../styles/appStyles";
import { StockRequest } from "../types/product";

export type AppNotification = {
  id: string;
  title: string;
  text: string;
  tone: "info" | "warning" | "error";
};

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
  const totalNotifications = notifications.length + pendingRequests.length;

  return (
    <ScrollView style={styles.content} contentContainerStyle={styles.contentInner}>
      <View style={styles.pendingHeader}>
        <View>
          <Text style={styles.sectionTitle}>Notificacoes</Text>
          <Text style={styles.sectionSubtitle}>{totalNotifications} aviso(s) no momento.</Text>
        </View>
      </View>

      {totalNotifications === 0 ? (
        <Text style={styles.mutedText}>Nenhuma notificacao agora.</Text>
      ) : (
        <>
          {pendingRequests.map((request) => (
            <View key={request._id} style={styles.notificationItem}>
              <Ionicons name="file-tray-full-outline" size={22} color="#0f766e" />
              <View style={styles.pendingTitleArea}>
                <Text style={styles.branchProductName}>Solicitação de estoque</Text>
                <Text style={styles.branchProductMeta}>
                  {request.requesterName} solicitou {request.quantity} de {request.productName}.
                </Text>
                {request.observation && <Text style={styles.branchProductMeta}>{request.observation}</Text>}
                <View style={styles.notificationActions}>
                  <Pressable
                    style={[styles.notificationActionButton, loading && styles.disabledButton]}
                    disabled={loading}
                    onPress={() => onApproveStockRequest?.(request._id)}
                  >
                    <Ionicons name="checkmark-circle-outline" size={18} color="#ffffff" />
                    <Text style={styles.notificationActionText}>Aceitar</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.notificationRejectButton, loading && styles.disabledButton]}
                    disabled={loading}
                    onPress={() => onRejectStockRequest?.(request._id)}
                  >
                    <Ionicons name="close-circle-outline" size={18} color="#991b1b" />
                    <Text style={styles.notificationRejectText}>Recusar</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          ))}

          {notifications.map((notification) => (
            <View key={notification.id} style={styles.notificationItem}>
              <Ionicons
                name={notification.tone === "error" ? "alert-circle-outline" : "information-circle-outline"}
                size={22}
                color={notification.tone === "error" ? "#991b1b" : "#0f766e"}
              />
              <View style={styles.pendingTitleArea}>
                <Text style={styles.branchProductName}>{notification.title}</Text>
                <Text style={styles.branchProductMeta}>{notification.text}</Text>
              </View>
            </View>
          ))}
        </>
      )}
    </ScrollView>
  );
}
