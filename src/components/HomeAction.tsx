import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";
import { styles } from "../styles/appStyles";
export function HomeAction({
  icon,
  title,
  text,
  hasBadge = false,
  onPress
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  text: string;
  hasBadge?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.homeAction} onPress={onPress}>
      <View style={styles.homeActionIcon}>
        <Ionicons name={icon} size={26} color="#0f766e" />
      </View>
      {hasBadge && <View style={styles.homeActionNotificationDot} />}
      <Text style={styles.homeActionTitle}>{title}</Text>
      <Text style={styles.homeActionText}>{text}</Text>
    </Pressable>
  );
}
