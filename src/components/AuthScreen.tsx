import { Ionicons } from "@expo/vector-icons";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { AuthMode, RegisterCredentials } from "../types/app";

type AuthScreenProps = {
  loading: boolean;
  error: string | null;
  onLogin: (email: string, password: string) => Promise<void>;
  onRegister: (payload: RegisterCredentials) => Promise<void>;
  onRequestPasswordReset: (email: string) => Promise<{ message: string; resetToken?: string } | undefined>;
  onCompletePasswordReset: (token: string, password: string) => Promise<void>;
};

const palette = {
  shell: "#ffffff",
  panel: "#ffffff",
  formBackground: "#f5f7fb",
  primary: "#2563eb",
  primaryPressed: "#1d4ed8",
  text: "#050816",
  muted: "#667085",
  inputBorder: "#d9e1ec",
  placeholder: "#94a3b8",
  segment: "#eef2f7",
  danger: "#991b1b",
  dangerSoft: "#fee2e2"
};

export function AuthScreen({ loading, error, onLogin, onRegister, onRequestPasswordReset, onCompletePasswordReset }: AuthScreenProps) {
  const [mode, setMode] = useState<AuthMode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [resetRequested, setResetRequested] = useState(false);
  const [resetToken, setResetToken] = useState("");
  const [resetPassword, setResetPassword] = useState("");
  const [resetPasswordVisible, setResetPasswordVisible] = useState(false);
  const emailInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);
  const resetTokenInputRef = useRef<TextInput>(null);
  const resetPasswordInputRef = useRef<TextInput>(null);

  async function submit() {
    if (mode === "reset") {
      if (!resetRequested) {
        const result = await onRequestPasswordReset(email);
        if (result) {
          setResetRequested(true);
          if (result.resetToken) {
            setResetToken(result.resetToken);
          }
          setTimeout(() => resetTokenInputRef.current?.focus(), 150);
        }
        return;
      }

      await onCompletePasswordReset(resetToken, resetPassword);
      setMode("login");
      setResetRequested(false);
      setResetToken("");
      setResetPassword("");
      return;
    }

    if (mode === "login") {
      await onLogin(email, password);
      return;
    }

    await onRegister({ name, email, password });
  }

  const primaryLabel =
    mode === "login" ? "Entrar" : mode === "register" ? "Criar acesso" : resetRequested ? "Redefinir senha" : "Enviar e-mail de redefinição";

  return (
    <View style={screenStyles.shell}>
      <KeyboardAvoidingView
        style={screenStyles.keyboard}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 0}
      >
        <ScrollView
          style={screenStyles.scroller}
          contentContainerStyle={screenStyles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={screenStyles.panel}>
            <View style={screenStyles.hero}>
              <View style={screenStyles.logoBox} accessibilityLabel="BipaAí">
                <Ionicons name="barcode-outline" size={40} color="#ffffff" />
              </View>
              <Text style={screenStyles.title}>BipaAí</Text>
              <Text style={screenStyles.subtitle}>Da nota ao estoque em segundos</Text>
            </View>

            <View style={screenStyles.formSection}>
              <View style={screenStyles.segmentedControl}>
                <SegmentButton label="Entrar" active={mode === "login"} disabled={loading} onPress={() => setMode("login")} />
                <SegmentButton
                  label="Registre-se"
                  active={mode === "register"}
                  disabled={loading}
                  onPress={() => setMode("register")}
                />
              </View>

              {error && <Text style={screenStyles.errorText}>{error}</Text>}

              {mode === "register" && (
                <View style={screenStyles.fieldGroup}>
                  <Text style={screenStyles.label}>Nome</Text>
                  <TextInput
                    value={name}
                    onChangeText={setName}
                    placeholder="Seu nome"
                    placeholderTextColor={palette.placeholder}
                    style={screenStyles.input}
                    returnKeyType="next"
                    blurOnSubmit={false}
                    editable={!loading}
                    onSubmitEditing={() => emailInputRef.current?.focus()}
                  />
                </View>
              )}

              <View style={screenStyles.fieldGroup}>
                <Text style={screenStyles.label}>E-mail</Text>
                <TextInput
                  ref={emailInputRef}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="e-mail@empresa.com.br"
                  placeholderTextColor={palette.placeholder}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                  editable={!loading}
                  importantForAutofill="yes"
                  keyboardType="email-address"
                  showSoftInputOnFocus
                  textContentType="emailAddress"
                  returnKeyType="next"
                  blurOnSubmit={false}
                  onPressIn={() => emailInputRef.current?.focus()}
                  onSubmitEditing={() => (mode === "reset" && resetRequested ? resetTokenInputRef.current?.focus() : passwordInputRef.current?.focus())}
                  style={screenStyles.input}
                />
              </View>

              {mode !== "reset" && (
                <View style={screenStyles.fieldGroup}>
                  <Text style={screenStyles.label}>Senha</Text>
                  <View style={screenStyles.passwordInput}>
                    <TextInput
                      ref={passwordInputRef}
                      value={password}
                      onChangeText={setPassword}
                      placeholder={mode === "login" ? "••••••••" : "Mínimo 6 caracteres"}
                      placeholderTextColor={palette.placeholder}
                      autoComplete={mode === "login" ? "current-password" : "new-password"}
                      editable={!loading}
                      importantForAutofill="yes"
                      secureTextEntry={!passwordVisible}
                      showSoftInputOnFocus
                      textContentType={mode === "login" ? "password" : "newPassword"}
                      returnKeyType="done"
                      onPressIn={() => passwordInputRef.current?.focus()}
                      onSubmitEditing={submit}
                      style={screenStyles.passwordTextInput}
                    />
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={passwordVisible ? "Ocultar senha" : "Mostrar senha"}
                      hitSlop={8}
                      style={screenStyles.eyeButton}
                      onPress={() => setPasswordVisible((visible) => !visible)}
                    >
                      <Ionicons name={passwordVisible ? "eye-off-outline" : "eye-outline"} size={19} color="#98a2b3" />
                    </Pressable>
                  </View>
                </View>
              )}

              {mode === "reset" && resetRequested && (
                <>
                  <View style={screenStyles.fieldGroup}>
                    <Text style={screenStyles.label}>Token recebido por e-mail</Text>
                    <TextInput
                      ref={resetTokenInputRef}
                      value={resetToken}
                      onChangeText={setResetToken}
                      placeholder="Cole o token aqui"
                      placeholderTextColor={palette.placeholder}
                      autoCapitalize="none"
                      autoCorrect={false}
                      editable={!loading}
                      returnKeyType="next"
                      blurOnSubmit={false}
                      onSubmitEditing={() => resetPasswordInputRef.current?.focus()}
                      style={screenStyles.input}
                    />
                  </View>

                  <View style={screenStyles.fieldGroup}>
                    <Text style={screenStyles.label}>Nova senha</Text>
                    <View style={screenStyles.passwordInput}>
                      <TextInput
                        ref={resetPasswordInputRef}
                        value={resetPassword}
                        onChangeText={setResetPassword}
                        placeholder="Minimo 8 caracteres"
                        placeholderTextColor={palette.placeholder}
                        autoComplete="new-password"
                        editable={!loading}
                        importantForAutofill="yes"
                        secureTextEntry={!resetPasswordVisible}
                        textContentType="newPassword"
                        returnKeyType="done"
                        onSubmitEditing={submit}
                        style={screenStyles.passwordTextInput}
                      />
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={resetPasswordVisible ? "Ocultar nova senha" : "Mostrar nova senha"}
                        hitSlop={8}
                        style={screenStyles.eyeButton}
                        onPress={() => setResetPasswordVisible((visible) => !visible)}
                      >
                        <Ionicons name={resetPasswordVisible ? "eye-off-outline" : "eye-outline"} size={19} color="#98a2b3" />
                      </Pressable>
                    </View>
                  </View>
                </>
              )}

              <Pressable
                style={({ pressed }) => [
                  screenStyles.primaryButton,
                  pressed && !loading && screenStyles.primaryButtonPressed,
                  loading && screenStyles.disabledButton
                ]}
                disabled={loading}
                onPress={submit}
              >
                {loading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={screenStyles.primaryButtonText}>{primaryLabel}</Text>
                )}
              </Pressable>

              {mode === "login" ? (
                <Pressable
                  style={screenStyles.textLink}
                  disabled={loading}
                  onPress={() => {
                    setMode("reset");
                    setResetRequested(false);
                    setResetToken("");
                    setResetPassword("");
                  }}
                >
                  <Text style={screenStyles.textLinkLabel}>Redefinir senha</Text>
                </Pressable>
              ) : (
                <Pressable
                  style={screenStyles.textLink}
                  disabled={loading}
                  onPress={() => {
                    setMode("login");
                    setResetRequested(false);
                    setResetToken("");
                    setResetPassword("");
                  }}
                >
                  <Text style={screenStyles.textLinkLabel}>Voltar para login</Text>
                </Pressable>
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

function SegmentButton({
  label,
  active,
  disabled,
  onPress
}: {
  label: string;
  active: boolean;
  disabled: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        screenStyles.segmentButton,
        active && screenStyles.segmentButtonActive,
        pressed && !active && screenStyles.segmentButtonPressed
      ]}
      disabled={disabled}
      onPress={onPress}
    >
      <Text style={[screenStyles.segmentButtonText, active && screenStyles.segmentButtonTextActive]}>{label}</Text>
    </Pressable>
  );
}

