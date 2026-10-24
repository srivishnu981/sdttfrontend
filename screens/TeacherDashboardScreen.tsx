import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import ScreenBackground from './components/ScreenBackground';
import { API_URL } from './config';
import { getAuthHeader, teacherLogout } from './teacherApi';

const QUICK_HOURS = ['1', '1.5', '2', '3'];

export default function TeacherDashboardScreen({ route, navigation }: any) {
  const { teacherName, courseId, courseName, section } = route.params;
  const [starting, setStarting] = useState(false);
  const [hours, setHours] = useState('1');

  const goLogin = async () => {
    await teacherLogout();
    navigation.reset({ index: 0, routes: [{ name: 'RoleSelection' }] });
  };

  const startSession = async () => {
    const h = parseFloat(hours.replace(',', '.'));
    if (!(h > 0 && h <= 12)) {
      Alert.alert('Session duration', 'Enter how many hours this session is (for example 1, 1.5 or 2).');
      return;
    }

    setStarting(true);
    try {
      const res = await fetch(`${API_URL}/session/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(await getAuthHeader()) },
        body: JSON.stringify({ courseId, hours: h }),
      });
      const data = await res.json();
      if (res.status === 401) {
        Alert.alert('Logged out', 'Please log in again.', [{ text: 'OK', onPress: goLogin }]);
        return;
      }
      if (!res.ok) throw new Error(data.error || 'Could not start session');
      navigation.navigate('ActiveSession', { sessionId: data.sessionId, subject: courseName, roomId: section });
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Could not reach server');
    } finally {
      setStarting(false);
    }
  };

  return (
    <ScreenBackground>
      <View style={styles.card}>
        <Text style={styles.title}>{courseName}</Text>
        <Text style={styles.subtitle}>
          {section} · {teacherName}
        </Text>

        <Text style={styles.label}>Session duration (hours)</Text>
        <View style={styles.chips}>
          {QUICK_HOURS.map((h) => (
            <TouchableOpacity
              key={h}
              style={[styles.chip, hours === h && styles.chipActive]}
              onPress={() => setHours(h)}
            >
              <Text style={[styles.chipText, hours === h && styles.chipTextActive]}>{h}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TextInput
          style={styles.input}
          value={hours}
          onChangeText={setHours}
          keyboardType="decimal-pad"
          placeholder="Or type hours, e.g. 1.5"
          placeholderTextColor="#999"
        />

        <TouchableOpacity style={styles.primary} onPress={startSession} disabled={starting}>
          {starting ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryText}>Start Session</Text>}
        </TouchableOpacity>

        {/* passes the selected class so history + percentages are only for this class */}
        <TouchableOpacity
          style={styles.secondary}
          onPress={() => navigation.navigate('TeacherAttendance', { courseName, section })}
        >
          <Text style={styles.secondaryText}>View Attendance</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={goLogin}>
          <Text style={styles.logout}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 24,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  title: { fontSize: 22, fontWeight: 'bold', textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#666', textAlign: 'center', marginTop: 4, marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '600', color: '#333', marginBottom: 8 },
  chips: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  chip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#e5e7eb',
  },
  chipActive: { backgroundColor: '#2563eb' },
  chipText: { color: '#111', fontWeight: '600' },
  chipTextActive: { color: '#fff' },
  input: {
    backgroundColor: '#f3f4f6',
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    marginBottom: 16,
    color: '#111',
  },
  primary: { backgroundColor: '#2563eb', padding: 14, borderRadius: 10, alignItems: 'center' },
  primaryText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  secondary: { backgroundColor: '#e5e7eb', padding: 14, borderRadius: 10, alignItems: 'center', marginTop: 12 },
  secondaryText: { color: '#111', fontWeight: '600', fontSize: 16 },
  logout: { color: '#dc2626', textAlign: 'center', marginTop: 18, fontWeight: '600' },
});