import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { getLiveUser } from '@/lib/firestoreSync';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    // Sync live from Firestore
    const liveUser = await getLiveUser(session.userId).catch(() => null);

    let user: any = null;
    try {
      user = await db.user.findUnique({
        where: { id: session.userId },
        select: {
          id: true,
          phone: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          status: true,
        },
      });
    } catch (e) {
      console.warn('SQLite session lookup skipped, using session/Firestore:', e);
    }

    if (!user) {
      if (liveUser) {
        user = {
          id: session.userId,
          phone: liveUser.phone || session.phone,
          email: liveUser.email || null,
          firstName: liveUser.firstName || session.firstName,
          lastName: liveUser.lastName || session.lastName,
          role: liveUser.role || session.role,
          status: liveUser.status || session.status,
        };
      } else {
        user = {
          id: session.userId,
          phone: session.phone,
          email: null,
          firstName: session.firstName,
          lastName: session.lastName,
          role: session.role,
          status: session.status,
        };
      }
    }

    return NextResponse.json({
      authenticated: true,
      user,
    });
  } catch (error: any) {
    console.error('Session check error:', error);
    return NextResponse.json({ authenticated: false, error: error.message }, { status: 500 });
  }
}
