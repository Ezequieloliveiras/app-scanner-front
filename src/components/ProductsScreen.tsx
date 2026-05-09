import { Ionicons } from "@expo/vector-icons";
import { Pressable, ScrollView, Text, View } from "react-native";
import { styles } from "../styles/appStyles";
import { Product } from "../types/product";
import { ProductList } from "./ProductList";
export function ProductsScreen({
  products,
  onScan,
  onSimulate,
  onRegisterMissingDelivered
}: {
  products: Product[];
  onScan: () => void;
  onSimulate: () => void;
  onRegisterMissingDelivered: (productId: string, quantity: number, observation?: string) => Promise<void>;
}) {
  return (
    <ScrollView style={styles.content} contentContainerStyle={styles.contentInner}>
      <View style={styles.actions}>
        <Pressable style={styles.primaryButton} onPress={onScan}>
          <Ionicons name="camera-outline" size={18} color="#ffffff" />
          <Text style={styles.primaryButtonText}>Escanear</Text>
        </Pressable>
        <Pressable style={styles.secondaryButton} onPress={onSimulate}>
          <Ionicons name="document-text-outline" size={18} color="#0f766e" />
          <Text style={styles.secondaryButtonText}>Simular leitura de XML</Text>
        </Pressable>
      </View>

      <Text style={styles.sectionTitle}>Produtos em estoque</Text>
      <ProductList products={products} onRegisterMissingDelivered={onRegisterMissingDelivered} />
    </ScrollView>
  );
}
