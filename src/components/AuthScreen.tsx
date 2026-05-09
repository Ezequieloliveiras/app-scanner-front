import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { styles } from "../styles/appStyles";
import { AuthMode, RegisterCredentials } from "../types/app";

type AuthScreenProps = {
  loading: boolean;
  error: string | null;
  onLogin: (email: string, password: string) => Promise<void>;
  onRegister: (payload: RegisterCredentials) => Promise<void>;
  onRequestPasswordReset: (email: string) => Promise<void>;
};

export function AuthScreen({ loading, error, onLogin, onRegister, onRequestPasswordReset }: AuthScreenProps) {
  const [mode, setMode] = useState<AuthMode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function submit() {
    if (mode === "reset") {
      await onRequestPasswordReset(email);
      return;
    }

    if (mode === "login") {
      await onLogin(email, password);
      return;
    }

    await onRegister({ name, email, password });
  }

  return (
    <KeyboardAvoidingView
      style={styles.screenBody}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 16 : 0}
    >
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.authContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.authHero}>
          <View style={styles.authIcon}>
            <Ionicons name="shield-checkmark-outline" size={30} color="#0f766e" />
          </View>
          <Text style={styles.homeEyebrow}>Controle de acesso</Text>
          <Text style={styles.homeTitle}>
            {mode === "login" && "Entrar no estoque inteligente."}
            {mode === "register" && "Criar acesso ao sistema."}
            {mode === "reset" && "Redefinir senha da conta."}
          </Text>
        </View>

        <View style={styles.authPanel}>
          <View style={styles.authTabs}>
            <Pressable style={[styles.authTab, mode === "login" && styles.authTabActive]} onPress={() => setMode("login")}>
              <Text style={[styles.authTabText, mode === "login" && styles.authTabTextActive]}>Entrar</Text>
            </Pressable>
            <Pressable style={[styles.authTab, mode === "register" && styles.authTabActive]} onPress={() => setMode("register")}>
              <Text style={[styles.authTabText, mode === "register" && styles.authTabTextActive]}>Registre-se</Text>
            </Pressable>
          </View>

          {error && <Text style={styles.errorText}>{error}</Text>}

          {mode === "register" && (
            <>
              <Text style={styles.fieldLabel}>Nome</Text>
              <TextInput value={name} onChangeText={setName} placeholder="Seu nome" style={styles.quantityInput} returnKeyType="next" />
            </>
          )}

          <Text style={styles.fieldLabel}>E-mail</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="e-mail@empresa.com"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            textContentType="emailAddress"
            returnKeyType="next"
            style={styles.quantityInput}
          />

          {mode !== "reset" && (
            <>
              <Text style={styles.fieldLabel}>Senha</Text>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder={"M\u00ednimo 6 caracteres"}
                secureTextEntry
                textContentType={mode === "login" ? "password" : "newPassword"}
                returnKeyType="done"
                onSubmitEditing={submit}
                style={styles.quantityInput}
              />
            </>
          )}

          <Pressable style={[styles.primaryButton, loading && styles.disabledButton]} disabled={loading} onPress={submit}>
            <Ionicons
              name={mode === "login" ? "log-in-outline" : mode === "register" ? "person-add-outline" : "mail-outline"}
              size={18}
              color="#ffffff"
            />
            <Text style={styles.primaryButtonText}>
              {mode === "login" && "Entrar"}
              {mode === "register" && "Criar acesso"}
              {mode === "reset" && "Enviar e-mail de redefini\u00e7\u00e3o"}
            </Text>
          </Pressable>

          {mode === "login" ? (
            <Pressable style={styles.secondaryButton} disabled={loading} onPress={() => setMode("reset")}>
              <Ionicons name="key-outline" size={18} color="#0f766e" />
              <Text style={styles.secondaryButtonText}>Redefinir senha</Text>
            </Pressable>
          ) : (
            <Pressable style={styles.secondaryButton} disabled={loading} onPress={() => setMode("login")}>
              <Ionicons name="arrow-back-outline" size={18} color="#0f766e" />
              <Text style={styles.secondaryButtonText}>Voltar para login</Text>
            </Pressable>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
