import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, FlatList, KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { EditableInvoiceProduct } from "../types/app";
import { InvoiceResult } from "../types/product";
import { formatQuantity, parseQuantity } from "../utils/appHelpers";

type InvoiceReviewModalProps = {
  visible: boolean;
  pendingInvoice: InvoiceResult | null;
  pendingProducts: EditableInvoiceProduct[];
  editingProductIndex: number | null;
  loading: boolean;
  topInset: number;
  bottomInset: number;
  onUpdateProduct: (index: number, changes: Partial<EditableInvoiceProduct>) => void;
  onEditProduct: (index: number) => void;
  onCloseEdit: () => void;
  onCommit: () => void;
  onSaveForLater: () => void;
  onClose: () => void;
  onBackToScan: () => void;
};

const reviewPalette = {
  background: "#f7f9fc",
  white: "#ffffff",
  text: "#020617",
  muted: "#94a3b8",
  label: "#8b9bb0",
  border: "#dce3ee",
  blue: "#2563eb",
  navy: "#1e3a5f",
  green: "#00a83b",
  orange: "#ea580c",
  warningBg: "#fff8e6",
  warningBorder: "#f6c453",
  warningText: "#b45309",
  softControl: "#eef2f7"
};

export function InvoiceReviewModal({
  visible,
  pendingInvoice,
  pendingProducts,
  editingProductIndex,
  loading,
  topInset,
  bottomInset,
  onUpdateProduct,
  onEditProduct,
  onCloseEdit,
  onCommit,
  onSaveForLater,
  onBackToScan
}: InvoiceReviewModalProps) {
  const safeBottom = Math.max(bottomInset, 52);
  const divergentCount = pendingProducts.filter((product) => {
    const countedQuantity = parseQuantity(product.quantityInput);
    return countedQuantity !== product.quantity;
  }).length;

  function updateCountedQuantity(index: number, value: number) {
    onUpdateProduct(index, { quantityInput: formatQuantity(Math.max(0, value)) });
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" onRequestClose={onBackToScan}>
      <KeyboardAvoidingView
        style={reviewStyles.page}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
      >
        <View style={[reviewStyles.header, { paddingTop: topInset + 8 }]}>
          <Pressable accessibilityRole="button" accessibilityLabel="Voltar" style={reviewStyles.backButton} onPress={onBackToScan}>
            <Ionicons name="chevron-back-outline" size={24} color="#0f172a" />
          </Pressable>
          <View style={reviewStyles.headerTitleArea}>
            <Text style={reviewStyles.headerTitle}>Produtos lidos</Text>
            <Text style={reviewStyles.headerSubtitle}>Confira a contagem antes de enviar</Text>
          </View>
          <View style={reviewStyles.headerSpacer} />
        </View>

        <FlatList
          data={pendingProducts}
          keyExtractor={(item, index) => `${item.ean || item.name}-${index}`}
          style={reviewStyles.list}
          contentContainerStyle={[reviewStyles.listContent, { paddingBottom: safeBottom + 86 }]}
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={
            <>
              {!!pendingInvoice?.invoiceKey && (
                <View style={reviewStyles.invoiceKeyCard}>
                  <Text style={reviewStyles.invoiceKeyLabel}>Chave de acesso</Text>
                  <Text style={reviewStyles.invoiceKeyValue}>{pendingInvoice.invoiceKey}</Text>
                </View>
              )}

              {divergentCount > 0 && (
                <View style={reviewStyles.warningCard}>
                  <Ionicons name="warning-outline" size={15} color={reviewPalette.warningText} />
                  <Text style={reviewStyles.warningText}>
                    {divergentCount} {divergentCount === 1 ? "divergência" : "divergências"} entre a NF e a contagem
                  </Text>
                </View>
              )}
            </>
          }
          renderItem={({ item, index }) => (
            <ProductReviewCard
              product={item}
              index={index}
              observationOpen={editingProductIndex === index}
              onChangeQuantity={(value) => onUpdateProduct(index, { quantityInput: value })}
              onChangeObservation={(value) => onUpdateProduct(index, { observation: value })}
              onDecrease={() => updateCountedQuantity(index, parseQuantity(item.quantityInput) - 1)}
              onIncrease={() => updateCountedQuantity(index, parseQuantity(item.quantityInput) + 1)}
              onToggleObservation={() => {
                if (editingProductIndex === index) {
                  onCloseEdit();
                  return;
                }

                onEditProduct(index);
              }}
            />
          )}
        />

        <View style={[reviewStyles.footer, { paddingBottom: safeBottom }]}>
          <Pressable
            style={({ pressed }) => [
              reviewStyles.saveLaterButton,
              pressed && !loading && reviewStyles.commitButtonPressed,
              loading && reviewStyles.disabledButton
            ]}
            disabled={loading}
            onPress={onSaveForLater}
          >
            <Ionicons name="time-outline" size={18} color={reviewPalette.blue} />
            <Text style={reviewStyles.saveLaterButtonText}>Conferir depois</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [reviewStyles.commitButton, pressed && !loading && reviewStyles.commitButtonPressed, loading && reviewStyles.disabledButton]}
            disabled={loading}
            onPress={onCommit}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <>
                <Ionicons name="paper-plane-outline" size={18} color="#ffffff" />
                <Text style={reviewStyles.commitButtonText}>Enviar ao estoque</Text>
              </>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function ProductReviewCard({
  product,
  index,
  observationOpen,
  onChangeQuantity,
  onChangeObservation,
  onDecrease,
  onIncrease,
  onToggleObservation
}: {
  product: EditableInvoiceProduct;
  index: number;
  observationOpen: boolean;
  onChangeQuantity: (value: string) => void;
  onChangeObservation: (value: string) => void;
  onDecrease: () => void;
  onIncrease: () => void;
  onToggleObservation: () => void;
}) {
  const invoiceQuantity = product.quantity;
  const countedQuantity = parseQuantity(product.quantityInput);
  const hasDivergence = countedQuantity !== invoiceQuantity;
  const hasObservation = Boolean(product.observation?.trim());
  const divergenceText = countedQuantity > invoiceQuantity ? "Sobra" : "Falta";
  const countColorStyle = hasDivergence ? reviewStyles.countValueDivergent : reviewStyles.countValueOk;

  return (
    <View style={reviewStyles.productCard}>
      <View style={reviewStyles.productTopRow}>
        <View style={reviewStyles.productTitleArea}>
          <Text style={reviewStyles.productName} numberOfLines={2}>
            {product.name}
          </Text>
          <Text style={reviewStyles.productCode} numberOfLines={1}>
            {product.ean}
          </Text>
        </View>
        {hasDivergence && (
          <View style={reviewStyles.divergenceActions}>
            <Text style={reviewStyles.divergenceBadge}>{divergenceText}</Text>
            <Pressable
              style={[
                reviewStyles.observationIconButton,
                (observationOpen || hasObservation) && reviewStyles.observationIconButtonActive
              ]}
              onPress={onToggleObservation}
              accessibilityRole="button"
              accessibilityLabel={`Adicionar observacao para ${product.name}`}
            >
              <Ionicons
                name={hasObservation ? "chatbox-ellipses" : "chatbox-ellipses-outline"}
                size={17}
                color={observationOpen || hasObservation ? reviewPalette.blue : "#64748b"}
              />
            </Pressable>
          </View>
        )}
      </View>

      <View style={reviewStyles.quantityRow}>
        <View style={reviewStyles.quantityGroup}>
          <View style={reviewStyles.quantityBlock}>
            <Text style={reviewStyles.quantityLabel}>Qtd. NF</Text>
            <Text style={reviewStyles.invoiceValue}>{formatQuantity(invoiceQuantity)}</Text>
          </View>
          <View style={reviewStyles.quantityBlock}>
            <Text style={reviewStyles.quantityLabel}>Contagem</Text>
            <Text style={[reviewStyles.countValue, countColorStyle]}>{formatQuantity(countedQuantity)}</Text>
          </View>
        </View>

        <View style={reviewStyles.stepper}>
          <Pressable accessibilityRole="button" accessibilityLabel={`Diminuir contagem de ${product.name}`} style={reviewStyles.stepButton} onPress={onDecrease}>
            <Ionicons name="remove-outline" size={19} color="#475569" />
          </Pressable>
          <TextInput
            value={product.quantityInput}
            onChangeText={onChangeQuantity}
            keyboardType="decimal-pad"
            style={reviewStyles.stepInput}
            placeholder="0"
            selectTextOnFocus
          />
          <Pressable accessibilityRole="button" accessibilityLabel={`Aumentar contagem de ${product.name}`} style={reviewStyles.addButton} onPress={onIncrease}>
            <Ionicons name="add-outline" size={22} color="#ffffff" />
          </Pressable>
        </View>
      </View>

      {hasDivergence && observationOpen && (
        <View style={reviewStyles.observationBox}>
          <View style={reviewStyles.observationHeader}>
            <Ionicons name="create-outline" size={15} color={reviewPalette.blue} />
            <Text style={reviewStyles.observationTitle}>Observacao da entrada</Text>
          </View>
          <TextInput
            value={product.observation || ""}
            onChangeText={onChangeObservation}
            placeholder={countedQuantity > invoiceQuantity ? "Ex: vieram unidades a mais na entrega" : "Ex: faltaram unidades na entrega"}
            placeholderTextColor="#94a3b8"
            multiline
            style={reviewStyles.observationInput}
            accessibilityLabel={`Observacao da entrada de ${product.name}`}
          />
        </View>
      )}
    </View>
  );
}

const reviewStyles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: reviewPalette.background
  },
  header: {
    minHeight: 74,
    paddingHorizontal: 12,
    paddingBottom: 8,
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: reviewPalette.white
  },
  backButton: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center"
  },
  headerTitleArea: {
    flex: 1,
    alignItems: "center",
    paddingRight: 32
  },
  headerTitle: {
    color: reviewPalette.text,
    fontSize: 16,
    lineHeight: 20,
    fontWeight: "900",
    textAlign: "center"
  },
  headerSubtitle: {
    marginTop: 2,
    color: reviewPalette.muted,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "600",
    textAlign: "center"
  },
  headerSpacer: {
    width: 0
  },
  list: {
    flex: 1,
    backgroundColor: reviewPalette.background
  },
  listContent: {
    paddingHorizontal: 12,
    paddingTop: 10,
    gap: 12
  },
  invoiceKeyCard: {
    minHeight: 42,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#f0f4f9"
  },
  invoiceKeyLabel: {
    color: reviewPalette.label,
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "700"
  },
  invoiceKeyValue: {
    marginTop: 1,
    color: "#334155",
    fontSize: 9,
    lineHeight: 12,
    fontWeight: "700"
  },
  warningCard: {
    minHeight: 32,
    marginTop: 9,
    borderWidth: 1,
    borderColor: reviewPalette.warningBorder,
    borderRadius: 9,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: reviewPalette.warningBg
  },
  warningText: {
    flex: 1,
    color: reviewPalette.warningText,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "700"
  },
  productCard: {
    minHeight: 110,
    borderWidth: 1,
    borderColor: reviewPalette.border,
    borderRadius: 11,
    paddingHorizontal: 15,
    paddingTop: 14,
    paddingBottom: 12,
    backgroundColor: reviewPalette.white,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.055,
    shadowRadius: 10,
    elevation: 2
  },
  productTopRow: {
    minHeight: 38,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10
  },
  productTitleArea: {
    flex: 1,
    minWidth: 0
  },
  productName: {
    color: reviewPalette.text,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "900"
  },
  productCode: {
    marginTop: 3,
    color: reviewPalette.muted,
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "700"
  },
  divergenceBadge: {
    borderRadius: 9,
    paddingHorizontal: 9,
    paddingVertical: 4,
    overflow: "hidden",
    color: reviewPalette.orange,
    backgroundColor: "#fff1c7",
    fontSize: 10,
    lineHeight: 12,
    fontWeight: "800"
  },
  divergenceActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7
  },
  observationIconButton: {
    width: 32,
    height: 32,
    borderWidth: 1,
    borderColor: reviewPalette.border,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: reviewPalette.white
  },
  observationIconButtonActive: {
    borderColor: "#bfdbfe",
    backgroundColor: "#eff6ff"
  },
  quantityRow: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 12
  },
  quantityGroup: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 22
  },
  quantityBlock: {
    minWidth: 38
  },
  quantityLabel: {
    color: reviewPalette.label,
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "700"
  },
  invoiceValue: {
    marginTop: 5,
    color: reviewPalette.navy,
    fontSize: 19,
    lineHeight: 23,
    fontWeight: "900"
  },
  countValue: {
    marginTop: 5,
    fontSize: 19,
    lineHeight: 23,
    fontWeight: "900"
  },
  countValueOk: {
    color: reviewPalette.green
  },
  countValueDivergent: {
    color: reviewPalette.orange
  },
  stepper: {
    minWidth: 111,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 10
  },
  stepButton: {
    width: 33,
    height: 33,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: reviewPalette.softControl
  },
  stepInput: {
    width: 32,
    minHeight: 34,
    padding: 0,
    color: reviewPalette.text,
    fontSize: 16,
    lineHeight: 20,
    fontWeight: "900",
    textAlign: "center"
  },
  addButton: {
    width: 33,
    height: 33,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: reviewPalette.blue
  },
  observationBox: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#bfdbfe",
    borderRadius: 11,
    padding: 10,
    backgroundColor: "#f8fbff"
  },
  observationHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8
  },
  observationTitle: {
    color: reviewPalette.text,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "900"
  },
  observationInput: {
    minHeight: 76,
    borderWidth: 1,
    borderColor: reviewPalette.border,
    borderRadius: 10,
    paddingHorizontal: 11,
    paddingTop: 9,
    paddingBottom: 9,
    color: reviewPalette.text,
    backgroundColor: reviewPalette.white,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600",
    textAlignVertical: "top"
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: "#edf2f7",
    paddingHorizontal: 12,
    paddingTop: 10,
    gap: 8,
    backgroundColor: reviewPalette.background
  },
  saveLaterButton: {
    minHeight: 42,
    borderWidth: 1,
    borderColor: "#bfdbfe",
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#eff6ff"
  },
  saveLaterButtonText: {
    color: reviewPalette.blue,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "900"
  },
  commitButton: {
    minHeight: 44,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: reviewPalette.blue,
    shadowColor: reviewPalette.blue,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 3
  },
  commitButtonPressed: {
    opacity: 0.88,
    transform: [{ translateY: 1 }]
  },
  disabledButton: {
    opacity: 0.68
  },
  commitButtonText: {
    color: reviewPalette.white,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "900"
  }
});
