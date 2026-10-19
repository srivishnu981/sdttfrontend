import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import ScreenBackground from './components/ScreenBackground';

export default function RoleSelectionScreen({ navigation }: any) {
  return (
    <ScreenBackground>
      <View style={styles.card}>
        <Text style={styles.title}>Smart Attendance</Text>
        <Text style={styles.subtitle}>Continue as</Text>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#4f46e5' }]}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.buttonText}>Student</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#22c55e', marginTop: 12 }]}
          onPress={() => navigation.navigate('TeacherLogin')}
        >
          <Text style={styles.buttonText}>Teacher</Text>
        </TouchableOpacity>
      </View>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 4, textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#666', marginBottom: 24 },
  button: { paddingVertical: 14, paddingHorizontal: 32, borderRadius: 8, width: '100%', alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  card: {
    marginHorizontal: 24, backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 16, padding: 24,
    alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 5,
  },
});