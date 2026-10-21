import * as SecureStore from 'expo-secure-store';
import * as Application from 'expo-application';
import { Platform } from 'react-native';
import { API_URL } from './config';

const KEY = 'auth_token';
export const getToken = () => SecureStore.getItemAsync(KEY);
export const saveToken = (t: string) => SecureStore.setItemAsync(KEY, t);
export const clearToken = () => SecureStore.deleteItemAsync(KEY);

// Stable id for this phone (used to lock an account to one device)
export async function getDeviceId(): Promise<string> {
  if (Platform.OS === 'android') {
    const id = Application.getAndroidId();
    if (id) return String(id);
  }
  let id = await SecureStore.getItemAsync('device_id');
  if (!id) {
    id = Math.random().toString(36).slice(2) + Date.now().toString(36);
    await SecureStore.setItemAsync('device_id', id);
  }
  return id;
}

export async function postAuth(path: string, body: object) {
  const deviceId = await getDeviceId();
  const r = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...body, deviceId }),
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data.error || 'Something went wrong');
  return data; // { token, user: { name, rollNo } }
}

export async function authFetch(path: string, options: RequestInit = {}) {
  const token = await getToken();
  const deviceId = await getDeviceId();
  return fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
      'x-device-id': deviceId,
    },
  });
}