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
  onCreateStockRequest: (productId: string, quantity: number, observation?: string) => Promise<void>;
};

type ExpandedAction = "missing" | "withdraw" | null;

export function ProductList({ products, onRegisterMissingDelivered, onCreateStockRequest }: Props) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantityInput, setQuantityInput] = useState("");
  const [observationInput, setObservationInput] = useState("");
  const [withdrawQuantityInput, setWithdrawQuantityInput] = useState("");
  const [withdrawObservationInput, setWithdrawObservationInput] = useState("");
  const [expandedAction, setExpandedAction] = useState<ExpandedAction>(null);
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
      setExpandedAction(null);
      Alert.alert("Entrada registrada", "A entrega faltante foi adicionada ao estoque.");
    } catch (error) {
      Alert.alert("Não foi possível registrar", error instanceof Error ? error.message : "Tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  async function createStockRequest() {
    if (!selectedProduct || saving) return;

    const quantity = parseQuantity(withdrawQuantityInput);

    if (quantity <= 0) {
      Alert.alert("Quantidade invalida", "Informe a quantidade para retirada.");
      return;
    }

    try {
      setSaving(true);
      await onCreateStockRequest(
        selectedProduct._id,
        quantity,
        withdrawObservationInput.trim() || "Solicitação de retirada de estoque"
      );
      setWithdrawQuantityInput("");
      setWithdrawObservationInput("");
      setExpandedAction(null);
      Alert.alert("Solicitação enviada", "A retirada de estoque foi enviada para analise.");
    } catch (error) {
      Alert.alert("Nao foi possivel solicitar", error instanceof Error ? error.message : "Tente novamente.");
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
                  setWithdrawQuantityInput("");
                  setWithdrawObservationInput("");
                  setExpandedAction(null);
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
                <View
                  key={`${entry.createdAt}-${index}`}
                  style={[styles.historyItem, isInvoiceDivergent(entry) && styles.historyItemDivergent]}
                >
                  <View style={styles.historyTopRow}>
                    <Text style={styles.historyType}>{getEntryLabel(entry)}</Text>
                    <Text style={[styles.historyQuantity, getEntryQuantityStyle(entry)]}>
                      {getEntryQuantity(entry)}
                    </Text>
                  </View>
                  <Text style={styles.historyMeta}>{formatDate(entry.createdAt)}</Text>
                  {entry.invoiceKey && <Text style={styles.historyMeta}>Chave: {entry.invoiceKey}</Text>}
                  {isInvoiceDivergent(entry) && (
                    <Text style={styles.historyDivergence}>
                      {getDivergenceText(entry)}
                    </Text>
                  )}
                  {entry.observation && <Text style={styles.historyObservation}>{entry.observation}</Text>}
                </View>
              ))}
            </ScrollView>

            <View style={styles.actionArea}>
              <ActionHeader
                title="Incluir faltante"
                icon="add-circle-outline"
                expanded={expandedAction === "missing"}
                onPress={() => setExpandedAction(expandedAction === "missing" ? null : "missing")}
              />
              {expandedAction === "missing" && (
                <View style={styles.actionBody}>
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
              )}

              <ActionHeader
                title="Solicitar retirada de estoque"
                icon="file-tray-full-outline"
                expanded={expandedAction === "withdraw"}
                onPress={() => setExpandedAction(expandedAction === "withdraw" ? null : "withdraw")}
              />
              {expandedAction === "withdraw" && (
                <View style={styles.actionBody}>
                  <TextInput
                    value={withdrawQuantityInput}
                    onChangeText={setWithdrawQuantityInput}
                    keyboardType="decimal-pad"
                    placeholder="Quantidade para retirada"
                    returnKeyType="next"
                    style={styles.input}
                  />
                  <TextInput
                    value={withdrawObservationInput}
                    onChangeText={setWithdrawObservationInput}
                    placeholder="Observacao da solicitacao"
                    style={[styles.input, styles.textArea]}
                    multiline
                    returnKeyType="done"
                  />
                  <Pressable style={[styles.saveButton, saving && styles.disabledButton]} disabled={saving} onPress={createStockRequest}>
                    <Ionicons name="send-outline" size={18} color="#ffffff" />
                    <Text style={styles.saveButtonText}>Enviar solicitacao</Text>
                  </Pressable>
                </View>
              )}
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

