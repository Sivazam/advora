import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { getLiveUser, getLiveApplication, ensureDefaultTaxYears } from '@/lib/firestoreSync';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const selectedYear = searchParams.get('year') || new Date().getFullYear().toString();

    // 1. Concurrently reconcile live user, application, and tax years
    await Promise.all([
      getLiveUser(session.userId),
      getLiveApplication(session.userId, selectedYear),
      ensureDefaultTaxYears(session.userId, selectedYear),
    ]);

    // 3. Fetch fresh user data with all tax years
    const user = await db.user.findUnique({
      where: { id: session.userId },
      include: {
        taxYears: {
          orderBy: { year: 'desc' },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 3. Fetch or create Tax Application for selected year
    let application = await db.taxApplication.findUnique({
      where: {
        userId_taxYear: {
          userId: user.id,
          taxYear: selectedYear,
        },
      },
    });

    if (!application) {
      application = await db.taxApplication.create({
        data: {
          userId: user.id,
          taxYear: selectedYear,
          status: 'INITIATED',
        },
      });
    }

    // 4. Strictly fetch documents belonging to THIS USER and THIS SPECIFIC TAX YEAR
    const yearDocuments = await db.document.findMany({
      where: {
        userId: user.id,
        taxYear: selectedYear,
      },
      orderBy: { createdAt: 'desc' },
    });

    // 5. Fetch Support Tickets
    const tickets = await db.supportTicket.findMany({
      where: { userId: user.id },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    // 6. Fetch Notifications
    const notifications = await db.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    // Re-fetch tax years list to ensure freshly added sections are included
    const allTaxYears = await db.taxYearSection.findMany({
      where: { userId: user.id },
      orderBy: { year: 'desc' },
    });

    const currentYear = new Date().getFullYear();
    const defaultYears = [currentYear.toString(), (currentYear - 1).toString(), (currentYear - 2).toString()];
    const yearsSet = new Set<string>(defaultYears);
    if (selectedYear && /^\d{4}$/.test(selectedYear)) yearsSet.add(selectedYear);
    allTaxYears.forEach((t) => yearsSet.add(t.year));

    const combinedYears = Array.from(yearsSet).sort((a, b) => parseInt(b) - parseInt(a));

    return NextResponse.json({
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        email: user.email,
        status: user.status,
        role: user.role,
      },
      taxYears: combinedYears,
      activeYear: selectedYear,
      application: {
        id: application.id,
        taxYear: application.taxYear,
        status: application.status,
        estimatedRefund: application.estimatedRefund,
        feeAmount: application.feeAmount,
        adminNotes: application.adminNotes,
        updatedAt: application.updatedAt,
      },
      documents: {
        estimates: yearDocuments.filter((d) => d.category === 'ESTIMATE'),
        drafts: yearDocuments.filter((d) => d.category === 'DRAFT_COPY'),
        finals: yearDocuments.filter((d) => d.category === 'FILED_FINAL'),
        supporting: yearDocuments.filter((d) => d.category === 'SUPPORTING_DOC'),
      },
      tickets,
      notifications,
    });
  } catch (error: any) {
    console.error('Error fetching client dashboard:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
