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

export async function DELETE(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Only administrators can delete tax years.' }, { status: 403 });
    }

    const { year, targetUserId } = await req.json();

    if (!year || !targetUserId) {
      return NextResponse.json({ error: 'Tax year and client ID are required.' }, { status: 400 });
    }

    const yearStr = year.toString();

    // Check existing tax years for this client
    const userYears = await db.taxYearSection.findMany({
      where: { userId: targetUserId },
    });

    if (userYears.length <= 1) {
      return NextResponse.json(
        { error: 'Cannot delete the only remaining tax year for this client.' },
        { status: 400 }
      );
    }

    // 1. Find Application
    const app = await db.taxApplication.findUnique({
      where: {
        userId_taxYear: {
          userId: targetUserId,
          taxYear: yearStr,
        },
      },
    });

    if (app) {
      // Delete documents associated with this year
      await db.document.deleteMany({
        where: { userId: targetUserId, taxYear: yearStr },
      });

      // Delete audit logs for this application
      await db.auditLog.deleteMany({
        where: { applicationId: app.id },
      });

      // Delete application
      await db.taxApplication.delete({
        where: { id: app.id },
      });

      // Delete from Firestore
      const { deleteApplicationFromFirestore } = await import('@/lib/firestoreSync');
      await deleteApplicationFromFirestore(app.id);
    }

    // 2. Delete Tax Year Section
    await db.taxYearSection.deleteMany({
      where: {
        userId: targetUserId,
        year: yearStr,
      },
    });

    // 3. Log Audit
    await db.auditLog.create({
      data: {
        userId: targetUserId,
        performerId: session.userId,
        action: 'TAX_YEAR_DELETED',
        details: `Tax Year ${yearStr} deleted by administrator ${session.firstName} ${session.lastName}.`,
      },
    });

    // Fetch remaining years
    const remaining = await db.taxYearSection.findMany({
      where: { userId: targetUserId },
      orderBy: { year: 'desc' },
    });

    return NextResponse.json({
      success: true,
      message: `Tax Year ${yearStr} successfully deleted.`,
      remainingYears: remaining.map((y) => y.year),
    });
  } catch (error: any) {
    console.error('Error deleting tax year:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
