import { Capacitor } from '@capacitor/core';
import { FirebaseMessaging } from '@capacitor-firebase/messaging';
import { api } from '../Store/api';

async function saveFcmToken(authToken: string, fcmToken: string) {
  if (!authToken || !fcmToken) return;
  await api('fcm_token', { token: authToken, fcm_token: fcmToken });
}

export async function registerFcmToken(authToken: string) {
  if (!Capacitor.isNativePlatform() || !authToken) return;
  const permission = await FirebaseMessaging.requestPermissions();
  if (permission.receive !== 'granted') return;
  const { token } = await FirebaseMessaging.getToken();
  await saveFcmToken(authToken, token);
}

export async function subscribeFcmTokenRefresh(getAuthToken: () => string) {
  if (!Capacitor.isNativePlatform()) return undefined;
  const handle = await FirebaseMessaging.addListener('tokenReceived', (event) => {
    void saveFcmToken(getAuthToken(), event.token);
  });
  return () => {
    void handle.remove();
  };
}
