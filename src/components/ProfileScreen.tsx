import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system/legacy";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useState } from "react";
import { Alert, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { styles } from "../styles/appStyles";
import { AuthUser, UpdateProfilePayload } from "../types/app";
import { PLAN_LABELS } from "../utils/appHelpers";

type ProfileScreenProps = {
  user: AuthUser;
  loading: boolean;
  onUpdateProfile: (payload: UpdateProfilePayload) => Promise<void>;
  onUpgradePlan: () => void;
};

type SelectedProfilePhoto = {
  uri: string;
  fileName: string;
  mimeType: string;
  base64: string;
};

export function ProfileScreen({ user, loading, onUpdateProfile, onUpgradePlan }: ProfileScreenProps) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [photoUrl, setPhotoUrl] = useState(user.photoUrl || "");
  const [selectedPhoto, setSelectedPhoto] = useState<SelectedProfilePhoto | null>(null);
  const [removePhoto, setRemovePhoto] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    setName(user.name);
    setEmail(user.email);
    setPhotoUrl(user.photoUrl || "");
    setSelectedPhoto(null);
    setRemovePhoto(false);
  }, [user._id, user.name, user.email, user.photoUrl]);

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
    await onUpdateProfile({
      name,
      email,
      photoFileBase64: selectedPhoto?.base64,
      photoFileName: selectedPhoto?.fileName,
      photoMimeType: selectedPhoto?.mimeType,
      removePhoto,
      currentPassword: currentPassword || undefined,
      newPassword: newPassword || undefined
    });
    setSelectedPhoto(null);
    setRemovePhoto(false);
    setCurrentPassword("");
    setNewPassword("");
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
                <Ionicons name="person-outline" size={34} color="#0f766e" />
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
            <Ionicons name="arrow-up-circle-outline" size={18} color="#0f766e" />
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
