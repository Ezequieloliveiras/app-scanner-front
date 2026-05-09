import { Ionicons } from "@expo/vector-icons";
import { Pressable, ScrollView, Text, View } from "react-native";
import { styles } from "../styles/appStyles";
import { StockRequest, StockRequestStatus } from "../types/product";

type Props = {
  requests: StockRequest[];
  loading: boolean;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
};

export function StockRequestsScreen({ requests, loading, onApprove, onReject }: Props) {
  const pendingRequests = requests.filter((request) => request.status === "pending");
  const reviewedRequests = requests.filter((request) => request.status !== "pending");

  return (
    <ScrollView style={styles.content} contentContainerStyle={styles.contentInner}>
      <View style={styles.pendingHeader}>
        <View>
          <Text style={styles.sectionTitle}>Solicitações</Text>
          <Text style={styles.sectionSubtitle}>{pendingRequests.length} retirada(s) aguardando analise.</Text>
        </View>
        {pendingRequests.length > 0 && <Text style={styles.pendingCount}>{pendingRequests.length}</Text>}
      </View>

      {requests.length === 0 ? (
        <Text style={styles.mutedText}>Nenhuma solicitacao de estoque encontrada.</Text>
      ) : (
        <>
          <View style={styles.pendingSection}>
            <Text style={styles.fieldLabel}>Pendentes</Text>
            {pendingRequests.length === 0 ? (
              <Text style={styles.mutedText}>Nenhuma solicitacao pendente.</Text>
            ) : (
              pendingRequests.map((request) => (
                <StockRequestCard
                  key={request._id}
                  request={request}
                  loading={loading}
                  onApprove={onApprove}
                  onReject={onReject}
                />
              ))
            )}
          </View>

          {reviewedRequests.length > 0 && (
            <View style={styles.pendingSection}>
              <Text style={styles.fieldLabel}>Historico</Text>
              {reviewedRequests.map((request) => (
                <StockRequestCard
                  key={request._id}
                  request={request}
                  loading={loading}
                  onApprove={onApprove}
                  onReject={onReject}
                />
              ))}
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
}

function StockRequestCard({
  request,
  loading,
  onApprove,
  onReject
}: {
  request: StockRequest;
  loading: boolean;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}) {
  const pending = request.status === "pending";

  return (
    <View style={styles.stockRequestCard}>
      <View style={styles.pendingTopRow}>
        <View style={styles.pendingTitleArea}>
          <Text style={styles.branchProductName}>{request.productName}</Text>
          <Text style={styles.branchProductMeta}>
            {request.requesterName} solicitou {request.quantity} unidade(s).
          </Text>
          <Text style={styles.branchProductMeta}>EAN: {request.ean}</Text>
        </View>
        <Text style={[styles.stockRequestStatus, getStatusStyle(request.status)]}>{getStatusLabel(request.status)}</Text>
      </View>

      {request.observation && <Text style={styles.stockRequestObservation}>{request.observation}</Text>}
      {request.reviewerName && (
        <Text style={styles.branchProductMeta}>
          Analisado por {request.reviewerName}
          {request.reviewedAt ? ` em ${formatDate(request.reviewedAt)}` : ""}
        </Text>
      )}
      {request.reviewObservation && <Text style={styles.branchProductMeta}>{request.reviewObservation}</Text>}

      {pending && (
        <View style={styles.notificationActions}>
          <Pressable
            style={[styles.notificationActionButton, loading && styles.disabledButton]}
            disabled={loading}
            onPress={() => onApprove(request._id)}
          >
            <Ionicons name="checkmark-circle-outline" size={18} color="#ffffff" />
            <Text style={styles.notificationActionText}>Aceitar</Text>
          </Pressable>
          <Pressable
            style={[styles.notificationRejectButton, loading && styles.disabledButton]}
            disabled={loading}
            onPress={() => onReject(request._id)}
          >
            <Ionicons name="close-circle-outline" size={18} color="#991b1b" />
            <Text style={styles.notificationRejectText}>Recusar</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

function getStatusLabel(status: StockRequestStatus) {
  if (status === "approved") return "Aceita";
  if (status === "rejected") return "Recusada";
  return "Pendente";
}

function getStatusStyle(status: StockRequestStatus) {
  if (status === "approved") return styles.stockRequestApproved;
  if (status === "rejected") return styles.stockRequestRejected;
  return styles.stockRequestPending;
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "sem horario";
  }

  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}
