import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  type DimensionValue,
  View
} from "react-native";
import { AppModule, AuthUser, CreateManagedUserPayload, PlanDefinition, UserPlan, UserRole } from "../types/app";
import { APP_MODULES, PLAN_LABELS, PLAN_ORDER } from "../utils/appHelpers";

type AccessManagementScreenProps = {
  currentUser: AuthUser;
  plans: PlanDefinition[];
  users: AuthUser[];
  loading: boolean;
  onCreateUser: (payload: CreateManagedUserPayload) => Promise<void>;
  onToggleEnabled: (user: AuthUser) => void;
  onToggleCamera: (user: AuthUser) => void;
  onToggleModule: (user: AuthUser, module: AppModule) => void;
  onChangeRole: (user: AuthUser, role: UserRole) => void;
  onChangePlan: (user: AuthUser, plan: UserPlan) => void;
  onAdminResetPassword: (user: AuthUser, password: string) => Promise<void>;
  onDeleteUser: (user: AuthUser) => void;
};

const ROLE_LABELS: Record<UserRole, string> = {
  main: "Principal",
  master: "Master",
  default: "Padrão"
};

const ACCESS_MODULE_LABELS: Record<AppModule, string> = {
  dashboard: "Dashboard",
  scan: "Scanner",
  products: "Produtos",
  branches: "Filial",
  stock_requests: "Solicitações",
  access: "Acessos"
};

const PLAN_OPTIONS: UserPlan[] = PLAN_ORDER;

