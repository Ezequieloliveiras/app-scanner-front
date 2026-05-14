import { Ionicons } from "@expo/vector-icons";
import { Pressable, ScrollView, Text, View } from "react-native";
import { styles } from "../styles/appStyles";
import { Product } from "../types/product";
import { ProductList } from "./ProductList";
export function ProductsScreen({
  products,
  onScan,
  onSimulate,
  onRegisterMissingDelivered,
  onCreateStockRequest
}: {
  products: Product[];
  onScan: () => void;
  onSimulate: () => void;
  onRegisterMissingDelivered: (productId: string, quantity: number, observation?: string) => Promise<void>;
  onCreateStockRequest: (productId: string, quantity: number, observation?: string) => Promise<void>;
}) {
  return (
    <ScrollView style={styles.content} contentContainerStyle={styles.contentInner}>
      <ProductList
        products={products}
        onRegisterMissingDelivered={onRegisterMissingDelivered}
        onCreateStockRequest={onCreateStockRequest}
      />
    </ScrollView>
  );
}
