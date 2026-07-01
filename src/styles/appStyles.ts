import { StyleSheet } from "react-native";

export const colors = {
  primary: "#3b82f6",
  primarySoft: "#eaf4ff",
  primaryDark: "#17263a",
  white: "#ffffff",
  background: "#f6f8fb",
  surface: "#ffffff",
  surfaceMuted: "#f8fafc",
  border: "#edf2f7",
  borderStrong: "#dbe4f0",
  text: "#1f2937",
  muted: "#64748b",
  danger: "#991b1b",
  warning: "#B45309",
  warningSoft: "#FFF4D6",
  warningAccent: "#F59E0B",
  success: "#15803d",
  successSoft: "#dcfce7"
};

export const radii = {
  sm: 10,
  md: 14,
  lg: 18,
  xl: 22,
  pill: 999
};

const softShadow = {
  shadowColor: "#0f172a",
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.05,
  shadowRadius: 18,
  elevation: 2
};

const primaryShadow = {
  shadowColor: "#2563eb",
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.16,
  shadowRadius: 14,
  elevation: 3
};

export const scannerBorderRadius = 18;
export const scannerFrameStrokeWidth = 4;
export const scannerFrameWidth = "86%";
export const scannerFrameHeight = 170;

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background
  },
  screenBody: {
    flex: 1
  },
  header: {
    minHeight: 76,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 18,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 1
  },
  headerIconButton: {
    width: 42,
    height: 42,
    borderRadius: radii.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceMuted
  },
  headerTitleArea: {
    flex: 1
  },
  headerTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "800"
  },
  headerSubtitle: {
    marginTop: 2,
    color: colors.muted,
    fontSize: 12,
    fontWeight: "600"
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
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: 12,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: colors.surface,
    ...softShadow
  },
  notificationActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  notificationActionButton: {
    minHeight: 38,
    borderRadius: radii.md,
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
  },
  content: {
    flex: 1
  },
  contentInner: {
    padding: 16,
    gap: 16
  },
  productListScreenInner: {
    width: "100%",
    paddingHorizontal: 10,
    paddingTop: 12,
    paddingBottom: 16,
    gap: 12
  },
  homeInner: {
    padding: 16,
    gap: 16
  },
  homeHero: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: 18,
    backgroundColor: colors.surface,
    ...softShadow
  },
  homeHeroTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  homeHeroMark: {
    width: 48,
    height: 48,
    borderRadius: radii.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#eaf4ff"
  },
  homeHeroBrand: {
    flex: 1
  },
  homeHeroName: {
    marginTop: 2,
    color: colors.text,
    fontSize: 22,
    lineHeight: 27,
    fontWeight: "900"
  },
  homeHeroText: {
    marginTop: 14,
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600"
  },
  authContainer: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 16,
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
    color: colors.text,
    fontSize: 26,
    fontWeight: "900"
  },
  authAppTagline: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "700"
  },
  authPanel: {
    gap: 14,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: 16,
    backgroundColor: colors.surface,
    ...softShadow
  },
  authTabs: {
    flexDirection: "row",
    gap: 8,
    padding: 4,
    borderRadius: radii.md,
    backgroundColor: "#eef3f8"
  },
  authTab: {
    flex: 1,
    minHeight: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center"
  },
  authTabActive: {
    backgroundColor: "#ffffff"
  },
  authTabText: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "800"
  },
  authTabTextActive: {
    color: "#3b82f6"
  },
  homeEyebrow: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase"
  },
  homeTitle: {
    marginTop: 8,
    color: colors.text,
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
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: 12,
    backgroundColor: colors.surfaceMuted
  },
  metricValue: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "900"
  },
  metricLabel: {
    marginTop: 2,
    color: colors.muted,
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
    paddingHorizontal: 18
  },
  scanTopChrome: {
    position: "absolute",
    top: 12,
    left: 12,
    right: 76,
    zIndex: 5,
    gap: 10
  },
  scanModeBar: {
    flexDirection: "row",
    alignSelf: "flex-start",
    gap: 4,
    padding: 4,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.34)",
    borderRadius: radii.pill,
    backgroundColor: "rgba(15,23,42,0.26)",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 2
  },
  scanModeButton: {
    minHeight: 32,
    borderRadius: radii.pill,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 5
  },
  scanModeButtonActive: {
    backgroundColor: "rgba(59,130,246,0.92)"
  },
  scanModeButtonText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "800"
  },
  scanModeButtonTextActive: {
    color: "#ffffff"
  },
  scanTorchButton: {
    position: "absolute",
    top: 12,
    right: 12,
    zIndex: 5,
    minHeight: 34,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.34)",
    borderRadius: radii.pill,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    backgroundColor: "rgba(15,23,42,0.26)",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 4
  },
  scanTorchButtonActive: {
    borderColor: "rgba(191,219,254,0.9)",
    backgroundColor: "rgba(234,244,255,0.94)"
  },
  scanTorchButtonText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "800"
  },
  scanTorchButtonTextActive: {
    color: "#17263a"
  },
  scanBox: {
    width: 230,
    height: 230,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.86)",
    borderRadius: radii.xl,
    zIndex: 2
  },
  scanBarcodeGuide: {
    width: scannerFrameWidth,
    height: scannerFrameHeight,
    alignSelf: "center",
    borderRadius: scannerBorderRadius,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
    position: "relative",
    backgroundColor: "transparent"
  },

  scanBarcodeLine: {
    position: "absolute",
    width: "82%",
    height: 3,
    borderRadius: radii.pill,
    backgroundColor: "#60a5fa",
    zIndex: 3
  },
  scanBarcodeCorner: {
    position: "absolute",
    width: 34,
    height: 34,
    borderColor: "rgba(255,255,255,0.92)"
  },
  scanBarcodeCornerTopLeft: {
    top: 0,
    left: 0,
    borderTopWidth: scannerFrameStrokeWidth,
    borderLeftWidth: scannerFrameStrokeWidth,
    borderTopLeftRadius: scannerBorderRadius
  },
  scanBarcodeCornerTopRight: {
    top: 0,
    right: 0,
    borderTopWidth: scannerFrameStrokeWidth,
    borderRightWidth: scannerFrameStrokeWidth,
    borderTopRightRadius: scannerBorderRadius
  },
  scanBarcodeCornerBottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: scannerFrameStrokeWidth,
    borderLeftWidth: scannerFrameStrokeWidth,
    borderBottomLeftRadius: scannerBorderRadius
  },
  scanBarcodeCornerBottomRight: {
    right: 0,
    bottom: 0,
    borderRightWidth: scannerFrameStrokeWidth,
    borderBottomWidth: scannerFrameStrokeWidth,
    borderBottomRightRadius: scannerBorderRadius
  },
  scanReadButton: {
    marginTop: 18,
    alignSelf: "center",
    minWidth: 138,
    height: 50,
    borderRadius: radii.pill,
    paddingHorizontal: 20,
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    zIndex: 3,
    shadowColor: "#2563eb",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 4
  },

  scanBarcodeSideHint: {
    marginTop: 14,
    alignSelf: "center",
    overflow: "hidden",
    backgroundColor: "rgba(15, 23, 42, 0.68)",
    color: "#ffffff",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radii.pill,
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
  },
  scanReadButtonActive: {
    backgroundColor: "#2563eb"
  },
  scanReadButtonText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "800"
  },
  scanControlPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }]
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
    borderRadius: radii.lg,
    padding: 16,
    alignItems: "center",
    backgroundColor: colors.surface,
    ...softShadow
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
    borderColor: colors.borderStrong,
    borderRadius: radii.md,
    paddingHorizontal: 12,
    color: colors.text,
    backgroundColor: "#fbfdff",
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
    borderRadius: radii.md,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.primary,
    ...primaryShadow
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "800"
  },
  secondaryButton: {
    minHeight: 46,
    borderRadius: radii.md,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#dbeafe",
    backgroundColor: colors.surfaceMuted
  },
  secondaryButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "800"
  },
  disabledButton: {
    opacity: 0.65
  },
  errorText: {
    marginHorizontal: 0,
    marginTop: 12,
    borderRadius: radii.md,
    padding: 12,
    color: colors.danger,
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
    color: colors.text,
    fontSize: 18,
    fontWeight: "800"
  },
  sectionSubtitle: {
    marginTop: 3,
    color: colors.muted,
    fontSize: 13
  },
  meta: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "600"
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
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: 14,
    backgroundColor: colors.surface,
    gap: 10,
    ...softShadow
  },
  pendingCardDivergent: {
    borderColor: "#E5E7EB",
    borderLeftWidth: 4,
    borderLeftColor: colors.warningAccent,
    backgroundColor: colors.surface
  },
  pendingTopRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start"
  },
  pendingTitleArea: {
    flex: 1,
    minWidth: 0,
    gap: 7
  },
  pendingName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "800",
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
    borderRadius: radii.md,
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
    borderRadius: radii.pill,
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
    color: "#596579",
    fontSize: 12,
    fontWeight: "600"
  },
  quantityCompareRow: {
    flexDirection: "row",
    gap: 8
  },
  quantityCompareBox: {
    flex: 1,
    minHeight: 58,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: "#f8fafc"
  },
  quantityCompareBoxDivergent: {
    borderColor: "#E5E7EB",
    borderLeftWidth: 4,
    borderLeftColor: colors.warningAccent,
    backgroundColor: colors.surface
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
    color: colors.warning
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
    color: colors.text
  },
  quantityInput: {
    minHeight: 46,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radii.md,
    paddingHorizontal: 12,
    color: colors.text,
    backgroundColor: "#fbfdff",
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
    minHeight: 46,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radii.md,
    paddingHorizontal: 12,
    color: colors.text,
    backgroundColor: "#fbfdff",
    fontSize: 15
  },
  selectButton: {
    width: 46,
    height: 44,
    borderWidth: 1,
    borderColor: "#3b82f6",
    borderRadius: radii.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#eaf4ff"
  },
  branchPanel: {
    width: "100%",
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: 16,
    backgroundColor: colors.surface,
    ...softShadow
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
    width: "100%",
    gap: 8
  },
  branchProductOption: {
    width: "100%",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: 12,
    backgroundColor: "#f8fafc"
  },
  selectorModal: {
    width: "100%",
    maxHeight: "92%",
    gap: 12,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    paddingHorizontal: 10,
    paddingTop: 14,
    paddingBottom: 12,
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
    width: "100%",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: 12,
    backgroundColor: "#f8fafc"
  },
  branchProductOptionActive: {
    borderColor: "#3b82f6",
    backgroundColor: "#eaf4ff"
  },
  branchProductName: {
    flexShrink: 1,
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
    width: "100%",
    gap: 8,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: 14,
    backgroundColor: colors.surface,
    ...softShadow
  },
  stockRequestCard: {
    gap: 10,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: 14,
    backgroundColor: colors.surface,
    ...softShadow
  },
  stockRequestStatus: {
    alignSelf: "flex-start",
    borderRadius: radii.pill,
    paddingHorizontal: 8,
    paddingVertical: 5,
    overflow: "hidden",
    fontSize: 12,
    fontWeight: "900"
  },
  stockRequestObservation: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderLeftWidth: 4,
    borderLeftColor: colors.warningAccent,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: colors.muted,
    backgroundColor: colors.surfaceMuted,
    fontSize: 13,
    lineHeight: 18
  },
  stockRequestPending: {
    color: colors.warning,
    backgroundColor: colors.warningSoft
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
    color: colors.warning,
    backgroundColor: colors.warningSoft
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
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: 16,
    backgroundColor: colors.surface,
    ...softShadow
  },
  planCard: {
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: 16,
    backgroundColor: colors.surface,
    ...softShadow
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
    borderRadius: radii.pill,
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
    borderRadius: radii.pill,
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
    borderRadius: radii.md,
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
    backgroundColor: colors.warningSoft
  },
  certificateStatusText: {
    color: "#3b82f6",
    fontSize: 12,
    fontWeight: "900"
  },
  certificateStatusTextEmpty: {
    color: colors.warning
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
    borderColor: colors.border,
    borderRadius: radii.md,
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
    borderRadius: radii.pill,
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
    borderColor: colors.borderStrong,
    borderRadius: radii.md,
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
    borderColor: colors.border,
    borderRadius: radii.md,
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
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: 18,
    alignItems: "center",
    backgroundColor: colors.surface,
    ...softShadow
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
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderLeftWidth: 4,
    borderLeftColor: colors.warningAccent,
    borderRadius: 8,
    padding: 10,
    backgroundColor: colors.surfaceMuted
  },
  inlineAlertText: {
    flex: 1,
    color: colors.muted,
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
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(15,23,42,0.45)"
  },
  observationModal: {
    gap: 12,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
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
    paddingHorizontal: 8,
    paddingTop: 0,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    backgroundColor: "#ffffff"
  },
  invoiceReviewPageContent: {
    gap: 12,
    paddingHorizontal: 8,
    paddingTop: 10,
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
    borderRadius: radii.md,
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
    width: "100%",
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: 12,
    backgroundColor: colors.surface,
    ...softShadow
  },
  invoiceProductCardDivergent: {
    borderColor: "#E5E7EB",
    borderLeftWidth: 4,
    borderLeftColor: colors.warningAccent,
    backgroundColor: colors.surface
  },
  invoiceProductTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8
  },
  invoiceProductHeaderRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "flex-start",
    gap: 10
  },
  invoiceProductInfo: {
    flex: 1,
    minWidth: 0,
    gap: 7
  },
  invoiceObservationButton: {
    width: 36,
    height: 36,
    borderRadius: radii.md,
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
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: 10,
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#f8fafc"
  },
  invoiceQuantitySummary: {
    width: 82,
    minWidth: 74,
    gap: 3
  },
  invoiceQuantityValue: {
    color: "#1f2937",
    fontSize: 20,
    fontWeight: "900"
  },
  invoiceCountEditor: {
    flex: 1,
    minWidth: 174,
    gap: 6
  },
  invoiceCountControls: {
    minHeight: 38,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: 5,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff"
  },
  invoiceCountControlsDivergent: {
    borderColor: "#E5E7EB",
    backgroundColor: "#ffffff"
  },
  invoiceQuantityBox: {
    flex: 1,
    minHeight: 86,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#ffffff"
  },
  invoiceQuantityBoxDivergent: {
    borderColor: "#E5E7EB",
    borderLeftWidth: 4,
    borderLeftColor: colors.warningAccent,
    backgroundColor: colors.surface
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
    paddingHorizontal: 8,
    paddingTop: 8,
    paddingBottom: 0,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    backgroundColor: "#ffffff"
  },
  invoiceReviewBackButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: radii.md,
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
    borderRadius: radii.md,
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