export function AccessManagementScreen({
  currentUser,
  plans,
  users,
  loading,
  onCreateUser,
  onToggleEnabled,
  onToggleCamera,
  onToggleModule,
  onChangeRole,
  onChangePlan,
  onAdminResetPassword,
  onDeleteUser
}: AccessManagementScreenProps) {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [search, setSearch] = useState("");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [resetPasswords, setResetPasswords] = useState<Record<string, string>>({});
  const [newRole, setNewRole] = useState<UserRole>("default");
  const [newPlan, setNewPlan] = useState<UserPlan>("basic");
  const canCreateMaster = currentUser.role === "main";
  const currentPlan = plans.find((plan) => plan.id === currentUser.plan);
  const managedUsersLimit = currentUser.role === "main" ? Infinity : currentUser.role === "master" ? currentPlan?.maxManagedUsers ?? 0 : null;
  const reachedPlanLimit = managedUsersLimit !== null && users.length >= managedUsersLimit;
  const managedUsersLimitText = managedUsersLimit === Infinity ? "sem limite" : managedUsersLimit;
  const progressWidth: DimensionValue = typeof managedUsersLimit === "number" && Number.isFinite(managedUsersLimit) && managedUsersLimit > 0
    ? `${Math.min(100, (users.length / managedUsersLimit) * 100)}%`
    : "100%";
  const normalizedSearch = normalizeSearch(search);
  const filteredUsers = normalizedSearch
    ? users.filter((user) => normalizeSearch(`${user.name} ${user.email}`).includes(normalizedSearch))
    : users;
  const canSubmitCreateUser = name.trim().length > 0 && email.trim().length > 0 && password.trim().length >= 6 && !loading && !reachedPlanLimit;

  async function submitCreateUser() {
    await onCreateUser({
      name,
      email,
      password,
      role: canCreateMaster ? newRole : "default",
      plan: newRole === "master" ? newPlan : "free"
    });
    setName("");
    setEmail("");
    setPassword("");
    setNewRole("default");
    setNewPlan("basic");
    setCreateModalOpen(false);
  }

  return (
    <View style={accessStyles.root}>
      <FlatList
        data={filteredUsers}
        keyExtractor={(user) => user._id}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={accessStyles.listContent}
        ListHeaderComponent={
          <View style={accessStyles.headerBlock}>
            <View style={accessStyles.summaryRow}>
              <View style={accessStyles.usageArea}>
                <Text style={accessStyles.usageText}>
                  {users.length} de {managedUsersLimitText} usuários
                </Text>
                <View style={accessStyles.progressTrack}>
                  <View style={[accessStyles.progressFill, { width: progressWidth }]} />
                </View>
              </View>

              <Pressable
                style={[accessStyles.newUserButton, reachedPlanLimit && accessStyles.disabledButton]}
                disabled={reachedPlanLimit}
                onPress={() => setCreateModalOpen(true)}
                accessibilityRole="button"
                accessibilityLabel="Criar novo usuário"
              >
                <Ionicons name="add-outline" size={15} color="#FFFFFF" />
                <Text style={accessStyles.newUserButtonText}>Novo usuário</Text>
              </Pressable>
            </View>

            {reachedPlanLimit && (
              <Text style={accessStyles.limitText}>
                Limite do plano atingido. {currentUser.role === "main" ? "Faça upgrade para ampliar." : "Fale com o acesso principal para ampliar."}
              </Text>
            )}

            <View style={accessStyles.searchBox}>
              <Ionicons name="search-outline" size={15} color="#8BA0B7" />
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Buscar por nome ou e-mail"
                placeholderTextColor="#8BA0B7"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="search"
                style={accessStyles.searchInput}
                accessibilityLabel="Buscar por nome ou e-mail"
              />
              {!!search && (
                <Pressable onPress={() => setSearch("")} hitSlop={8} accessibilityRole="button" accessibilityLabel="Limpar busca">
                  <Ionicons name="close-outline" size={18} color="#64748B" />
                </Pressable>
              )}
            </View>
          </View>
        }
        ListEmptyComponent={<Text style={accessStyles.emptyText}>Nenhum usuário encontrado.</Text>}
        renderItem={({ item }) => {
          const expanded = selectedUserId === item._id;

          return (
            <AccessUserCard
              user={item}
              expanded={expanded}
              loading={loading}
              canManageRole={currentUser.role === "main"}
              resetPassword={resetPasswords[item._id] || ""}
              onToggleExpanded={() => setSelectedUserId(expanded ? null : item._id)}
              onToggleEnabled={() => onToggleEnabled(item)}
              onToggleCamera={() => onToggleCamera(item)}
              onToggleModule={(module) => onToggleModule(item, module)}
              onChangeRole={(role) => onChangeRole(item, role)}
              onChangePlan={(plan) => onChangePlan(item, plan)}
              onChangeResetPassword={(value) => setResetPasswords((current) => ({ ...current, [item._id]: value }))}
              onApplyResetPassword={async () => {
                await onAdminResetPassword(item, resetPasswords[item._id] || "");
                setResetPasswords((current) => ({ ...current, [item._id]: "" }));
              }}
              onDelete={() => onDeleteUser(item)}
            />
          );
        }}
      />

      {createModalOpen && (
        <>
          <Pressable
            style={accessStyles.contentOverlay}
            onPress={() => setCreateModalOpen(false)}
            accessibilityRole="button"
            accessibilityLabel="Fechar cadastro"
          />

        <KeyboardAvoidingView
          style={accessStyles.createUserSheet}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={Platform.OS === "ios" ? 16 : 0}
        >
          <View style={accessStyles.modalCard}>
            <View style={accessStyles.modalHeader}>
              <Text style={accessStyles.modalTitle}>Cadastrar usuário</Text>
              <Pressable
                style={accessStyles.modalCloseButton}
                onPress={() => setCreateModalOpen(false)}
                accessibilityRole="button"
                accessibilityLabel="Fechar cadastro"
              >
                <Ionicons name="close-outline" size={20} color="#334155" />
              </Pressable>
            </View>

            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={accessStyles.modalContent}>
              <Text style={accessStyles.modalSubtitle}>Crie o acesso e depois habilite os módulos no card do usuário.</Text>

              <Text style={accessStyles.modalFieldLabel}>Nome</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Nome completo"
                placeholderTextColor="#8BA0B7"
                style={accessStyles.modalInput}
                returnKeyType="next"
              />

              <Text style={accessStyles.modalFieldLabel}>E-mail</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="e-mail@empresa.com.br"
                placeholderTextColor="#8BA0B7"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                style={accessStyles.modalInput}
                returnKeyType="next"
              />

              <Text style={accessStyles.modalFieldLabel}>Senha inicial</Text>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Mínimo 6 caracteres"
                placeholderTextColor="#8BA0B7"
                secureTextEntry
                style={accessStyles.modalInput}
                returnKeyType="done"
                onSubmitEditing={submitCreateUser}
              />

              <Text style={accessStyles.modalFieldLabel}>Função</Text>
              <View style={accessStyles.modalRoleRow}>
                {(["default", "master"] as UserRole[]).map((role) => (
                  <Pressable
                    key={role}
                    style={[accessStyles.modalRoleButton, newRole === role && accessStyles.modalRoleButtonActive]}
                    disabled={loading || (!canCreateMaster && role === "master")}
                    onPress={() => setNewRole(role)}
                    accessibilityRole="button"
                    accessibilityLabel={`Selecionar função ${ROLE_LABELS[role]}`}
                  >
                    <Text style={[accessStyles.modalRoleText, newRole === role && accessStyles.modalRoleTextActive]}>
                      {ROLE_LABELS[role]}
                    </Text>
                  </Pressable>
                ))}
              </View>

                <Pressable
                  style={[accessStyles.modalPrimaryButton, !canSubmitCreateUser && accessStyles.modalPrimaryButtonDisabled]}
                disabled={!canSubmitCreateUser}
                onPress={submitCreateUser}
                accessibilityRole="button"
                accessibilityLabel="Cadastrar acesso"
              >
                {loading && <ActivityIndicator color="#FFFFFF" size="small" />}
                <Text style={accessStyles.modalPrimaryText}>Cadastrar acesso</Text>
              </Pressable>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
        </>
      )}
    </View>
  );
}

