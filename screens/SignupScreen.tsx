import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import ScreenBackground from './components/ScreenBackground';
import { postAuth, saveToken } from './auth';
import { authStyles as s } from './authStyles';

type Props = { onAuthed: (user: any) => void; goLogin: () => void };

export default function SignupScreen({ onAuthed, goLogin }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [busy, setBusy] = useState(false);

  // Step 1: server checks the email/roll and emails an OTP
  const sendOtp = async () => {
    if (!email.trim() || password.length < 6) {
      Alert.alert('Check details', 'Enter your college email and a password of 6+ characters');
      return;
    }
    setBusy(true);
    try {
      await postAuth('/auth/signup/request-otp', { email: email.trim() });
      setOtpSent(true);
      setOtp('');
      Alert.alert('OTP sent', 'Check your college email for the 6-digit code.');
    } catch (e: any) {
      Alert.alert('Could not send OTP', e.message);
    } finally {
      setBusy(false);
    }
  };

  // Step 2: verify OTP + create the account
  const signup = async () => {
    if (otp.trim().length !== 6) {
      Alert.alert('Enter OTP', 'Type the 6-digit code from your email');
      return;
    }
    setBusy(true);
    try {
      const { token, user } = await postAuth('/auth/signup', {
        email: email.trim(),
        password,
        otp: otp.trim(),
      });
      await saveToken(token);
      onAuthed(user);
    } catch (e: any) {
      Alert.alert('Signup failed', e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScreenBackground>
      <View style={s.card}>
        <Text style={s.title}>Create account</Text>

        <TextInput
          placeholder="College email (with roll no)"
          placeholderTextColor="#888"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          editable={!otpSent}
          style={[s.input, otpSent && s.inputLocked]}
        />
        <TextInput
          placeholder="Password (6+ chars)"
          placeholderTextColor="#888"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          editable={!otpSent}
          style={[s.input, otpSent && s.inputLocked]}
        />

        {!otpSent ? (
          <TouchableOpacity style={s.button} onPress={sendOtp} disabled={busy}>
            {busy ? <ActivityIndicator color="#fff" /> : <Text style={s.buttonText}>Send OTP</Text>}
          </TouchableOpacity>
        ) : (
          <>
            <Text style={s.hint}>Enter the 6-digit OTP sent to your email</Text>
            <TextInput
              placeholder="------"
              placeholderTextColor="#aaa"
              keyboardType="number-pad"
              maxLength={6}
              value={otp}
              onChangeText={setOtp}
              style={[s.input, s.otpInput]}
            />
            <TouchableOpacity style={s.button} onPress={signup} disabled={busy}>
              {busy ? <ActivityIndicator color="#fff" /> : <Text style={s.buttonText}>Sign up</Text>}
            </TouchableOpacity>
            <TouchableOpacity onPress={sendOtp} style={s.link} disabled={busy}>
              <Text style={s.linkText}>Resend OTP</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setOtpSent(false)} style={s.link}>
              <Text style={s.linkText}>Change email / password</Text>
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity onPress={goLogin} style={s.link}>
          <Text style={s.linkText}>Already have an account? Log in</Text>
        </TouchableOpacity>
      </View>
    </ScreenBackground>
  );
}