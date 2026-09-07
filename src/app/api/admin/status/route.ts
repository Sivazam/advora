import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { createNotification } from '@/lib/notifications';
import { syncApplicationToFirestore, syncAuditLogToFirestore, syncUserToFirestore } from '@/lib/firestoreSync';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { userId, taxYear, newStatus, estimatedRefund, feeAmount, adminNotes } = await req.json();

    if (!userId || !taxYear || !newStatus) {
      return NextResponse.json({ error: 'User ID, Tax Year, and New Status are required' }, { status: 400 });
    }

    // Find current application
    let application = await db.taxApplication.findUnique({
      where: {
        userId_taxYear: {
          userId,
          taxYear,
        },
      },
      include: { user: true },
    });

    if (!application) {
      application = await db.taxApplication.create({
        data: {
          userId,
          taxYear,
          status: newStatus,
        },
        include: { user: true },
      });
    }

    const previousStatus = application.status;

    // Update Tax Application
    const updatedApp = await db.taxApplication.update({
      where: { id: application.id },
      data: {
        status: newStatus,
        estimatedRefund: estimatedRefund !== undefined ? parseFloat(estimatedRefund) || null : application.estimatedRefund,
        feeAmount: feeAmount !== undefined ? parseFloat(feeAmount) || null : application.feeAmount,
        adminNotes: adminNotes !== undefined ? adminNotes : application.adminNotes,
        updatedAt: new Date(),
      },
    });

    // If moving to IN_PROGRESS, activate client portal account if pending
    if (newStatus === 'IN_PROGRESS' && application.user.status === 'PENDING_APPROVAL') {
      const activeUser = await db.user.update({
        where: { id: userId },
        data: { status: 'ACTIVE' },
      });
      await syncUserToFirestore(activeUser);
    }

    // Sync updated application to Firestore
    await syncApplicationToFirestore(updatedApp);

    // Record Audit Log
    const auditLog = await db.auditLog.create({
      data: {
        userId,
        performedById: session.userId,
        applicationId: application.id,
        action: 'STATUS_TRANSITION',
        previousStatus,
        newStatus,
        details: `Tax Year ${taxYear}: ${previousStatus} → ${newStatus} by ${session.firstName} ${session.lastName}`,
      },
    });

    // Sync audit log to Firestore
    await syncAuditLogToFirestore(auditLog);

    // Notify Client
    let statusLabel = newStatus.replace(/_/g, ' ');
    await createNotification({
      userId,
      title: `Tax Status Updated: ${statusLabel}`,
      message: `Your ${taxYear} tax filing status has been updated to: ${statusLabel}. Check your portal for details.`,
      link: `/portal/client?year=${taxYear}`,
    });

    return NextResponse.json({
      success: true,
      message: `Status updated to ${newStatus} successfully.`,
      application: updatedApp,
    });
  } catch (error: any) {
    console.error('Error updating status:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
