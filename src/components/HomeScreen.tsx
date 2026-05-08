import { ScrollView, Text, View } from "react-native";
import { styles } from "../styles/appStyles";
import { HomeAction } from "./HomeAction";
export function HomeScreen({
  productsCount,
  pendingCount,
  onScan,
  onProducts,
  onBranches,
  onSimulate
}: {
  productsCount: number;
  pendingCount: number;
  onScan: () => void;
  onProducts: () => void;
  onBranches: () => void;
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
        <HomeAction icon="camera-outline" title="Camera" text="Escannear nota" onPress={onScan} />
        <HomeAction icon="cube-outline" title="Produtos" text="Ver estoque" onPress={onProducts} />
        <HomeAction icon="git-compare-outline" title="Filial" text="Movimentar estoque" onPress={onBranches} />
        <HomeAction icon="document-text-outline" title="XML" text="Simular leitura" onPress={onSimulate} />
      </View>
    </ScrollView>
  );
}
