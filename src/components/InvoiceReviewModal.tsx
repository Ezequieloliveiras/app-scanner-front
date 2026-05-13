import { Ionicons } from "@expo/vector-icons";
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { styles } from "../styles/appStyles";
import { EditableInvoiceProduct } from "../types/app";
import { InvoiceResult } from "../types/product";

type InvoiceReviewModalProps = {
  visible: boolean;
  pendingInvoice: InvoiceResult | null;
  pendingProducts: EditableInvoiceProduct[];
  editingProductIndex: number | null;
  loading: boolean;
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
  onUpdateProduct,
  onEditProduct,
  onCloseEdit,
  onCommit,
  onClose,
  onBackToScan
}: InvoiceReviewModalProps) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 16 : 0}
      >
        <View style={styles.invoiceReviewModal}>
          <View style={styles.modalHeader}>
            <View style={styles.modalTitleArea}>
              <Text style={styles.modalTitle}>Produtos lidos</Text>
              <Text style={styles.modalSubtitle}>Ajuste quantidades antes de enviar ao estoque.</Text>
            </View>
            <Pressable style={styles.headerIconButton} onPress={onClose}>
              <Ionicons name="close-outline" size={24} color="#1f2937" />
            </Pressable>
          </View>

          {pendingInvoice?.invoiceKey && <Text style={styles.invoiceKey}>Chave: {pendingInvoice.invoiceKey}</Text>}

          <ScrollView
            style={styles.invoiceReviewList}
            contentContainerStyle={styles.pendingSection}
            keyboardShouldPersistTaps="always"
            keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
          >
            {pendingProducts.map((product, index) => {
              const isEditing = editingProductIndex === index;

              return (
                <View key={`${product.ean}-${index}`} style={styles.pendingCard}>
                  <View style={styles.pendingTopRow}>
                    <Pressable
                      style={styles.pendingTitleArea}
                      accessibilityRole="button"
                      accessibilityLabel={`${isEditing ? "Fechar" : "Editar"} observacao de ${product.name}`}
                      onPress={() => (isEditing ? onCloseEdit() : onEditProduct(index))}
                    >
                      <Text style={styles.pendingName}>{product.name}</Text>
                      <Text style={styles.eanBadge}>{product.ean}</Text>
                    </Pressable>
                    <Pressable
                      style={[styles.editButton, isEditing && styles.editButtonActive]}
                      hitSlop={16}
                      accessibilityRole="button"
                      accessibilityLabel={`${isEditing ? "Fechar" : "Editar"} observacao de ${product.name}`}
                      onPress={() => (isEditing ? onCloseEdit() : onEditProduct(index))}
                    >
                      <Ionicons name={isEditing ? "checkmark-outline" : "pencil-outline"} size={20} color="#0f766e" />
                    </Pressable>
                  </View>

                  <Text style={styles.fieldLabel}>Quantidade que entrou</Text>
                  <TextInput
                    value={product.quantityInput}
                    onChangeText={(value) => onUpdateProduct(index, { quantityInput: value })}
                    keyboardType="decimal-pad"
                    returnKeyType="done"
                    style={styles.quantityInput}
                    placeholder="0"
                  />

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

                  {!!product.observation?.trim() && !isEditing && (
                    <View style={styles.inlineAlert}>
                      <Ionicons name="alert-circle-outline" size={18} color="#92400e" />
                      <Text style={styles.inlineAlertText}>Este produto tem observação.</Text>
                    </View>
                  )}
                </View>
              );
            })}
          </ScrollView>

          <View style={styles.invoiceReviewActions}>
            <Pressable style={styles.secondaryButton} onPress={onBackToScan}>
              <Ionicons name="camera-outline" size={18} color="#0f766e" />
              <Text style={styles.secondaryButtonText}>Voltar ao scanner</Text>
            </Pressable>
            <Pressable style={[styles.commitButton, loading && styles.disabledButton]} disabled={loading} onPress={onCommit}>
              <Ionicons name="send-outline" size={18} color="#ffffff" />
              <Text style={styles.commitButtonText}>Enviar para o estoque</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
