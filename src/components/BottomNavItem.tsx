import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text } from "react-native";
import { styles } from "../styles/appStyles";
export function BottomNavItem({
  icon,
  label,
  active,
  onPress
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable style={[styles.bottomNavItem, active && styles.bottomNavItemActive]} onPress={onPress}>
      <Ionicons name={icon} size={22} color={active ? "#ffffff" : "#64748b"} />
      <Text style={[styles.bottomNavLabel, active && styles.bottomNavLabelActive]}>{label}</Text>
    </Pressable>
  );
}
