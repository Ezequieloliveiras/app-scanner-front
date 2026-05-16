import { Ionicons } from "@expo/vector-icons";
import { Modal, Pressable, Text, View } from "react-native";
import { styles } from "../styles/appStyles";
import { AuthUser } from "../types/app";
import { canAccessModule, canManageAccess, canManageCertificate } from "../utils/appHelpers";
import { MenuItem } from "./MenuItem";
export function SideMenu({
  visible,
  user,
  onClose,
  onHome,
  onDashboard,
  onScan,
  onProducts,
  onBranches,
  onStockRequests,
  onBilling,
  onCertificate,
  onProfile,
  onAccess,
  onLogout,
  onSimulate,
  hasPendingStockRequests = false,
  topInset
}: {
  visible: boolean;
  user: AuthUser;
  onClose: () => void;
  onHome: () => void;
  onDashboard: () => void;
  onScan: () => void;
  onProducts: () => void;
  onBranches: () => void;
  onStockRequests: () => void;
  onBilling: () => void;
  onCertificate: () => void;
  onProfile: () => void;
  onAccess: () => void;
  onLogout: () => void;
  onSimulate: () => void;
  hasPendingStockRequests?: boolean;
  topInset: number;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.menuOverlay}>
        <Pressable style={styles.menuBackdrop} onPress={onClose} />
        <View style={[styles.sideMenu, { paddingTop: topInset + 18 }]}>
          <View style={styles.sideMenuHeader}>
            <Text style={styles.sideMenuTitle}>Menu</Text>
            <Pressable style={styles.headerIconButton} onPress={onClose}>
              <Ionicons name="close-outline" size={24} color="#1f2937" />
            </Pressable>
          </View>
          <MenuItem icon="home-outline" label="Início" onPress={onHome} />
          {canAccessModule(user, "dashboard") && <MenuItem icon="analytics-outline" label="Dashboard" onPress={onDashboard} />}
          <MenuItem icon="person-circle-outline" label="Perfil" onPress={onProfile} />
          <MenuItem icon="card-outline" label="Planos" onPress={onBilling} />
          {canAccessModule(user, "scan") && <MenuItem icon="camera-outline" label="Escanear" onPress={onScan} />}
          {canAccessModule(user, "products") && <MenuItem icon="cube-outline" label="Ver produtos" onPress={onProducts} />}
          {canAccessModule(user, "branches") && <MenuItem icon="git-compare-outline" label="Filial" onPress={onBranches} />}
          {canAccessModule(user, "stock_requests") && (
            <MenuItem
              icon="file-tray-full-outline"
              label="Solicitações"
              hasBadge={hasPendingStockRequests}
              onPress={onStockRequests}
            />
          )}
          {canManageAccess(user) && <MenuItem icon="people-outline" label="Gerenciar acessos" onPress={onAccess} />}
          {canManageCertificate(user) && <MenuItem icon="shield-checkmark-outline" label="Certificado" onPress={onCertificate} />}
          {/* {canAccessModule(user, "scan") && <MenuItem icon="document-text-outline" label="Simular XML" onPress={onSimulate} />} */}
          <MenuItem icon="log-out-outline" label="Sair" onPress={onLogout} />
        </View>
      </View>
    </Modal>
  );
}
