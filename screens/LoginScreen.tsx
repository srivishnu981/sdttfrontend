import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import ScreenBackground from './components/ScreenBackground';
import { postAuth, saveToken } from './auth';
import { authStyles as s } from './authStyles';

type Props = { onAuthed: (user: any) => void; goSignup: () => void; goForgot: () => void };

export default function LoginScreen({ onAuthed, goSignup, goForgot }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'creds' | 'otp'>('creds');
  const [busy, setBusy] = useState(false);

  // Step 1: check email + password, server emails an OTP
  const sendOtp = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Missing info', 'Enter your email and password');
      return;
    }
    setBusy(true);
    try {
      await postAuth('/auth/login', { email: email.trim(), password });
      setStep('otp');
      setOtp('');
      Alert.alert('OTP sent', 'Check your college email for the 6-digit code.');
    } catch (e: any) {
      Alert.alert('Login failed', e.message);
    } finally {
      setBusy(false);
    }
  };

  // Step 2: verify OTP, save login token
  const verifyOtp = async () => {
    if (otp.trim().length !== 6) {
      Alert.alert('Enter OTP', 'Type the 6-digit code from your email');
      return;
    }
    setBusy(true);
    try {
      const { token, user } = await postAuth('/auth/login/verify', {
        email: email.trim(),
        otp: otp.trim(),
      });
      await saveToken(token); // keeps them logged in next time
      onAuthed(user);
    } catch (e: any) {
      Alert.alert('Verification failed', e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScreenBackground>
      <View style={s.card}>
        <Text style={s.title}>Student login</Text>

        {step === 'creds' ? (
          <>
            <TextInput
              placeholder="College email"
              placeholderTextColor="#888"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              style={s.input}
            />
            <TextInput
              placeholder="Password"
              placeholderTextColor="#888"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              style={s.input}
            />
            <TouchableOpacity style={s.button} onPress={sendOtp} disabled={busy}>
              {busy ? <ActivityIndicator color="#fff" /> : <Text style={s.buttonText}>Log in</Text>}
            </TouchableOpacity>

            <TouchableOpacity onPress={goForgot} style={s.link}>
              <Text style={s.linkText}>Forgot password?</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={goSignup} style={s.link}>
              <Text style={s.linkText}>New here? Sign up</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={s.hint}>Enter the 6-digit OTP sent to {email.trim()}</Text>
            <TextInput
              placeholder="------"
              placeholderTextColor="#aaa"
              keyboardType="number-pad"
              maxLength={6}
              value={otp}
              onChangeText={setOtp}
              style={[s.input, s.otpInput]}
            />
            <TouchableOpacity style={s.button} onPress={verifyOtp} disabled={busy}>
              {busy ? <ActivityIndicator color="#fff" /> : <Text style={s.buttonText}>Verify & log in</Text>}
            </TouchableOpacity>

            <TouchableOpacity onPress={sendOtp} style={s.link} disabled={busy}>
              <Text style={s.linkText}>Resend OTP</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setStep('creds')} style={s.link}>
              <Text style={s.linkText}>Back</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </ScreenBackground>
  );
}