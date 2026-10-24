import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import ScreenBackground from './components/ScreenBackground';

type Student = { rollNo: string; name?: string; markedAt: string };

// Server times are UTC ("2026-10-22 12:30:00"), so show them in local time.
const formatTime = (utc: string) => {
  const d = new Date(utc.replace(' ', 'T') + 'Z');
  return isNaN(d.getTime()) ? '-' : d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
};

export default function SessionSummaryScreen({ route, navigation }: any) {
  const { subject, roomId, totalPresent, presentStudents } = route.params;
  const students: Student[] = presentStudents || [];

  return (
    <ScreenBackground>
      <View style={styles.card}>
        <Text style={styles.checkmark}>✓</Text>
        <Text style={styles.title}>Session Ended</Text>
        <Text style={styles.subtitle}>{subject} · {roomId}</Text>
        <Text style={styles.count}>
          {totalPresent} student{totalPresent === 1 ? '' : 's'} marked present
        </Text>

        {students.length > 0 ? (
          <View style={styles.table}>
            <View style={[styles.row, styles.headerRow]}>
              <Text style={[styles.cell, styles.sno, styles.headerText]}>#</Text>
              <Text style={[styles.cell, styles.roll, styles.headerText]}>Roll No</Text>
              <Text style={[styles.cell, styles.time, styles.headerText]}>Time</Text>
            </View>
            <ScrollView style={styles.body} nestedScrollEnabled>
              {students.map((s, i) => (
                <View key={s.rollNo} style={[styles.row, i % 2 === 1 && styles.altRow]}>
                  <Text style={[styles.cell, styles.sno]}>{i + 1}</Text>
                  <Text style={[styles.cell, styles.roll]}>{s.rollNo}</Text>
                  <Text style={[styles.cell, styles.time]}>{formatTime(s.markedAt)}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        ) : (
          <Text style={styles.empty}>No students marked present</Text>
        )}

        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('RoleSelection')}>
          <Text style={styles.buttonText}>Done</Text>
        </TouchableOpacity>
      </View>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  checkmark: { fontSize: 50, color: '#22c55e', marginBottom: 12 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 4, textAlign: 'center' },
  subtitle: { fontSize: 15, color: '#666', marginBottom: 8 },
  count: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 16 },
  table: { width: '100%', marginBottom: 20, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, overflow: 'hidden' },
  body: { maxHeight: 260 },
  row: { flexDirection: 'row', paddingVertical: 8, paddingHorizontal: 6 },
  headerRow: { backgroundColor: '#f3f4f6' },
  altRow: { backgroundColor: '#f9fafb' },
  headerText: { color: '#111', fontWeight: '700' },
  cell: { fontSize: 14, color: '#333' },
  sno: { width: 32 },
  roll: { flex: 1 },
  time: { width: 70, textAlign: 'right' },
  empty: { fontSize: 14, color: '#666', paddingVertical: 20 },
  button: { backgroundColor: '#2563eb', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 15, fontWeight: '600' },
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