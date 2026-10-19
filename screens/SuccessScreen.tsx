import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import ScreenBackground from './components/ScreenBackground';

export default function SuccessScreen({ route, navigation }: any) {
  const { studentId } = route.params;

  return (
    <ScreenBackground>
      <View style={styles.card}>
        <Text style={styles.checkmark}>✓</Text>
        <Text style={styles.title}>Attendance Marked!</Text>
        <Text style={styles.subtitle}>Student ID: {studentId}</Text>
        <Text style={styles.note}>{new Date().toLocaleTimeString()}</Text>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Dashboard', { studentId })}
        >
          <Text style={styles.buttonText}>Back to Dashboard</Text>
        </TouchableOpacity>
      </View>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  checkmark: { fontSize: 64, color: '#22c55e', marginBottom: 16 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#666', marginBottom: 4 },
  note: { fontSize: 14, color: '#999', marginBottom: 32 },
  button: { backgroundColor: '#22c55e', paddingVertical: 14, paddingHorizontal: 24, borderRadius: 8, alignItems: 'center' },
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