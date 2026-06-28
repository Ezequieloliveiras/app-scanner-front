import { ScrollView } from "react-native";
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
    <ScrollView style={styles.content} contentContainerStyle={[styles.contentInner, styles.productListScreenInner]}>
      <ProductList
        products={products}
        onRegisterMissingDelivered={onRegisterMissingDelivered}
        onCreateStockRequest={onCreateStockRequest}
      />
    </ScrollView>
  );
}
