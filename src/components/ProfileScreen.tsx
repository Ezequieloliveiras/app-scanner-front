import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system/legacy";
import * as ImagePicker from "expo-image-picker";
import { ReactNode, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { primaryShadow, softShadow } from "../styles/appStyles";
import { AuthUser, UpdateProfilePayload } from "../types/app";
import { PLAN_LABELS } from "../utils/appHelpers";
import { normalizeCameraEnabled, shouldHydrateCameraPreference } from "../utils/cameraPreference";

type ProfileScreenProps = {
  user: AuthUser;
  loading: boolean;
  onUpdateProfile: (payload: UpdateProfilePayload, options?: { silent?: boolean }) => Promise<AuthUser | undefined>;
  onUpgradePlan: () => void;
};

type SelectedProfilePhoto = {
  uri: string;
  fileName: string;
  mimeType: string;
  base64: string;
};

export function ProfileScreen({ user, loading, onUpdateProfile, onUpgradePlan }: ProfileScreenProps) {
  const cameraPreferenceDirtyRef = useRef(false);
  const cameraPreferenceSavingRef = useRef(false);
  const loadedUserIdRef = useRef(user._id);
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [photoUrl, setPhotoUrl] = useState(user.photoUrl || "");
  const [selectedPhoto, setSelectedPhoto] = useState<SelectedProfilePhoto | null>(null);
  const [removePhoto, setRemovePhoto] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [currentPasswordVisible, setCurrentPasswordVisible] = useState(false);
  const [cameraEnabled, setCameraEnabled] = useState(normalizeCameraEnabled(user.cameraEnabled));
  const [cameraPreferenceSaving, setCameraPreferenceSaving] = useState(false);

  useEffect(() => {
    const normalizedCameraEnabled = normalizeCameraEnabled(user.cameraEnabled);
    debugAutomaticCamera("API loaded", user.cameraEnabled);
    debugAutomaticCamera("normalized", normalizedCameraEnabled);

    if (!shouldHydrateCameraPreference(loadedUserIdRef.current, user._id, cameraPreferenceDirtyRef.current)) {
      return;
    }

    loadedUserIdRef.current = user._id;
    cameraPreferenceDirtyRef.current = false;
    setName(user.name);
    setEmail(user.email);
    setPhotoUrl(user.photoUrl || "");
    setCameraEnabled(normalizedCameraEnabled);
    setSelectedPhoto(null);
    setRemovePhoto(false);
  }, [user._id, user.name, user.email, user.photoUrl, user.cameraEnabled]);

  async function pickProfilePhoto() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permissão necessária", "Libere acesso as fotos para anexar uma imagem de perfil.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.82
    });

    if (result.canceled || !result.assets[0]?.uri) {
      return;
    }

    const asset = result.assets[0];
    const fileName = asset.fileName || asset.uri.split("/").pop() || "profile-photo.jpg";
    const mimeType = asset.mimeType || inferMimeType(fileName);
    const isAcceptedImage = ["image/png", "image/jpeg", "image/jpg", "image/webp"].includes(mimeType);

    if (!isAcceptedImage) {
      Alert.alert("Formato inválido", "Escolha uma imagem PNG, JPG, JPEG ou WEBP.");
      return;
    }

    const base64 = await FileSystem.readAsStringAsync(asset.uri, {
      encoding: FileSystem.EncodingType.Base64
    });

    setSelectedPhoto({
      uri: asset.uri,
      fileName,
      mimeType,
      base64
    });
    setRemovePhoto(false);
    setPhotoUrl(asset.uri);
  }

  function clearProfilePhoto() {
    setSelectedPhoto(null);
    setRemovePhoto(true);
    setPhotoUrl("");
  }

  async function submitProfile() {
    const payload: UpdateProfilePayload = {
      name,
      email,
      photoFileBase64: selectedPhoto?.base64,
      photoFileName: selectedPhoto?.fileName,
      photoMimeType: selectedPhoto?.mimeType,
      removePhoto,
      cameraEnabled,
      currentPassword: currentPassword || undefined,
      newPassword: newPassword || undefined
    };
    debugAutomaticCamera("state before save", cameraEnabled);
    debugAutomaticCamera("payload", payload.cameraEnabled);

    const updatedUser = await onUpdateProfile(payload);
    cameraPreferenceDirtyRef.current = false;

    if (updatedUser) {
      setCameraEnabled(normalizeCameraEnabled(updatedUser.cameraEnabled));
    }

    setSelectedPhoto(null);
    setRemovePhoto(false);
    setCurrentPassword("");
    setNewPassword("");
  }

  async function toggleCameraPreference() {
    if (cameraPreferenceSavingRef.current) return;

    const previousCameraEnabled = cameraEnabled;
    const nextCameraEnabled = !previousCameraEnabled;
    cameraPreferenceDirtyRef.current = true;
    cameraPreferenceSavingRef.current = true;
    setCameraPreferenceSaving(true);
    setCameraEnabled(nextCameraEnabled);
    debugAutomaticCamera("user changed", nextCameraEnabled);

    try {
      const updatedUser = await onUpdateProfile({ cameraEnabled: nextCameraEnabled }, { silent: true });

      if (updatedUser) {
        setCameraEnabled(normalizeCameraEnabled(updatedUser.cameraEnabled));
      } else {
        setCameraEnabled(previousCameraEnabled);
      }
    } finally {
      cameraPreferenceDirtyRef.current = false;
      cameraPreferenceSavingRef.current = false;
      setCameraPreferenceSaving(false);
    }
  }

  return (
    <KeyboardAvoidingView style={profileStyles.keyboard} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView
        style={profileStyles.scrollArea}
        contentContainerStyle={profileStyles.scrollContent}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
        showsVerticalScrollIndicator={false}
      >
        <View style={profileStyles.profileHero}>
          <Pressable
            style={profileStyles.avatarButton}
            onPress={pickProfilePhoto}
            accessibilityRole="button"
            accessibilityLabel="Alterar foto do perfil"
          >
            <View style={profileStyles.avatar}>
              {photoUrl ? (
                <Image source={{ uri: photoUrl }} style={profileStyles.avatarImage} />
              ) : (
                <Text style={profileStyles.avatarInitial}>{getUserInitial(user.name)}</Text>
              )}
            </View>
            <View style={profileStyles.cameraBadge}>
              <Ionicons name="camera-outline" size={14} color="#ffffff" />
            </View>
          </Pressable>
          <Text style={profileStyles.profileName}>{user.name}</Text>
          <Text style={profileStyles.profileEmail}>{user.email}</Text>
          <View style={profileStyles.badgeRow}>
            <Text style={profileStyles.profileBadge}>{PLAN_LABELS[user.plan]}</Text>
            <Text style={profileStyles.profileBadge}>{getRoleLabel(user.role)}</Text>
          </View>
          {photoUrl && (
            <Pressable
              style={[profileStyles.removePhotoButton, loading && profileStyles.disabled]}
              disabled={loading}
              onPress={clearProfilePhoto}
              accessibilityRole="button"
              accessibilityLabel="Remover foto do perfil"
            >
              <Text style={profileStyles.removePhotoText}>Remover foto</Text>
            </Pressable>
          )}
        </View>

        <Pressable
          style={({ pressed }) => [profileStyles.planButton, pressed && profileStyles.pressed]}
          onPress={onUpgradePlan}
          accessibilityRole="button"
          accessibilityLabel="Ver planos e upgrades"
        >
          <Text style={profileStyles.planButtonText}>Ver planos e upgrades</Text>
          <Ionicons name="chevron-forward-outline" size={17} color="#2563EB" />
        </Pressable>

        <View style={profileStyles.accountCard}>
          <Text style={profileStyles.cardTitle}>Minha conta</Text>
          <View style={profileStyles.cardDivider} />

          <ProfileField label="Nome" accessibilityLabel="Nome">
            <TextInput value={name} onChangeText={setName} style={profileStyles.input} returnKeyType="next" />
          </ProfileField>

          <ProfileField label="E-mail" accessibilityLabel="E-mail">
            <TextInput
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              style={profileStyles.input}
              returnKeyType="next"
            />
          </ProfileField>

          <ProfileField label="Senha atual para alterar e-mail ou senha" accessibilityLabel="Senha atual">
            <View style={profileStyles.passwordInputWrap}>
              <TextInput
                value={currentPassword}
                onChangeText={setCurrentPassword}
                secureTextEntry={!currentPasswordVisible}
                style={profileStyles.passwordInput}
                returnKeyType="next"
                accessibilityLabel="Senha atual para alterar e-mail ou senha"
              />
              <Pressable
                style={profileStyles.eyeButton}
                onPress={() => setCurrentPasswordVisible((current) => !current)}
                accessibilityRole="button"
                accessibilityLabel={currentPasswordVisible ? "Ocultar senha atual" : "Visualizar senha atual"}
              >
                <Ionicons name={currentPasswordVisible ? "eye-off-outline" : "eye-outline"} size={15} color="#94A3B8" />
              </Pressable>
            </View>
          </ProfileField>

          <ProfileField label="Nova senha" accessibilityLabel="Nova senha">
            <TextInput
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="Deixe em branco para não alterar"
              placeholderTextColor="#94A3B8"
              secureTextEntry
              style={profileStyles.input}
              returnKeyType="done"
              onSubmitEditing={submitProfile}
            />
          </ProfileField>
        </View>

        <Pressable
          style={({ pressed }) => [
            profileStyles.cameraCard,
            pressed && !loading && !cameraPreferenceSaving && profileStyles.pressed,
            (loading || cameraPreferenceSaving) && profileStyles.disabled
          ]}
          disabled={loading || cameraPreferenceSaving}
          onPress={toggleCameraPreference}
          accessibilityRole="switch"
          accessibilityLabel="Câmera automática"
          accessibilityState={{ checked: cameraEnabled, disabled: loading || cameraPreferenceSaving }}
        >
          <View style={profileStyles.cameraTextArea}>
            <Text style={profileStyles.cameraTitle}>Câmera automática</Text>
            <Text style={profileStyles.cameraDescription}>Inicia a câmera ao abrir o scanner</Text>
          </View>
          <View style={[profileStyles.switchTrack, cameraEnabled && profileStyles.switchTrackActive]}>
            <View style={[profileStyles.switchKnob, cameraEnabled && profileStyles.switchKnobActive]} />
          </View>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            profileStyles.saveButton,
            pressed && !loading && profileStyles.saveButtonPressed,
            loading && profileStyles.disabled
          ]}
          disabled={loading}
          onPress={submitProfile}
          accessibilityRole="button"
          accessibilityLabel="Salvar perfil"
        >
          {loading && <ActivityIndicator color="#ffffff" />}
          <Text style={profileStyles.saveButtonText}>Salvar perfil</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function ProfileField({
  label,
  accessibilityLabel,
  children
}: {
  label: string;
  accessibilityLabel: string;
  children: ReactNode;
}) {
  return (
    <View style={profileStyles.fieldGroup} accessibilityLabel={accessibilityLabel}>
      <Text style={profileStyles.fieldLabel}>{label}</Text>
      {children}
    </View>
  );
}