const screenStyles = StyleSheet.create({
  shell: {
    flex: 1,
    backgroundColor: palette.formBackground
  },
  keyboard: {
    flex: 1
  },
  scroller: {
    flex: 1,
    backgroundColor: palette.formBackground
  },
  scrollContent: {
    flexGrow: 1,
    padding: 0
  },
  panel: {
    flex: 1,
    width: "100%",
    alignSelf: "center",
    overflow: "hidden",
    backgroundColor: palette.formBackground
  },
  hero: {
    minHeight: 260,
    paddingHorizontal: 24,
    paddingTop: 78,
    paddingBottom: 24,
    alignItems: "center",
    justifyContent: "flex-start",
    backgroundColor: palette.panel
  },
  logoBox: {
    width: 72,
    height: 72,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: palette.primary,
    shadowColor: palette.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.22,
    shadowRadius: 22,
    elevation: 8
  },
  logoLine: {
    width: 3,
    height: 22,
    borderRadius: 2,
    backgroundColor: palette.panel
  },
  title: {
    marginTop: 18,
    color: palette.text,
    fontSize: 26,
    lineHeight: 31,
    fontWeight: "900",
    textAlign: "center"
  },
  subtitle: {
    marginTop: 8,
    color: palette.muted,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "500",
    textAlign: "center"
  },
  formSection: {
    flexGrow: 1,
    paddingHorizontal: 10,
    paddingTop: 22,
    paddingBottom: 30,
    backgroundColor: palette.formBackground
  },
  segmentedControl: {
    minHeight: 40,
    borderRadius: 9,
    padding: 3,
    flexDirection: "row",
    gap: 4,
    backgroundColor: palette.segment
  },
  segmentButton: {
    flex: 1,
    minHeight: 34,
    borderRadius: 7,
    alignItems: "center",
    justifyContent: "center"
  },
  segmentButtonActive: {
    backgroundColor: palette.panel,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 5,
    elevation: 2
  },
  segmentButtonPressed: {
    opacity: 0.78
  },
  segmentButtonText: {
    color: palette.muted,
    fontSize: 12,
    fontWeight: "800",
    textAlign: "center"
  },
  segmentButtonTextActive: {
    color: palette.text
  },
  errorText: {
    marginTop: 16,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    overflow: "hidden",
    color: palette.danger,
    backgroundColor: palette.dangerSoft,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "700"
  },
  fieldGroup: {
    marginTop: 22,
    gap: 7
  },
  label: {
    color: palette.text,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "800"
  },
  input: {
    minHeight: 44,
    borderWidth: 1,
    borderColor: palette.inputBorder,
    borderRadius: 9,
    paddingHorizontal: 14,
    color: palette.text,
    backgroundColor: palette.panel,
    fontSize: 14,
    fontWeight: "500"
  },
  passwordInput: {
    minHeight: 44,
    borderWidth: 1,
    borderColor: palette.inputBorder,
    borderRadius: 9,
    paddingLeft: 14,
    paddingRight: 4,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: palette.panel
  },
  passwordTextInput: {
    flex: 1,
    minWidth: 0,
    minHeight: 42,
    paddingVertical: 0,
    color: palette.text,
    fontSize: 14,
    fontWeight: "500"
  },
  eyeButton: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center"
  },
  primaryButton: {
    minHeight: 44,
    marginTop: 22,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: palette.primary,
    shadowColor: palette.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.26,
    shadowRadius: 16,
    elevation: 5
  },
  primaryButtonPressed: {
    backgroundColor: palette.primaryPressed,
    transform: [{ translateY: 1 }]
  },
  disabledButton: {
    opacity: 0.68
  },
  primaryButtonText: {
    color: palette.panel,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "900",
    textAlign: "center"
  },
  textLink: {
    minHeight: 44,
    marginTop: 8,
    alignItems: "center",
    justifyContent: "center"
  },
  textLinkLabel: {
    color: "#0b57ff",
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center"
  }
});
