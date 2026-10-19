import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import ScreenBackground from './components/ScreenBackground';
import { TEACHERS } from './teacherData';

export default function ClassSelectionScreen({ route, navigation }: any) {
  const { teacherCode, teacherName } = route.params;
  const teacher = TEACHERS.find((t) => t.code === teacherCode);
  const classes = teacher ? teacher.classes : [];

  return (
    <ScreenBackground>
      <View style={styles.card}>
        <Text style={styles.title}>Welcome, {teacherName}</Text>
        <Text style={styles.subtitle}>Select the class you're teaching</Text>

        <FlatList
          data={classes}
          keyExtractor={(item) => item.id}
          style={{ width: '100%' }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.classItem}
              onPress={() =>
                navigation.navigate('TeacherDashboard', {
                  teacherName,
                  subject: item.subject,
                  roomId: item.roomId,
                })
              }
            >
              <Text style={styles.classSubject}>{item.subject}</Text>
              <Text style={styles.classRoom}>{item.roomId}</Text>
            </TouchableOpacity>
          )}
        />
      </View>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 4, textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#666', marginBottom: 16, textAlign: 'center' },
  classItem: {
    backgroundColor: '#f3f4f6', borderRadius: 10, padding: 14, marginBottom: 10,
  },
  classSubject: { fontSize: 16, fontWeight: '600', color: '#111' },
  classRoom: { fontSize: 13, color: '#666', marginTop: 2 },
  card: {
    marginHorizontal: 24, backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 16, padding: 24,
    maxHeight: '70%', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 5,
  },
});