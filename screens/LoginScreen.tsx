import ScreenBackground from './components/ScreenBackground';
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

export default function LoginScreen({ navigation }: any) {
  const [studentId, setStudentId] = useState('');

  const handleLogin = () => {
    if (studentId.trim() === '') {
      alert('Please enter your Student ID');
      return;
    }
    // For now, we just move to the Dashboard screen.
    // Later, this is where we'll actually check the ID against a real backend.
    navigation.navigate('Dashboard', { studentId });
  };

  return (
  <ScreenBackground>
    <View style={styles.card}>
      <Text style={styles.title}>Smart Attendance</Text>
      <Text style={styles.subtitle}>Student Login</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter Student ID"
        value={studentId}
        onChangeText={setStudentId}
        autoCapitalize="none"
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
    </View>
  </ScreenBackground>
);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#4f46e5',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
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