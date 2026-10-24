import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import ScreenBackground from './components/ScreenBackground';
import {
  getLiveAttendance,
  getMySessions,
  teacherLogout,
  AttendanceRecord,
  SessionRow,
} from './teacherApi';

type SessionWithStudents = SessionRow & { students?: AttendanceRecord[] };

// Server times are UTC ("2026-10-23 12:30:00"); convert to the phone's local time
const toDate = (s: string) => new Date(s.replace(' ', 'T') + 'Z');
const fmtDate = (s?: string | null) =>
  s ? toDate(s).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '–';
const fmtTime = (s?: string | null) =>
  s ? toDate(s).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '';
const courseTitle = (s: SessionRow) => s.course_name || 'Course';
const fmtHours = (h?: number) => `${h ?? 1} hr${(h ?? 1) === 1 ? '' : 's'}`;
const timeRange = (s: SessionRow) =>
  `${fmtDate(s.started_at)}  ·  ${fmtTime(s.started_at)}${s.ended_at ? ' – ' + fmtTime(s.ended_at) : ''}`;

function StudentTable({ students }: { students: AttendanceRecord[] }) {
  if (students.length === 0) return <Text style={styles.emptySmall}>No students marked present.</Text>;
  return (
    <View style={styles.table}>
      <View style={[styles.row, styles.headerRow]}>
        <Text style={[styles.cell, styles.cNo, styles.headerText]}>#</Text>
        <Text style={[styles.cell, styles.cRoll, styles.headerText]}>Roll No</Text>
        <Text style={[styles.cell, styles.cTime, styles.headerText]}>Time</Text>
      </View>
      {students.map((s, i) => (
        <View key={s.roll_no} style={styles.row}>
          <Text style={[styles.cell, styles.cNo]}>{i + 1}</Text>
          <Text style={[styles.cell, styles.cRoll]}>{s.roll_no}</Text>
          <Text style={[styles.cell, styles.cTime]}>{fmtTime(s.marked_at)}</Text>
        </View>
      ))}
    </View>
  );
}

