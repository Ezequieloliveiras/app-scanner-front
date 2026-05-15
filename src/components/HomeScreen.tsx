import { Ionicons } from "@expo/vector-icons";
import { RefreshControl, ScrollView, Text, View } from "react-native";
import { styles } from "../styles/appStyles";
import { AuthUser } from "../types/app";
import { PLAN_LABELS, canAccessModule, canManageAccess, canManageCertificate } from "../utils/appHelpers";
import { HomeAction } from "./HomeAction";
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
  onAccess,
  onCertificate,
  onBilling,
  onSimulate
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
  onAccess: () => void;
  onCertificate: () => void;
  onBilling: () => void;
  onSimulate: () => void;
}) {
  return (
    <ScrollView
      style={styles.content}
      contentContainerStyle={styles.homeInner}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#0f766e"
          colors={["#0f766e"]}
        />
      }
    >
      <View style={styles.homeHero}>
        <View style={styles.homeHeroTop}>
          <View style={styles.homeHeroMark}>
            <Ionicons name="barcode-outline" size={26} color="#0f766e" />
          </View>
          <View style={styles.homeHeroBrand}>
            <Text style={styles.homeEyebrow}>LogScan</Text>
            <Text style={styles.homeHeroName}>NF-e direto no estoque</Text>
          </View>
        </View>
        <Text style={styles.homeHeroText}>Escaneie a nota, confira os produtos e finalize a entrada sem retrabalho.</Text>
        <View style={styles.metricRow}>
          <View style={styles.metricBox}>
            <Text style={styles.metricValue}>{productsCount}</Text>
            <Text style={styles.metricLabel}>produtos em estoque</Text>
          </View>
          <View style={styles.metricBox}>
            <Text style={styles.metricValue}>{pendingCount}</Text>
            <Text style={styles.metricLabel}>itens para conferir</Text>
          </View>
        </View>
      </View>

      <View style={styles.quickGrid}>
        {canAccessModule(user, "dashboard") && (
          <HomeAction icon="analytics-outline" title="Dashboard" text="Produtos parados" onPress={onDashboard} />
        )}
        {canAccessModule(user, "scan") && <HomeAction icon="camera-outline" title="Câmera" text="Escanear nota" onPress={onScan} />}
        {canAccessModule(user, "products") && <HomeAction icon="cube-outline" title="Produtos" text="Ver estoque" onPress={onProducts} />}
        {canAccessModule(user, "branches") && (
          <HomeAction icon="git-compare-outline" title="Filial" text="Movimentar estoque" onPress={onBranches} />
        )}
        {canAccessModule(user, "stock_requests") && (
          <HomeAction
            icon="file-tray-full-outline"
            title="Solicitações"
            text="Analisar retiradas"
            hasBadge={pendingStockRequestsCount > 0}
            onPress={onStockRequests}
          />
        )}
        {canManageAccess(user) && <HomeAction icon="people-outline" title="Acessos" text="Gerenciar usuários" onPress={onAccess} />}
        {canManageCertificate(user) && (
          <HomeAction icon="shield-checkmark-outline" title="Certificado" text="A1 da organização" onPress={onCertificate} />
        )}
        <HomeAction icon="card-outline" title="Planos" text={`Atual: ${PLAN_LABELS[user.plan]}`} onPress={onBilling} />
        {/* {canAccessModule(user, "scan") && <HomeAction icon="document-text-outline" title="XML" text="Simular leitura" onPress={onSimulate} />} */}
      </View>
    </ScrollView>
  );
}
