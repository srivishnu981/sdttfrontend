import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import ScreenBackground from './components/ScreenBackground';

export default function BluetoothScreen({ route, navigation }: any) {
  const { studentId } = route.params;

  return (
    <ScreenBackground>
      <View style={styles.card}>
        <Text style={styles.title}>Bluetooth Check</Text>
        <Text style={styles.subtitle}>Student ID: {studentId}</Text>
        <Text style={styles.note}>(Real Bluetooth detection will be added here later)</Text>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('QRScanner', { studentId })}
        >
          <Text style={styles.buttonText}>Simulate: Classroom Detected</Text>
        </TouchableOpacity>
      </View>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#666', marginBottom: 12 },
  note: { fontSize: 14, color: '#999', textAlign: 'center', marginBottom: 32 },
  button: { backgroundColor: '#3b82f6', paddingVertical: 14, paddingHorizontal: 24, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  card: {
    marginHorizontal: 24,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
});