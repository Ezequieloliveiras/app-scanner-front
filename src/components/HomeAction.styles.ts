import { StyleSheet } from "react-native";
import { colors, radii, softShadow } from "../styles/tokens";

export const styles = StyleSheet.create({
  homeAction: {
    width: "48%",
    minHeight: 132,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: 14,
    position: "relative",
    backgroundColor: colors.surface,
    ...softShadow
  },
  homeActionNotificationDot: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#ef4444"
  },
  homeActionIcon: {
    width: 42,
    height: 42,
    borderRadius: radii.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#eaf4ff"
  },
  homeActionTitle: {
    marginTop: 12,
    color: colors.text,
    fontSize: 16,
    fontWeight: "800"
  },
  homeActionText: {
    marginTop: 4,
    color: colors.muted,
    fontSize: 13,
    fontWeight: "600"
  }
});
