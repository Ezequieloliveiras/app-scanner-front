import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { styles } from "./AppHeader.styles";
export function AppHeader({
  title,
  loading,
  topInset,
  hasNotification,
  isHome = false,
  onMenuPress,
  onNotificationPress
}: {
  title: string;
  loading: boolean;
  topInset: number;
  hasNotification: boolean;
  isHome?: boolean;
  onMenuPress: () => void;
  onNotificationPress: () => void;
}) {
  return (
    <View style={[styles.header, isHome && styles.headerHome, { paddingTop: topInset + 8 }]}>
      <Pressable style={styles.headerIconButton} onPress={onMenuPress}>
        <Ionicons name="menu-outline" size={25} color="#1f2937" />
      </Pressable>
      <View style={[styles.headerTitleArea, isHome && styles.headerTitleAreaHome]}>
        <Text style={[styles.headerTitle, isHome && styles.headerTitleHome]}>{isHome ? "BipaAí" : title}</Text>
        <Text style={styles.headerSubtitle}>Scanner de notas e estoque</Text>
      </View>
      <View style={styles.headerActions}>
        {loading && <ActivityIndicator color="#3b82f6" />}
        <Pressable style={styles.headerIconButton} onPress={onNotificationPress}>
          <Ionicons name="notifications-outline" size={22} color="#1f2937" />
          {hasNotification && <View style={styles.notificationDot} />}
        </Pressable>
      </View>
    </View>
  );
}
