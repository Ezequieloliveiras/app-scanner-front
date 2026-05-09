import { Ionicons } from "@expo/vector-icons";
import { ReactNode } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { styles } from "../styles/appStyles";
export function SelectorModal({
  visible,
  title,
  children,
  onClose
}: {
  visible: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.selectorModal}>
          <View style={styles.modalHeader}>
            <View style={styles.modalTitleArea}>
              <Text style={styles.modalTitle}>{title}</Text>
              <Text style={styles.modalSubtitle}>Toque em uma opção para selecionar.</Text>
            </View>
            <Pressable style={styles.headerIconButton} onPress={onClose}>
              <Ionicons name="close-outline" size={24} color="#1f2937" />
            </Pressable>
          </View>
          <ScrollView style={styles.selectorList} contentContainerStyle={styles.selectorListInner}>
            {children}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
