import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";
import { styles } from "./BottomNav.styles";
export function BottomNavItem({
  icon,
  label,
  active,
  prominent = false,
  onPress
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  active: boolean;
  prominent?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable style={[styles.bottomNavItem, prominent && styles.bottomNavItemProminent]} onPress={onPress}>
      <View style={[styles.bottomNavIconBox, active && !prominent && styles.bottomNavIconBoxActive, prominent && styles.bottomNavIconBoxProminent]}>
        <Ionicons name={icon} size={prominent ? 22 : 21} color={prominent ? "#ffffff" : active ? "#2563eb" : "#94a3b8"} />
      </View>
      <Text style={[styles.bottomNavLabel, active && !prominent && styles.bottomNavLabelActive]}>{label}</Text>
    </Pressable>
  );
}
