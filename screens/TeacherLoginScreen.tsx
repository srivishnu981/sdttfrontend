import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import ScreenBackground from './components/ScreenBackground';
import { findTeacherByCode } from './teacherData';

export default function TeacherLoginScreen({ navigation }: any) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const handleLogin = () => {
    const teacher = findTeacherByCode(code);
    if (!teacher) {
      setError('Invalid teacher code. Please try again.');
      return;
    }
    setError('');
    navigation.navigate('ClassSelection', { teacherCode: teacher.code, teacherName: teacher.name });
  };

  return (
    <ScreenBackground>
      <View style={styles.card}>
        <Text style={styles.title}>Smart Attendance</Text>
        <Text style={styles.subtitle}>Teacher Login</Text>

        <TextInput
          style={styles.input}
          placeholder="Enter Teacher Code"
          value={code}
          onChangeText={setCode}
          autoCapitalize="characters"
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
      </View>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 4, textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#666', marginBottom: 24 },
  input: { width: '100%', borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, fontSize: 16, marginBottom: 12 },
  error: { color: '#ef4444', marginBottom: 12, textAlign: 'center' },
  button: { backgroundColor: '#4f46e5', paddingVertical: 12, paddingHorizontal: 32, borderRadius: 8, width: '100%', alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  card: {
    marginHorizontal: 24, backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 16, padding: 24,
    alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 5,
  },
});