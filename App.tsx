import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import RoleSelectionScreen from './screens/RoleSelectionScreen';
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';
import DashboardScreen from './screens/DashboardScreen';
import BluetoothScreen from './screens/BluetoothScreen';
import QRScannerScreen from './screens/QRScannerScreen';
import FingerprintScreen from './screens/FingerprintScreen';
import SuccessScreen from './screens/SuccessScreen';

import TeacherLoginScreen from './screens/TeacherLoginScreen';
import ClassSelectionScreen from './screens/ClassSelectionScreen';
import TeacherDashboardScreen from './screens/TeacherDashboardScreen';
import ActiveSessionScreen from './screens/ActiveSessionScreen';
import SessionSummaryScreen from './screens/SessionSummaryScreen';

import { getToken, clearToken, authFetch } from './screens/auth';
import TeacherAttendanceScreen from './screens/TeacherAttendanceScreen';
import ClassPercentageScreen from './screens/ClassPercentageScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const [booting, setBooting] = useState(true);
  const [user, setUser] = useState<any>(null); // set if a saved login is still valid

  // On app start: if a saved token exists and the server accepts it, skip login.
  useEffect(() => {
    (async () => {
      try {
        if (await getToken()) {
          const r = await authFetch('/auth/me');
          if (r.ok) setUser(await r.json()); // { name, rollNo }
          else if (r.status === 401) await clearToken(); // expired/invalid
        }
      } catch {
        // server unreachable -> just fall through to the normal login flow
      }
      setBooting(false);
    })();
  }, []);

  if (booting) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // After login/signup: clear the back stack and go to the Dashboard.
  const goDashboard = (navigation: any, u: any) =>
    navigation.reset({
      index: 0,
      routes: [{ name: 'Dashboard', params: { user: u, rollNo: u?.rollNo, name: u?.name } }],
    });

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={user ? 'Dashboard' : 'RoleSelection'}>
        <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} options={{ headerShown: false }} />

        <Stack.Screen name="Login" options={{ headerShown: false }}>
          {(props) => (
            <LoginScreen
              {...props}
              onAuthed={(u: any) => goDashboard(props.navigation, u)}
              goSignup={() => props.navigation.navigate('Signup')}
              goForgot={() => props.navigation.navigate('ForgotPassword')}
            />
          )}
        </Stack.Screen>

        <Stack.Screen name="Signup" options={{ headerShown: false }}>
          {(props) => (
            <SignupScreen
              {...props}
              onAuthed={(u: any) => goDashboard(props.navigation, u)}
              goLogin={() => props.navigation.navigate('Login')}
            />
          )}
        </Stack.Screen>

        <Stack.Screen name="ForgotPassword" options={{ headerShown: false }}>
          {(props) => (
            <ForgotPasswordScreen {...props} goLogin={() => props.navigation.navigate('Login')} />
          )}
        </Stack.Screen>

        <Stack.Screen
          name="Dashboard"
          component={DashboardScreen}
          options={{ title: 'Dashboard', headerBackVisible: false }}
          initialParams={user ? { user, rollNo: user.rollNo, name: user.name } : undefined}
        />
        <Stack.Screen name="Bluetooth" component={BluetoothScreen} options={{ title: 'Bluetooth Check' }} />
        <Stack.Screen name="QRScanner" component={QRScannerScreen} options={{ title: 'Scan QR Code' }} />
        <Stack.Screen name="Fingerprint" component={FingerprintScreen} options={{ title: 'Fingerprint Check' }} />
        <Stack.Screen name="Success" component={SuccessScreen} options={{ headerShown: false }} />

        <Stack.Screen name="TeacherLogin" component={TeacherLoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="ClassSelection" component={ClassSelectionScreen} options={{ title: 'Select Class' }} />
        <Stack.Screen name="TeacherDashboard" component={TeacherDashboardScreen} options={{ title: 'Teacher Dashboard' }} />
        <Stack.Screen
          name="ActiveSession"
          component={ActiveSessionScreen}
          options={{ title: 'Active Session', headerBackVisible: false }}
        />
        <Stack.Screen name="SessionSummary" component={SessionSummaryScreen} options={{ headerShown: false }} />
        <Stack.Screen name="TeacherAttendance" component={TeacherAttendanceScreen} options={{ headerShown: false }} />
        <Stack.Screen name="ClassPercentage" component={ClassPercentageScreen} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
