import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { AuthUser } from "../types/app";
import { PLAN_LABELS, canAccessModule, canManageAccess, canManageCertificate } from "../utils/appHelpers";
import { HomeAction } from "./HomeAction";

const homePalette = {
  blue: "#2563eb",
  navy: "#071426",
  orange: "#ff8a00",
  text: "#020617",
  muted: "#64748b",
  line: "#dce3ee",
  section: "#f7f9fc",
  iconSoft: "#eef4ff",
  white: "#ffffff"
};

export function HomeScreen({
  productsCount,
  pendingCount,
  pendingStockRequestsCount = 0,
  refreshing = false,
  user,
  onRefresh,
  onScan,
  onDashboard,
  onProducts,
  onBranches,
  onStockRequests,
  onPendingConferences,
  onAccess,
  onCertificate,
  onBilling
}: {
  productsCount: number;
  pendingCount: number;
  pendingStockRequestsCount?: number;
  refreshing?: boolean;
  user: AuthUser;
  onRefresh: () => void;
  onScan: () => void;
  onDashboard: () => void;
  onProducts: () => void;
  onBranches: () => void;
  onStockRequests: () => void;
  onPendingConferences: () => void;
  onAccess: () => void;
  onCertificate: () => void;
  onBilling: () => void;
  onSimulate: () => void;
}) {
  const displayName = user.name?.trim() || "usuário";

  return (
    <ScrollView
      style={homeStyles.screen}
      contentContainerStyle={homeStyles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={homePalette.blue} colors={[homePalette.blue]} />
      }
    >
      <View style={homeStyles.intro}>
        <View style={homeStyles.greetingRow}>
          <Text style={homeStyles.greeting}>Olá, {displayName} 👋</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Atualizar dados"
            style={({ pressed }) => [homeStyles.refreshButton, pressed && homeStyles.pressed]}
            onPress={onRefresh}
          >
            {refreshing ? (
              <ActivityIndicator size="small" color={homePalette.blue} />
            ) : (
              <Ionicons name="refresh-outline" size={18} color="#8aa0b8" />
            )}
          </Pressable>
        </View>

        <Text style={homeStyles.heroTitle}>NF-e direto no estoque</Text>
        <Text style={homeStyles.heroText}>Escaneie a nota, confira os produtos e finalize a entrada sem retrabalho.</Text>

        <View style={homeStyles.metricsRow}>
          <MetricCard value={productsCount} label="produtos em estoque" accent="blue" />
          <MetricCard value={pendingCount} label="conferencias pendentes" accent="orange" onPress={onPendingConferences} />
        </View>
      </View>

      <View style={homeStyles.quickSection}>
        <Text style={homeStyles.quickTitle}>ACESSO RÁPIDO</Text>
        <View style={homeStyles.quickGrid}>
          {canAccessModule(user, "dashboard") && <HomeAction icon="bar-chart-outline" title="Dashboard" onPress={onDashboard} />}
          {canAccessModule(user, "scan") && <HomeAction icon="camera-outline" title="Câmera" onPress={onScan} />}
          {canAccessModule(user, "products") && <HomeAction icon="cube-outline" title="Produtos" onPress={onProducts} />}
          {canAccessModule(user, "branches") && <HomeAction icon="git-branch-outline" title="Filial" onPress={onBranches} />}
          {canAccessModule(user, "stock_requests") && (
            <HomeAction
              icon="clipboard-outline"
              title="Solicitações"
              hasBadge={pendingStockRequestsCount > 0}
              onPress={onStockRequests}
            />
          )}
          {canManageAccess(user) && <HomeAction icon="people-outline" title="Acessos" onPress={onAccess} />}
          {canManageCertificate(user) && (
            <HomeAction icon="shield-checkmark-outline" title="Certificado" onPress={onCertificate} />
          )}
          <HomeAction icon="card-outline" title="Planos" badgeText={PLAN_LABELS[user.plan]} onPress={onBilling} />
        </View>
      </View>
    </ScrollView>
  );
}

function MetricCard({
  value,
  label,
  accent,
  onPress
}: {
  value: number;
  label: string;
  accent: "blue" | "orange";
  onPress?: () => void;
}) {
  const accentStyle = accent === "blue" ? homeStyles.metricAccentBlue : homeStyles.metricAccentOrange;
  const content = (
    <>
      <View style={[homeStyles.metricAccent, accentStyle]} />
      <Text style={homeStyles.metricValue}>{value}</Text>
      <Text style={homeStyles.metricLabel}>{label}</Text>
    </>
  );

  if (onPress) {
    return (
      <Pressable style={({ pressed }) => [homeStyles.metricCard, pressed && homeStyles.pressed]} onPress={onPress}>
        {content}
      </Pressable>
    );
  }

  return (
    <View style={homeStyles.metricCard}>
      {content}
    </View>
  );
}

const homeStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: homePalette.section
  },
  content: {
    flexGrow: 1,
    paddingBottom: 18,
    backgroundColor: homePalette.section
  },
  intro: {
    borderBottomWidth: 1,
    borderBottomColor: "#edf2f7",
    paddingHorizontal: 8,
    paddingTop: 18,
    paddingBottom: 22,
    backgroundColor: homePalette.white
  },
  greetingRow: {
    minHeight: 22,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12
  },
  greeting: {
    flex: 1,
    color: "#475569",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600"
  },
  refreshButton: {
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center"
  },
  pressed: {
    opacity: 0.7
  },
  heroTitle: {
    marginTop: 2,
    color: homePalette.text,
    fontSize: 21,
    lineHeight: 26,
    fontWeight: "900"
  },
  heroText: {
    marginTop: 5,
    maxWidth: 306,
    color: homePalette.muted,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "500"
  },
  metricsRow: {
    marginTop: 15,
    flexDirection: "row",
    gap: 12
  },
  metricCard: {
    flex: 1,
    minHeight: 85,
    borderWidth: 1,
    borderColor: homePalette.line,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 12,
    overflow: "hidden",
    backgroundColor: homePalette.white,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 1
  },
  metricAccent: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    width: 3
  },
  metricAccentBlue: {
    backgroundColor: homePalette.blue
  },
  metricAccentOrange: {
    backgroundColor: homePalette.orange
  },
  metricValue: {
    color: homePalette.text,
    fontSize: 25,
    lineHeight: 30,
    fontWeight: "900"
  },
  metricLabel: {
    marginTop: 4,
    color: homePalette.muted,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "600"
  },
  quickSection: {
    flexGrow: 1,
    borderTopWidth: 1,
    borderTopColor: "#edf2f7",
    paddingHorizontal: 8,
    paddingTop: 18,
    paddingBottom: 18,
    backgroundColor: homePalette.section
  },
  quickTitle: {
    marginBottom: 13,
    color: "#64748b",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "900",
    letterSpacing: 0
  },
  quickGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 12
  }
});
