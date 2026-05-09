import { Ionicons } from "@expo/vector-icons";
import { ScrollView, Text, View } from "react-native";
import { styles } from "../styles/appStyles";

export type AppNotification = {
  id: string;
  title: string;
  text: string;
  tone: "info" | "warning" | "error";
};

export function NotificationsScreen({ notifications }: { notifications: AppNotification[] }) {
  return (
    <ScrollView style={styles.content} contentContainerStyle={styles.contentInner}>
      <View style={styles.pendingHeader}>
        <View>
          <Text style={styles.sectionTitle}>Notificações</Text>
          <Text style={styles.sectionSubtitle}>{notifications.length} aviso(s) no momento.</Text>
        </View>
      </View>

      {notifications.length === 0 ? (
        <Text style={styles.mutedText}>Nenhuma notificação agora.</Text>
      ) : (
        notifications.map((notification) => (
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
        ))
      )}
    </ScrollView>
  );
}
