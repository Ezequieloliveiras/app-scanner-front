import { StyleSheet } from "react-native";
import { radii } from "../styles/tokens";

export const styles = StyleSheet.create({
  menuItem: {
    minHeight: 52,
    borderRadius: radii.md,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#f8fafc"
  },
  menuItemText: {
    flex: 1,
    color: "#1f2937",
    fontSize: 15,
    fontWeight: "900"
  },
  menuNotificationDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: "#ef4444"
  }
});
