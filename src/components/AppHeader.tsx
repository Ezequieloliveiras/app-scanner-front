import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { styles } from "./AppHeader.styles";
export function AppHeader({
  title,
  loading,
  topInset,
  hasNotification,
  isHome = false,
  compactTitle = false,
  showBackButton = false,
  onMenuPress,
  onNotificationPress
}: {
  title: string;
  loading: boolean;
  topInset: number;
  hasNotification: boolean;
  isHome?: boolean;
  compactTitle?: boolean;
  showBackButton?: boolean;
  onMenuPress: () => void;
  onNotificationPress: () => void;
}) {
  const centeredTitle = isHome || compactTitle;

  return (
    <View style={[styles.header, isHome && styles.headerHome, compactTitle && styles.headerCompact, { paddingTop: topInset + 8 }]}>
      <Pressable
        style={styles.headerIconButton}
        onPress={onMenuPress}
        accessibilityRole="button"
        accessibilityLabel={showBackButton ? "Voltar" : "Abrir menu"}
      >
        <Ionicons name={showBackButton ? "chevron-back-outline" : "menu-outline"} size={showBackButton ? 24 : 25} color="#1f2937" />
      </Pressable>
      <View style={[styles.headerTitleArea, centeredTitle && styles.headerTitleAreaHome]}>
        <Text style={[styles.headerTitle, isHome && styles.headerTitleHome, compactTitle && styles.headerTitleCompact]}>
          {isHome ? "BipaAí" : title}
        </Text>
        {!compactTitle && <Text style={styles.headerSubtitle}>Scanner de notas e estoque</Text>}
      </View>
      <View style={styles.headerActions}>
        {loading && <ActivityIndicator color="#3b82f6" />}
        <Pressable
          style={styles.headerIconButton}
          onPress={onNotificationPress}
          accessibilityRole="button"
          accessibilityLabel="Abrir notificações"
        >
          <Ionicons name="notifications-outline" size={22} color="#1f2937" />
          {hasNotification && <View style={styles.notificationDot} />}
        </Pressable>
      </View>
    </View>
  );
}
