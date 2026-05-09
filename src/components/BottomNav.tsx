import { View } from "react-native";
import { styles } from "../styles/appStyles";
import { AuthUser, Screen } from "../types/app";
import { canAccessModule } from "../utils/appHelpers";
import { BottomNavItem } from "./BottomNavItem";
export function BottomNav({
  activeScreen,
  bottomInset,
  user,
  onHome,
  onScan,
  onProducts
}: {
  activeScreen: Screen;
  bottomInset: number;
  user: AuthUser;
  onHome: () => void;
  onScan: () => void;
  onProducts: () => void;
}) {
  return (
    <View style={[styles.bottomNav, { paddingBottom: Math.max(bottomInset, 10) }]}>
      <BottomNavItem icon="home-outline" label="Início" active={activeScreen === "home"} onPress={onHome} />
      {canAccessModule(user, "scan") && (
        <BottomNavItem icon="camera-outline" label="Câmera" active={activeScreen === "scan"} onPress={onScan} />
      )}
      {canAccessModule(user, "products") && (
        <BottomNavItem icon="cube-outline" label="Produtos" active={activeScreen === "products"} onPress={onProducts} />
      )}
    </View>
  );
}
