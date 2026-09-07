// Client-side FCM Push Notification Registration Helper
import { getMessaging, getToken, isSupported, onMessage } from 'firebase/messaging';
import { app } from './firebase';

export async function onFcmMessage(callback: (payload: any) => void) {
  if (typeof window === 'undefined') return () => {};
  try {
    const supported = await isSupported().catch(() => false);
    if (!supported) return () => {};
    const messaging = getMessaging(app);
    return onMessage(messaging, (payload) => {
      console.log('Incoming FCM notification:', payload);
      callback(payload);
    });
  } catch (e) {
    return () => {};
  }
}

export async function requestAndRegisterFcmToken(): Promise<string | null> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return null;
  }

  try {
    const supported = await isSupported().catch(() => false);
    if (!supported) return null;

    // 1. Request Browser Permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.log('Notification permission not granted:', permission);
      return null;
    }

    // 2. Register Service Worker if needed
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js').catch((err) => {
      console.warn('Service worker registration notice:', err);
      return null;
    });

    const messaging = getMessaging(app);
    const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY || 'BBNQdmWzXPYWe15V6if1BKUdqHcC6K2U9boUXcCvThjfyT5At5-YemKZZNPExMlKdkiDRuuijMASov5ZYxneb9A';

    // 3. Obtain registration token
    const token = await getToken(messaging, {
      vapidKey,
      serviceWorkerRegistration: registration || undefined,
    });

    if (token) {
      // 4. Save token to server backend & Firestore
      await fetch('/api/notifications/register-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fcmToken: token }),
      });
      console.log('📱 [FCM Client Token Registered]:', token.slice(0, 15) + '...');
      return token;
    }
  } catch (error) {
    console.warn('Error obtaining FCM push token:', error);
  }

  return null;
}
