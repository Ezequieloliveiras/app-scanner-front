import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text } from "react-native";
import { styles } from "../styles/appStyles";
export function MenuItem({
  icon,
  label,
  onPress
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.menuItem} onPress={onPress}>
      <Ionicons name={icon} size={22} color="#0f766e" />
      <Text style={styles.menuItemText}>{label}</Text>
      <Ionicons name="chevron-forward-outline" size={18} color="#94a3b8" />
    </Pressable>
  );
}
