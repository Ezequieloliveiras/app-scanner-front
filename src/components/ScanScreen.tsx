import { Ionicons } from "@expo/vector-icons";
import { BarcodeScanningResult, BarcodeType, CameraView } from "expo-camera";
import { useEffect, useMemo, useRef, useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Pressable, Text, TextInput, View } from "react-native";
import { styles } from "../styles/appStyles";

type ScanMode = "barcode" | "qr" | "manual" | "ai";

export function ScanScreen({
  permissionGranted,
  loading,
  scannerEnabled,
  onRequestPermission,
  onBarcodeScanned,
  onManualSubmit,
  onCaptureWithAi,
  onSimulate,
  topInset
}: {
  permissionGranted?: boolean;
  loading: boolean;
  scannerEnabled: boolean;
  topInset: number;
  onRequestPermission: () => void;
  onBarcodeScanned: (result: BarcodeScanningResult) => void;
  onManualSubmit: (value: string) => void;
  onCaptureWithAi: () => void;
  onSimulate: () => void;
}) {
  const cameraRef = useRef<CameraView | null>(null);
  const [mode, setMode] = useState<ScanMode>("barcode");
  const [manualInput, setManualInput] = useState("");
  const [barcodeScanArmed, setBarcodeScanArmed] = useState(false);
  const [torchEnabled, setTorchEnabled] = useState(false);
  const cameraActive = mode === "barcode" || mode === "qr" || mode === "ai";
  const barcodeTypes = useMemo(
    () =>
      mode === "qr"
        ? (["qr"] as BarcodeType[])
        : (["code128", "code39", "code93", "ean13", "ean8", "itf14", "codabar", "upc_a", "upc_e", "pdf417"] as BarcodeType[]),
    [mode]
  );

  useEffect(() => {
    if (!cameraActive && torchEnabled) {
      setTorchEnabled(false);
    }
  }, [cameraActive, torchEnabled]);

  function handleBarcodeScanned(result: BarcodeScanningResult) {
    if (mode === "barcode" && !barcodeScanArmed) return;
    setBarcodeScanArmed(false);
    setTorchEnabled(false);
    onBarcodeScanned(result);
  }

  function submitManualInput() {
    const value = manualInput.replace(/\s/g, "").trim();

    if (!value) {
      Alert.alert("Chave obrigatoria", "Digite a chave de acesso da nota.");
      return;
    }

    onManualSubmit(value);
  }

  async function captureWithAi() {
    if (loading) return;

    const photo = await cameraRef.current?.takePictureAsync({
      quality: 0.9,
      base64: true,
      skipProcessing: false
    });

    if (!photo?.uri) {
      Alert.alert("Captura nao concluida", "Nao consegui capturar a imagem da nota.");
      return;
    }

    onCaptureWithAi();
  }

  if (!permissionGranted) {
    return (
      <View style={styles.permissionPanel}>
        <Ionicons name="camera-outline" size={42} color="#0f766e" />
        <Text style={styles.permissionTitle}>Permitir camera</Text>
        <Text style={styles.mutedText}>Libere a camera para ler codigo de barras e QRCode da NF-e/NFC-e.</Text>
        <Pressable style={styles.primaryButton} onPress={onRequestPermission}>
          <Ionicons name="key-outline" size={18} color="#ffffff" />
          <Text style={styles.primaryButtonText}>Liberar camera</Text>
        </Pressable>
        {/* <Pressable style={styles.secondaryButton} onPress={onSimulate}>
          <Ionicons name="document-text-outline" size={18} color="#0f766e" />
          <Text style={styles.secondaryButtonText}>Simular leitura de XML</Text>
        </Pressable> */}
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.scanPage} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      {cameraActive && (
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing="back"
          autofocus="on"
          enableTorch={torchEnabled}
          zoom={mode === "barcode" ? 0.08 : 0}
          barcodeScannerSettings={{ barcodeTypes }}
          onBarcodeScanned={mode !== "ai" && scannerEnabled && !loading ? handleBarcodeScanned : undefined}
        />
      )}

      <View style={[styles.scannerOverlay, { paddingTop: topInset }]}>
        <View style={styles.scanModeBar}>
          <ScanModeButton icon="barcode-outline" label="Barras" active={mode === "barcode"} onPress={() => setMode("barcode")} />
          <ScanModeButton icon="qr-code-outline" label="QRCode" active={mode === "qr"} onPress={() => setMode("qr")} />
          <ScanModeButton icon="create-outline" label="Manual" active={mode === "manual"} onPress={() => setMode("manual")} />
          <ScanModeButton icon="sparkles-outline" label="IA" active={mode === "ai"} onPress={() => setMode("ai")} />
        </View>

        {cameraActive && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={torchEnabled ? "Desligar flash" : "Acender flash"}
            style={[styles.scanTorchButton, torchEnabled && styles.scanTorchButtonActive]}
            onPress={() => setTorchEnabled((enabled) => !enabled)}
          >
            <Ionicons name={torchEnabled ? "flashlight" : "flashlight-outline"} size={19} color={torchEnabled ? "#101820" : "#ffffff"} />
            <Text style={[styles.scanTorchButtonText, torchEnabled && styles.scanTorchButtonTextActive]}>
              {torchEnabled ? "Flash ligado" : "Flash"}
            </Text>
          </Pressable>
        )}

        {mode === "manual" ? (
          <View style={styles.scanManualPanel}>
            <Ionicons name="create-outline" size={28} color="#0f766e" />
            <Text style={styles.scanManualTitle}>Digitar chave de acesso</Text>
            <TextInput
              value={manualInput}
              onChangeText={setManualInput}
              placeholder="44 digitos da chave da NF-e/NFC-e"
              keyboardType="number-pad"
              maxLength={44}
              style={styles.scanManualInput}
              returnKeyType="done"
              onSubmitEditing={submitManualInput}
            />
            <Pressable style={[styles.primaryButton, loading && styles.disabledButton]} disabled={loading} onPress={submitManualInput}>
              <Ionicons name="search-outline" size={18} color="#ffffff" />
              <Text style={styles.primaryButtonText}>Buscar nota</Text>
            </Pressable>
          </View>
        ) : (
          <>
            {mode === "barcode" && (
              <View pointerEvents="none" style={styles.scanBarcodeFocusLayer}>
                <View style={styles.scanBarcodeShade} />
                <View style={styles.scanBarcodeFocusRow}>
                  <View style={styles.scanBarcodeShade} />
                  <View style={styles.scanBarcodeFocusHole} />
                  <View style={styles.scanBarcodeShade} />
                </View>
                <View style={styles.scanBarcodeShade} />
              </View>
            )}
            {mode === "barcode" ? (
              <View style={styles.scanBarcodeGuide}>
                <View style={[styles.scanBarcodeCorner, styles.scanBarcodeCornerTopLeft]} />
                <View style={[styles.scanBarcodeCorner, styles.scanBarcodeCornerTopRight]} />
                <View style={styles.scanBarcodeLine} />
                <View style={[styles.scanBarcodeCorner, styles.scanBarcodeCornerBottomLeft]} />
                <View style={[styles.scanBarcodeCorner, styles.scanBarcodeCornerBottomRight]} />
              </View>
            ) : (
              <View style={styles.scanBox} />
            )}

            <Text style={styles.scanBarcodeSideHint}>
              {mode === "barcode" && (barcodeScanArmed ? "Lendo código de barras da DANFE" : "Toque em Ler NF e posicione o código")}
              {mode === "qr" && "Aponte para o QRCode da nota"}
              {mode === "ai" && "Capture uma imagem ruim para tentar ler com IA"}
            </Text>
            {mode === "barcode" && (
              <Pressable
                style={[styles.scanReadButton, barcodeScanArmed && styles.scanReadButtonActive]}
                disabled={loading}
                onPress={() => setBarcodeScanArmed((armed) => !armed)}
              >
                <Ionicons name={barcodeScanArmed ? "stop-circle-outline" : "barcode-outline"} size={20} color="#ffffff" />
                <Text style={styles.scanReadButtonText}>
                  {barcodeScanArmed ? "Parar" : "Ler NF"}
                </Text>
              </Pressable>
            )}
            {mode === "ai" && (
              <Pressable style={styles.scanSimulateButton} onPress={captureWithAi}>
                <Ionicons name="sparkles-outline" size={18} color="#ffffff" />
                <Text style={styles.scanSimulateText}>Tirar foto para IA</Text>
              </Pressable>
            )}
          </>
        )}

        {/* <Pressable style={styles.scanSimulateButton} onPress={onSimulate}>
          <Ionicons name="document-text-outline" size={18} color="#ffffff" />
          <Text style={styles.scanSimulateText}>Simular leitura de XML</Text>
        </Pressable> */}
      </View>
    </KeyboardAvoidingView>
  );
}

function ScanModeButton({
  icon,
  label,
  active,
  onPress
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable style={[styles.scanModeButton, active && styles.scanModeButtonActive]} onPress={onPress}>
      <Ionicons name={icon} size={19} color={active ? "#ffffff" : "#0f766e"} />
      <Text style={[styles.scanModeButtonText, active && styles.scanModeButtonTextActive]}>{label}</Text>
    </Pressable>
  );
}
