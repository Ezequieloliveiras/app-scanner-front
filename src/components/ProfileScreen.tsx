import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system/legacy";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useRef, useState } from "react";
import { Alert, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { styles } from "../styles/appStyles";
import { AuthUser, UpdateProfilePayload } from "../types/app";
import { PLAN_LABELS } from "../utils/appHelpers";
import { normalizeCameraEnabled, shouldHydrateCameraPreference } from "../utils/cameraPreference";
import { CameraPreferenceSwitch } from "./CameraPreferenceSwitch";

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
    <KeyboardAvoidingView style={styles.screenBody} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentInner}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
      >
        <View style={styles.profileCard}>
          <Pressable style={styles.profileAvatarButton} onPress={pickProfilePhoto}>
            <View style={styles.profileAvatar}>
              {photoUrl ? (
                <Image source={{ uri: photoUrl }} style={styles.profileAvatarImage} />
              ) : (
                <Ionicons name="person-outline" size={34} color="#3b82f6" />
              )}
            </View>
            <View style={styles.profileCameraBadge}>
              <Ionicons name="camera-outline" size={16} color="#ffffff" />
            </View>
          </Pressable>
          <Text style={styles.sectionTitle}>{user.name}</Text>
          <Text style={styles.meta}>{user.email}</Text>
          <Text style={styles.branchProductMeta}>
            {user.role.toUpperCase()} | Plano {PLAN_LABELS[user.plan]}
          </Text>
          <Pressable style={styles.secondaryButton} onPress={onUpgradePlan}>
            <Ionicons name="arrow-up-circle-outline" size={18} color="#3b82f6" />
            <Text style={styles.secondaryButtonText}>Ver planos e upgrades</Text>
          </Pressable>
          {photoUrl && (
            <Pressable style={[styles.cancelButton, loading && styles.disabledButton]} disabled={loading} onPress={clearProfilePhoto}>
              <Ionicons name="trash-outline" size={18} color="#991b1b" />
              <Text style={styles.cancelButtonText}>Remover foto</Text>
            </Pressable>
          )}
        </View>

        <View style={styles.accessCard}>
          <Text style={styles.sectionTitle}>Minha conta</Text>
          <CameraPreferenceSwitch enabled={cameraEnabled} disabled={loading || cameraPreferenceSaving} onPress={toggleCameraPreference} />
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
            value={currentPassword}
            onChangeText={setCurrentPassword}
            placeholder="Senha atual para alterar e-mail ou senha"
            secureTextEntry
            style={styles.quantityInput}
            returnKeyType="next"
          />
          <TextInput
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="Nova senha"
            secureTextEntry
            style={styles.quantityInput}
            returnKeyType="done"
            onSubmitEditing={submitProfile}
          />

          <Pressable style={[styles.primaryButton, loading && styles.disabledButton]} disabled={loading} onPress={submitProfile}>
            <Ionicons name="save-outline" size={18} color="#ffffff" />
            <Text style={styles.primaryButtonText}>Salvar perfil</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

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
