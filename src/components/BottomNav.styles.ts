import { StyleSheet } from "react-native";
import { colors, radii } from "../styles/tokens";

export const styles = StyleSheet.create({
  bottomNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    gap: 8,
    paddingTop: 9,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.04,
    shadowRadius: 14,
    elevation: 8
  },
  bottomNavItem: {
    flex: 1,
    minHeight: 50,
    borderRadius: radii.md,
    alignItems: "center",
    justifyContent: "center",
    gap: 3
  },
  bottomNavItemActive: {
    backgroundColor: "#3b82f6"
  },
  bottomNavLabel: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "800"
  },
  bottomNavLabelActive: {
    color: "#ffffff"
  }
});
