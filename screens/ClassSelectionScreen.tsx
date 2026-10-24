import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import ScreenBackground from './components/ScreenBackground';
import { Course, getCourses, addCourse, deleteCourse, teacherLogout } from './teacherApi';

export default function ClassSelectionScreen({ route, navigation }: any) {
  const { teacherName } = route.params;

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [section, setSection] = useState('');

  const logout = useCallback(async () => {
    await teacherLogout();
    navigation.reset({ index: 0, routes: [{ name: 'RoleSelection' }] });
  }, [navigation]);

  const handleError = useCallback(
    (e: any) => {
      if (e.status === 401) {
        Alert.alert('Logged out', 'Please log in again.', [{ text: 'OK', onPress: logout }]);
      } else {
        Alert.alert('Error', e.message || 'Could not reach server');
      }
    },
    [logout]
  );

  const load = useCallback(async () => {
    try {
      const data = await getCourses();
      setCourses(data.courses);
    } catch (e) {
      handleError(e);
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  useEffect(() => {
    load();
  }, [load]);

  const save = async () => {
    if (name.trim().length < 2) return Alert.alert('Missing info', 'Enter the course name.');
    if (!section.trim()) return Alert.alert('Missing info', 'Enter branch and section, e.g. CSE-B.');
    setSaving(true);
    try {
      await addCourse(name.trim(), section.trim());
      setName('');
      setSection('');
      setAdding(false);
      await load();
    } catch (e) {
      handleError(e);
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (c: Course) => {
    Alert.alert('Remove course?', `${c.name} (${c.section})\nPast attendance records are kept.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteCourse(c.id);
            await load();
          } catch (e) {
            handleError(e);
          }
        },
      },
    ]);
  };

  return (
    <ScreenBackground>
      <View style={styles.card}>
        <Text style={styles.title}>Welcome, {teacherName}</Text>
        <Text style={styles.subtitle}>Select a course to take attendance</Text>

        {loading ? (
          <ActivityIndicator style={{ marginVertical: 20 }} />
        ) : (
          <FlatList
            data={courses}
            keyExtractor={(c) => String(c.id)}
            style={{ width: '100%' }}
            ListEmptyComponent={<Text style={styles.empty}>No courses yet. Add your first course below.</Text>}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.classItem}
                onPress={() =>
                  navigation.navigate('TeacherDashboard', {
                    teacherName,
                    courseId: item.id,
                    courseName: item.name,
                    section: item.section,
                  })
                }
                onLongPress={() => confirmDelete(item)}
              >
                <Text style={styles.classSubject}>{item.name}</Text>
                <Text style={styles.classRoom}>{item.section}</Text>
              </TouchableOpacity>
            )}
          />
        )}

        {courses.length > 0 && <Text style={styles.hint}>Tip: press and hold a course to remove it</Text>}

        {adding ? (
          <View style={{ width: '100%', marginTop: 8 }}>
            <TextInput
              style={styles.input}
              placeholder="Course name (e.g. Computer Networks)"
              placeholderTextColor="#888"
              value={name}
              onChangeText={setName}
            />
            <TextInput
              style={styles.input}
              placeholder="Branch & section (e.g. CSE-B)"
              placeholderTextColor="#888"
              autoCapitalize="characters"
              value={section}
              onChangeText={setSection}
            />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity style={[styles.btn, styles.btnGhost]} onPress={() => setAdding(false)} disabled={saving}>
                <Text style={styles.btnGhostText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btn, styles.btnPrimary]} onPress={save} disabled={saving}>
                {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnPrimaryText}>Save Course</Text>}
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity style={[styles.btn, styles.btnPrimary, { width: '100%', marginTop: 8 }]} onPress={() => setAdding(true)}>
            <Text style={styles.btnPrimaryText}>+ Add Course</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity onPress={logout}>
          <Text style={styles.logout}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 24,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 16,
    padding: 24,
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 4, textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#666', marginBottom: 16, textAlign: 'center' },
  empty: { color: '#666', textAlign: 'center', marginVertical: 16 },
  hint: { color: '#999', fontSize: 12, textAlign: 'center', marginTop: 4 },
  classItem: { backgroundColor: '#f3f4f6', borderRadius: 10, padding: 14, marginBottom: 10 },
  classSubject: { fontSize: 16, fontWeight: '600', color: '#111' },
  classRoom: { fontSize: 13, color: '#666', marginTop: 2 },
  input: { backgroundColor: '#f3f4f6', borderRadius: 10, padding: 12, marginBottom: 10, fontSize: 15, color: '#111' },
  btn: { flex: 1, padding: 13, borderRadius: 10, alignItems: 'center' },
  btnPrimary: { backgroundColor: '#2563eb' },
  btnPrimaryText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  btnGhost: { backgroundColor: '#e5e7eb' },
  btnGhostText: { color: '#111', fontWeight: '600', fontSize: 15 },
  logout: { color: '#dc2626', textAlign: 'center', marginTop: 14, fontWeight: '600' },
});