import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import ScreenBackground from './components/ScreenBackground';
import { getClassStats, teacherLogout, ClassStats, StudentStat } from './teacherApi';

const PASS_MARK = 75; // change this if your college uses a different cutoff

export default function ClassPercentageScreen({ route, navigation }: any) {
  const { courseName, section } = route.params || {};

  const [stats, setStats] = useState<ClassStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lowestFirst, setLowestFirst] = useState(false);

  const onBack = () => navigation.goBack();

  const handleError = useCallback(
    (e: any) => {
      if (e.status === 401) {
        Alert.alert('Logged out', e.message, [
          {
            text: 'OK',
            onPress: async () => {
              await teacherLogout();
              navigation.reset({ index: 0, routes: [{ name: 'RoleSelection' }] });
            },
          },
        ]);
      } else {
        Alert.alert('Error', e.message || 'Could not reach server');
      }
    },
    [navigation]
  );

  const load = useCallback(async () => {
    try {
      const data = await getClassStats({ name: courseName, section });
      setStats(data);
    } catch (e: any) {
      handleError(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [courseName, section, handleError]);

  useEffect(() => {
    load();
  }, [load]);

  const students: StudentStat[] = stats
    ? [...stats.students].sort((a, b) =>
        lowestFirst
          ? a.percentage - b.percentage || a.roll_no.localeCompare(b.roll_no)
          : a.roll_no.localeCompare(b.roll_no)
      )
    : [];

  const renderItem = ({ item }: { item: StudentStat }) => {
    const ok = item.percentage >= PASS_MARK;
    const color = ok ? '#22c55e' : '#ef4444';
    return (
      <View style={styles.row}>
        <View style={styles.rowTop}>
          <Text style={styles.roll}>{item.roll_no}</Text>
          <Text style={[styles.pct, { color }]}>{item.percentage}%</Text>
        </View>
        <View style={styles.barBg}>
          <View
            style={[
              styles.barFill,
              { width: `${Math.min(100, item.percentage)}%`, backgroundColor: color },
            ]}
          />
        </View>
        <Text style={styles.count}>
          {item.attendedHours} / {stats?.totalHours} hrs attended · {item.attendedSessions} of{' '}
          {stats?.totalSessions} classes
        </Text>
      </View>
    );
  };

  return (
    <ScreenBackground>
      <View style={styles.container}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.back}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Attendance %</Text>
        <Text style={styles.sub}>
          {courseName} · {section}
        </Text>

        {loading ? (
          <ActivityIndicator color="#fff" style={{ marginTop: 40 }} />
        ) : (
          <>
            <View style={styles.summary}>
              <Text style={styles.summaryText}>
                Total hours held: {stats?.totalHours ?? 0} ({stats?.totalSessions ?? 0} classes)
              </Text>
              <TouchableOpacity onPress={() => setLowestFirst((v) => !v)}>
                <Text style={styles.sort}>{lowestFirst ? 'Lowest first' : 'By roll no'}</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.legend}>
              % = hours attended ÷ total hours · Red = below {PASS_MARK}%
            </Text>

            <FlatList
              data={students}
              keyExtractor={(s) => s.roll_no}
              renderItem={renderItem}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={() => {
                    setRefreshing(true);
                    load();
                  }}
                  tintColor="#fff"
                />
              }
              ListEmptyComponent={
                <Text style={styles.empty}>
                  No attendance yet for this class. Finish a session and it will show up here.
                </Text>
              }
            />
          </>
        )}
      </View>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, width: '100%', padding: 20, paddingTop: 50, backgroundColor: 'rgba(15,23,42,0.82)' },
  back: { color: '#93c5fd', fontSize: 16, marginBottom: 12 },
  title: { color: '#fff', fontSize: 24, fontWeight: '700' },
  sub: { color: '#94a3b8', fontSize: 14, marginTop: 4, marginBottom: 16 },
  summary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryText: { color: '#fff', fontSize: 14, fontWeight: '600', flex: 1, paddingRight: 8 },
  sort: { color: '#93c5fd', fontSize: 13, fontWeight: '600' },
  legend: { color: '#94a3b8', fontSize: 12, marginTop: 4, marginBottom: 12 },
  row: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  rowTop: { flexDirection: 'row', justifyContent: 'space-between' },
  roll: { color: '#fff', fontSize: 16, fontWeight: '700' },
  pct: { fontSize: 16, fontWeight: '700' },
  barBg: {
    height: 6,
    backgroundColor: '#334155',
    borderRadius: 3,
    marginTop: 10,
    overflow: 'hidden',
  },
  barFill: { height: 6, borderRadius: 3 },
  count: { color: '#94a3b8', fontSize: 12, marginTop: 8 },
  empty: { color: '#94a3b8', textAlign: 'center', marginTop: 40, fontSize: 14 },
});