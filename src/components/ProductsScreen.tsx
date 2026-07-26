import { View } from "react-native";
import { styles } from "../styles/appStyles";
import { Product } from "../types/product";
import { ProductList } from "./ProductList";
export function ProductsScreen({
  products,
  onScan,
  onSimulate,
  onDetailChange,
  detailOpen = false,
  detailBackRequest = 0,
  onRegisterMissingDelivered,
  onCreateStockRequest
}: {
  products: Product[];
  onScan: () => void;
  onSimulate: () => void;
  onDetailChange?: (open: boolean) => void;
  detailOpen?: boolean;
  detailBackRequest?: number;
  onRegisterMissingDelivered: (productId: string, quantity: number, observation?: string) => Promise<void>;
  onCreateStockRequest: (productId: string, quantity: number, observation?: string) => Promise<void>;
}) {
  return (
    <View style={[styles.productsPage, detailOpen && styles.productsPageDetail]}>
      <ProductList
        products={products}
        onDetailChange={onDetailChange}
        detailBackRequest={detailBackRequest}
        onRegisterMissingDelivered={onRegisterMissingDelivered}
        onCreateStockRequest={onCreateStockRequest}
      />
    </View>
  );
}
