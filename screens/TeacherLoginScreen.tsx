import React, { useEffect, useState } from 'react';
import {
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { teacherLogin, teacherRegister, getSavedTeacher } from './teacherApi';

export default function TeacherLoginScreen({ navigation }: any) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const goNext = (t: { code: string; name: string }) =>
    navigation.replace('ClassSelection', { teacherCode: t.code, teacherName: t.name });

  // already logged in before? skip this screen
  useEffect(() => {
    getSavedTeacher().then((t) => {
      if (t) goNext(t);
    });
  }, []);

  const submit = async () => {
    const teacherCode = code.trim().toUpperCase();
    if (!teacherCode || !password) return Alert.alert('Missing info', 'Enter teacher code and password.');

    if (mode === 'register') {
      if (password.length < 6) return Alert.alert('Weak password', 'Use at least 6 characters.');
      if (password !== confirm) return Alert.alert('Mismatch', 'Passwords do not match.');
    }

    setLoading(true);
    try {
      const teacher =
        mode === 'register' ? await teacherRegister(teacherCode, password) : await teacherLogin(teacherCode, password);
      goNext(teacher);
    } catch (e: any) {
      if (e.needsRegister) {
        Alert.alert('No account yet', 'This teacher code has no account. Create one now?', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Create account', onPress: () => setMode('register') },
        ]);
      } else {
        Alert.alert(mode === 'register' ? 'Could not create account' : 'Login failed', e.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.back}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>{mode === 'login' ? 'Teacher Login' : 'Create Teacher Account'}</Text>
      <Text style={styles.sub}>
        {mode === 'login' ? 'Use your teacher code and password.' : 'Enter your teacher code and choose a password.'}
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Teacher code (e.g. T101)"
        placeholderTextColor="#888"
        autoCapitalize="characters"
        value={code}
        onChangeText={setCode}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#888"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      {mode === 'register' && (
        <TextInput
          style={styles.input}
          placeholder="Confirm password"
          placeholderTextColor="#888"
          secureTextEntry
          value={confirm}
          onChangeText={setConfirm}
        />
      )}

      <TouchableOpacity style={styles.button} onPress={submit} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>{mode === 'login' ? 'Login' : 'Create Account'}</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setMode(mode === 'login' ? 'register' : 'login')}>
        <Text style={styles.link}>
          {mode === 'login' ? 'First time? Create your account' : 'Already have an account? Login'}
        </Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center', backgroundColor: '#0f172a' },
  back: { color: '#93c5fd', fontSize: 16, marginBottom: 24 },
  title: { color: '#fff', fontSize: 28, fontWeight: '700' },
  sub: { color: '#94a3b8', marginTop: 6, marginBottom: 24 },
  input: {
    backgroundColor: '#1e293b',
    color: '#fff',
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    fontSize: 16,
  },
    button: { backgroundColor: '#2563eb', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 6 },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  link: { color: '#93c5fd', textAlign: 'center', marginTop: 18 },
});