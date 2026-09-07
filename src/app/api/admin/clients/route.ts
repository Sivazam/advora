import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { createNotification } from '@/lib/notifications';
import { sendOtpSms } from '@/lib/sms';
import { syncUserToFirestore, syncAuditLogToFirestore } from '@/lib/firestoreSync';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const statusFilter = searchParams.get('status'); // PENDING_APPROVAL, INITIATED, IN_PROGRESS, COMPLETED, PAYMENT_RECEIVED, ALL
    const searchQuery = searchParams.get('search')?.toLowerCase() || '';

    // Fetch clients
    const clients = await db.user.findMany({
      where: {
        role: 'CLIENT',
        ...(statusFilter && statusFilter !== 'ALL'
          ? statusFilter === 'PENDING_APPROVAL'
            ? { status: 'PENDING_APPROVAL' }
            : {
                applications: {
                  some: { status: statusFilter },
                },
              }
          : {}),
        ...(searchQuery
          ? {
              OR: [
                { firstName: { contains: searchQuery } },
                { lastName: { contains: searchQuery } },
                { phone: { contains: searchQuery } },
                { email: { contains: searchQuery } },
              ],
            }
          : {}),
      },
      include: {
        applications: {
          orderBy: { taxYear: 'desc' },
          include: {
            documents: true,
          },
        },
        taxYears: {
          orderBy: { year: 'desc' },
        },
        tickets: true,
      },
      orderBy: { updatedAt: 'desc' },
    });

    // Summary counts for dashboard badges
    const totalClients = await db.user.count({ where: { role: 'CLIENT' } });
    const pendingApprovalCount = await db.user.count({ where: { role: 'CLIENT', status: 'PENDING_APPROVAL' } });
    const inProgressCount = await db.taxApplication.count({ where: { status: 'IN_PROGRESS' } });
    const completedCount = await db.taxApplication.count({ where: { status: 'COMPLETED' } });
    const paymentReceivedCount = await db.taxApplication.count({ where: { status: 'PAYMENT_RECEIVED' } });

    return NextResponse.json({
      clients,
      stats: {
        totalClients,
        pendingApprovalCount,
        inProgressCount,
        completedCount,
        paymentReceivedCount,
      },
    });
  } catch (error: any) {
    console.error('Error fetching admin client list:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

// Update client information (e.g., Edit Phone Number, Email, Name)
export async function PATCH(req: Request) {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { userId, phone, firstName, lastName, email, assignedAdminId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const existingUser = await db.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    // Format new phone if provided
    let formattedPhone = existingUser.phone;
    if (phone && phone !== existingUser.phone) {
      const cleanDigits = phone.replace(/[^0-9]/g, '');
      formattedPhone = cleanDigits.length === 10 ? `+91${cleanDigits}` : `+${cleanDigits}`;

      // Check if new phone is already in use by another user
      const duplicate = await db.user.findFirst({
        where: {
          phone: formattedPhone,
          id: { not: userId },
        },
      });

      if (duplicate) {
        return NextResponse.json({ error: 'Another user already exists with this phone number.' }, { status: 400 });
      }
    }

    const updatedUser = await db.user.update({
      where: { id: userId },
      data: {
        phone: formattedPhone,
        firstName: firstName || existingUser.firstName,
        lastName: lastName || existingUser.lastName,
        email: email !== undefined ? email : existingUser.email,
        assignedAdminId: assignedAdminId !== undefined ? assignedAdminId : existingUser.assignedAdminId,
      },
    });

    // Sync to Firestore
    await syncUserToFirestore(updatedUser);

    // Create Audit Log for phone or profile change
    const auditLog = await db.auditLog.create({
      data: {
        userId,
        performedById: session.userId,
        action: 'CLIENT_PROFILE_UPDATED',
        details: `Admin updated client profile. Phone: ${existingUser.phone} -> ${formattedPhone}`,
      },
    });

    // Sync audit log to Firestore
    await syncAuditLogToFirestore(auditLog);

    return NextResponse.json({
      success: true,
      message: 'Client profile updated successfully. All history and tax files remain securely preserved.',
      user: updatedUser,
    });
  } catch (error: any) {
    console.error('Error updating client profile:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

// Approve Client (Admin Gate)
export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const user = await db.user.update({
      where: { id: userId },
      data: {
        status: 'ACTIVE',
      },
    });

    // Sync approved user to Firestore
    await syncUserToFirestore(user);

    // Create Audit Log
    const auditLog = await db.auditLog.create({
      data: {
        userId,
        performedById: session.userId,
        action: 'CLIENT_APPROVED',
        details: `Admin approved client portal access for ${user.firstName} ${user.lastName}.`,
      },
    });

    // Sync audit log to Firestore
    await syncAuditLogToFirestore(auditLog);

    // Send in-app notification & optional SMS alert
    await createNotification({
      userId,
      title: 'Portal Access Approved!',
      message: 'Your Advora Tax Portal account has been approved. You can now upload and track your tax returns.',
      link: '/portal/client',
    });

    // Notify user via SMS
    console.log(`📲 [SMS Notification to ${user.phone}]: Your Advora Tax Portal account is now active.`);

    return NextResponse.json({
      success: true,
      message: `${user.firstName} ${user.lastName}'s account is now ACTIVE and approved.`,
      user,
    });
  } catch (error: any) {
    console.error('Error approving client:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
