import { StyleSheet } from "react-native";
import { colors } from "../styles/tokens";

export const styles = StyleSheet.create({
  bottomNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    gap: 4,
    paddingTop: 2,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderTopColor: "#dce3ee",
    backgroundColor: colors.surface,
    shadowOpacity: 0,
    elevation: 0
  },
  bottomNavItem: {
    flex: 1,
    minHeight: 50,
    alignItems: "center",
    justifyContent: "center",
    gap: 1
  },
  bottomNavItemProminent: {
    transform: [{ translateY: -3 }]
  },
  bottomNavIconBox: {
    width: 34,
    height: 30,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent"
  },
  bottomNavIconBoxActive: {
    backgroundColor: "#eef4ff"
  },
  bottomNavIconBoxProminent: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#071426"
  },
  bottomNavLabel: {
    color: colors.muted,
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "700"
  },
  bottomNavLabelActive: {
    color: "#2563eb"
  }
});
