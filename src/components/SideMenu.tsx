import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Easing, Modal, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { AuthUser, Screen } from "../types/app";
import { canAccessModule, canManageAccess, canManageCertificate, PLAN_LABELS } from "../utils/appHelpers";

type DrawerItem = {
  key: Screen | "logout";
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  active?: boolean;
  danger?: boolean;
  hasBadge?: boolean;
  onPress: () => void;
};

const ANIMATION_DURATION = 240;

export function SideMenu({
  visible,
  activeScreen,
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
  hasPendingStockRequests = false,
  topInset,
  bottomInset
}: {
  visible: boolean;
  activeScreen: Screen;
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
  bottomInset: number;
}) {
  const { width } = useWindowDimensions();
  const drawerWidth = Math.min(width * 0.77, 360);
  const bottomNavHeight = 52 + Math.max(bottomInset, 10);
  const [mounted, setMounted] = useState(visible);
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setMounted(true);
      Animated.timing(progress, {
        toValue: 1,
        duration: ANIMATION_DURATION,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true
      }).start();
      return;
    }

    Animated.timing(progress, {
      toValue: 0,
      duration: 190,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true
    }).start(({ finished }) => {
      if (finished) {
        setMounted(false);
      }
    });
  }, [progress, visible]);

  const translateX = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [-drawerWidth, 0]
  });

  const items = useMemo<DrawerItem[]>(
    () => [
      { key: "home", icon: "home-outline", label: "Início", active: activeScreen === "home", onPress: onHome },
      ...(canAccessModule(user, "dashboard")
        ? [{ key: "dashboard" as const, icon: "bar-chart-outline" as const, label: "Dashboard", active: activeScreen === "dashboard", onPress: onDashboard }]
        : []),
      { key: "profile", icon: "person-outline", label: "Perfil", active: activeScreen === "profile", onPress: onProfile },
      { key: "billing", icon: "card-outline", label: "Planos", active: activeScreen === "billing", onPress: onBilling },
      ...(canAccessModule(user, "scan")
        ? [{ key: "scan" as const, icon: "camera-outline" as const, label: "Escanear", active: activeScreen === "scan", onPress: onScan }]
        : []),
      ...(canAccessModule(user, "products")
        ? [{ key: "products" as const, icon: "cube-outline" as const, label: "Ver produtos", active: activeScreen === "products", onPress: onProducts }]
        : []),
      ...(canAccessModule(user, "branches")
        ? [{ key: "branches" as const, icon: "git-branch-outline" as const, label: "Filial", active: activeScreen === "branches", onPress: onBranches }]
        : []),
      ...(canAccessModule(user, "stock_requests")
        ? [
            {
              key: "stock_requests" as const,
              icon: "clipboard-outline" as const,
              label: "Solicitações",
              active: activeScreen === "stock_requests",
              hasBadge: hasPendingStockRequests,
              onPress: onStockRequests
            }
          ]
        : []),
      ...(canManageAccess(user)
        ? [{ key: "access" as const, icon: "people-outline" as const, label: "Gerenciar acessos", active: activeScreen === "access", onPress: onAccess }]
        : []),
      ...(canManageCertificate(user)
        ? [
            {
              key: "certificate" as const,
              icon: "shield-checkmark-outline" as const,
              label: "Certificado",
              active: activeScreen === "certificate",
              onPress: onCertificate
            }
          ]
        : [])
    ],
    [
      activeScreen,
      hasPendingStockRequests,
      onAccess,
      onBilling,
      onBranches,
      onCertificate,
      onDashboard,
      onHome,
      onProducts,
      onProfile,
      onScan,
      onStockRequests,
      user
    ]
  );

  if (!mounted) return null;

  return (
    <Modal visible={mounted} transparent animationType="none" onRequestClose={onClose}>
      <View style={drawerStyles.modalRoot} pointerEvents="box-none">
        <Animated.View
          pointerEvents={visible ? "auto" : "none"}
          style={[
            drawerStyles.overlay,
            {
              bottom: bottomNavHeight,
              opacity: progress
            }
          ]}
        >
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityRole="button" accessibilityLabel="Fechar menu" />
        </Animated.View>

        <Animated.View
          accessibilityRole="menu"
          style={[
            drawerStyles.drawer,
            {
              width: drawerWidth,
              bottom: bottomNavHeight,
              paddingTop: topInset,
              transform: [{ translateX }]
            }
          ]}
        >
          <View style={drawerStyles.header}>
            <View style={drawerStyles.headerTextArea}>
              <Text style={drawerStyles.appName} numberOfLines={1}>
                BipaAí
              </Text>
              <Text style={drawerStyles.userName} numberOfLines={1}>
                {user.name}
              </Text>
            </View>

            <Text style={drawerStyles.planBadge} numberOfLines={1}>
              {PLAN_LABELS[user.plan]}
            </Text>

            <Pressable style={drawerStyles.closeButton} onPress={onClose} accessibilityRole="button" accessibilityLabel="Fechar menu">
              <Ionicons name="close-outline" size={19} color="#334155" />
            </Pressable>
          </View>

          <ScrollView
            style={drawerStyles.menuList}
            contentContainerStyle={drawerStyles.menuListContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {items.map((item) => (
              <DrawerMenuItem key={item.key} item={item} />
            ))}
          </ScrollView>

          <View style={drawerStyles.footer}>
            <DrawerMenuItem item={{ key: "logout", icon: "log-out-outline", label: "Sair", danger: true, onPress: onLogout }} />
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

function DrawerMenuItem({ item }: { item: DrawerItem }) {
  const color = item.danger ? "#EF4444" : item.active ? "#0F172A" : "#475569";
  const textColor = item.danger ? "#EF4444" : "#0F172A";

  return (
    <Pressable
      style={({ pressed }) => [drawerStyles.menuItem, item.active && drawerStyles.menuItemActive, pressed && drawerStyles.menuItemPressed]}
      onPress={item.onPress}
      accessibilityRole="menuitem"
      accessibilityLabel={item.label}
      accessibilityState={{ selected: Boolean(item.active) }}
    >
      <View style={drawerStyles.iconSlot}>
        <Ionicons name={item.icon} size={18} color={color} />
      </View>
      <Text style={[drawerStyles.menuItemText, item.active && drawerStyles.menuItemTextActive, item.danger && drawerStyles.logoutText]} numberOfLines={1}>
        {item.label}
      </Text>
      {item.hasBadge && <View style={drawerStyles.notificationDot} />}
    </Pressable>
  );
}

const drawerStyles = StyleSheet.create({
  modalRoot: {
    flex: 1
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(7, 20, 38, 0.42)"
  },
  drawer: {
    position: "absolute",
    top: 0,
    left: 0,
    borderTopRightRadius: 24,
    borderBottomRightRadius: 24,
    overflow: "hidden",
    backgroundColor: "#FFFFFF"
  },
  header: {
    minHeight: 44,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    paddingHorizontal: 16,
    paddingBottom: 8,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8
  },
  headerTextArea: {
    flex: 1,
    minWidth: 0,
    paddingTop: 1
  },
  appName: {
    color: "#0F172A",
    fontSize: 16,
    lineHeight: 20,
    fontWeight: "900"
  },
  userName: {
    marginTop: 2,
    color: "#94A3B8",
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "600"
  },
  planBadge: {
    maxWidth: 68,
    minHeight: 19,
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingTop: 3,
    overflow: "hidden",
    color: "#2563EB",
    backgroundColor: "#EEF4FF",
    fontSize: 10,
    lineHeight: 12,
    fontWeight: "800",
    textAlign: "center"
  },
  closeButton: {
    width: 30,
    height: 30,
    marginTop: -5,
    alignItems: "center",
    justifyContent: "center"
  },
  menuList: {
    flex: 1
  },
  menuListContent: {
    paddingTop: 8,
    paddingBottom: 12
  },
  menuItem: {
    minHeight: 41,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#FFFFFF"
  },
  menuItemActive: {
    backgroundColor: "#F1F5F9"
  },
  menuItemPressed: {
    opacity: 0.76
  },
  iconSlot: {
    width: 18,
    alignItems: "center",
    justifyContent: "center"
  },
  menuItemText: {
    flex: 1,
    minWidth: 0,
    color: "#0F172A",
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "500"
  },
  menuItemTextActive: {
    fontWeight: "600"
  },
  notificationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#EF4444"
  },
  footer: {
    minHeight: 69,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    paddingTop: 13,
    backgroundColor: "#FFFFFF"
  },
  logoutText: {
    color: "#EF4444",
    fontWeight: "700"
  }
});