function AccessUserCard({
  user,
  expanded,
  loading,
  canManageRole,
  resetPassword,
  onToggleExpanded,
  onToggleEnabled,
  onToggleCamera,
  onToggleModule,
  onChangeRole,
  onChangePlan,
  onChangeResetPassword,
  onApplyResetPassword,
  onDelete
}: {
  user: AuthUser;
  expanded: boolean;
  loading: boolean;
  canManageRole: boolean;
  resetPassword: string;
  onToggleExpanded: () => void;
  onToggleEnabled: () => void;
  onToggleCamera: () => void;
  onToggleModule: (module: AppModule) => void;
  onChangeRole: (role: UserRole) => void;
  onChangePlan: (plan: UserPlan) => void;
  onChangeResetPassword: (value: string) => void;
  onApplyResetPassword: () => Promise<void>;
  onDelete: () => void;
}) {
  return (
    <View style={[accessStyles.userCard, expanded && accessStyles.userCardExpanded]}>
      <Pressable
        style={accessStyles.userCardHeader}
        onPress={onToggleExpanded}
        accessibilityRole="button"
        accessibilityLabel={expanded ? `Recolher usuário ${user.name}` : `Expandir usuário ${user.name}`}
      >
        <View style={accessStyles.avatar}>
          <Text style={accessStyles.avatarText}>{getInitial(user.name)}</Text>
        </View>

        <View style={accessStyles.userTextArea}>
          <Text style={accessStyles.userName} numberOfLines={1}>{user.name}</Text>
          <Text style={accessStyles.userEmail} numberOfLines={1}>{user.email}</Text>
        </View>

        <View style={[accessStyles.statusDot, user.enabled ? accessStyles.statusDotEnabled : accessStyles.statusDotDisabled]} />
        <Ionicons name={expanded ? "chevron-up-outline" : "chevron-down-outline"} size={13} color="#8BA0B7" />
      </Pressable>

      {expanded && (
        <View style={accessStyles.expandedArea}>
          <Text style={accessStyles.groupLabel}>STATUS</Text>
          <View style={accessStyles.segmentRow}>
            <Pressable
              style={[accessStyles.segmentButton, user.enabled && accessStyles.enabledButtonActive]}
              disabled={loading || user.enabled}
              onPress={onToggleEnabled}
              accessibilityRole="button"
              accessibilityLabel={`Habilitar ${user.name}`}
            >
              <Text style={[accessStyles.segmentText, user.enabled && accessStyles.enabledButtonText]}>Habilitado</Text>
            </Pressable>
            <Pressable
              style={[accessStyles.segmentButton, !user.enabled && accessStyles.segmentButtonDanger]}
              disabled={loading || !user.enabled}
              onPress={onToggleEnabled}
              accessibilityRole="button"
              accessibilityLabel={`Cortar acesso de ${user.name}`}
            >
              <Text style={[accessStyles.segmentText, !user.enabled && accessStyles.segmentDangerText]}>Cortado</Text>
            </Pressable>
          </View>

          <Text style={accessStyles.groupLabel}>MÓDULOS</Text>
          <View style={accessStyles.chipGrid}>
            {APP_MODULES.filter((module) => module !== "access").map((module) => {
              const active = user.role === "main" || user.role === "master" || user.modules.includes(module);

              return (
                <Pressable
                  key={module}
                  style={[accessStyles.moduleChip, active && accessStyles.moduleChipActive]}
                  disabled={loading || user.role === "main" || user.role === "master"}
                  onPress={() => onToggleModule(module)}
                  accessibilityRole="button"
                  accessibilityLabel={`${active ? "Desativar" : "Ativar"} módulo ${ACCESS_MODULE_LABELS[module]} de ${user.name}`}
                >
                  <Text style={[accessStyles.moduleChipText, active && accessStyles.moduleChipTextActive]}>
                    {ACCESS_MODULE_LABELS[module]}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={accessStyles.groupLabel}>FUNÇÃO</Text>
          <View style={accessStyles.segmentRow}>
            {(["default", "master"] as UserRole[]).map((role) => (
              <Pressable
                key={role}
                style={[accessStyles.segmentButton, user.role === role && accessStyles.darkSegmentActive, !canManageRole && accessStyles.segmentButtonMuted]}
                disabled={loading || !canManageRole || user.role === role}
                onPress={() => onChangeRole(role)}
                accessibilityRole="button"
                accessibilityLabel={`Alterar função de ${user.name} para ${ROLE_LABELS[role]}`}
              >
                <Text style={[accessStyles.segmentText, user.role === role && accessStyles.darkSegmentText]}>
                  {ROLE_LABELS[role]}
                </Text>
              </Pressable>
            ))}
          </View>

          {canManageRole && user.role === "master" && (
            <>
              <Text style={accessStyles.groupLabel}>PLANO</Text>
              <View style={accessStyles.chipGrid}>
                {PLAN_OPTIONS.map((plan) => (
                  <Pressable
                    key={plan}
                    style={[accessStyles.moduleChip, user.plan === plan && accessStyles.moduleChipActive]}
                    disabled={loading || user.plan === plan}
                    onPress={() => onChangePlan(plan)}
                    accessibilityRole="button"
                    accessibilityLabel={`Alterar plano de ${user.name} para ${PLAN_LABELS[plan]}`}
                  >
                    <Text style={[accessStyles.moduleChipText, user.plan === plan && accessStyles.moduleChipTextActive]}>
                      {PLAN_LABELS[plan]}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </>
          )}

          <Text style={accessStyles.groupLabel}>CÂMERA</Text>
          <View style={accessStyles.segmentRow}>
            <Pressable
              style={[accessStyles.segmentButton, user.cameraEnabled && accessStyles.darkSegmentActive]}
              disabled={loading || user.cameraEnabled}
              onPress={onToggleCamera}
              accessibilityRole="button"
              accessibilityLabel={`Ativar câmera automática de ${user.name}`}
            >
              <Text style={[accessStyles.segmentText, user.cameraEnabled && accessStyles.darkSegmentText]}>Automática</Text>
            </Pressable>
            <Pressable
              style={[accessStyles.segmentButton, !user.cameraEnabled && accessStyles.darkSegmentActive]}
              disabled={loading || !user.cameraEnabled}
              onPress={onToggleCamera}
              accessibilityRole="button"
              accessibilityLabel={`Desativar câmera automática de ${user.name}`}
            >
              <Text style={[accessStyles.segmentText, !user.cameraEnabled && accessStyles.darkSegmentText]}>Manual</Text>
            </Pressable>
          </View>

          <Text style={accessStyles.groupLabel}>REDEFINIR SENHA</Text>
          <View style={accessStyles.passwordRow}>
            <TextInput
              value={resetPassword}
              onChangeText={onChangeResetPassword}
              placeholder="Nova senha"
              placeholderTextColor="#8BA0B7"
              secureTextEntry
              style={accessStyles.passwordInput}
              returnKeyType="done"
              accessibilityLabel={`Nova senha de ${user.name}`}
            />
            <Pressable
              style={[accessStyles.iconActionButton, loading && accessStyles.disabledButton]}
              disabled={loading}
              onPress={onApplyResetPassword}
              accessibilityRole="button"
              accessibilityLabel={`Aplicar nova senha para ${user.name}`}
            >
              <Ionicons name="key-outline" size={16} color="#2563EB" />
            </Pressable>
            <Pressable
              style={[accessStyles.deleteButton, loading && accessStyles.disabledButton]}
              disabled={loading}
              onPress={onDelete}
              accessibilityRole="button"
              accessibilityLabel={`Excluir usuário ${user.name}`}
            >
              <Ionicons name="trash-outline" size={16} color="#EF4444" />
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

function getInitial(name: string) {
  return (name.trim()[0] || "?").toUpperCase();
}

function normalizeSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

const accessStyles = StyleSheet.create({
  root: {
    flex: 1,
    position: "relative",
    backgroundColor: "#F7F9FC"
  },
  listContent: {
    paddingBottom: 96
  },
  headerBlock: {
    paddingHorizontal: 7,
    paddingTop: 12,
    paddingBottom: 9
  },
  summaryRow: {
    minHeight: 34,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 10
  },
  usageArea: {
    paddingTop: 2,
    minWidth: 92
  },
  usageText: {
    color: "#64748B",
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "600"
  },
  progressTrack: {
    marginTop: 7,
    width: 87,
    height: 3,
    borderRadius: 999,
    overflow: "hidden",
    backgroundColor: "#E7EEF8"
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: "#2563EB"
  },
  newUserButton: {
    minHeight: 33,
    paddingHorizontal: 13,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    backgroundColor: "#2563EB",
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.18,
    shadowRadius: 9,
    elevation: 3
  },
  newUserButtonText: {
    color: "#FFFFFF",
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "900"
  },
  limitText: {
    marginTop: 4,
    color: "#EF4444",
    fontSize: 10,
    lineHeight: 14,
    fontWeight: "700"
  },
  searchBox: {
    height: 40,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#DCE3EE",
    borderRadius: 8,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: "#FFFFFF"
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    color: "#0F172A",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "600",
    paddingVertical: 0
  },
  userCard: {
    marginHorizontal: 7,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#DCE3EE",
    borderRadius: 11,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2
  },
  userCardExpanded: {
    borderColor: "#D7E0EC"
  },
  userCardHeader: {
    minHeight: 64,
    paddingHorizontal: 15,
    paddingVertical: 11,
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1F5F9"
  },
  avatarText: {
    color: "#334155",
    fontSize: 13,
    lineHeight: 16,
    fontWeight: "900"
  },
  userTextArea: {
    flex: 1,
    minWidth: 0
  },
  userName: {
    color: "#020617",
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "900"
  },
  userEmail: {
    marginTop: 1,
    color: "#64748B",
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "500"
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4
  },
  statusDotEnabled: {
    backgroundColor: "#16A34A"
  },
  statusDotDisabled: {
    backgroundColor: "#FB7185"
  },
  expandedArea: {
    borderTopWidth: 1,
    borderTopColor: "#E5EBF3",
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 13
  },
  groupLabel: {
    marginBottom: 7,
    color: "#64748B",
    fontSize: 9,
    lineHeight: 12,
    fontWeight: "900"
  },
  segmentRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12
  },
  segmentButton: {
    flex: 1,
    minHeight: 36,
    borderWidth: 1,
    borderColor: "#DCE3EE",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
    backgroundColor: "#FFFFFF"
  },
  segmentButtonActive: {
    borderColor: "#071426",
    backgroundColor: "#071426"
  },
  segmentButtonMuted: {
    opacity: 0.82
  },
  enabledButtonActive: {
    borderColor: "#16A34A",
    backgroundColor: "#16C95B"
  },
  segmentButtonDanger: {
    borderColor: "#FCA5A5",
    backgroundColor: "#FFF1F2"
  },
  segmentText: {
    color: "#334155",
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "800"
  },
  enabledButtonText: {
    color: "#FFFFFF",
    fontWeight: "900"
  },
  segmentTextActive: {
    color: "#FFFFFF",
    fontWeight: "900"
  },
  segmentDangerText: {
    color: "#DC2626",
    fontWeight: "900"
  },
  darkSegmentActive: {
    borderColor: "#071426",
    backgroundColor: "#071426"
  },
  darkSegmentText: {
    color: "#FFFFFF",
    fontWeight: "900"
  },
  chipGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
    marginBottom: 12
  },
  moduleChip: {
    minHeight: 28,
    borderWidth: 1,
    borderColor: "#DCE3EE",
    borderRadius: 6,
    paddingHorizontal: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF"
  },
  moduleChipActive: {
    borderColor: "#2563EB",
    backgroundColor: "#2563EB"
  },
  moduleChipText: {
    color: "#475569",
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "800"
  },
  moduleChipTextActive: {
    color: "#FFFFFF",
    fontWeight: "900"
  },
  passwordRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7
  },
  passwordInput: {
    flex: 1,
    minHeight: 36,
    borderWidth: 1,
    borderColor: "#DCE3EE",
    borderRadius: 8,
    paddingHorizontal: 11,
    color: "#0F172A",
    fontSize: 12,
    fontWeight: "700",
    backgroundColor: "#FFFFFF"
  },
  iconActionButton: {
    width: 38,
    height: 36,
    borderWidth: 1,
    borderColor: "#DCE3EE",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF"
  },
  deleteButton: {
    width: 38,
    height: 36,
    borderWidth: 1,
    borderColor: "#FCA5A5",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF1F2"
  },
  emptyText: {
    paddingTop: 20,
    color: "#64748B",
    fontSize: 13,
    lineHeight: 18,
    textAlign: "center",
    fontWeight: "700"
  },
  contentOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
    backgroundColor: "rgba(7, 20, 38, 0.38)"
  },
  createUserSheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 11,
    maxHeight: "96%"
  },
  modalCard: {
    width: "100%",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    overflow: "hidden",
    backgroundColor: "#FFFFFF"
  },
  modalHeader: {
    minHeight: 59,
    borderBottomWidth: 1,
    borderBottomColor: "#E5EAF1",
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12
  },
  modalTitle: {
    color: "#020617",
    fontSize: 16,
    lineHeight: 20,
    fontWeight: "900"
  },
  modalCloseButton: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center"
  },
  modalSubtitle: {
    marginBottom: 15,
    color: "#64748B",
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "500"
  },
  modalContent: {
    paddingHorizontal: 18,
    paddingTop: 17,
    paddingBottom: 12
  },
  modalFieldLabel: {
    marginBottom: 7,
    color: "#0F172A",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "800"
  },
  modalInput: {
    height: 43,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#DCE3EE",
    borderRadius: 8,
    paddingHorizontal: 14,
    color: "#0F172A",
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "600",
    backgroundColor: "#FFFFFF"
  },
  modalRoleRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 15
  },
  modalRoleButton: {
    flex: 1,
    height: 37,
    borderWidth: 1,
    borderColor: "#DCE3EE",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF"
  },
  modalRoleButtonActive: {
    borderColor: "#071426",
    backgroundColor: "#071426"
  },
  modalRoleText: {
    color: "#475569",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "800"
  },
  modalRoleTextActive: {
    color: "#FFFFFF",
    fontWeight: "900"
  },
  modalPlanRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 20
  },
  modalPlanChip: {
    height: 30,
    minWidth: 45,
    borderWidth: 1,
    borderColor: "#DCE3EE",
    borderRadius: 6,
    paddingHorizontal: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF"
  },
  modalPlanChipActive: {
    borderColor: "#2563EB",
    backgroundColor: "#2563EB"
  },
  modalPlanText: {
    color: "#475569",
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "800"
  },
  modalPlanTextActive: {
    color: "#FFFFFF",
    fontWeight: "900"
  },
  modalPrimaryButton: {
    height: 43,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    backgroundColor: "#2563EB"
  },
  modalPrimaryButtonDisabled: {
    backgroundColor: "#86A6F2"
  },
  modalPrimaryText: {
    color: "#FFFFFF",
    fontSize: 14,
    lineHeight: 17,
    fontWeight: "900"
  },
  disabledButton: {
    opacity: 0.58
  }
});
