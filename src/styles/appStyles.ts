import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f4f7f6"
  },
  screenBody: {
    flex: 1
  },
  header: {
    minHeight: 80,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#d8dee9",
    backgroundColor: "#ffffff"
  },
  headerIconButton: {
    width: 42,
    height: 42,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f1f5f9"
  },
  headerTitleArea: {
    flex: 1
  },
  headerTitle: {
    color: "#1f2937",
    fontSize: 20,
    fontWeight: "900"
  },
  headerSubtitle: {
    marginTop: 2,
    color: "#64748b",
    fontSize: 12,
    fontWeight: "700"
  },
  headerStatus: {
    width: 28,
    alignItems: "center"
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  notificationDot: {
    position: "absolute",
    top: 9,
    right: 9,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: "#ef4444"
  },
  bottomNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    gap: 8,
    paddingTop: 10,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderTopColor: "#d8dee9",
    backgroundColor: "#ffffff"
  },
  bottomNavItem: {
    flex: 1,
    minHeight: 52,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    gap: 3
  },
  bottomNavItemActive: {
    backgroundColor: "#0f766e"
  },
  bottomNavLabel: {
    color: "#64748b",
    fontSize: 11,
    fontWeight: "900"
  },
  bottomNavLabelActive: {
    color: "#ffffff"
  },
  content: {
    flex: 1
  },
  contentInner: {
    padding: 18,
    gap: 14
  },
  homeInner: {
    padding: 18,
    gap: 16
  },
  homeHero: {
    borderRadius: 8,
    padding: 18,
    backgroundColor: "#102521"
  },
  homeEyebrow: {
    color: "#99f6e4",
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  homeTitle: {
    marginTop: 8,
    color: "#ffffff",
    fontSize: 25,
    lineHeight: 31,
    fontWeight: "900"
  },
  metricRow: {
    marginTop: 18,
    flexDirection: "row",
    gap: 10
  },
  metricBox: {
    flex: 1,
    borderRadius: 8,
    padding: 12,
    backgroundColor: "rgba(255,255,255,0.10)"
  },
  metricValue: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "900"
  },
  metricLabel: {
    marginTop: 2,
    color: "#cbd5e1",
    fontSize: 12,
    fontWeight: "700"
  },
  quickGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10
  },
  homeAction: {
    width: "48%",
    minHeight: 142,
    borderWidth: 1,
    borderColor: "#d8dee9",
    borderRadius: 8,
    padding: 14,
    backgroundColor: "#ffffff"
  },
  homeActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#e8f3f0"
  },
  homeActionTitle: {
    marginTop: 14,
    color: "#1f2937",
    fontSize: 17,
    fontWeight: "900"
  },
  homeActionText: {
    marginTop: 4,
    color: "#64748b",
    fontSize: 13,
    fontWeight: "700"
  },
  scanPage: {
    flex: 1,
    backgroundColor: "#101820"
  },
  camera: {
    ...StyleSheet.absoluteFillObject
  },
  scannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.18)"
  },
  scanBox: {
    width: 230,
    height: 230,
    borderWidth: 3,
    borderColor: "#ffffff",
    borderRadius: 8
  },
  scanText: {
    marginTop: 14,
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "800"
  },
  scanSimulateButton: {
    marginTop: 18,
    minHeight: 46,
    borderRadius: 8,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(15,118,110,0.92)"
  },
  scanSimulateText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "900"
  },
  permissionPanel: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
    padding: 24
  },
  permissionTitle: {
    color: "#1f2937",
    fontSize: 20,
    fontWeight: "900"
  },
  mutedText: {
    color: "#64748b",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20
  },
  actions: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap"
  },
  primaryButton: {
    minHeight: 46,
    borderRadius: 8,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#0f766e"
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "900"
  },
  secondaryButton: {
    minHeight: 46,
    borderRadius: 8,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#0f766e",
    backgroundColor: "#ffffff"
  },
  secondaryButtonText: {
    color: "#0f766e",
    fontSize: 14,
    fontWeight: "900"
  },
  disabledButton: {
    opacity: 0.65
  },
  errorText: {
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 8,
    padding: 12,
    color: "#991b1b",
    backgroundColor: "#fee2e2"
  },
  pendingSection: {
    gap: 12
  },
  pendingHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12
  },
  sectionTitle: {
    color: "#1f2937",
    fontSize: 19,
    fontWeight: "900"
  },
  sectionSubtitle: {
    marginTop: 3,
    color: "#5b6472",
    fontSize: 13
  },
  meta: {
    color: "#64748b",
    fontSize: 13,
    fontWeight: "700"
  },
  pendingCount: {
    minWidth: 38,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    overflow: "hidden",
    textAlign: "center",
    color: "#ffffff",
    backgroundColor: "#0f766e",
    fontWeight: "900"
  },
  invoiceKey: {
    color: "#3f4b5b",
    fontSize: 12
  },
  pendingCard: {
    borderWidth: 1,
    borderColor: "#d8dee9",
    borderRadius: 8,
    padding: 14,
    backgroundColor: "#ffffff",
    gap: 8
  },
  pendingTopRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start"
  },
  pendingTitleArea: {
    flex: 1,
    gap: 7
  },
  pendingName: {
    color: "#1f2937",
    fontSize: 16,
    fontWeight: "900",
    lineHeight: 22
  },
  quantity: {
    minWidth: 58,
    textAlign: "right",
    color: "#0f766e",
    fontSize: 18,
    fontWeight: "900"
  },
  editButton: {
    width: 42,
    height: 42,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#e8f3f0"
  },
  eanBadge: {
    alignSelf: "flex-start",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    overflow: "hidden",
    color: "#35524d",
    backgroundColor: "#e8f3f0",
    fontSize: 12,
    fontWeight: "800"
  },
  fieldLabel: {
    marginTop: 4,
    color: "#3f4b5b",
    fontSize: 13,
    fontWeight: "900"
  },
  quantityInput: {
    minHeight: 44,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 8,
    paddingHorizontal: 12,
    color: "#1f2937",
    backgroundColor: "#f8fafc",
    fontSize: 15
  },
  selectInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  selectInput: {
    flex: 1,
    minHeight: 44,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 8,
    paddingHorizontal: 12,
    color: "#1f2937",
    backgroundColor: "#f8fafc",
    fontSize: 15
  },
  selectButton: {
    width: 46,
    height: 44,
    borderWidth: 1,
    borderColor: "#0f766e",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#e8f3f0"
  },
  branchPanel: {
    gap: 12,
    borderWidth: 1,
    borderColor: "#d8dee9",
    borderRadius: 8,
    padding: 14,
    backgroundColor: "#ffffff"
  },
  accordionHeader: {
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12
  },
  accordionTitleArea: {
    flex: 1
  },
  accordionBody: {
    gap: 12
  },
  branchProductGrid: {
    gap: 8
  },
  branchProductOption: {
    borderWidth: 1,
    borderColor: "#d8dee9",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#f8fafc"
  },
  selectorModal: {
    maxHeight: "82%",
    gap: 12,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    padding: 18,
    backgroundColor: "#ffffff"
  },
  selectorList: {
    maxHeight: 420
  },
  selectorListInner: {
    gap: 8,
    paddingBottom: 8
  },
  selectorItem: {
    borderWidth: 1,
    borderColor: "#d8dee9",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#f8fafc"
  },
  branchProductOptionActive: {
    borderColor: "#0f766e",
    backgroundColor: "#e8f3f0"
  },
  branchProductName: {
    color: "#1f2937",
    fontSize: 14,
    fontWeight: "900"
  },
  branchProductNameActive: {
    color: "#0f766e"
  },
  branchProductMeta: {
    marginTop: 4,
    color: "#64748b",
    fontSize: 12,
    fontWeight: "800"
  },
  branchProductMetaActive: {
    color: "#35524d"
  },
  branchObservationInput: {
    minHeight: 76,
    paddingTop: 10,
    textAlignVertical: "top"
  },
  transferCard: {
    gap: 8,
    borderWidth: 1,
    borderColor: "#d8dee9",
    borderRadius: 8,
    padding: 14,
    backgroundColor: "#f8fafc"
  },
  transferId: {
    alignSelf: "flex-start",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
    overflow: "hidden",
    color: "#334155",
    backgroundColor: "#e2e8f0",
    fontSize: 12,
    fontWeight: "900"
  },
  transferHistory: {
    borderLeftWidth: 3,
    borderLeftColor: "#0f766e",
    paddingLeft: 8,
    color: "#475569",
    fontSize: 12,
    fontWeight: "800"
  },
  transferActions: {
    gap: 8
  },
  cancelButton: {
    minHeight: 46,
    borderRadius: 8,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#fecaca",
    backgroundColor: "#fee2e2"
  },
  cancelButtonText: {
    color: "#991b1b",
    fontSize: 14,
    fontWeight: "900"
  },
  clearFilterButton: {
    minHeight: 42,
    borderRadius: 8,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#e2e8f0"
  },
  clearFilterText: {
    color: "#475569",
    fontSize: 13,
    fontWeight: "900"
  },
  inlineAlert: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 8,
    padding: 10,
    backgroundColor: "#fffbeb"
  },
  inlineAlertText: {
    flex: 1,
    color: "#92400e",
    fontSize: 13,
    fontWeight: "800"
  },
  commitButton: {
    minHeight: 50,
    borderRadius: 8,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#b91c1c"
  },
  commitButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "900"
  },
  menuOverlay: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "rgba(15,23,42,0.35)"
  },
  menuBackdrop: {
    ...StyleSheet.absoluteFillObject
  },
  sideMenu: {
    width: 292,
    paddingHorizontal: 14,
    gap: 8,
    backgroundColor: "#ffffff"
  },
  sideMenuHeader: {
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8
  },
  sideMenuTitle: {
    color: "#1f2937",
    fontSize: 24,
    fontWeight: "900"
  },
  menuItem: {
    minHeight: 52,
    borderRadius: 8,
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
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(15,23,42,0.45)"
  },
  observationModal: {
    gap: 12,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    padding: 18,
    backgroundColor: "#ffffff"
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  modalTitleArea: {
    flex: 1
  },
  modalTitle: {
    color: "#1f2937",
    fontSize: 20,
    fontWeight: "900"
  },
  modalSubtitle: {
    marginTop: 3,
    color: "#64748b",
    fontSize: 13,
    fontWeight: "700"
  },
  observationInput: {
    minHeight: 128,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "#1f2937",
    backgroundColor: "#f8fafc",
    fontSize: 15,
    textAlignVertical: "top"
  }
});