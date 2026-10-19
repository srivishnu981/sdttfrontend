import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import ScreenBackground from './components/ScreenBackground';
import { API_URL } from './config';

export default function FingerprintScreen({ route, navigation }: any) {
    const { studentId, qrData } = route.params;
  const [statusText, setStatusText] = useState('Tap below to verify your identity');

  const handleVerify = async () => {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    if (!hasHardware) {
      setStatusText('This device has no fingerprint/face sensor available.');
      return;
    }

    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    if (!isEnrolled) {
      setStatusText('No fingerprint/face is set up on this phone yet. Please set one up in phone Settings.');
      return;
    }

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Verify your identity to mark attendance',
      cancelLabel: 'Cancel',
      disableDeviceFallback: true,
    });

          if (result.success) {
        try {
          const { sessionId, token } = JSON.parse(qrData);
          const res = await fetch(`${API_URL}/attendance/mark`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId, studentId, token }),
          });
          const data = await res.json();

          if (res.status === 409) {
            setStatusText('QR code expired — please scan again.');
            return;
          }
          if (!res.ok) {
            setStatusText(data.error || 'Could not mark attendance. Try again.');
            return;
          }
          navigation.navigate('Success', { studentId });
        } catch (err) {
          setStatusText('Could not reach server. Check your connection.');
        }
      } else {
        setStatusText('Verification failed or cancelled. Please try again.');
      }};

  return (
    <ScreenBackground>
      <View style={styles.card}>
        <Text style={styles.title}>Fingerprint Check</Text>
        <Text style={styles.subtitle}>Student ID: {studentId}</Text>
        <Text style={styles.note}>{statusText}</Text>

        <TouchableOpacity style={styles.button} onPress={handleVerify}>
          <Text style={styles.buttonText}>Verify Fingerprint / Face</Text>
        </TouchableOpacity>
      </View>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#666', marginBottom: 12 },
  note: { fontSize: 14, color: '#999', textAlign: 'center', marginBottom: 32 },
  button: { backgroundColor: '#8b5cf6', paddingVertical: 14, paddingHorizontal: 24, borderRadius: 8, alignItems: 'center' },
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