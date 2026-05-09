import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { Product, StockEntry } from "../types/product";

type Props = {
  products: Product[];
  onRegisterMissingDelivered: (productId: string, quantity: number, observation?: string) => Promise<void>;
};

export function ProductList({ products, onRegisterMissingDelivered }: Props) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantityInput, setQuantityInput] = useState("");
  const [observationInput, setObservationInput] = useState("");
  const [saving, setSaving] = useState(false);

  if (!products.length) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyTitle}>Nenhum produto no estoque</Text>
        <Text style={styles.emptyText}>Leia uma nota ou simule um XML para registrar entradas.</Text>
      </View>
    );
  }

  async function registerMissingDelivered() {
    if (!selectedProduct || saving) return;

    const quantity = parseQuantity(quantityInput);

    if (quantity <= 0) {
      Alert.alert("Quantidade inválida", "Informe a quantidade entregue depois.");
      return;
    }

    try {
      setSaving(true);
      await onRegisterMissingDelivered(selectedProduct._id, quantity, observationInput.trim() || "Entrada faltante entregue");
      setQuantityInput("");
      setObservationInput("");
      setSelectedProduct(null);
      Alert.alert("Entrada registrada", "A entrega faltante foi adicionada ao estoque.");
    } catch (error) {
      Alert.alert("Não foi possível registrar", error instanceof Error ? error.message : "Tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <View style={styles.list}>
        {products.map((product) => (
          <View key={product._id} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleArea}>
                <Text style={styles.productName}>{product.name}</Text>
                <Text style={styles.meta}>EAN: {product.ean}</Text>
              </View>
              <Text style={styles.quantity}>{product.quantity}</Text>
              <Pressable
                style={styles.detailButton}
                onPress={() => {
                  setSelectedProduct(product);
                  setQuantityInput("");
                  setObservationInput("");
                }}
              >
                <Ionicons name="information-circle-outline" size={22} color="#0f766e" />
              </Pressable>
            </View>
            <Text style={styles.meta}>Entradas: {product.stockEntries?.length || 0}</Text>
          </View>
        ))}
      </View>

      <Modal visible={!!selectedProduct} transparent animationType="slide" onRequestClose={() => setSelectedProduct(null)}>
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 16 : 0}
        >
          <View style={styles.detailModal}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleArea}>
                <Text style={styles.modalTitle}>{selectedProduct?.name}</Text>
                <Text style={styles.modalSubtitle}>EAN: {selectedProduct?.ean}</Text>
              </View>
              <Pressable style={styles.closeButton} onPress={() => setSelectedProduct(null)}>
                <Ionicons name="close-outline" size={24} color="#1f2937" />
              </Pressable>
            </View>

            <View style={styles.summaryRow}>
              <View style={styles.summaryBox}>
                <Text style={styles.summaryValue}>{selectedProduct?.quantity || 0}</Text>
                <Text style={styles.summaryLabel}>em estoque</Text>
              </View>
              <View style={styles.summaryBox}>
                <Text style={styles.summaryValue}>{selectedProduct?.stockEntries?.length || 0}</Text>
                <Text style={styles.summaryLabel}>entradas</Text>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Histórico completo</Text>
            <ScrollView
              style={styles.historyList}
              contentContainerStyle={styles.historyInner}
              keyboardShouldPersistTaps="handled"
            >
              {selectedProduct?.stockEntries?.map((entry, index) => (
                <View key={`${entry.createdAt}-${index}`} style={styles.historyItem}>
                  <View style={styles.historyTopRow}>
                    <Text style={styles.historyType}>{getEntryLabel(entry)}</Text>
                    <Text style={styles.historyQuantity}>+{entry.quantity}</Text>
                  </View>
                  <Text style={styles.historyMeta}>{formatDate(entry.createdAt)}</Text>
                  {entry.invoiceKey && <Text style={styles.historyMeta}>Chave: {entry.invoiceKey}</Text>}
                  {entry.observation && <Text style={styles.historyObservation}>{entry.observation}</Text>}
                </View>
              ))}
            </ScrollView>

            <View style={styles.missingBox}>
              <Text style={styles.sectionTitle}>Faltante entregue</Text>
              <TextInput
                value={quantityInput}
                onChangeText={setQuantityInput}
                keyboardType="decimal-pad"
                placeholder="Quantidade entregue"
                returnKeyType="next"
                style={styles.input}
              />
              <TextInput
                value={observationInput}
                onChangeText={setObservationInput}
                placeholder="Observação da entrega faltante"
                style={[styles.input, styles.textArea]}
                multiline
                returnKeyType="done"
              />
              <Pressable style={[styles.saveButton, saving && styles.disabledButton]} disabled={saving} onPress={registerMissingDelivered}>
                <Ionicons name="add-circle-outline" size={18} color="#ffffff" />
                <Text style={styles.saveButtonText}>Adicionar ao estoque</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