function ActionHeader({
  title,
  icon,
  expanded,
  onPress
}: {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  expanded: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.actionHeader} onPress={onPress}>
      <View style={styles.actionHeaderTitle}>
        <Ionicons name={icon} size={20} color="#0f766e" />
        <Text style={styles.actionHeaderText}>{title}</Text>
      </View>
      <Ionicons name={expanded ? "chevron-up-outline" : "chevron-down-outline"} size={20} color="#0f766e" />
    </Pressable>
  );
}

function getEntryLabel(entry: StockEntry) {
  if (entry.type === "missing_delivered" || entry.source === "faltante_entregue") {
    return "Faltante entregue";
  }

  if (entry.type === "stock_withdraw_requested") {
    return "Retirada solicitada";
  }

  if (entry.type === "stock_withdraw_approved") {
    return "Retirada aprovada";
  }

  if (entry.type === "stock_withdraw_rejected") {
    return "Retirada reprovada";
  }

  if (isInvoiceDivergent(entry)) {
    return "Entrada divergente";
  }

  return "Entrada da nota";
}

function isWithdrawalApproved(entry: StockEntry) {
  return entry.type === "stock_withdraw_approved";
}

function isInvoiceDivergent(entry: StockEntry) {
  return entry.type === "invoice_entry" && Number(entry.divergenceQuantity || 0) !== 0;
}

function getEntryQuantity(entry: StockEntry) {
  if (isWithdrawalApproved(entry)) {
    return `-${entry.quantity}`;
  }

  if (entry.type === "stock_withdraw_requested" || entry.type === "stock_withdraw_rejected") {
    return `${entry.quantity}`;
  }

  return `+${entry.quantity}`;
}

function getEntryQuantityStyle(entry: StockEntry) {
  if (isWithdrawalApproved(entry)) {
    return styles.historyQuantityOut;
  }

  if (isInvoiceDivergent(entry)) {
    return Number(entry.divergenceQuantity) < 0
      ? styles.historyQuantityDivergentMissing
      : styles.historyQuantityDivergentExtra;
  }

  return undefined;
}

function getDivergenceText(entry: StockEntry) {
  const invoiceQuantity = entry.invoiceQuantity ?? entry.quantity;
  const countedQuantity = entry.countedQuantity ?? entry.quantity;
  const divergenceQuantity = entry.divergenceQuantity ?? countedQuantity - invoiceQuantity;
  const absoluteDivergence = Math.abs(divergenceQuantity);

  if (divergenceQuantity < 0) {
    return `Faltante: ${formatQuantity(absoluteDivergence)} | NF: ${formatQuantity(invoiceQuantity)} | Entrou: ${formatQuantity(countedQuantity)}`;
  }

  return `Sobra: ${formatQuantity(absoluteDivergence)} | NF: ${formatQuantity(invoiceQuantity)} | Entrou: ${formatQuantity(countedQuantity)}`;
}

function formatQuantity(value: number) {
  return Number.isInteger(value) ? String(value) : String(value).replace(".", ",");
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
  historyItemDivergent: {
    borderColor: "#f59e0b",
    backgroundColor: "#fffbeb"
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
  historyQuantityOut: {
    color: "#991b1b"
  },
  historyQuantityDivergentMissing: {
    color: "#b45309"
  },
  historyQuantityDivergentExtra: {
    color: "#0f766e"
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
  historyDivergence: {
    marginTop: 8,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: "#92400e",
    backgroundColor: "#fef3c7",
    fontSize: 13,
    fontWeight: "900"
  },
  actionArea: {
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    paddingTop: 12
  },
  actionHeader: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: "#d8dee9",
    borderRadius: 8,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    backgroundColor: "#f8fafc"
  },
  actionHeaderTitle: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  actionHeaderText: {
    flex: 1,
    color: "#1f2937",
    fontSize: 14,
    fontWeight: "900"
  },
  actionBody: {
    gap: 8
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
