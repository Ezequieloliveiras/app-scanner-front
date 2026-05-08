import { Ionicons } from "@expo/vector-icons";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { styles } from "../styles/appStyles";
import { EditableInvoiceProduct } from "../types/app";
import { InvoiceResult, Product } from "../types/product";
import { ProductList } from "./ProductList";
export function ProductsScreen({
  pendingInvoice,
  pendingProducts,
  products,
  loading,
  onUpdateProduct,
  onEditProduct,
  onCommit,
  onScan,
  onSimulate,
  onRegisterMissingDelivered
}: {
  pendingInvoice: InvoiceResult | null;
  pendingProducts: EditableInvoiceProduct[];
  products: Product[];
  loading: boolean;
  onUpdateProduct: (index: number, changes: Partial<EditableInvoiceProduct>) => void;
  onEditProduct: (index: number) => void;
  onCommit: () => void;
  onScan: () => void;
  onSimulate: () => void;
  onRegisterMissingDelivered: (productId: string, quantity: number, observation?: string) => Promise<void>;
}) {
  return (
    <ScrollView style={styles.content} contentContainerStyle={styles.contentInner}>
      <View style={styles.actions}>
        <Pressable style={styles.primaryButton} onPress={onScan}>
          <Ionicons name="camera-outline" size={18} color="#ffffff" />
          <Text style={styles.primaryButtonText}>Escannear</Text>
        </Pressable>
        <Pressable style={styles.secondaryButton} onPress={onSimulate}>
          <Ionicons name="document-text-outline" size={18} color="#0f766e" />
          <Text style={styles.secondaryButtonText}>Siimular leitura de XML</Text>
        </Pressable>
      </View>

      {pendingInvoice ? (
        <View style={styles.pendingSection}>
          <View style={styles.pendingHeader}>
            <View>
              <Text style={styles.sectionTitle}>Produtos lidos</Text>
              <Text style={styles.sectionSubtitle}>Ajuste quantidades e use o lapis para observacoes.</Text>
            </View>
            <Text style={styles.pendingCount}>{pendingProducts.length}</Text>
          </View>

          {pendingInvoice.invoiceKey && <Text style={styles.invoiceKey}>Chave: {pendingInvoice.invoiceKey}</Text>}

          {pendingProducts.map((product, index) => (
            <View key={`${product.ean}-${index}`} style={styles.pendingCard}>
              <View style={styles.pendingTopRow}>
                <View style={styles.pendingTitleArea}>
                  <Text style={styles.pendingName}>{product.name}</Text>
                  <Text style={styles.eanBadge}>{product.ean}</Text>
                </View>
                <Pressable style={styles.editButton} onPress={() => onEditProduct(index)}>
                  <Ionicons name="pencil-outline" size={20} color="#0f766e" />
                </Pressable>
              </View>

              <Text style={styles.fieldLabel}>Quantidade que entrou</Text>
              <TextInput
                value={product.quantityInput}
                onChangeText={(value) => onUpdateProduct(index, { quantityInput: value })}
                keyboardType="decimal-pad"
                style={styles.quantityInput}
                placeholder="0"
              />

              {!!product.observation?.trim() && (
                <View style={styles.inlineAlert}>
                  <Ionicons name="alert-circle-outline" size={18} color="#92400e" />
                  <Text style={styles.inlineAlertText}>Este produto tem observacao.</Text>
                </View>
              )}
            </View>
          ))}

          <Pressable style={[styles.commitButton, loading && styles.disabledButton]} disabled={loading} onPress={onCommit}>
            <Ionicons name="send-outline" size={18} color="#ffffff" />
            <Text style={styles.commitButtonText}>Enviar para o estoque</Text>
          </Pressable>
        </View>
      ) : (
        <ProductList products={products} onRegisterMissingDelivered={onRegisterMissingDelivered} />
      )}
    </ScrollView>
  );
}