export default function TeacherAttendanceScreen({ route, navigation }: any) {
  // the class the teacher selected (sent from the dashboard)
  const { courseName, section } = route.params || {};

  const onBack = () => navigation.goBack();
  const onSessionExpired = useCallback(async () => {
    await teacherLogout();
    navigation.reset({ index: 0, routes: [{ name: 'RoleSelection' }] });
  }, [navigation]);

  const [tab, setTab] = useState<'live' | 'history'>('live');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Live
  const [active, setActive] = useState(false);
  const [liveSession, setLiveSession] = useState<SessionRow | null>(null);
  const [liveRecords, setLiveRecords] = useState<AttendanceRecord[]>([]);

  // History
  const [sessions, setSessions] = useState<SessionWithStudents[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const handleError = useCallback(
    (e: any) => {
      if (e.status === 401) {
        Alert.alert('Logged out', e.message, [{ text: 'OK', onPress: onSessionExpired }]);
      }
      // other errors (network blips during polling) are ignored so the screen doesn't spam alerts
    },
    [onSessionExpired]
  );

  const loadLive = useCallback(async () => {
    try {
      const data = await getLiveAttendance();
      // only show the live session if it belongs to THIS class
      const isThisClass =
        !!data.active &&
        data.session?.course_name === courseName &&
        data.session?.section === section;
      setActive(isThisClass);
      setLiveSession(isThisClass ? data.session ?? null : null);
      setLiveRecords(isThisClass ? data.records ?? [] : []);
    } catch (e) {
      handleError(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [handleError, courseName, section]);

  const loadHistory = useCallback(async () => {
    try {
      // history of ONLY the selected class
      const data = await getMySessions({ name: courseName, section });
      setSessions(data.sessions as SessionWithStudents[]);
    } catch (e) {
      handleError(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [handleError, courseName, section]);

  // poll live list every 5s while the Live tab is open
  useEffect(() => {
    if (tab !== 'live') return;
    setLoading(true);
    loadLive();
    const id = setInterval(loadLive, 5000);
    return () => clearInterval(id);
  }, [tab, loadLive]);

  useEffect(() => {
    if (tab === 'history') {
      setLoading(true);
      setExpandedId(null);
      loadHistory();
    }
  }, [tab, loadHistory]);

  const renderRecord = ({ item, index }: { item: AttendanceRecord; index: number }) => (
    <View style={styles.liveRow}>
      <Text style={styles.rowIndex}>{index + 1}</Text>
      <Text style={[styles.roll, { flex: 1 }]}>{item.roll_no}</Text>
      <Text style={styles.time}>{fmtTime(item.marked_at)}</Text>
    </View>
  );

  return (
    <ScreenBackground>
      <View style={styles.container}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.back}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Attendance</Text>
        <Text style={styles.classLabel}>
          {courseName} · {section}
        </Text>

        {/* separate screen: attendance % of every student in this class */}
        <TouchableOpacity
          style={styles.pctBtn}
          onPress={() => navigation.navigate('ClassPercentage', { courseName, section })}
        >
          <Text style={styles.pctBtnText}>Student attendance % →</Text>
        </TouchableOpacity>

        <View style={styles.tabs}>
          {(['live', 'history'] as const).map((t) => (
            <TouchableOpacity key={t} style={[styles.tab, tab === t && styles.tabActive]} onPress={() => setTab(t)}>
              <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
                {t === 'live' ? 'Live' : 'History'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {loading && <ActivityIndicator color="#2563eb" style={{ marginTop: 30 }} />}

        {/* LIVE TAB */}
        {!loading && tab === 'live' && (
          <>
            {!active || !liveSession ? (
              <Text style={styles.empty}>
                No session running for this class right now.{'\n'}Start a session to see students appear here live.
              </Text>
            ) : (
              <>
                <View style={styles.card}>
                  <Text style={styles.cardTitle}>{courseTitle(liveSession)}</Text>
                  {!!liveSession.section && <Text style={styles.cardSub}>Section: {liveSession.section}</Text>}
                  <Text style={styles.cardSub}>
                    Started {fmtDate(liveSession.started_at)} · {fmtTime(liveSession.started_at)} ·{' '}
                    {fmtHours(liveSession.hours)}
                  </Text>
                  <Text style={styles.count}>{liveRecords.length} present</Text>
                </View>
                <FlatList
                  data={liveRecords}
                  keyExtractor={(r) => r.roll_no}
                  renderItem={renderRecord}
                  refreshControl={
                    <RefreshControl
                      refreshing={refreshing}
                      onRefresh={() => {
                        setRefreshing(true);
                        loadLive();
                      }}
                      tintColor="#fff"
                    />
                  }
                  ListEmptyComponent={<Text style={styles.empty}>Nobody has marked attendance yet.</Text>}
                />
              </>
            )}
          </>
        )}

        {/* HISTORY TAB: every session of THIS class with its present students */}
        {!loading && tab === 'history' && (
          <FlatList
            data={sessions}
            extraData={expandedId}
            keyExtractor={(s) => String(s.id)}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => {
                  setRefreshing(true);
                  loadHistory();
                }}
                tintColor="#fff"
              />
            }
            ListEmptyComponent={<Text style={styles.empty}>No sessions for this class yet.</Text>}
            renderItem={({ item }) => {
              const open = expandedId === item.id;
              const students = item.students ?? [];
              return (
                <View style={styles.card}>
                  <TouchableOpacity onPress={() => setExpandedId(open ? null : item.id)}>
                    <Text style={styles.cardTitle}>{courseTitle(item)}</Text>
                    {!!item.section && <Text style={styles.cardSub}>Section: {item.section}</Text>}
                    <Text style={styles.cardSub}>{timeRange(item)}</Text>
                    <Text style={styles.cardSub}>Duration: {fmtHours(item.hours)}</Text>
                    <View style={styles.metaRow}>
                      <Text style={styles.cardMeta}>
                        {item.ended_at ? 'Ended' : 'Running'} · {item.present_count ?? students.length} present
                      </Text>
                      <Text style={styles.toggle}>{open ? 'Hide students ▲' : 'Show students ▼'}</Text>
                    </View>
                  </TouchableOpacity>
                  {open && <StudentTable students={students} />}
                </View>
              );
            }}
          />
        )}
      </View>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, width: '100%', padding: 20, paddingTop: 50, backgroundColor: 'rgba(15,23,42,0.82)' },
  back: { color: '#93c5fd', fontSize: 16, marginBottom: 12 },
  title: { color: '#fff', fontSize: 26, fontWeight: '700', marginBottom: 4 },
  classLabel: { color: '#94a3b8', fontSize: 14, marginBottom: 12 },
  pctBtn: {
    backgroundColor: '#1e293b',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#2563eb',
  },
  pctBtnText: { color: '#93c5fd', fontWeight: '700', fontSize: 14 },
  tabs: { flexDirection: 'row', backgroundColor: '#1e293b', borderRadius: 10, marginBottom: 14 },
  tab: { flex: 1, padding: 11, alignItems: 'center', borderRadius: 10 },
  tabActive: { backgroundColor: '#2563eb' },
  tabText: { color: '#94a3b8', fontWeight: '600' },
  tabTextActive: { color: '#fff' },
  card: { backgroundColor: '#1e293b', borderRadius: 12, padding: 14, marginBottom: 10 },
  cardTitle: { color: '#fff', fontSize: 17, fontWeight: '700' },
  cardSub: { color: '#94a3b8', marginTop: 3 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 },
  cardMeta: { color: '#4ade80', fontWeight: '600' },
  toggle: { color: '#93c5fd', fontSize: 13 },
  count: { color: '#4ade80', fontSize: 20, fontWeight: '700', marginTop: 8 },

  // live list
  liveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  rowIndex: { color: '#64748b', width: 30 },
  roll: { color: '#fff', fontSize: 16, fontWeight: '600' },
  time: { color: '#94a3b8', fontSize: 13 },

  // history student table
  table: { marginTop: 12, borderTopWidth: 1, borderTopColor: '#334155' },
  row: { flexDirection: 'row', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#334155' },
  headerRow: { backgroundColor: '#0f172a' },
  headerText: { color: '#93c5fd', fontWeight: '700' },
  cell: { color: '#e2e8f0', fontSize: 14 },
  cNo: { width: 32, paddingLeft: 4 },
  cRoll: { flex: 1 },
  cTime: { width: 70, textAlign: 'right', paddingRight: 4 },
  emptySmall: { color: '#94a3b8', marginTop: 12, textAlign: 'center' },

  empty: { color: '#94a3b8', textAlign: 'center', marginTop: 40, lineHeight: 22 },
});