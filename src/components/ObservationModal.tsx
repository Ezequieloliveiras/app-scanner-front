import { Ionicons } from "@expo/vector-icons";
import { Modal, Pressable, Text, TextInput, View } from "react-native";
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
      <View style={styles.modalOverlay}>
        <View style={styles.observationModal}>
          <View style={styles.modalHeader}>
            <View style={styles.modalTitleArea}>
              <Text style={styles.modalTitle}>Observacao</Text>
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
          />
          {!!product?.observation?.trim() && (
            <View style={styles.inlineAlert}>
              <Ionicons name="alert-circle-outline" size={18} color="#92400e" />
              <Text style={styles.inlineAlertText}>Essa observacao sera vinculada a entrada deste produto.</Text>
            </View>
          )}
          <Pressable style={styles.primaryButton} onPress={onClose}>
            <Ionicons name="checkmark-outline" size={18} color="#ffffff" />
            <Text style={styles.primaryButtonText}>Salvar observacao</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
