import { Ionicons } from "@expo/vector-icons";
import { KeyboardAvoidingView, Modal, Platform, Pressable, Text, TextInput, View } from "react-native";
import { styles } from "../styles/appStyles";
import { EditableInvoiceProduct } from "../types/app";
export function ObservationModal({
  visible,
  product,
  onClose,
  onChange
}: {
  visible: boolean;
  product: EditableInvoiceProduct | null;
  onClose: () => void;
  onChange: (observation: string) => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 16 : 0}
      >
        <View style={styles.observationModal}>
          <View style={styles.modalHeader}>
            <View style={styles.modalTitleArea}>
              <Text style={styles.modalTitle}>Observação</Text>
              <Text style={styles.modalSubtitle}>{product?.name}</Text>
            </View>
            <Pressable style={styles.headerIconButton} onPress={onClose}>
              <Ionicons name="close-outline" size={24} color="#1f2937" />
            </Pressable>
          </View>
          <TextInput
            value={product?.observation || ""}
            onChangeText={onChange}
            style={styles.observationInput}
            placeholder="Ex: faltaram 2 unidades na entrega"
            multiline
            autoFocus
            returnKeyType="done"
          />
          {!!product?.observation?.trim() && (
            <View style={styles.inlineAlert}>
              <Ionicons name="alert-circle-outline" size={18} color="#92400e" />
              <Text style={styles.inlineAlertText}>Essa observação será vinculada à entrada deste produto.</Text>
            </View>
          )}
          <Pressable style={styles.primaryButton} onPress={onClose}>
            <Ionicons name="checkmark-outline" size={18} color="#ffffff" />
            <Text style={styles.primaryButtonText}>Salvar observação</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
