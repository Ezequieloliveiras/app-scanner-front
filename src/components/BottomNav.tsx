import { View } from "react-native";
import { styles } from "../styles/appStyles";
import { Screen } from "../types/app";
import { BottomNavItem } from "./BottomNavItem";
export function BottomNav({
  activeScreen,
  bottomInset,
  onHome,
  onScan,
  onProducts
}: {
  activeScreen: Screen;
  bottomInset: number;
  onHome: () => void;
  onScan: () => void;
  onProducts: () => void;
}) {
  return (
    <View style={[styles.bottomNav, { paddingBottom: Math.max(bottomInset, 10) }]}>
      <BottomNavItem icon="home-outline" label="Home" active={activeScreen === "home"} onPress={onHome} />
      <BottomNavItem icon="camera-outline" label="Camera" active={activeScreen === "scan"} onPress={onScan} />
      <BottomNavItem icon="cube-outline" label="Produtos" active={activeScreen === "products"} onPress={onProducts} />
    </View>
  );
}
