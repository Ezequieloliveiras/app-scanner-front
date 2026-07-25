import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";
import { styles } from "./HomeAction.styles";
export function HomeAction({
  icon,
  title,
  text,
  badgeText,
  hasBadge = false,
  onPress
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  text?: string;
  badgeText?: string;
  hasBadge?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable style={({ pressed }) => [styles.homeAction, pressed && styles.homeActionPressed]} onPress={onPress}>
      <View style={styles.homeActionIcon}>
        <Ionicons name={icon} size={20} color="#2563eb" />
      </View>
      {hasBadge && <View style={styles.homeActionNotificationDot} />}
      <View style={styles.homeActionTextArea}>
        <Text style={styles.homeActionTitle}>{title}</Text>
        {!!text && <Text style={styles.homeActionText}>{text}</Text>}
        {!!badgeText && <Text style={styles.homeActionBadge}>{badgeText}</Text>}
      </View>
      <Ionicons name="chevron-forward-outline" size={16} color="#cbd5e1" />
    </Pressable>
  );
}
