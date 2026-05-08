import { Ionicons } from "@expo/vector-icons";
import { BarcodeScanningResult, CameraView } from "expo-camera";
import { Pressable, Text, View } from "react-native";
import { styles } from "../styles/appStyles";
export function ScanScreen({
  permissionGranted,
  loading,
  scannerEnabled,
  onRequestPermission,
  onBarcodeScanned,
  onSimulate,
  topInset
}: {
  permissionGranted?: boolean;
  loading: boolean;
  scannerEnabled: boolean;
  topInset: number;
  onRequestPermission: () => void;
  onBarcodeScanned: (result: BarcodeScanningResult) => void;
  onSimulate: () => void;
}) {
  if (!permissionGranted) {
    return (
      <View style={styles.permissionPanel}>
        <Ionicons name="camera-outline" size={42} color="#0f766e" />
        <Text style={styles.permissionTitle}>Permitir camera</Text>
        <Text style={styles.mutedText}>Libere a camera para ler o QR Code da NF-e/NFC-e.</Text>
        <Pressable style={styles.primaryButton} onPress={onRequestPermission}>
          <Ionicons name="key-outline" size={18} color="#ffffff" />
          <Text style={styles.primaryButtonText}>Liberar camera</Text>
        </Pressable>
        <Pressable style={styles.secondaryButton} onPress={onSimulate}>
          <Ionicons name="document-text-outline" size={18} color="#0f766e" />
          <Text style={styles.secondaryButtonText}>Siimular leitura de XML</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.scanPage}>
      <CameraView
        style={styles.camera}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
        onBarcodeScanned={scannerEnabled && !loading ? onBarcodeScanned : undefined}
      />
      <View style={[styles.scannerOverlay, { paddingTop: topInset }]}>
        <View style={styles.scanBox} />
        <Text style={styles.scanText}>Aponte para o QR Code da nota</Text>
        <Pressable style={styles.scanSimulateButton} onPress={onSimulate}>
          <Ionicons name="document-text-outline" size={18} color="#ffffff" />
          <Text style={styles.scanSimulateText}>Siimular leitura de XML</Text>
        </Pressable>
      </View>
    </View>
  );
}
