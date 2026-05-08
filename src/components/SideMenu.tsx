import { Ionicons } from "@expo/vector-icons";
import { Modal, Pressable, Text, View } from "react-native";
import { styles } from "../styles/appStyles";
import { MenuItem } from "./MenuItem";
export function SideMenu({
  visible,
  onClose,
  onHome,
  onScan,
  onProducts,
  onBranches,
  onSimulate,
  topInset
}: {
  visible: boolean;
  onClose: () => void;
  onHome: () => void;
  onScan: () => void;
  onProducts: () => void;
  onBranches: () => void;
  onSimulate: () => void;
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
          <MenuItem icon="home-outline" label="Home" onPress={onHome} />
          <MenuItem icon="camera-outline" label="Scannear" onPress={onScan} />
          <MenuItem icon="cube-outline" label="Ver produtos" onPress={onProducts} />
          <MenuItem icon="git-compare-outline" label="Filial" onPress={onBranches} />
          <MenuItem icon="document-text-outline" label="Siimular XML" onPress={onSimulate} />
        </View>
      </View>
    </Modal>
  );
}
