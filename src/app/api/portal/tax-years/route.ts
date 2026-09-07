import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { syncApplicationToFirestore } from '@/lib/firestoreSync';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { year, targetUserId } = await req.json();

    if (!year || !/^\d{4}$/.test(year.toString())) {
      return NextResponse.json({ error: 'Please provide a valid 4-digit tax year (e.g., 2024).' }, { status: 400 });
    }

    const userId = session.role === 'CLIENT' ? session.userId : (targetUserId || session.userId);

    // Create Tax Year Section
    await db.taxYearSection.upsert({
      where: {
        userId_year: {
          userId,
          year: year.toString(),
        },
      },
      update: {},
      create: {
        userId,
        year: year.toString(),
        isDefault: false,
      },
    });

    // Create corresponding Tax Application record if missing
    const application = await db.taxApplication.upsert({
      where: {
        userId_taxYear: {
          userId,
          taxYear: year.toString(),
        },
      },
      update: {},
      create: {
        userId,
        taxYear: year.toString(),
        status: 'INITIATED',
      },
    });

    // Sync to Firestore
    await syncApplicationToFirestore(application);

    return NextResponse.json({
      success: true,
      message: `Tax Year ${year} section created successfully.`,
      year: year.toString(),
    });
  } catch (error: any) {
    console.error('Error adding tax year:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
