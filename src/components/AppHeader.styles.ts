import { StyleSheet } from "react-native";
import { colors, radii } from "../styles/tokens";

export const styles = StyleSheet.create({
  header: {
    minHeight: 74,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 8,
    paddingBottom: 11,
    borderBottomWidth: 1,
    borderBottomColor: "#dce3ee",
    backgroundColor: colors.surface,
    shadowOpacity: 0,
    elevation: 0
  },
  headerHome: {
    minHeight: 74
  },
  headerIconButton: {
    width: 32,
    height: 32,
    borderRadius: radii.sm,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent"
  },
  headerTitleArea: {
    flex: 1,
    alignItems: "flex-start"
  },
  headerTitleAreaHome: {
    alignItems: "center"
  },
  headerTitle: {
    color: colors.text,
    fontSize: 16,
    lineHeight: 19,
    fontWeight: "900"
  },
  headerTitleHome: {
    color: "#020617",
    fontSize: 14,
    lineHeight: 17
  },
  headerSubtitle: {
    marginTop: 1,
    color: "#8b9bb0",
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "700"
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 4,
    minWidth: 32
  },
  notificationDot: {
    position: "absolute",
    top: 5,
    right: 5,
    width: 9,
    height: 9,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#ffffff",
    backgroundColor: "#2563eb"
  }
});
