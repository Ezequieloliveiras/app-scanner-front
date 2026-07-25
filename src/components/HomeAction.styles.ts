import { StyleSheet } from "react-native";
import { colors } from "../styles/tokens";

export const styles = StyleSheet.create({
  homeAction: {
    width: "48.2%",
    minHeight: 66,
    borderWidth: 1,
    borderColor: "#dce3ee",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    backgroundColor: colors.surface,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.035,
    shadowRadius: 8,
    elevation: 1
  },
  homeActionPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.99 }]
  },
  homeActionNotificationDot: {
    position: "absolute",
    top: 10,
    right: 26,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#2563eb"
  },
  homeActionIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#eef4ff"
  },
  homeActionTextArea: {
    flex: 1,
    minWidth: 0,
    justifyContent: "center"
  },
  homeActionTitle: {
    color: "#020617",
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "900"
  },
  homeActionText: {
    marginTop: 2,
    color: colors.muted,
    fontSize: 10,
    fontWeight: "600"
  },
  homeActionBadge: {
    alignSelf: "flex-start",
    marginTop: 3,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    overflow: "hidden",
    color: "#2563eb",
    backgroundColor: "#eaf2ff",
    fontSize: 9,
    lineHeight: 11,
    fontWeight: "800"
  }
});
