import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import ScreenBackground from './components/ScreenBackground';
import { postAuth } from './auth';
import { authStyles as s } from './authStyles';

type Props = { goLogin: () => void };

export default function ForgotPasswordScreen({ goLogin }: Props) {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState<'email' | 'reset'>('email');
  const [busy, setBusy] = useState(false);

  const sendOtp = async () => {
    if (!email.trim()) {
      Alert.alert('Enter email', 'Type your college email');
      return;
    }
    setBusy(true);
    try {
      await postAuth('/auth/forgot/request-otp', { email: email.trim() });
      setStep('reset');
      setOtp('');
      Alert.alert('OTP sent', 'If this account exists, a 6-digit code was sent to your email.');
    } catch (e: any) {
      Alert.alert('Could not send OTP', e.message);
    } finally {
      setBusy(false);
    }
  };

  const reset = async () => {
    if (otp.trim().length !== 6 || newPassword.length < 6) {
      Alert.alert('Check details', 'Enter the 6-digit OTP and a new password of 6+ characters');
      return;
    }
    setBusy(true);
    try {
      await postAuth('/auth/forgot/reset', {
        email: email.trim(),
        otp: otp.trim(),
        newPassword,
      });
      Alert.alert('Password changed', 'Please log in with your new password.', [
        { text: 'OK', onPress: goLogin },
      ]);
    } catch (e: any) {
      Alert.alert('Reset failed', e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScreenBackground>
      <View style={s.card}>
        <Text style={s.title}>Reset password</Text>

        {step === 'email' ? (
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
            <TouchableOpacity style={s.button} onPress={sendOtp} disabled={busy}>
              {busy ? <ActivityIndicator color="#fff" /> : <Text style={s.buttonText}>Send OTP</Text>}
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={s.hint}>Enter the OTP sent to {email.trim()} and choose a new password</Text>
            <TextInput
              placeholder="------"
              placeholderTextColor="#aaa"
              keyboardType="number-pad"
              maxLength={6}
              value={otp}
              onChangeText={setOtp}
              style={[s.input, s.otpInput]}
            />
            <TextInput
              placeholder="New password (6+ chars)"
              placeholderTextColor="#888"
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
              style={s.input}
            />
            <TouchableOpacity style={s.button} onPress={reset} disabled={busy}>
              {busy ? <ActivityIndicator color="#fff" /> : <Text style={s.buttonText}>Change password</Text>}
            </TouchableOpacity>
            <TouchableOpacity onPress={sendOtp} style={s.link} disabled={busy}>
              <Text style={s.linkText}>Resend OTP</Text>
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity onPress={goLogin} style={s.link}>
          <Text style={s.linkText}>Back to login</Text>
        </TouchableOpacity>
      </View>
    </ScreenBackground>
  );
}