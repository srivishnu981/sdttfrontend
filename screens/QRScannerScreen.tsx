import ScreenBackground from './components/ScreenBackground';
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';

export default function QRScannerScreen({ route, navigation }: any) {
  const { studentId } = route.params;
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  if (!permission) {
    return (
      <View style={styles.centered}>
        <Text>Loading camera...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <ScreenBackground>
      <View style={styles.centered}>
        <Text style={styles.title}>Camera Permission Needed</Text>
        <Text style={styles.note}>We need camera access to scan the QR code.</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
      </ScreenBackground>
    );
  }

  const handleScan = ({ data }: { data: string }) => {
    if (scanned) return; // stops it firing repeatedly for the same code
    setScanned(true);
    navigation.navigate('Fingerprint', { studentId, qrData: data });
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={scanned ? undefined : handleScan}
      />
      <View style={styles.overlay}>
        <Text style={styles.overlayText}>Point camera at the QR code</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, backgroundColor: '#fff' },
  overlay: { position: 'absolute', bottom: 40, width: '100%', alignItems: 'center' },
  overlayText: { color: '#fff', fontSize: 16, backgroundColor: 'rgba(0,0,0,0.5)', padding: 10, borderRadius: 8 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 12, textAlign: 'center' },
  note: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 24 },
  button: { backgroundColor: '#3b82f6', paddingVertical: 14, paddingHorizontal: 24, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 15, fontWeight: '600' },
});