import { ScrollView, Text, View } from "react-native";
import { styles } from "../styles/appStyles";
import { AuthUser } from "../types/app";
import { canAccessModule, canManageAccess } from "../utils/appHelpers";
import { HomeAction } from "./HomeAction";
export function HomeScreen({
  productsCount,
  pendingCount,
  user,
  onScan,
  onProducts,
  onBranches,
  onAccess,
  onSimulate
}: {
  productsCount: number;
  pendingCount: number;
  user: AuthUser;
  onScan: () => void;
  onProducts: () => void;
  onBranches: () => void;
  onAccess: () => void;
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
        {canAccessModule(user, "scan") && <HomeAction icon="camera-outline" title="Câmera" text="Escanear nota" onPress={onScan} />}
        {canAccessModule(user, "products") && <HomeAction icon="cube-outline" title="Produtos" text="Ver estoque" onPress={onProducts} />}
        {canAccessModule(user, "branches") && (
          <HomeAction icon="git-compare-outline" title="Filial" text="Movimentar estoque" onPress={onBranches} />
        )}
        {canManageAccess(user) && <HomeAction icon="people-outline" title="Acessos" text="Gerenciar usuários" onPress={onAccess} />}
        {canAccessModule(user, "scan") && <HomeAction icon="document-text-outline" title="XML" text="Simular leitura" onPress={onSimulate} />}
      </View>
    </ScrollView>
  );
}
