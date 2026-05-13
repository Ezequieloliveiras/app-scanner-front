import { ScrollView, Text, View } from "react-native";
import { styles } from "../styles/appStyles";
import { AuthUser } from "../types/app";
import { PLAN_LABELS, canAccessModule, canManageAccess } from "../utils/appHelpers";
import { HomeAction } from "./HomeAction";
export function HomeScreen({
  productsCount,
  pendingCount,
  pendingStockRequestsCount = 0,
  user,
  onScan,
  onDashboard,
  onProducts,
  onBranches,
  onStockRequests,
  onAccess,
  onBilling,
  onSimulate
}: {
  productsCount: number;
  pendingCount: number;
  pendingStockRequestsCount?: number;
  user: AuthUser;
  onScan: () => void;
  onDashboard: () => void;
  onProducts: () => void;
  onBranches: () => void;
  onStockRequests: () => void;
  onAccess: () => void;
  onBilling: () => void;
  onSimulate: () => void;
}) {
  return (
    <ScrollView style={styles.content} contentContainerStyle={styles.homeInner}>
      <View style={styles.homeHero}>
        <Text style={styles.homeEyebrow}>Entrada inteligente</Text>
        <Text style={styles.homeTitle}>Controle a entrada antes de gravar no estoque.</Text>
        <View style={styles.metricRow}>
          <View style={styles.metricBox}>
            <Text style={styles.metricValue}>{productsCount}</Text>
            <Text style={styles.metricLabel}>produtos</Text>
          </View>
          <View style={styles.metricBox}>
            <Text style={styles.metricValue}>{pendingCount}</Text>
            <Text style={styles.metricLabel}>pendentes</Text>
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
        <HomeAction icon="card-outline" title="Planos" text={`Atual: ${PLAN_LABELS[user.plan]}`} onPress={onBilling} />
        {/* {canAccessModule(user, "scan") && <HomeAction icon="document-text-outline" title="XML" text="Simular leitura" onPress={onSimulate} />} */}
      </View>
    </ScrollView>
  );
}
