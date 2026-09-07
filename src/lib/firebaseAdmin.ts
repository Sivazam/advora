// Firebase Admin SDK initialization for Server-side operations
import * as admin from 'firebase-admin';

function formatPrivateKey(key: string | undefined): string | undefined {
  if (!key) return undefined;
  return key.replace(/\\n/g, '\n');
}

const DEFAULT_PROJECT_ID = 'advoraservices-c3d9e';
const DEFAULT_CLIENT_EMAIL = 'firebase-adminsdk-fbsvc@advoraservices-c3d9e.iam.gserviceaccount.com';
const DEFAULT_PRIVATE_KEY = `-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCoYDoNx61OOpdy
VYjSJfWpwioePis/0Rjq0Ge+JHcBQ+gUFzQ0jbAd5VLPSVOrU7y2pRhu/vDpN3jK
8nGbcdU43H+MinJS1ZkSM/PEFWmGcXojplFvQyHHg7Rki3D7frJg+ZEff07YAnJg
bz/Vl3lCSkDTHJT0kvdfLkcL9+5FfgRihc8td6hZQHip3o2C01hpgSbeC0FWi1kU
MX9nqt500kGnMkAvWAk3sBnGvpsSHei9TWlFeuFcome/Fui3stnkRFJigh5LQ1Vw
vnoLOOPnUmYpqYbUHVz3FoxGxFnb5VDHcHudBudaCSWD2Hivk09gyApduVwL/ZYO
X8kA9hIBAgMBAAECggEAE3aiJ1ciZ7Vard8I1KAKNJArDblqhvM9EeG66E4vSoBm
yrG++Wc6iU4wpyfrCdZBbYyKlUQXpaHhrvYVH16qgursPJsBaaVizymdv1gpTV7/
OzE93yJvvHAzUV8UFaJY7OBUgANXoh0wSwj5JE/g9sJ+GVlHt7joawJ+uHm1u6cM
SVnNgEff05Mg0v6e0+fOJoj8vaYwZFYqqE6fg9YIWIu2OpHl9SynJ1E6+0MtSAFc
wyxbK3Msxf8/6PLJr5ORhrl6JnBe28a4nFr/MQqnefRd8r1XVvfxWkvOc13fOkdx
7PHPJsLy053xB+BPXAFjsY7SiQb8T7sYUH4/L26NFQKBgQDTahAi2riNwWXy6LBY
wF7j+SaT9UlndCwfaghk/ufCQlLCgtMgGoaJfqYtWYro3dF15YhaMqjVGim6Zkks
VL8Kw9Wi8tupIkyfrlnxty5pgc0BmrD8l9jjXLleACDsnMQW21rJCPYjf33o3/AI
sskwqmC91k8FUoEOGMeww5aTNQKBgQDL4pWyM0GsNGwNITpPRMCjGBwVRAx85Wtz
IQGQZT8E9mwbjk4pKRTV2eweCJSvrBP9bmTMk80ux+YBhkxGKUcWCa6H+EmhHCu1
Ssg7/aPROt9TPIirNLsS/mzea2SpziYTst3t1JAKLl90TUmXDIC73Ti4z+pdhr4P
jivpctlxHQKBgAS5AdNFf4nrIBPlDstswLHnBu2XNSSSe8nX3IglCZhVUvP1aDH3
Zbn8kknBDlFVYzB3CCy7pPnds8DuOAQ9gGcFKOiS9EU69us6Qdgcd3Tz6Vh31CxQ
WA/8KkfnSNUAS4EXNVf4U0dHudBR8FLBa60ioTacavd7eFaQRyWzuNFhAoGBAL1Z
vQ8XvVkyAlubTW0K/CE8JfC2FybzZnww3iP9c66nMTXSTtK5PYlyb3BhJb2VAaev
m9vHNJrKudkWocXTVhqoeTf8Jl2DLTCcuCPG5xpNI9VI9eCTA16bff5/HKj7NK+8
wZG8hN1/vdTkZoDq8rAGv0QcjJu5pNALiMqxiDIdAoGBALzF7b5spUx8gXoFvf8W
cD1XkM50yDke6h5uFpZNe173Y6sjXoUQ3Wm55O7WZajDIMIP0VL+VkaqZgdv0+2i
M0u3UKQAKxImPTfQG6xqkpx1+25Rl8D844LCj2EUtKum24ZpHZ0d+3uA61gTR7qF
NgyUD5xBfaYPMmsIxbqcumR4
-----END PRIVATE KEY-----`;

if (!admin.apps.length) {
  const projectId = process.env.FIREBASE_PROJECT_ID || DEFAULT_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL || DEFAULT_CLIENT_EMAIL;
  const privateKey = formatPrivateKey(process.env.FIREBASE_PRIVATE_KEY) || DEFAULT_PRIVATE_KEY;

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey,
    }),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'advoraservices-c3d9e.firebasestorage.app',
  });
  console.log('🔥 [Firebase Admin SDK Initialized Successfully]');
}

export const adminAuth = admin.auth();
export const adminFirestore = admin.firestore();
export const adminStorage = admin.storage();
export const adminMessaging = admin.messaging();
export default admin;
