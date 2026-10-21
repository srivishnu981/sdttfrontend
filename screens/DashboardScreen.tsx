import ScreenBackground from './components/ScreenBackground';
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { clearToken } from './auth';

export default function DashboardScreen({ route, navigation }: any) {
  const { rollNo, name } = route.params ?? {};

  const logout = async () => {
    await clearToken();
    navigation.reset({ index: 0, routes: [{ name: 'RoleSelection' }] });
  };

  return (
    <ScreenBackground>
      <View style={styles.card}>
        <Text style={styles.title}>Welcome, {name || rollNo}</Text>
        {name && rollNo ? <Text style={styles.roll}>{rollNo}</Text> : null}
        <Text style={styles.subtitle}>Student Dashboard</Text>

        <TouchableOpacity
          style={styles.button}
          // still passing studentId so Bluetooth/QR/Fingerprint screens keep working
          onPress={() => navigation.navigate('Bluetooth', { studentId: rollNo })}
        >
          <Text style={styles.buttonText}>Mark Attendance</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Text style={styles.logoutText}>Log out</Text>
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
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  roll: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
  },
  button: {
    backgroundColor: '#22c55e',
    paddingVertical: 14,
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
  logoutButton: {
    marginTop: 12,
    paddingVertical: 12,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  logoutText: {
    color: '#ef4444',
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