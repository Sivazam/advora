import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { getLiveUser, getLiveApplication } from '@/lib/firestoreSync';

export const dynamic = 'force-dynamic';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const selectedYear = searchParams.get('year') || new Date().getFullYear().toString();

    // 1. Sync live status & application details from Firestore
    await getLiveUser(id);
    await getLiveApplication(id, selectedYear);

    const client = await db.user.findUnique({
      where: { id },
      include: {
        taxYears: {
          orderBy: { year: 'desc' },
        },
        auditLogs: {
          include: {
            performedBy: {
              select: {
                firstName: true,
                lastName: true,
                role: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        tickets: {
          include: {
            messages: {
              orderBy: { createdAt: 'asc' },
            },
          },
          orderBy: { updatedAt: 'desc' },
        },
      },
    });

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    // Ensure selected tax year section exists
    const hasYear = client.taxYears.some((t) => t.year === selectedYear);
    if (!hasYear) {
      await db.taxYearSection.create({
        data: {
          userId: client.id,
          year: selectedYear,
          isDefault: false,
        },
      }).catch(() => {});
    }

    // Find or create active application for selected year
    let activeApp = await db.taxApplication.findUnique({
      where: {
        userId_taxYear: {
          userId: client.id,
          taxYear: selectedYear,
        },
      },
    });

    if (!activeApp) {
      activeApp = await db.taxApplication.create({
        data: {
          userId: client.id,
          taxYear: selectedYear,
          status: 'INITIATED',
        },
      });
    }

    // Strictly fetch documents for THIS specific tax year
    const yearDocuments = await db.document.findMany({
      where: {
        userId: client.id,
        taxYear: selectedYear,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Fetch list of all admins for assignment dropdown
    const staffAdmins = await db.user.findMany({
      where: { role: { in: ['ADMIN', 'SUPER_ADMIN'] } },
      select: { id: true, firstName: true, lastName: true, role: true, phone: true },
    });

    // Fetch updated tax years
    const allTaxYears = await db.taxYearSection.findMany({
      where: { userId: client.id },
      orderBy: { year: 'desc' },
    });

    return NextResponse.json({
      client: {
        id: client.id,
        firstName: client.firstName,
        lastName: client.lastName,
        phone: client.phone,
        email: client.email,
        status: client.status,
        role: client.role,
        assignedAdminId: client.assignedAdminId,
        createdAt: client.createdAt,
        updatedAt: client.updatedAt,
      },
      taxYears: allTaxYears.map((t) => t.year),
      activeYear: selectedYear,
      activeApplication: activeApp,
      documents: {
        estimates: yearDocuments.filter((d) => d.category === 'ESTIMATE'),
        drafts: yearDocuments.filter((d) => d.category === 'DRAFT_COPY'),
        finals: yearDocuments.filter((d) => d.category === 'FILED_FINAL'),
        supporting: yearDocuments.filter((d) => d.category === 'SUPPORTING_DOC'),
      },
      auditLogs: client.auditLogs,
      tickets: client.tickets,
      staffAdmins,
    });
  } catch (error: any) {
    console.error('Error fetching client details:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
