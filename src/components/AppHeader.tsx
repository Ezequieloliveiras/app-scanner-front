import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { styles } from "../styles/appStyles";
export function AppHeader({
  title,
  loading,
  topInset,
  hasNotification,
  onMenuPress,
  onNotificationPress
}: {
  title: string;
  loading: boolean;
  topInset: number;
  hasNotification: boolean;
  onMenuPress: () => void;
  onNotificationPress: () => void;
}) {
  return (
    <View style={[styles.header, { paddingTop: topInset + 8 }]}>
      <Pressable style={styles.headerIconButton} onPress={onMenuPress}>
        <Ionicons name="menu-outline" size={26} color="#1f2937" />
      </Pressable>
      <View style={styles.headerTitleArea}>
        <Text style={styles.headerTitle}>{title}</Text>
        <Text style={styles.headerSubtitle}>Scanner de notas e estoque</Text>
      </View>
      <View style={styles.headerActions}>
        {loading && <ActivityIndicator color="#0f766e" />}
        <Pressable style={styles.headerIconButton} onPress={onNotificationPress}>
          <Ionicons name="notifications-outline" size={22} color="#1f2937" />
          {hasNotification && <View style={styles.notificationDot} />}
        </Pressable>
      </View>
    </View>
  );
}
