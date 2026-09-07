import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { saveFcmToken } from '@/lib/firestoreSync';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { fcmToken } = await req.json();
    if (!fcmToken || typeof fcmToken !== 'string') {
      return NextResponse.json({ error: 'Valid FCM token is required' }, { status: 400 });
    }

    const success = await saveFcmToken(session.userId, fcmToken.trim());
    if (!success) {
      return NextResponse.json({ error: 'Failed to save FCM token' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'FCM push notification token registered.' });
  } catch (error: any) {
    console.error('Error registering FCM token:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
