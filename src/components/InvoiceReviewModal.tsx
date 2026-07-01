import { Ionicons } from "@expo/vector-icons";
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { styles } from "../styles/appStyles";
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
  onClose: () => void;
  onBackToScan: () => void;
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
  onBackToScan
}: InvoiceReviewModalProps) {
  function updateCountedQuantity(index: number, value: number) {
    onUpdateProduct(index, { quantityInput: formatQuantity(Math.max(0, value)) });
  }

  const safeBottom = Math.max(bottomInset, 56);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onBackToScan}
    >
      <KeyboardAvoidingView
        style={styles.invoiceReviewPage}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 16 : 0}
      >
        <View style={[styles.invoiceReviewPageHeader, { paddingTop: topInset }]}>
          <Pressable style={styles.headerIconButton} onPress={onBackToScan}>
            <Ionicons name="arrow-back-outline" size={24} color="#1f2937" />
          </Pressable>
          <View style={styles.modalTitleArea}>
            <Text style={styles.modalTitle}>Produtos lidos</Text>
            <Text style={styles.modalSubtitle}>Confira a contagem antes de enviar.</Text>
          </View>
        </View>

        <ScrollView
          style={styles.invoiceReviewList}
          contentContainerStyle={styles.invoiceReviewPageContent}
          keyboardShouldPersistTaps="always"
          keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
        >
          {pendingInvoice?.invoiceKey && (
            <View style={styles.invoiceKeyArea}>
              <Text style={styles.invoiceKeyLabel}>Chave de acesso</Text>
              <View style={styles.invoiceKeyBox}>
                <Text style={styles.invoiceKeyValue} numberOfLines={1}>
                  {pendingInvoice.invoiceKey}
                </Text>
                <Ionicons name="copy-outline" size={15} color="#64748b" />
              </View>
            </View>
          )}

          {pendingProducts.map((product, index) => {
            const isEditing = editingProductIndex === index;
            const invoiceQuantity = product.quantity;
            const countedQuantity = parseQuantity(product.quantityInput);
            const hasDivergence = countedQuantity > 0 && countedQuantity !== invoiceQuantity;

            return (
              <View key={`${product.ean}-${index}`} style={[styles.invoiceProductCard, hasDivergence && styles.invoiceProductCardDivergent]}>
                <View style={styles.invoiceProductHeaderRow}>
                  <View style={styles.invoiceProductInfo}>
                    <View style={styles.invoiceProductNameRow}>
                      <View style={styles.invoiceProductInlineIcon}>
                        <Ionicons name="cube-outline" size={17} color="#3b82f6" />
                      </View>
                      <Text style={styles.invoiceProductName}>{product.name}</Text>
                    </View>
                    <View style={styles.invoiceProductMetaRow}>
                      <Ionicons name="barcode-outline" size={14} color="#64748b" />
                      <Text style={styles.invoiceProductMeta}>{product.ean}</Text>
                    </View>
                  </View>
                  <Pressable
                    style={[styles.invoiceObservationButton, (isEditing || !!product.observation?.trim()) && styles.invoiceObservationButtonActive]}
                    accessibilityRole="button"
                    accessibilityLabel={`${isEditing ? "Fechar" : "Abrir"} observação de ${product.name}`}
                    onPress={() => (isEditing ? onCloseEdit() : onEditProduct(index))}
                  >
                    <Ionicons
                      name={isEditing ? "close-outline" : "chatbubble-ellipses-outline"}
                      size={19}
                      color={isEditing || !!product.observation?.trim() ? "#ffffff" : "#3b82f6"}
                    />
                  </Pressable>
                </View>

                <View style={styles.invoiceQuantityPanel}>
                  <View style={styles.invoiceQuantitySummary}>
                    <Text style={styles.quantityCompareLabel}>Qtd. NF</Text>
                    <Text style={styles.invoiceQuantityValue}>{formatQuantity(invoiceQuantity)}</Text>
                  </View>
                  <View style={styles.invoiceCountEditor}>
                    <Text style={styles.quantityCompareLabel}>Contagem</Text>
                    <View style={[styles.invoiceCountControls, hasDivergence && styles.invoiceCountControlsDivergent]}>
                      <Pressable
                        style={styles.invoiceQuantityStepButton}
                        onPress={() => updateCountedQuantity(index, countedQuantity - 1)}
                      >
                        <Ionicons name="remove-outline" size={17} color="#475569" />
                      </Pressable>
                      <TextInput
                        value={product.quantityInput}
                        onChangeText={(value) => onUpdateProduct(index, { quantityInput: value })}
                        keyboardType="decimal-pad"
                        style={[styles.invoiceQuantityInput, hasDivergence && styles.quantityCompareInputDivergent]}
                        placeholder="0"
                      />
                      <Pressable
                        style={styles.invoiceQuantityStepButton}
                        onPress={() => updateCountedQuantity(index, countedQuantity + 1)}
                      >
                        <Ionicons name="add-outline" size={17} color="#475569" />
                      </Pressable>
                    </View>
                  </View>
                </View>

                {hasDivergence && (
                  <View style={styles.inlineAlert}>
                    <Ionicons name="alert-circle-outline" size={18} color="#B45309" />
                    <Text style={styles.inlineAlertText}>Divergencia entre a NF e a contagem.</Text>
                  </View>
                )}

                {isEditing && (
                  <View style={styles.inlineEditor}>
                    <Text style={styles.fieldLabel}>Observação da entrada</Text>
                    <TextInput
                      value={product.observation || ""}
                      onChangeText={(value) => onUpdateProduct(index, { observation: value })}
                      style={[styles.quantityInput, styles.inlineObservationInput]}
                      placeholder="Ex: faltaram 2 unidades na entrega"
                      multiline
                      autoFocus
                      textAlignVertical="top"
                    />
                  </View>
                )}

                {!!product.observation?.trim() && !isEditing && !hasDivergence && (
                  <View style={styles.inlineAlert}>
                    <Ionicons name="alert-circle-outline" size={18} color="#B45309" />
                    <Text style={styles.inlineAlertText}>Este produto tem observacao.</Text>
                  </View>
                )}
              </View>
            );
          })}
        </ScrollView>

        <View style={[styles.invoiceReviewFooter, { paddingBottom: safeBottom }]}>
          <Pressable style={[styles.invoiceReviewCommitButton, loading && styles.disabledButton]} disabled={loading} onPress={onCommit}>
            <Ionicons name="send-outline" size={18} color="#ffffff" />
            <Text style={styles.invoiceReviewCommitText}>Enviar ao estoque</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
