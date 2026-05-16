import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { styles } from "../styles/appStyles";
import { AppModule, AuthUser, CreateManagedUserPayload, UserPlan, UserRole } from "../types/app";
import { APP_MODULES, MODULE_LABELS, PLAN_LABELS, PLAN_LIMITS, PLAN_ORDER } from "../utils/appHelpers";

type AccessManagementScreenProps = {
  currentUser: AuthUser;
  users: AuthUser[];
  loading: boolean;
  onCreateUser: (payload: CreateManagedUserPayload) => Promise<void>;
  onToggleEnabled: (user: AuthUser) => void;
  onToggleModule: (user: AuthUser, module: AppModule) => void;
  onChangeRole: (user: AuthUser, role: UserRole) => void;
  onChangePlan: (user: AuthUser, plan: UserPlan) => void;
  onAdminResetPassword: (user: AuthUser, password: string) => Promise<void>;
  onDeleteUser: (user: AuthUser) => void;
};

const ROLE_LABELS: Record<UserRole, string> = {
  main: "Principal",
  master: "Master",
  default: "Padr\u00e3o"
};

const PLAN_OPTIONS: UserPlan[] = PLAN_ORDER;

export function AccessManagementScreen({
  currentUser,
  users,
  loading,
  onCreateUser,
  onToggleEnabled,
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
  const [newRole, setNewRole] = useState<UserRole>(currentUser.role === "main" ? "master" : "default");
  const [newPlan, setNewPlan] = useState<UserPlan>("free");
  const canCreateMaster = currentUser.role === "main";
  const managedUsersLimit = currentUser.role === "main" || currentUser.role === "master" ? PLAN_LIMITS[currentUser.plan] : null;
  const reachedPlanLimit = managedUsersLimit !== null && users.length >= managedUsersLimit;
  const managedUsersLimitText = managedUsersLimit === Infinity ? "sem limite" : managedUsersLimit;
  const normalizedSearch = normalizeSearch(search);
  const filteredUsers = normalizedSearch
    ? users.filter((user) => normalizeSearch(`${user.name} ${user.email}`).includes(normalizedSearch))
    : users;

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
    setNewRole(canCreateMaster ? "master" : "default");
    setNewPlan("free");
    setCreateModalOpen(false);
  }

  return (
    <KeyboardAvoidingView style={styles.screenBody} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentInner}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
      >
        <View style={styles.pendingHeader}>
          <View>
            <Text style={styles.sectionSubtitle}>
              {currentUser.role === "main"
                ? `Principal controla masters e usu\u00e1rios padr\u00e3o (${users.length}/${managedUsersLimitText}).`
                : `Master controla os usu\u00e1rios padr\u00e3o que cadastrou (${users.length}/${managedUsersLimitText}).`}
            </Text>
          </View>
        </View>

        <Pressable
          style={[styles.primaryButton, reachedPlanLimit && styles.disabledButton]}
          disabled={reachedPlanLimit}
          onPress={() => setCreateModalOpen(true)}
        >
          <Ionicons name="person-add-outline" size={18} color="#ffffff" />
          <Text style={styles.primaryButtonText}>Novo usuário</Text>
        </Pressable>

        {reachedPlanLimit && (
          <Text style={styles.inlineAlertText}>
            Limite do plano atingido. {currentUser.role === "main" ? "Faca upgrade para ampliar." : "Fale com o acesso principal para ampliar."}
          </Text>
        )}

        <View style={styles.selectInputRow}>
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Buscar por nome ou e-mail"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
            style={styles.selectInput}
          />
          {!!search && (
            <Pressable style={styles.selectButton} onPress={() => setSearch("")}>
              <Ionicons name="close-outline" size={21} color="#0f766e" />
            </Pressable>
          )}
        </View>

        {filteredUsers.length === 0 ? (
          <Text style={styles.mutedText}>Nenhum usuário encontrado.</Text>
        ) : (
          filteredUsers.map((user) => {
            const expanded = selectedUserId === user._id;

            return (
              <View key={user._id} style={[styles.accessCard, expanded && styles.userListItemActive]}>
                <Pressable style={styles.pendingTopRow} onPress={() => setSelectedUserId(expanded ? null : user._id)}>
                  <View style={styles.pendingTitleArea}>
                    <Text style={styles.pendingName}>{user.name}</Text>
                    <Text style={styles.meta}>{user.email}</Text>
                    <Text style={styles.branchProductMeta}>
                      {ROLE_LABELS[user.role]}{user.role === "master" ? ` | ${PLAN_LABELS[user.plan]}` : ""}
                    </Text>
                  </View>
                  <Ionicons name={expanded ? "chevron-up-outline" : "chevron-down-outline"} size={20} color="#0f766e" />
                </Pressable>

                {expanded && (
                  <Pressable
                    style={[styles.accessStatusButton, user.enabled ? styles.accessEnabled : styles.accessDisabled]}
                    disabled={loading}
                    onPress={() => onToggleEnabled(user)}
                  >
                    <Ionicons
                      name={user.enabled ? "checkmark-circle-outline" : "close-circle-outline"}
                      size={18}
                      color={user.enabled ? "#0f766e" : "#991b1b"}
                    />
                    <Text style={[styles.accessStatusText, !user.enabled && styles.accessStatusTextDisabled]}>
                      {user.enabled ? "Habilitado" : "Cortado"}
                    </Text>
                  </Pressable>
                )}

            {expanded && currentUser.role === "main" && (
              <View style={styles.roleRow}>
                {(["default", "master"] as UserRole[]).map((role) => (
                  <Pressable
                    key={role}
                    style={[styles.roleButton, user.role === role && styles.roleButtonActive]}
                    disabled={loading}
                    onPress={() => onChangeRole(user, role)}
                  >
                    <Text style={[styles.roleButtonText, user.role === role && styles.roleButtonTextActive]}>
                      {ROLE_LABELS[role]}
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}

            {expanded && currentUser.role === "main" && user.role === "master" && (
              <View style={styles.roleRow}>
                {PLAN_OPTIONS.map((plan) => (
                  <Pressable
                    key={plan}
                    style={[styles.roleButton, user.plan === plan && styles.roleButtonActive]}
                    disabled={loading}
                    onPress={() => onChangePlan(user, plan)}
                  >
                    <Text style={[styles.roleButtonText, user.plan === plan && styles.roleButtonTextActive]}>
                      {PLAN_LABELS[plan]}
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}

            {expanded && <View style={styles.moduleGrid}>
              {APP_MODULES.filter((module) => module !== "access").map((module) => {
                const active = user.role === "main" || user.role === "master" || user.modules.includes(module);

                return (
                  <Pressable
                    key={module}
                    style={[styles.moduleButton, active && styles.moduleButtonActive]}
                    disabled={loading || user.role === "main" || user.role === "master"}
                    onPress={() => onToggleModule(user, module)}
                  >
                    <Ionicons
                      name={active ? "toggle-outline" : "ellipse-outline"}
                      size={18}
                      color={active ? "#0f766e" : "#64748b"}
                    />
                    <Text style={[styles.moduleButtonText, active && styles.moduleButtonTextActive]}>
                      {MODULE_LABELS[module]}
                    </Text>
                  </Pressable>
                );
              })}
            </View>}
            {expanded && (
              <View style={styles.pendingSection}>
                <Text style={styles.fieldLabel}>Redefinir senha deste usuário</Text>
                <TextInput
                  value={resetPasswords[user._id] || ""}
                  onChangeText={(value) => setResetPasswords((current) => ({ ...current, [user._id]: value }))}
                  placeholder="Nova senha"
                  secureTextEntry
                  style={styles.quantityInput}
                  returnKeyType="done"
                />
                <Pressable
                  style={[styles.secondaryButton, loading && styles.disabledButton]}
                  disabled={loading}
                  onPress={async () => {
                    await onAdminResetPassword(user, resetPasswords[user._id] || "");
                    setResetPasswords((current) => ({ ...current, [user._id]: "" }));
                  }}
                >
                  <Ionicons name="key-outline" size={18} color="#0f766e" />
                  <Text style={styles.secondaryButtonText}>Aplicar nova senha</Text>
                </Pressable>
              </View>
            )}
            {expanded && (
              <Pressable
                style={[styles.cancelButton, loading && styles.disabledButton]}
                disabled={loading}
                onPress={() => onDeleteUser(user)}
              >
                <Ionicons name="trash-outline" size={18} color="#991b1b" />
                <Text style={styles.cancelButtonText}>Excluir usuário</Text>
              </Pressable>
            )}
          </View>
            );
          })
        )}
      </ScrollView>

      <Modal visible={createModalOpen} transparent animationType="slide" onRequestClose={() => setCreateModalOpen(false)}>
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 16 : 0}
        >
          <View style={styles.observationModal}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleArea}>
                <Text style={styles.modalTitle}>Cadastrar usuário</Text>
                <Text style={styles.modalSubtitle}>Crie o acesso e depois habilite os módulos no card do usuário.</Text>
              </View>
              <Pressable style={styles.headerIconButton} onPress={() => setCreateModalOpen(false)}>
                <Ionicons name="close-outline" size={24} color="#1f2937" />
              </Pressable>
            </View>

            {currentUser.role === "master" && (
              <View style={styles.roleRow}>
                {PLAN_OPTIONS.map((plan) => (
                  <Pressable
                    key={plan}
                    style={[
                      styles.roleButton,
                      currentUser.plan === plan && styles.roleButtonActive,
                      currentUser.plan !== plan && styles.disabledButton
                    ]}
                    disabled
                  >
                    <Text style={[styles.roleButtonText, currentUser.plan === plan && styles.roleButtonTextActive]}>
                      {PLAN_LABELS[plan]}
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}

            <TextInput value={name} onChangeText={setName} placeholder="Nome" style={styles.quantityInput} returnKeyType="next" />
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="e-mail@empresa.com"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              style={styles.quantityInput}
              returnKeyType="next"
            />
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Senha inicial"
              secureTextEntry
              style={styles.quantityInput}
              returnKeyType="done"
              onSubmitEditing={submitCreateUser}
            />

            {canCreateMaster && (
              <View style={styles.roleRow}>
                {(["master", "default"] as UserRole[]).map((role) => (
                  <Pressable
                    key={role}
                    style={[styles.roleButton, newRole === role && styles.roleButtonActive]}
                    disabled={loading}
                    onPress={() => setNewRole(role)}
                  >
                    <Text style={[styles.roleButtonText, newRole === role && styles.roleButtonTextActive]}>
                      {ROLE_LABELS[role]}
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}

            {canCreateMaster && newRole === "master" && (
              <View style={styles.roleRow}>
                {PLAN_OPTIONS.map((plan) => (
                  <Pressable
                    key={plan}
                    style={[styles.roleButton, newPlan === plan && styles.roleButtonActive]}
                    disabled={loading}
                    onPress={() => setNewPlan(plan)}
                  >
                    <Text style={[styles.roleButtonText, newPlan === plan && styles.roleButtonTextActive]}>
                      {PLAN_LABELS[plan]}
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}

            <Pressable
              style={[styles.primaryButton, (loading || reachedPlanLimit) && styles.disabledButton]}
              disabled={loading || reachedPlanLimit}
              onPress={submitCreateUser}
            >
              <Ionicons name="person-add-outline" size={18} color="#ffffff" />
              <Text style={styles.primaryButtonText}>Cadastrar acesso</Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </KeyboardAvoidingView>
  );
}

function normalizeSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}
