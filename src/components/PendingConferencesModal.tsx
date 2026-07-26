import { Ionicons } from "@expo/vector-icons";
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { PendingConference } from "../types/product";

type Props = {
  visible: boolean;
  conferences: PendingConference[];
  topInset: number;
  bottomInset: number;
  onClose: () => void;
  onResume: (conference: PendingConference) => void;
  onDelete: (conference: PendingConference) => void;
};

export function PendingConferencesModal({
  visible,
  conferences,
  topInset,
  bottomInset,
  onClose,
  onResume,
  onDelete
}: Props) {
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" onRequestClose={onClose}>
      <View style={pendingStyles.page}>
        <View style={[pendingStyles.header, { paddingTop: topInset + 8 }]}>
          <Pressable accessibilityRole="button" accessibilityLabel="Fechar" style={pendingStyles.iconButton} onPress={onClose}>
            <Ionicons name="chevron-back-outline" size={24} color="#0f172a" />
          </Pressable>
          <View style={pendingStyles.headerTitleArea}>
            <Text style={pendingStyles.headerTitle}>Conferencias pendentes</Text>
            <Text style={pendingStyles.headerSubtitle}>Retome uma nota salva para conferir depois</Text>
          </View>
          <View style={pendingStyles.headerSpacer} />
        </View>

        <FlatList
          data={conferences}
          keyExtractor={(conference) => conference._id}
          contentContainerStyle={[pendingStyles.listContent, { paddingBottom: Math.max(bottomInset, 18) + 18 }]}
          ListEmptyComponent={
            <View style={pendingStyles.emptyCard}>
              <Ionicons name="checkmark-circle-outline" size={26} color="#16a34a" />
              <Text style={pendingStyles.emptyTitle}>Nada pendente</Text>
              <Text style={pendingStyles.emptyText}>Quando salvar uma conferência para depois, ela aparece aqui.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <Pressable style={({ pressed }) => [pendingStyles.card, pressed && pendingStyles.cardPressed]} onPress={() => onResume(item)}>
              <View style={pendingStyles.cardIcon}>
                <Ionicons name="receipt-outline" size={20} color="#2563eb" />
              </View>
              <View style={pendingStyles.cardTextArea}>
                <Text style={pendingStyles.supplierName} numberOfLines={2}>
                  {item.invoice.source || "Fornecedor nao informado"}
                </Text>
                <Text style={pendingStyles.cardMeta}>
                  {item.products.length} {item.products.length === 1 ? "produto" : "produtos"} · {formatPendingDate(item.updatedAt || item.createdAt)}
                </Text>
                {!!item.invoice.invoiceKey && (
                  <Text style={pendingStyles.invoiceKey} numberOfLines={1}>
                    Chave: {item.invoice.invoiceKey}
                  </Text>
                )}
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Excluir conferencia de ${item.invoice.source || "fornecedor"}`}
                style={pendingStyles.deleteButton}
                onPress={() => onDelete(item)}
              >
                <Ionicons name="trash-outline" size={18} color="#ef4444" />
              </Pressable>
            </Pressable>
          )}
        />
      </View>
    </Modal>
  );
}

function formatPendingDate(value?: string) {
  if (!value) return "sem data";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "sem data";

  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

const pendingStyles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#f7f9fc"
  },
  header: {
    minHeight: 74,
    paddingHorizontal: 12,
    paddingBottom: 8,
    flexDirection: "row",
    alignItems: "flex-start",
    borderBottomWidth: 1,
    borderBottomColor: "#e5edf7",
    backgroundColor: "#ffffff"
  },
  iconButton: {
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
    color: "#020617",
    fontSize: 16,
    lineHeight: 20,
    fontWeight: "900",
    textAlign: "center"
  },
  headerSubtitle: {
    marginTop: 2,
    color: "#64748b",
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "700",
    textAlign: "center"
  },
  headerSpacer: {
    width: 0
  },
  listContent: {
    padding: 12,
    gap: 10
  },
  card: {
    minHeight: 88,
    borderWidth: 1,
    borderColor: "#dce3ee",
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    backgroundColor: "#ffffff"
  },
  cardPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.99 }]
  },
  cardIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#eef4ff"
  },
  cardTextArea: {
    flex: 1,
    minWidth: 0
  },
  supplierName: {
    color: "#020617",
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "900"
  },
  cardMeta: {
    marginTop: 4,
    color: "#64748b",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "700"
  },
  invoiceKey: {
    marginTop: 4,
    color: "#94a3b8",
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "700"
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff1f2"
  },
  emptyCard: {
    minHeight: 170,
    borderWidth: 1,
    borderColor: "#dce3ee",
    borderRadius: 14,
    padding: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff"
  },
  emptyTitle: {
    marginTop: 8,
    color: "#020617",
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "900"
  },
  emptyText: {
    marginTop: 4,
    maxWidth: 240,
    color: "#64748b",
    fontSize: 13,
    lineHeight: 18,
    textAlign: "center",
    fontWeight: "600"
  }
});
