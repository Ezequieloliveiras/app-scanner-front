import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
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
      Alert.alert("Formato inválido", "Envie um certificado em .pfx ou .p12.");
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
    Alert.alert("Remover certificado?", "As próximas consultas SEFAZ deixarão de usar este certificado.", [
      { text: "Voltar", style: "cancel" },
      {
        text: "Remover",
        style: "destructive",
        onPress: onDelete
      }
    ]);
  }

  const statusTitle = certificate ? "Certificado ativo" : "Certificado pendente";
  const statusBadge = certificate ? "Ativo" : "Pendente";
  const statusText = certificate ? "Certificado configurado para esta organização." : "Nenhum certificado configurado.";
  const displayedFileName = selectedFile?.name || certificate?.originalFileName || "";

  return (
    <KeyboardAvoidingView style={certificateStyles.root} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView
        style={certificateStyles.scrollArea}
        contentContainerStyle={certificateStyles.scrollContent}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
        showsVerticalScrollIndicator={false}
      >
        <View style={certificateStyles.statusCard}>
          <View style={certificateStyles.statusTopRow}>
            <View style={[certificateStyles.statusIconBox, !certificate && certificateStyles.statusIconBoxPending]}>
              <Ionicons name={certificate ? "checkmark-circle-outline" : "shield-outline"} size={17} color={certificate ? "#16A34A" : "#F59E0B"} />
            </View>
            <View style={certificateStyles.statusTextArea}>
              <View style={certificateStyles.statusTitleRow}>
                <Text style={certificateStyles.cardTitle}>{statusTitle}</Text>
                <Text style={[certificateStyles.statusBadge, !certificate && certificateStyles.statusBadgePending]}>{statusBadge}</Text>
              </View>
              <Text style={certificateStyles.statusDescription}>{statusText}</Text>
            </View>
          </View>

          {certificate && (
            <View style={certificateStyles.infoGrid}>
              <InfoTile label="ARQUIVO" value={certificate.originalFileName} />
              <InfoTile label="DOCUMENTO" value={formatDocument(certificate.documentNumber, certificate.documentType)} />
              <InfoTile label="AMBIENTE" value={certificate.ambiente === "1" ? "Produção" : "Homologação"} />
              <InfoTile label="VALIDADE" value={formatDate(certificate.certificateValidTo)} />
            </View>
          )}
        </View>

        <View style={certificateStyles.formCard}>
          <Text style={certificateStyles.formTitle}>Editar certificado</Text>

          <Text style={certificateStyles.fieldLabel}>Documento</Text>
          <View style={certificateStyles.segmentRow}>
            {(["CNPJ", "CPF"] as CertificateDocumentType[]).map((type) => (
              <Pressable
                key={type}
                style={[certificateStyles.segmentButtonBlue, documentType === type && certificateStyles.segmentButtonBlueActive]}
                onPress={() => {
                  setDocumentType(type);
                  setDocumentNumber("");
                }}
                accessibilityRole="button"
                accessibilityLabel={`Selecionar ${type}`}
              >
                <Text style={[certificateStyles.segmentText, documentType === type && certificateStyles.segmentTextActive]}>{type}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={certificateStyles.fieldLabel}>{documentType}</Text>
          <TextInput
            value={documentNumber}
            onChangeText={(value) => setDocumentNumber(formatDocument(value, documentType))}
            placeholder={documentType === "CNPJ" ? "00.000.000/0000-00" : "000.000.000-00"}
            placeholderTextColor="#94A3B8"
            keyboardType="number-pad"
            style={certificateStyles.input}
            accessibilityLabel={documentType}
          />

          <Text style={certificateStyles.fieldLabel}>Ambiente</Text>
          <View style={certificateStyles.segmentRow}>
            {([
              { value: "1" as const, label: "Produção" },
              { value: "2" as const, label: "Homologação" }
            ]).map((option) => (
              <Pressable
                key={option.value}
                style={[certificateStyles.segmentButtonDark, ambiente === option.value && certificateStyles.segmentButtonDarkActive]}
                onPress={() => setAmbiente(option.value)}
                accessibilityRole="button"
                accessibilityLabel={`Selecionar ${option.label}`}
              >
                <Text style={[certificateStyles.segmentText, ambiente === option.value && certificateStyles.segmentTextDarkActive]}>
                  {option.label}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={certificateStyles.fieldLabel}>UF autorizadora</Text>
          <TextInput
            value={cUFAutor}
            onChangeText={(value) => setCUFAutor(value.replace(/\D/g, "").slice(0, 2))}
            placeholder="UF autorizadora"
            placeholderTextColor="#94A3B8"
            keyboardType="number-pad"
            maxLength={2}
            style={certificateStyles.input}
            accessibilityLabel="UF autorizadora"
          />

          <Text style={certificateStyles.fieldLabel}>Arquivo do certificado</Text>
          {displayedFileName ? (
            <Pressable style={certificateStyles.fileSelectedRow} disabled={loading} onPress={pickCertificate} accessibilityRole="button" accessibilityLabel="Escolher arquivo">
              <Ionicons name="document-outline" size={15} color="#16A34A" />
              <Text style={certificateStyles.fileSelectedText} numberOfLines={1}>{displayedFileName}</Text>
              <Pressable
                style={certificateStyles.fileTrashButton}
                disabled={!selectedFile}
                onPress={() => setSelectedFile(null)}
                accessibilityRole="button"
                accessibilityLabel="Remover arquivo selecionado"
              >
                <Ionicons name="trash-outline" size={13} color={selectedFile ? "#94A3B8" : "#CBD5E1"} />
              </Pressable>
            </Pressable>
          ) : (
            <Pressable style={certificateStyles.filePickerButton} disabled={loading} onPress={pickCertificate} accessibilityRole="button" accessibilityLabel="Escolher arquivo">
              <Ionicons name="document-attach-outline" size={15} color="#2563EB" />
              <Text style={certificateStyles.filePickerText}>Selecionar arquivo</Text>
            </Pressable>
          )}

          <Text style={certificateStyles.fieldLabel}>Senha do certificado</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Deixe em branco para manter"
            placeholderTextColor="#94A3B8"
            secureTextEntry
            style={certificateStyles.input}
            returnKeyType="done"
            onSubmitEditing={submit}
            accessibilityLabel="Senha do certificado"
          />
        </View>

        <Pressable
          style={({ pressed }) => [certificateStyles.saveButton, loading && certificateStyles.disabledButton, pressed && !loading && certificateStyles.pressed]}
          disabled={loading}
          onPress={submit}
          accessibilityRole="button"
          accessibilityLabel="Salvar certificado"
        >
          {loading ? <ActivityIndicator color="#FFFFFF" size="small" /> : <Text style={certificateStyles.saveButtonText}>Salvar certificado</Text>}
        </Pressable>

        {certificate && (
          <Pressable
            style={({ pressed }) => [certificateStyles.removeButton, loading && certificateStyles.disabledButton, pressed && !loading && certificateStyles.pressed]}
            disabled={loading}
            onPress={confirmDelete}
            accessibilityRole="button"
            accessibilityLabel="Remover certificado"
          >
            <Ionicons name="trash-outline" size={14} color="#EF4444" />
            <Text style={certificateStyles.removeButtonText}>Remover certificado</Text>
          </Pressable>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <View style={certificateStyles.infoTile}>
      <Text style={certificateStyles.infoLabel}>{label}</Text>
      <Text style={certificateStyles.infoValue} numberOfLines={1}>{value}</Text>
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

const certificateStyles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#F7F9FC"
  },
  scrollArea: {
    flex: 1
  },
  scrollContent: {
    paddingTop: 12,
    paddingHorizontal: 10,
    paddingBottom: 22
  },
  statusCard: {
    borderWidth: 1,
    borderColor: "#DCE3EE",
    borderRadius: 11,
    padding: 12,
    backgroundColor: "#FFFFFF",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 7,
    elevation: 2
  },
  statusTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 11
  },
  statusIconBox: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ECFDF3"
  },
  statusIconBoxPending: {
    backgroundColor: "#FFF7ED"
  },
  statusTextArea: {
    flex: 1,
    minWidth: 0
  },
  statusTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  cardTitle: {
    color: "#020617",
    fontSize: 12,
    lineHeight: 15,
    fontWeight: "900"
  },
  statusBadge: {
    borderRadius: 999,
    paddingHorizontal: 7,
    paddingVertical: 2,
    overflow: "hidden",
    color: "#16A34A",
    backgroundColor: "#ECFDF3",
    fontSize: 8,
    lineHeight: 11,
    fontWeight: "900"
  },
  statusBadgePending: {
    color: "#B45309",
    backgroundColor: "#FEF3C7"
  },
  statusDescription: {
    marginTop: 3,
    color: "#64748B",
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "500"
  },
  infoGrid: {
    marginTop: 12,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  infoTile: {
    width: "48%",
    minHeight: 38,
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 7,
    backgroundColor: "#F7F9FC"
  },
  infoLabel: {
    color: "#7C8DA5",
    fontSize: 7,
    lineHeight: 9,
    fontWeight: "900"
  },
  infoValue: {
    marginTop: 4,
    color: "#0F172A",
    fontSize: 9,
    lineHeight: 12,
    fontWeight: "800"
  },
  formCard: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#DCE3EE",
    borderRadius: 11,
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: "#FFFFFF",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 7,
    elevation: 2
  },
  formTitle: {
    marginBottom: 12,
    color: "#020617",
    fontSize: 13,
    lineHeight: 16,
    fontWeight: "900"
  },
  fieldLabel: {
    marginBottom: 7,
    color: "#0F172A",
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "800"
  },
  segmentRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 14
  },
  segmentButtonBlue: {
    flex: 1,
    height: 36,
    borderWidth: 1,
    borderColor: "#DCE3EE",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF"
  },
  segmentButtonBlueActive: {
    borderColor: "#2563EB",
    backgroundColor: "#2563EB"
  },
  segmentButtonDark: {
    flex: 1,
    height: 36,
    borderWidth: 1,
    borderColor: "#DCE3EE",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF"
  },
  segmentButtonDarkActive: {
    borderColor: "#071426",
    backgroundColor: "#071426"
  },
  segmentText: {
    color: "#475569",
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "800"
  },
  segmentTextActive: {
    color: "#FFFFFF",
    fontWeight: "900"
  },
  segmentTextDarkActive: {
    color: "#FFFFFF",
    fontWeight: "900"
  },
  input: {
    height: 42,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#DCE3EE",
    borderRadius: 8,
    paddingHorizontal: 12,
    color: "#0F172A",
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "600",
    backgroundColor: "#FFFFFF"
  },
  fileSelectedRow: {
    height: 36,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#86EFAC",
    borderRadius: 8,
    paddingHorizontal: 11,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#ECFDF3"
  },
  fileSelectedText: {
    flex: 1,
    minWidth: 0,
    color: "#16A34A",
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "800"
  },
  fileTrashButton: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center"
  },
  filePickerButton: {
    height: 36,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#DCE3EE",
    borderRadius: 8,
    paddingHorizontal: 11,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    backgroundColor: "#FFFFFF"
  },
  filePickerText: {
    color: "#2563EB",
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "900"
  },
  saveButton: {
    height: 43,
    marginTop: 10,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2563EB",
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 3
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "900"
  },
  removeButton: {
    height: 43,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#FCA5A5",
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    backgroundColor: "#FFF1F2"
  },
  removeButtonText: {
    color: "#EF4444",
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "900"
  },
  disabledButton: {
    opacity: 0.65
  },
  pressed: {
    opacity: 0.84
  }
});
