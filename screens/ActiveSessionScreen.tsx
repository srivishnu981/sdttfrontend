import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ActivityIndicator } from 'react-native';
import ScreenBackground from './components/ScreenBackground';
import { API_URL } from './config';

export default function ActiveSessionScreen({ route, navigation }: any) {
  const { sessionId, subject, roomId } = route.params;
  const [qrImage, setQrImage] = useState<string | null>(null);
  const [ending, setEnding] = useState(false);
  const [error, setError] = useState('');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchQR = async () => {
    try {
      const res = await fetch(`${API_URL}/session/qr?sessionId=${sessionId}`);
      const data = await res.json();
      if (res.ok) {
        setQrImage(data.qrDataUrl);
        setError('');
      } else {
        setError(data.error || 'Could not load QR');
      }
    } catch (err) {
      setError('Lost connection to server');
    }
  };

  useEffect(() => {
    fetchQR();
    intervalRef.current = setInterval(fetchQR, 3000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const handleEndSession = async () => {
    setEnding(true);
    if (intervalRef.current) clearInterval(intervalRef.current);
    try {
      const res = await fetch(`${API_URL}/session/end`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });
      const data = await res.json();
      navigation.navigate('SessionSummary', {
        subject,
        roomId,
        totalPresent: data.presentCount,
        presentStudents: data.presentStudents,
      });
    } catch (err) {
      alert('Could not end session. Check your connection.');
      setEnding(false);
    }
  };

  return (
    <ScreenBackground>
      <View style={styles.card}>
        <Text style={styles.title}>{subject}</Text>
        <Text style={styles.subtitle}>{roomId} · Session Active</Text>

        <View style={styles.qrBox}>
          {qrImage ? (
            <Image source={{ uri: qrImage }} style={styles.qrImage} />
          ) : (
            <ActivityIndicator size="large" />
          )}
        </View>
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Text style={styles.note}>Project this screen for students to scan</Text>

        <TouchableOpacity style={styles.endButton} onPress={handleEndSession} disabled={ending}>
          {ending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>End Session</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 4, textAlign: 'center' },
  subtitle: { fontSize: 15, color: '#666', marginBottom: 20 },
  qrBox: { width: 220, height: 220, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  qrImage: { width: 220, height: 220 },
  error: { fontSize: 12, color: '#ef4444', marginBottom: 8, textAlign: 'center' },
  note: { fontSize: 13, color: '#999', textAlign: 'center', marginBottom: 24 },
  endButton: { backgroundColor: '#ef4444', paddingVertical: 12, paddingHorizontal: 32, borderRadius: 8, width: '100%', alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
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