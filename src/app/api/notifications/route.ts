import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { getLiveNotifications } from '@/lib/firestoreSync';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Reconcile in-app notifications from Firestore for multi-container parity
    await getLiveNotifications(session.userId).catch(() => {});

    const notifications = await db.notification.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: 'desc' },
      take: 25,
    });

    return NextResponse.json({ notifications });
  } catch (error: any) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, markAllAsRead } = await req.json();

    if (markAllAsRead) {
      await db.notification.updateMany({
        where: { userId: session.userId, isRead: false },
        data: { isRead: true },
      });
      try {
        const { adminFirestore } = await import('@/lib/firebaseAdmin');
        const unreadSnap = await adminFirestore
          .collection('notifications')
          .where('userId', '==', session.userId)
          .where('isRead', '==', false)
          .get();
        if (!unreadSnap.empty) {
          const batch = adminFirestore.batch();
          unreadSnap.docs.forEach((doc) => {
            batch.update(doc.ref, { isRead: true });
          });
          await batch.commit();
        }
      } catch (e) {
        console.warn('Firestore markAllAsRead sync notice:', e);
      }
      return NextResponse.json({ success: true });
    }

    if (id) {
      await db.notification.updateMany({
        where: { id, userId: session.userId },
        data: { isRead: true },
      });
      try {
        const { adminFirestore } = await import('@/lib/firebaseAdmin');
        await adminFirestore.collection('notifications').doc(id).set({ isRead: true }, { merge: true });
      } catch (e) {}
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
  } catch (error: any) {
    console.error('Error updating notifications:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
