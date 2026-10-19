import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import ScreenBackground from './components/ScreenBackground';
import { API_URL } from './config';

export default function TeacherDashboardScreen({ route, navigation }: any) {
  const { teacherName, subject, roomId } = route.params;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleStartSession = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/session/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teacherId: teacherName, classId: `${subject}-${roomId}` }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to start session');
        setLoading(false);
        return;
      }
      navigation.navigate('ActiveSession', {
        sessionId: data.sessionId,
        qrDataUrl: data.qrDataUrl,
        subject,
        roomId,
      });
    } catch (err) {
      setError('Could not reach server. Check your connection and API_URL.');
    }
    setLoading(false);
  };
    

  return (
    <ScreenBackground>
      <View style={styles.card}>
        <Text style={styles.title}>Welcome, {teacherName}</Text>
        <Text style={styles.subject}>{subject}</Text>
        <Text style={styles.subtitle}>{roomId}</Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity style={styles.button} onPress={handleStartSession} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Start Session</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 12 }}>
          <Text style={{ color: '#4f46e5' }}>← Choose a different class</Text>
        </TouchableOpacity>
      </View>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 8, textAlign: 'center' },
  subject: { fontSize: 18, fontWeight: '600', color: '#333', textAlign: 'center' },
  subtitle: { fontSize: 15, color: '#666', marginBottom: 20 },
  error: { color: '#ef4444', marginBottom: 12, textAlign: 'center' },
  button: { backgroundColor: '#4f46e5', paddingVertical: 12, paddingHorizontal: 32, borderRadius: 8, width: '100%', alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  card: {
    marginHorizontal: 24, backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 16, padding: 24,
    alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 5,
  },
});