function getUserInitial(name: string) {
  return (name.trim()[0] || "U").toUpperCase();
}

function getRoleLabel(role: AuthUser["role"]) {
  if (role === "main") return "Principal";
  if (role === "master") return "Master";
  return "Usuário";
}

const profileStyles = StyleSheet.create({
  keyboard: {
    flex: 1,
    backgroundColor: "#F7F9FC"
  },
  scrollArea: {
    flex: 1,
    backgroundColor: "#F7F9FC"
  },
  scrollContent: {
    paddingHorizontal: 7,
    paddingTop: 22,
    paddingBottom: 36
  },
  profileHero: {
    alignItems: "center",
    paddingBottom: 17
  },
  avatarButton: {
    width: 86,
    height: 78,
    alignItems: "center",
    justifyContent: "flex-start"
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    backgroundColor: "#DBEAFE"
  },
  avatarImage: {
    width: "100%",
    height: "100%"
  },
  avatarInitial: {
    color: "#2563EB",
    fontSize: 29,
    lineHeight: 34,
    fontWeight: "900"
  },
  cameraBadge: {
    position: "absolute",
    right: 3,
    bottom: 2,
    width: 31,
    height: 31,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#F7F9FC",
    backgroundColor: "#2563EB"
  },
  profileName: {
    marginTop: 7,
    color: "#020617",
    fontSize: 15,
    lineHeight: 19,
    fontWeight: "900",
    textAlign: "center"
  },
  profileEmail: {
    marginTop: 2,
    color: "#8A9AB3",
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "500",
    textAlign: "center"
  },
  badgeRow: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8
  },
  profileBadge: {
    minHeight: 18,
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingTop: 2,
    overflow: "hidden",
    color: "#2563EB",
    backgroundColor: "#EAF2FF",
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "800"
  },
  removePhotoButton: {
    marginTop: 8,
    minHeight: 24,
    paddingHorizontal: 10,
    justifyContent: "center"
  },
  removePhotoText: {
    color: "#DC2626",
    fontSize: 11,
    fontWeight: "800"
  },
  planButton: {
    minHeight: 42,
    borderWidth: 1,
    borderColor: "#BFDBFE",
    borderRadius: 9,
    paddingHorizontal: 14,
    marginHorizontal: 3,
    marginBottom: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#EFF6FF"
  },
  planButtonText: {
    color: "#2563EB",
    fontSize: 12,
    lineHeight: 15,
    fontWeight: "900"
  },
  accountCard: {
    borderWidth: 1,
    borderColor: "#DCE3EE",
    borderRadius: 10,
    paddingBottom: 16,
    marginBottom: 16,
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
    ...softShadow
  },
  cardTitle: {
    paddingHorizontal: 16,
    paddingTop: 15,
    paddingBottom: 19,
    color: "#020617",
    fontSize: 15,
    lineHeight: 19,
    fontWeight: "900"
  },
  cardDivider: {
    height: 1,
    marginBottom: 14,
    backgroundColor: "#EEF2F7"
  },
  fieldGroup: {
    paddingHorizontal: 16,
    marginBottom: 13
  },
  fieldLabel: {
    marginBottom: 7,
    color: "#020617",
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "500"
  },
  input: {
    minHeight: 43,
    borderWidth: 1,
    borderColor: "#DCE3EE",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 0,
    color: "#020617",
    backgroundColor: "#FFFFFF",
    fontSize: 12,
    lineHeight: 15,
    fontWeight: "500"
  },
  passwordInputWrap: {
    minHeight: 43,
    borderWidth: 1,
    borderColor: "#DCE3EE",
    borderRadius: 8,
    paddingLeft: 14,
    paddingRight: 8,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF"
  },
  passwordInput: {
    flex: 1,
    minHeight: 41,
    paddingVertical: 0,
    color: "#020617",
    fontSize: 12,
    lineHeight: 15,
    fontWeight: "500"
  },
  eyeButton: {
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center"
  },
  cameraCard: {
    minHeight: 66,
    borderWidth: 1,
    borderColor: "#DCE3EE",
    borderRadius: 10,
    paddingHorizontal: 16,
    marginBottom: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    backgroundColor: "#FFFFFF",
    ...softShadow
  },
  cameraTextArea: {
    flex: 1,
    minWidth: 0
  },
  cameraTitle: {
    color: "#020617",
    fontSize: 13,
    lineHeight: 16,
    fontWeight: "900"
  },
  cameraDescription: {
    marginTop: 4,
    color: "#94A3B8",
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "600"
  },
  switchTrack: {
    width: 44,
    height: 22,
    borderRadius: 11,
    padding: 2,
    justifyContent: "center",
    backgroundColor: "#E2E8F0"
  },
  switchTrackActive: {
    backgroundColor: "#BFDBFE"
  },
  switchKnob: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#FFFFFF",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.14,
    shadowRadius: 3,
    elevation: 2
  },
  switchKnobActive: {
    transform: [{ translateX: 22 }],
    backgroundColor: "#2563EB"
  },
  saveButton: {
    minHeight: 43,
    borderRadius: 7,
    marginHorizontal: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#2563EB",
    ...primaryShadow
  },
  saveButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }]
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    lineHeight: 16,
    fontWeight: "900"
  },
  pressed: {
    opacity: 0.84,
    transform: [{ scale: 0.99 }]
  },
  disabled: {
    opacity: 0.65
  }
});

function inferMimeType(fileName: string) {
  const normalized = fileName.toLowerCase();

  if (normalized.endsWith(".png")) return "image/png";
  if (normalized.endsWith(".webp")) return "image/webp";
  return "image/jpeg";
}

function debugAutomaticCamera(label: string, value: unknown) {
  if (typeof __DEV__ !== "undefined" && __DEV__) {
    console.debug(`[AutomaticCamera] ${label}:`, value);
  }
}
