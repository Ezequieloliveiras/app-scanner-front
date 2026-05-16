import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import { useEffect, useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { styles } from "../styles/appStyles";
import {
  CertificateDocumentType,
  CertificateStatus,
  SefazEnvironment,
  UpsertCertificatePayload
} from "../types/app";

type SelectedCertificateFile = {
  name: string;
  base64: string;
  size?: number;
};

type CertificateScreenProps = {
  status: CertificateStatus | null;
  loading: boolean;
  onRefresh: () => Promise<void>;
  onSave: (payload: UpsertCertificatePayload) => Promise<void>;
  onDelete: () => Promise<void>;
};

export function CertificateScreen({ status, loading, onRefresh, onSave, onDelete }: CertificateScreenProps) {
  const certificate = status?.certificate || null;
  const [documentType, setDocumentType] = useState<CertificateDocumentType>("CNPJ");
  const [documentNumber, setDocumentNumber] = useState("");
  const [cUFAutor, setCUFAutor] = useState("");
  const [ambiente, setAmbiente] = useState<SefazEnvironment>("1");
  const [password, setPassword] = useState("");
  const [selectedFile, setSelectedFile] = useState<SelectedCertificateFile | null>(null);

  useEffect(() => {
    onRefresh().catch(() => undefined);
  }, [onRefresh]);

  useEffect(() => {
    if (!certificate) return;

    setDocumentType(certificate.documentType);
    setDocumentNumber(formatDocument(certificate.documentNumber, certificate.documentType));
    setCUFAutor(certificate.cUFAutor || "");
    setAmbiente(certificate.ambiente);
  }, [certificate?.id, certificate?.updatedAt]);

  async function pickCertificate() {
    const result = await DocumentPicker.getDocumentAsync({
      type: ["application/x-pkcs12", "application/pkcs12", "application/octet-stream", "*/*"],
      copyToCacheDirectory: true,
      multiple: false
    });

    if (result.canceled || !result.assets?.[0]) {
      return;
    }

    const asset = result.assets[0];
    const fileName = asset.name || "certificado.pfx";
    const normalizedName = fileName.toLowerCase();

    if (!normalizedName.endsWith(".pfx") && !normalizedName.endsWith(".p12")) {
      Alert.alert("Formato inválidolido", "Envie um certificado em .pfx ou .p12.");
      return;
    }

    const base64 = await FileSystem.readAsStringAsync(asset.uri, {
      encoding: FileSystem.EncodingType.Base64
    });

    setSelectedFile({
      name: fileName,
      base64,
      size: asset.size
    });
  }

  async function submit() {
    const digits = documentNumber.replace(/\D/g, "");

    if (documentType === "CNPJ" && digits.length !== 14) {
      Alert.alert("CNPJ inválido", "Informe um CNPJ com 14 digitos.");
      return;
    }

    if (documentType === "CPF" && digits.length !== 11) {
      Alert.alert("CPF inválido", "Informe um CPF com 11 digitos.");
      return;
    }

    if (!certificate && (!selectedFile || !password.trim())) {
      Alert.alert("Certificado incompleto", "Selecione o arquivo e informe a senha.");
      return;
    }

    await onSave({
      documentType,
      documentNumber: digits,
      cUFAutor: cUFAutor.replace(/\D/g, "") || undefined,
      ambiente,
      fileName: selectedFile?.name,
      fileBase64: selectedFile?.base64,
      password: password.trim() || undefined
    });
    setPassword("");
    setSelectedFile(null);
  }

  function confirmDelete() {
    Alert.alert("Remover certificado?", "As proximas consultas SEFAZ deixarão de usar este A1.", [
      { text: "Voltar", style: "cancel" },
      {
        text: "Remover",
        style: "destructive",
        onPress: onDelete
      }
    ]);
  }

  return (
    <KeyboardAvoidingView style={styles.screenBody} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentInner}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
      >
        <View style={styles.accessCard}>
          <View style={styles.pendingHeader}>
            <View style={styles.pendingTitleArea}>
              <Text style={styles.sectionTitle}>Certificado</Text>
              <Text style={styles.sectionSubtitle}>
                {certificate ? "Certificado configurado para esta organizacão." : "Nenhum certificado configurado."}
              </Text>
            </View>
            <View style={[styles.certificateStatusBadge, certificate ? styles.certificateStatusOk : styles.certificateStatusEmpty]}>
              <Ionicons
                name={certificate ? "shield-checkmark-outline" : "shield-outline"}
                size={17}
                color={certificate ? "#0f766e" : "#92400e"}
              />
              <Text style={[styles.certificateStatusText, !certificate && styles.certificateStatusTextEmpty]}>
                {certificate ? "Ativo" : "Pendente"}
              </Text>
            </View>
          </View>

          {certificate && (
            <View style={styles.certificateMetaGrid}>
              <InfoTile label="Arquivo" value={certificate.originalFileName} />
              <InfoTile label="Documento" value={`${certificate.documentType} ${formatDocument(certificate.documentNumber, certificate.documentType)}`} />
              <InfoTile label="Ambiente" value={certificate.ambiente === "1" ? "Produção" : "Homologação"} />
              <InfoTile label="Validade" value={formatDate(certificate.certificateValidTo)} />
            </View>
          )}
        </View>

        <View style={styles.accessCard}>
          <Text style={styles.sectionTitle}>{certificate ? "Editar certificado" : "Adicionar certificado"}</Text>

          <Text style={styles.fieldLabel}>Documento</Text>
          <View style={styles.roleRow}>
            {(["CNPJ", "CPF"] as CertificateDocumentType[]).map((type) => (
              <Pressable
                key={type}
                style={[styles.roleButton, documentType === type && styles.roleButtonActive]}
                onPress={() => {
                  setDocumentType(type);
                  setDocumentNumber("");
                }}
              >
                <Text style={[styles.roleButtonText, documentType === type && styles.roleButtonTextActive]}>{type}</Text>
              </Pressable>
            ))}
          </View>

          <TextInput
            value={documentNumber}
            onChangeText={(value) => setDocumentNumber(formatDocument(value, documentType))}
            placeholder={documentType === "CNPJ" ? "00.000.000/0000-00" : "000.000.000-00"}
            keyboardType="number-pad"
            style={styles.quantityInput}
          />

          <Text style={styles.fieldLabel}>Ambiente SEFAZ</Text>
          <View style={styles.roleRow}>
            {([
              { value: "1" as const, label: "Produção" },
              { value: "2" as const, label: "Homologação" }
            ]).map((option) => (
              <Pressable
                key={option.value}
                style={[styles.roleButton, ambiente === option.value && styles.roleButtonActive]}
                onPress={() => setAmbiente(option.value)}
              >
                <Text style={[styles.roleButtonText, ambiente === option.value && styles.roleButtonTextActive]}>
                  {option.label}
                </Text>
              </Pressable>
            ))}
          </View>

          <TextInput
            value={cUFAutor}
            onChangeText={(value) => setCUFAutor(value.replace(/\D/g, "").slice(0, 2))}
            placeholder="UF autorizadora (ex.: 35)"
            keyboardType="number-pad"
            maxLength={2}
            style={styles.quantityInput}
          />

          <Pressable style={styles.secondaryButton} disabled={loading} onPress={pickCertificate}>
            <Ionicons name="document-attach-outline" size={18} color="#0f766e" />
            <Text style={styles.secondaryButtonText}>{selectedFile ? "Trocar arquivo" : "Selecionar arquivo"}</Text>
          </Pressable>

          {selectedFile && (
            <View style={styles.transferIdRow}>
              <Ionicons name="document-text-outline" size={16} color="#334155" />
              <Text style={styles.transferIdValue}>
                {selectedFile.name}{selectedFile.size ? ` | ${formatFileSize(selectedFile.size)}` : ""}
              </Text>
            </View>
          )}

          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder={certificate ? "Senha do A1 (opcional se nào trocar)" : "Senha do A1"}
            secureTextEntry
            style={styles.quantityInput}
            returnKeyType="done"
            onSubmitEditing={submit}
          />

          <Pressable style={[styles.primaryButton, loading && styles.disabledButton]} disabled={loading} onPress={submit}>
            <Ionicons name="cloud-upload-outline" size={18} color="#ffffff" />
            <Text style={styles.primaryButtonText}>{certificate ? "Salvar certificado" : "Adicionar certificado"}</Text>
          </Pressable>

          {certificate && (
            <Pressable style={[styles.cancelButton, loading && styles.disabledButton]} disabled={loading} onPress={confirmDelete}>
              <Ionicons name="trash-outline" size={18} color="#991b1b" />
              <Text style={styles.cancelButtonText}>Remover certificado</Text>
            </Pressable>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.certificateInfoTile}>
      <Text style={styles.quantityCompareLabel}>{label}</Text>
      <Text style={styles.certificateInfoValue}>{value}</Text>
    </View>
  );
}

function formatDocument(value: string, type: CertificateDocumentType) {
  const digits = value.replace(/\D/g, "");

  if (type === "CPF") {
    return digits
      .slice(0, 11)
      .replace(/^(\d{3})(\d)/, "$1.$2")
      .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3-$4");
  }

  return digits
    .slice(0, 14)
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/^(\d{2})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3/$4")
    .replace(/^(\d{2})\.(\d{3})\.(\d{3})\/(\d{4})(\d)/, "$1.$2.$3/$4-$5");
}

function formatDate(value?: string) {
  if (!value) return "sem data";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "sem data";
  return date.toLocaleDateString("pt-BR");
}

function formatFileSize(value: number) {
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / 1024 / 1024).toFixed(1)} MB`;
}
