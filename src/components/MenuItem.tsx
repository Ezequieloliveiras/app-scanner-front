import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";
import { styles } from "../styles/appStyles";
export function MenuItem({
  icon,
  label,
  hasBadge = false,
  onPress
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  hasBadge?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.menuItem} onPress={onPress}>
      <Ionicons name={icon} size={22} color="#3b82f6" />
      <Text style={styles.menuItemText}>{label}</Text>
      {hasBadge && <View style={styles.menuNotificationDot} />}
      <Ionicons name="chevron-forward-outline" size={18} color="#94a3b8" />
    </Pressable>
  );
}
