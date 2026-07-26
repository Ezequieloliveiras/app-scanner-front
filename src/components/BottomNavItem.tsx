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
    <Pressable style={styles.bottomNavItem} onPress={onPress}>
      <View style={[styles.bottomNavIconBox, active && styles.bottomNavIconBoxActive]}>
        <Ionicons name={icon} size={21} color={active ? "#2563eb" : "#94a3b8"} />
      </View>
      <Text style={[styles.bottomNavLabel, active && styles.bottomNavLabelActive]}>{label}</Text>
    </Pressable>
  );
}
