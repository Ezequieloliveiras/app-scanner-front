import { StyleSheet } from "react-native";

export const colors = {
  primary: "#3b82f6",
  primarySoft: "#eaf4ff",
  primaryDark: "#17263a",
  white: "#ffffff"
};

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#ffffff"
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
    justifyContent: "center"
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
    justifyContent: "flex-end",
    gap: 8,
    minWidth: 42
  },
  notificationDot: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: "#ef4444"
  },
  menuNotificationDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: "#ef4444"
  },
  notificationItem: {
    minHeight: 58,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    padding: 12,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: "#f8fafc"
  },
  notificationActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  notificationActionButton: {
    minHeight: 38,
    borderRadius: 8,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#3b82f6"
  },
  notificationActionText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "900"
  },
  notificationRejectButton: {
    minHeight: 38,
    borderWidth: 1,
    borderColor: "#fecaca",
    borderRadius: 8,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#fee2e2"
  },
  notificationRejectText: {
    color: "#991b1b",
    fontSize: 12,
    fontWeight: "900"
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
    backgroundColor: "#3b82f6"
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
    backgroundColor: "#17263a"
  },
  homeHeroTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  homeHeroMark: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#eaf4ff"
  },
  homeHeroBrand: {
    flex: 1
  },
  homeHeroName: {
    marginTop: 2,
    color: "#ffffff",
    fontSize: 22,
    lineHeight: 27,
    fontWeight: "900"
  },
  homeHeroText: {
    marginTop: 14,
    color: "#d7ebe6",
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "800"
  },
  authContainer: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 18,
    gap: 16
  },
  authHero: {
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 8
  },
  authLogoMark: {
    width: 76,
    height: 76,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  authIcon: {
    width: 52,
    height: 52,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primarySoft
  },
  authAppName: {
    color: colors.primaryDark,
    fontSize: 26,
    fontWeight: "900"
  },
  authAppTagline: {
    color: "#5d6f82",
    fontSize: 13,
    fontWeight: "800"
  },
  authPanel: {
    gap: 12,
    borderWidth: 1,
    borderColor: "#d8dee9",
    borderRadius: 8,
    padding: 14,
    backgroundColor: "#ffffff"
  },
  authTabs: {
    flexDirection: "row",
    gap: 8,
    padding: 4,
    borderRadius: 8,
    backgroundColor: "#e2e8f0"
  },
  authTab: {
    flex: 1,
    minHeight: 40,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center"
  },
  authTabActive: {
    backgroundColor: "#ffffff"
  },
  authTabText: {
    color: "#64748b",
    fontSize: 13,
    fontWeight: "900"
  },
  authTabTextActive: {
    color: "#3b82f6"
  },
  homeEyebrow: {
    color: "#bfdbfe",
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
    position: "relative",
    backgroundColor: "#ffffff"
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
    width: 48,
    height: 48,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#eaf4ff"
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
    backgroundColor: "#17263a"
  },
  camera: {
    ...StyleSheet.absoluteFillObject
  },
  scannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
  },
  scanModeBar: {
    position: "absolute",
    top: 16,
    left: 14,
    right: 14,
    zIndex: 3,
    flexDirection: "row",
    gap: 8,
    padding: 5,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.92)"
  },
  scanModeButton: {
    flex: 1,
    minHeight: 42,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    gap: 2
  },
  scanModeButtonActive: {
    backgroundColor: "#3b82f6"
  },
  scanModeButtonText: {
    color: "#3b82f6",
    fontSize: 10,
    fontWeight: "900"
  },
  scanModeButtonTextActive: {
    color: "#ffffff"
  },
  scanTorchButton: {
    position: "absolute",
    top: 74,
    right: 14,
    zIndex: 4,
    minHeight: 42,
    borderRadius: 8,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    backgroundColor: "rgba(15,23,42,0.76)",
    elevation: 4
  },
  scanTorchButtonActive: {
    backgroundColor: "#fbbf24"
  },
  scanTorchButtonText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "900"
  },
  scanTorchButtonTextActive: {
    color: "#17263a"
  },
  scanBox: {
    width: 230,
    height: 230,
    borderWidth: 3,
    borderColor: "#ffffff",
    borderRadius: 8,
    zIndex: 2
  },
  scanBarcodeGuide: {
    width: "86%",
    height: 170,
    alignSelf: "center",
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2
  },

  scanBarcodeFocusLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1
  },
  scanBarcodeShade: {
    flex: 1,
  },
  scanBarcodeFocusRow: {
    height: 170,
    flexDirection: "row",
  },
  scanBarcodeFocusHole: {
    width: "86%",
    height: 170,
    backgroundColor: "transparent",
  },
  scanBarcodeLine: {
    width: "82%",
    height: 4,
    borderRadius: 8,
    backgroundColor: "#ffffff",
  },
  scanBarcodeCorner: {
    position: "absolute",
    width: 30,
    height: 30,
    borderColor: "#ffffff"
  },
  scanBarcodeCornerTopLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 6,
    borderLeftWidth: 6,
    borderTopLeftRadius: 12
  },
  scanBarcodeCornerTopRight: {
    top: 0,
    right: 0,
    borderTopWidth: 6,
    borderRightWidth: 6,
    borderTopRightRadius: 12
  },
  scanBarcodeCornerBottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 6,
    borderLeftWidth: 6,
    borderBottomLeftRadius: 12
  },
  scanBarcodeCornerBottomRight: {
    right: 0,
    bottom: 0,
    borderRightWidth: 6,
    borderBottomWidth: 6,
    borderBottomRightRadius: 12
  },
  scanReadButton: {
    marginTop: 16,
    alignSelf: "center",
    width: 150,
    height: 64,
    borderRadius: 18,
    backgroundColor: "#3b82f6",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    zIndex: 3,
    elevation: 3
  },

  scanBarcodeSideHint: {
    marginTop: 12,
    alignSelf: "center",
    backgroundColor: "rgba(15, 23, 42, 0.75)",
    color: "#ffffff",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    fontWeight: "800",
    textAlign: "center",
  },
  scanReadButtonActive: {
    backgroundColor: "rgba(245,158,11,0.96)"
  },
  scanReadButtonText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "900"
  },
  scanText: {
    marginTop: 14,
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "800",
    zIndex: 2
  },
  scanManualPanel: {
    width: "100%",
    maxWidth: 420,
    gap: 12,
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    backgroundColor: "#ffffff"
  },
  scanManualTitle: {
    color: "#1f2937",
    fontSize: 17,
    fontWeight: "900"
  },
  scanManualInput: {
    width: "100%",
    minHeight: 48,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 8,
    paddingHorizontal: 12,
    color: "#1f2937",
    backgroundColor: "#f8fafc",
    fontSize: 15,
    textAlign: "center"
  },
  scanSimulateButton: {
    marginTop: 18,
    minHeight: 46,
    borderRadius: 8,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(15,118,110,0.92)",
    zIndex: 2
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
    backgroundColor: "#3b82f6"
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
    borderColor: "#3b82f6",
    backgroundColor: "#ffffff"
  },
  secondaryButtonText: {
    color: "#3b82f6",
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
    backgroundColor: "#3b82f6",
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
  pendingCardDivergent: {
    borderColor: "#f59e0b",
    backgroundColor: "#fffbeb"
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
    color: "#3b82f6",
    fontSize: 18,
    fontWeight: "900",
    paddingRight: 6
  },
  editButton: {
    minWidth: 52,
    minHeight: 52,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#dbeafe",
    backgroundColor: "#eaf4ff"
  },
  editButtonActive: {
    borderColor: "#bfdbfe",
    backgroundColor: "#dbeafe"
  },
  eanBadge: {
    alignSelf: "flex-start",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    overflow: "hidden",
    color: "#5d6f82",
    backgroundColor: "#eaf4ff",
    fontSize: 12,
    fontWeight: "800"
  },
  fieldLabel: {
    marginTop: 4,
    color: "#3f4b5b",
    fontSize: 13,
    fontWeight: "900"
  },
  quantityCompareRow: {
    flexDirection: "row",
    gap: 8
  },
  quantityCompareBox: {
    flex: 1,
    minHeight: 58,
    borderWidth: 1,
    borderColor: "#d8dee9",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: "#f8fafc"
  },
  quantityCompareBoxDivergent: {
    borderColor: "#f59e0b",
    backgroundColor: "#fef3c7"
  },
  quantityCompareLabel: {
    color: "#64748b",
    fontSize: 11,
    fontWeight: "900"
  },
  quantityCompareValue: {
    marginTop: 3,
    color: "#1f2937",
    fontSize: 18,
    fontWeight: "900"
  },
  quantityCompareValueDivergent: {
    color: "#92400e"
  },
  quantityCompareInput: {
    marginTop: 3,
    minHeight: 30,
    padding: 0,
    color: "#1f2937",
    fontSize: 18,
    fontWeight: "900"
  },
  quantityCompareInputDivergent: {
    color: "#92400e"
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
  inlineEditor: {
    gap: 8
  },
  inlineObservationInput: {
    minHeight: 96,
    paddingTop: 10
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
    borderColor: "#3b82f6",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#eaf4ff"
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
    borderColor: "#3b82f6",
    backgroundColor: "#eaf4ff"
  },
  branchProductName: {
    color: "#1f2937",
    fontSize: 14,
    fontWeight: "900"
  },
  branchProductNameActive: {
    color: "#3b82f6"
  },
  branchProductMeta: {
    marginTop: 4,
    color: "#64748b",
    fontSize: 12,
    fontWeight: "800"
  },
  branchProductMetaActive: {
    color: "#5d6f82"
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
  stockRequestCard: {
    gap: 10,
    borderWidth: 1,
    borderColor: "#d8dee9",
    borderRadius: 8,
    padding: 14,
    backgroundColor: "#f8fafc"
  },
  stockRequestStatus: {
    alignSelf: "flex-start",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
    overflow: "hidden",
    fontSize: 12,
    fontWeight: "900"
  },
  stockRequestObservation: {
    borderLeftWidth: 4,
    borderLeftColor: "#f59e0b",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: "#78350f",
    backgroundColor: "#fffbeb",
    fontSize: 13,
    lineHeight: 18
  },
  stockRequestPending: {
    color: "#92400e",
    backgroundColor: "#fef3c7"
  },
  stockRequestApproved: {
    color: "#3b82f6",
    backgroundColor: "#dbeafe"
  },
  stockRequestRejected: {
    color: "#991b1b",
    backgroundColor: "#fee2e2"
  },
  transferIdRow: {
    alignSelf: "flex-start",
    maxWidth: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
    backgroundColor: "#e2e8f0"
  },
  transferIdLabel: {
    color: "#334155",
    fontSize: 12,
    fontWeight: "900"
  },
  transferIdValue: {
    flexShrink: 1,
    color: "#334155",
    fontSize: 12,
    fontWeight: "800"
  },
  transferStatusBadge: {
    alignSelf: "flex-start",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
    overflow: "hidden",
    fontSize: 12,
    fontWeight: "900"
  },
  transferStatusReserved: {
    color: "#92400e",
    backgroundColor: "#fef3c7"
  },
  transferStatusInTransit: {
    color: "#1d4ed8",
    backgroundColor: "#dbeafe"
  },
  transferStatusReceived: {
    color: "#3b82f6",
    backgroundColor: "#dbeafe"
  },
  transferStatusCancelled: {
    color: "#991b1b",
    backgroundColor: "#fee2e2"
  },
  transferHistory: {
    borderLeftWidth: 3,
    borderLeftColor: "#3b82f6",
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
  accessCard: {
    gap: 12,
    borderWidth: 1,
    borderColor: "#d8dee9",
    borderRadius: 8,
    padding: 14,
    backgroundColor: "#ffffff"
  },
  planCard: {
    gap: 12,
    borderWidth: 1,
    borderColor: "#d8dee9",
    borderRadius: 8,
    padding: 14,
    backgroundColor: "#ffffff"
  },
  planCardHighlighted: {
    borderColor: "#3b82f6",
    backgroundColor: "#f7fbff"
  },
  planCardActive: {
    borderColor: "#bfdbfe"
  },
  planTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12
  },
  planTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8
  },
  planBadge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    overflow: "hidden",
    color: "#3b82f6",
    backgroundColor: "#dbeafe",
    fontSize: 11,
    fontWeight: "900"
  },
  planPrice: {
    color: "#3b82f6",
    fontSize: 16,
    fontWeight: "900",
    textAlign: "right"
  },
  planFeatureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  planModuleGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  planModulePill: {
    minHeight: 38,
    width: "48%",
    borderWidth: 1,
    borderColor: "#bfdbfe",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#eaf4ff"
  },
  planModuleText: {
    flex: 1,
    flexShrink: 1,
    color: "#3b82f6",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "900"
  },
  accessStatusButton: {
    minHeight: 38,
    borderRadius: 8,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderWidth: 1
  },
  accessEnabled: {
    borderColor: "#bfdbfe",
    backgroundColor: "#eaf4ff"
  },
  accessDisabled: {
    borderColor: "#fecaca",
    backgroundColor: "#fee2e2"
  },
  accessStatusText: {
    color: "#3b82f6",
    fontSize: 12,
    fontWeight: "900"
  },
  accessStatusTextDisabled: {
    color: "#991b1b"
  },
  certificateStatusBadge: {
    minHeight: 34,
    borderRadius: 8,
    paddingHorizontal: 9,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6
  },
  certificateStatusOk: {
    backgroundColor: "#dbeafe"
  },
  certificateStatusEmpty: {
    backgroundColor: "#fef3c7"
  },
  certificateStatusText: {
    color: "#3b82f6",
    fontSize: 12,
    fontWeight: "900"
  },
  certificateStatusTextEmpty: {
    color: "#92400e"
  },
  certificateMetaGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  certificateInfoTile: {
    width: "48%",
    minHeight: 62,
    borderWidth: 1,
    borderColor: "#d8dee9",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: "#f8fafc"
  },
  certificateInfoValue: {
    marginTop: 3,
    color: "#1f2937",
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "900"
  },
  roleRow: {
    flexDirection: "row",
    gap: 8
  },
  roleButton: {
    flex: 1,
    minHeight: 38,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#e2e8f0"
  },
  roleButtonActive: {
    backgroundColor: "#3b82f6"
  },
  roleButtonText: {
    color: "#475569",
    fontSize: 12,
    fontWeight: "900"
  },
  roleButtonTextActive: {
    color: "#ffffff"
  },
  moduleGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  moduleButton: {
    width: "48%",
    minHeight: 42,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 8,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#f8fafc"
  },
  moduleButtonActive: {
    borderColor: "#bfdbfe",
    backgroundColor: "#eaf4ff"
  },
  moduleButtonText: {
    color: "#64748b",
    fontSize: 12,
    fontWeight: "900"
  },
  moduleButtonTextActive: {
    color: "#3b82f6"
  },
  userListItem: {
    minHeight: 56,
    borderWidth: 1,
    borderColor: "#d8dee9",
    borderRadius: 8,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#f8fafc"
  },
  userListItemActive: {
    borderColor: "#cbd5e1",
    backgroundColor: "#f8fafc"
  },
  profileCard: {
    gap: 10,
    borderWidth: 1,
    borderColor: "#d8dee9",
    borderRadius: 8,
    padding: 18,
    alignItems: "center",
    backgroundColor: "#ffffff"
  },
  profileAvatarButton: {
    width: 88,
    height: 88,
    alignItems: "center",
    justifyContent: "center"
  },
  profileAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    backgroundColor: "#eaf4ff"
  },
  profileAvatarImage: {
    width: "100%",
    height: "100%"
  },
  profileCameraBadge: {
    position: "absolute",
    right: 3,
    bottom: 3,
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#ffffff",
    backgroundColor: "#3b82f6"
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
  sideMenuList: {
    flex: 1
  },
  sideMenuListContent: {
    gap: 8,
    paddingBottom: 28
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
  invoiceReviewPage: {
    flex: 1,
    backgroundColor: "#ffffff"
  },
  invoiceReviewPageHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingTop: 0,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    backgroundColor: "#ffffff"
  },
  invoiceReviewPageContent: {
    gap: 12,
    padding: 14,
    paddingBottom: 12
  },
  invoiceReviewModal: {
    maxHeight: "88%",
    gap: 12,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 18,
    backgroundColor: "#ffffff"
  },
  invoiceReviewHandle: {
    alignSelf: "center",
    width: 72,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#cbd5e1"
  },
  invoiceReviewCloseButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f1f5f9"
  },
  invoiceKeyArea: {
    minHeight: 34,
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  invoiceKeyLabel: {
    color: "#475569",
    fontSize: 11,
    fontWeight: "800"
  },
  invoiceKeyBox: {
    flex: 1,
    minHeight: 32,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#f8fafc"
  },
  invoiceKeyValue: {
    flex: 1,
    color: "#64748b",
    fontSize: 10,
    fontWeight: "700"
  },
  invoiceReviewList: {
    flex: 1
  },
  invoiceReviewListContent: {
    gap: 16,
    paddingBottom: 6
  },
  invoiceProductCard: {
    gap: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#ffffff"
  },
  invoiceProductCardDivergent: {
    borderColor: "#bfdbfe",
    backgroundColor: "#f7fbff"
  },
  invoiceProductTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8
  },
  invoiceProductHeaderRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10
  },
  invoiceProductInfo: {
    flex: 1,
    gap: 7
  },
  invoiceObservationButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#eaf4ff"
  },
  invoiceObservationButtonActive: {
    backgroundColor: "#3b82f6"
  },
  invoiceProductNameRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8
  },
  invoiceProductInlineIcon: {
    width: 26,
    height: 26,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#eaf4ff"
  },
  invoiceProductName: {
    flex: 1,
    color: "#17263a",
    fontSize: 14,
    lineHeight: 19,
    fontWeight: "900"
  },
  invoiceProductMetaRow: {
    marginLeft: 34,
    flexDirection: "row",
    alignItems: "center",
    gap: 5
  },
  invoiceProductMeta: {
    flex: 1,
    color: "#64748b",
    fontSize: 12,
    fontWeight: "800"
  },
  invoiceEanBadge: {
    alignSelf: "flex-start",
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 5,
    overflow: "hidden",
    color: "#3b82f6",
    backgroundColor: "#dbeafe",
    fontSize: 12,
    fontWeight: "900"
  },
  invoiceQuantityRow: {
    flexDirection: "row",
    gap: 10
  },
  invoiceQuantityPanel: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#f8fafc"
  },
  invoiceQuantitySummary: {
    width: 82,
    gap: 3
  },
  invoiceQuantityValue: {
    color: "#1f2937",
    fontSize: 20,
    fontWeight: "900"
  },
  invoiceCountEditor: {
    flex: 1,
    gap: 6
  },
  invoiceCountControls: {
    minHeight: 38,
    borderWidth: 1,
    borderColor: "#d8dee9",
    borderRadius: 8,
    paddingHorizontal: 5,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff"
  },
  invoiceCountControlsDivergent: {
    borderColor: "#bfdbfe",
    backgroundColor: "#ffffff"
  },
  invoiceQuantityBox: {
    flex: 1,
    minHeight: 86,
    borderWidth: 1,
    borderColor: "#d8dee9",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#ffffff"
  },
  invoiceQuantityBoxDivergent: {
    borderColor: "#bfdbfe",
    backgroundColor: "#eaf4ff"
  },
  invoiceQuantityInputRow: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  invoiceQuantityInput: {
    flex: 1,
    minHeight: 34,
    padding: 0,
    color: "#1f2937",
    fontSize: 19,
    fontWeight: "900",
    textAlign: "center"
  },
  invoiceQuantityStepButton: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#e2e8f0"
  },
  invoiceReviewInfo: {
    minHeight: 48,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#f8fafc"
  },
  invoiceReviewInfoIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#dbeafe"
  },
  invoiceReviewInfoText: {
    flex: 1,
    color: "#475569",
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "700"
  },
  invoiceReviewActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  invoiceReviewFooter: {
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 0,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    backgroundColor: "#ffffff"
  },
  invoiceReviewBackButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: 8,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    backgroundColor: "#f8fafc"
  },
  invoiceReviewBackText: {
    color: "#3b82f6",
    fontSize: 13,
    fontWeight: "900"
  },
  invoiceReviewCommitButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: 8,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    backgroundColor: "#2563eb"
  },
  invoiceReviewCommitText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "900"
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
  },
  transferRightArea: {
    alignItems: "flex-end",
    gap: 8
  },
  transferFooterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 6
  },
});
