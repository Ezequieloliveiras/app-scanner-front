import { Ionicons } from "@expo/vector-icons";
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { styles } from "../styles/appStyles";
import { EditableInvoiceProduct } from "../types/app";
import { InvoiceResult } from "../types/product";

type InvoiceReviewModalProps = {
  visible: boolean;
  pendingInvoice: InvoiceResult | null;
  pendingProducts: EditableInvoiceProduct[];
  loading: boolean;
  onUpdateProduct: (index: number, changes: Partial<EditableInvoiceProduct>) => void;
  onEditProduct: (index: number) => void;
  onCommit: () => void;
  onClose: () => void;
  onBackToScan: () => void;
};

export function InvoiceReviewModal({
  visible,
  pendingInvoice,
  pendingProducts,
  loading,
  onUpdateProduct,
  onEditProduct,
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
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
          >
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
                  returnKeyType="done"
                  style={styles.quantityInput}
                  placeholder="0"
                />

                {!!product.observation?.trim() && (
                  <View style={styles.inlineAlert}>
                    <Ionicons name="alert-circle-outline" size={18} color="#92400e" />
                    <Text style={styles.inlineAlertText}>Este produto tem observação.</Text>
                  </View>
                )}
              </View>
            ))}
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
