import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import RoleSelectionScreen from './screens/RoleSelectionScreen';
import LoginScreen from './screens/LoginScreen';
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

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="RoleSelection">
        <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} options={{ headerShown: false }} />

        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Dashboard' }} />
        <Stack.Screen name="Bluetooth" component={BluetoothScreen} options={{ title: 'Bluetooth Check' }} />
        <Stack.Screen name="QRScanner" component={QRScannerScreen} options={{ title: 'Scan QR Code' }} />
        <Stack.Screen name="Fingerprint" component={FingerprintScreen} options={{ title: 'Fingerprint Check' }} />
        <Stack.Screen name="Success" component={SuccessScreen} options={{ headerShown: false }} />

        <Stack.Screen name="TeacherLogin" component={TeacherLoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="ClassSelection" component={ClassSelectionScreen} options={{ title: 'Select Class' }} />
        <Stack.Screen name="TeacherDashboard" component={TeacherDashboardScreen} options={{ title: 'Teacher Dashboard' }} />
        <Stack.Screen name="ActiveSession" component={ActiveSessionScreen} options={{ title: 'Active Session', headerBackVisible: false }} />
        <Stack.Screen name="SessionSummary" component={SessionSummaryScreen} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}