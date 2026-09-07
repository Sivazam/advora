// Firebase Admin SDK initialization for Server-side operations
import * as admin from 'firebase-admin';

function formatPrivateKey(key: string | undefined): string | undefined {
  if (!key) return undefined;
  return key.replace(/\\n/g, '\n');
}

if (!admin.apps.length) {
  const projectId = process.env.FIREBASE_PROJECT_ID || 'advoraservices-c3d9e';
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = formatPrivateKey(process.env.FIREBASE_PRIVATE_KEY);

  if (clientEmail && privateKey) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'advoraservices-c3d9e.firebasestorage.app',
    });
    console.log('🔥 [Firebase Admin SDK Initialized Successfully]');
  } else {
    admin.initializeApp({
      projectId,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'advoraservices-c3d9e.firebasestorage.app',
    });
    console.log('🔥 [Firebase Admin SDK Initialized with Project ID]');
  }
}

export const adminAuth = admin.auth();
export const adminFirestore = admin.firestore();
export const adminStorage = admin.storage();
export const adminMessaging = admin.messaging();
export default admin;