function getEntryLabel(entry: StockEntry) {
  if (entry.type === "missing_delivered" || entry.source === "faltante_entregue") {
    return "Faltante entregue";
  }

  return "Entrada da nota";
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Horário não informado";
  }

  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function parseQuantity(value: string) {
  const parsed = Number(value.replace(",", ".").trim());
  return Number.isFinite(parsed) ? parsed : 0;
}

const styles = StyleSheet.create({
  list: {
    gap: 10,
    paddingBottom: 24
  },
  card: {
    borderWidth: 1,
    borderColor: "#d8dee9",
    borderRadius: 8,
    padding: 14,
    backgroundColor: "#ffffff"
  },
  cardHeader: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center"
  },
  cardTitleArea: {
    flex: 1
  },
  productName: {
    color: "#1f2937",
    fontSize: 15,
    fontWeight: "800"
  },
  quantity: {
    minWidth: 58,
    textAlign: "right",
    color: "#0f766e",
    fontSize: 18,
    fontWeight: "900"
  },
  detailButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#e8f3f0"
  },
  meta: {
    marginTop: 6,
    color: "#5b6472",
    fontSize: 13
  },
  emptyState: {
    borderWidth: 1,
    borderColor: "#d8dee9",
    borderRadius: 8,
    padding: 18,
    backgroundColor: "#ffffff"
  },
  emptyTitle: {
    color: "#1f2937",
    fontSize: 16,
    fontWeight: "800"
  },
  emptyText: {
    marginTop: 6,
    color: "#5b6472",
    fontSize: 14,
    lineHeight: 20
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(15,23,42,0.45)"
  },
  detailModal: {
    maxHeight: "88%",
    gap: 12,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    padding: 18,
    backgroundColor: "#ffffff"
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  modalTitleArea: {
    flex: 1
  },
  modalTitle: {
    color: "#1f2937",
    fontSize: 19,
    fontWeight: "900"
  },
  modalSubtitle: {
    marginTop: 3,
    color: "#64748b",
    fontSize: 13,
    fontWeight: "700"
  },
  closeButton: {
    width: 42,
    height: 42,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f1f5f9"
  },
  summaryRow: {
    flexDirection: "row",
    gap: 10
  },
  summaryBox: {
    flex: 1,
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#e8f3f0"
  },
  summaryValue: {
    color: "#0f766e",
    fontSize: 22,
    fontWeight: "900"
  },
  summaryLabel: {
    color: "#35524d",
    fontSize: 12,
    fontWeight: "800"
  },
  sectionTitle: {
    color: "#1f2937",
    fontSize: 15,
    fontWeight: "900"
  },
  historyList: {
    maxHeight: 220
  },
  historyInner: {
    gap: 8
  },
  historyItem: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    padding: 10,
    backgroundColor: "#f8fafc"
  },
  historyTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10
  },
  historyType: {
    color: "#1f2937",
    fontSize: 13,
    fontWeight: "900"
  },
  historyQuantity: {
    color: "#0f766e",
    fontSize: 15,
    fontWeight: "900"
  },
  historyMeta: {
    marginTop: 4,
    color: "#64748b",
    fontSize: 12,
    fontWeight: "700"
  },
  historyObservation: {
    marginTop: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#f59e0b",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: "#78350f",
    backgroundColor: "#fffbeb",
    fontSize: 13,
    lineHeight: 18
  },
  missingBox: {
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    paddingTop: 12
  },
  input: {
    minHeight: 44,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 8,
    paddingHorizontal: 12,
    color: "#1f2937",
    backgroundColor: "#f8fafc",
    fontSize: 15
  },
  textArea: {
    minHeight: 76,
    paddingTop: 10,
    textAlignVertical: "top"
  },
  saveButton: {
    minHeight: 46,
    borderRadius: 8,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#0f766e"
  },
  saveButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "900"
  },
  disabledButton: {
    opacity: 0.65
  }
});
