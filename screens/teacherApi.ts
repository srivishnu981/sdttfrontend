import * as SecureStore from 'expo-secure-store';
import { API_URL } from './config';

const TOKEN_KEY = 'teacher_token';
const TEACHER_KEY = 'teacher_info';

export type Teacher = { code: string; name: string };
export type Course = { id: number; name: string; section: string };
export type AttendanceRecord = { roll_no: string; name: string | null; marked_at: string };

export type SessionRow = {
  id: number;
  course_name: string | null;
  section: string | null;
  started_at: string;
  ended_at: string | null;
  hours?: number;
  present_count?: number;
};

// ---- per-class percentage types (hours based) ----
export type StudentStat = {
  roll_no: string;
  attendedSessions: number;
  attendedHours: number;
  percentage: number;
};
export type ClassStats = {
  courseName: string;
  section: string;
  totalSessions: number;
  totalHours: number;
  students: StudentStat[];
};

async function request(path: string, options: RequestInit = {}, auth = false) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = await SecureStore.getItemAsync(TOKEN_KEY);
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err: any = new Error(data.error || 'Something went wrong');
    err.status = res.status;
    err.needsRegister = data.needsRegister;
    throw err;
  }
  return data;
}

async function saveLogin(data: { token: string; teacher: Teacher }) {
  await SecureStore.setItemAsync(TOKEN_KEY, data.token);
  await SecureStore.setItemAsync(TEACHER_KEY, JSON.stringify(data.teacher));
  return data.teacher;
}

export async function teacherRegister(teacherCode: string, password: string) {
  const data = await request('/teacher/register', { method: 'POST', body: JSON.stringify({ teacherCode, password }) });
  return saveLogin(data);
}

export async function teacherLogin(teacherCode: string, password: string) {
  const data = await request('/teacher/login', { method: 'POST', body: JSON.stringify({ teacherCode, password }) });
  return saveLogin(data);
}

export async function getSavedTeacher(): Promise<Teacher | null> {
  const token = await SecureStore.getItemAsync(TOKEN_KEY);
  const info = await SecureStore.getItemAsync(TEACHER_KEY);
  if (!token || !info) return null;
  try {
    return JSON.parse(info);
  } catch {
    return null;
  }
}

export async function teacherLogout() {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
  await SecureStore.deleteItemAsync(TEACHER_KEY);
}

// ---- courses ----
export const getCourses = () => request('/teacher/courses', {}, true) as Promise<{ courses: Course[] }>;

export const addCourse = (name: string, section: string) =>
  request('/teacher/courses', { method: 'POST', body: JSON.stringify({ name, section }) }, true) as Promise<{ course: Course }>;

export const deleteCourse = (id: number) => request(`/teacher/courses/${id}`, { method: 'DELETE' }, true);

// ---- attendance ----
export const getLiveAttendance = () =>
  request('/teacher/live', {}, true) as Promise<{
    active: boolean;
    session?: SessionRow;
    count?: number;
    records?: AttendanceRecord[];
  }>;

// pass a course to get history of ONLY that class; no argument = all classes
export const getMySessions = (course?: { name: string; section: string }) => {
  const qs = course
    ? `?courseName=${encodeURIComponent(course.name)}&section=${encodeURIComponent(course.section)}`
    : '';
  return request(`/teacher/sessions${qs}`, {}, true) as Promise<{ sessions: SessionRow[] }>;
};

export const getSessionDetail = (id: number) =>
  request(`/teacher/sessions/${id}`, {}, true) as Promise<{
    session: SessionRow;
    count: number;
    records: AttendanceRecord[];
  }>;

// attendance % (hours attended / total hours) of every student for ONE class
export const getClassStats = (course: { name: string; section: string }) =>
  request(
    `/teacher/class-stats?courseName=${encodeURIComponent(course.name)}&section=${encodeURIComponent(course.section)}`,
    {},
    true
  ) as Promise<ClassStats>;

export async function getAuthHeader() {
  const token = await SecureStore.getItemAsync(TOKEN_KEY);
  return { Authorization: `Bearer ${token}` };
}