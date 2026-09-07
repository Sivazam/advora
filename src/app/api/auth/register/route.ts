import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createSessionToken } from '@/lib/auth';
import { syncUserToFirestore, syncApplicationToFirestore, syncAuditLogToFirestore } from '@/lib/firestoreSync';
import { notifyAdmins } from '@/lib/notifications';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { phone, firstName, lastName, email, taxYear } = await req.json();

    if (!phone || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'Phone number, First Name, and Last Name are required.' },
        { status: 400 }
      );
    }

    const cleanDigits = phone.replace(/[^0-9]/g, '');
    if (cleanDigits.length < 10) {
      return NextResponse.json({ error: 'Please provide a valid 10-digit phone number.' }, { status: 400 });
    }

    const formattedPhone = cleanDigits.length === 10 ? `+91${cleanDigits}` : `+${cleanDigits}`;
    const selectedYear = taxYear?.toString().trim() || new Date().getFullYear().toString();

    // 1. Find or create user
    let user = await db.user.findUnique({
      where: { phone: formattedPhone },
    });

    if (!user) {
      user = await db.user.create({
        data: {
          phone: formattedPhone,
          email: email?.toString().trim() || null,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          role: 'CLIENT',
          status: 'PENDING_APPROVAL',
        },
      });
    } else {
      user = await db.user.update({
        where: { id: user.id },
        data: {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email?.toString().trim() || user.email,
        },
      });
    }

    // Sync to Firestore
    await syncUserToFirestore(user);

    // 2. Ensure TaxYearSection exists
    await db.taxYearSection.upsert({
      where: {
        userId_year: {
          userId: user.id,
          year: selectedYear,
        },
      },
      update: {},
      create: {
        userId: user.id,
        year: selectedYear,
        isDefault: true,
      },
    });

    // 3. Ensure TaxApplication exists
    const application = await db.taxApplication.upsert({
      where: {
        userId_taxYear: {
          userId: user.id,
          taxYear: selectedYear,
        },
      },
      update: {},
      create: {
        userId: user.id,
        taxYear: selectedYear,
        status: 'INITIATED',
      },
    });

    // Sync application to Firestore
    await syncApplicationToFirestore(application);

    // 4. Audit Log
    const auditLog = await db.auditLog.create({
      data: {
        userId: user.id,
        performedById: user.id,
        applicationId: application.id,
        action: 'CLIENT_REGISTERED',
        newStatus: 'INITIATED',
        details: `Client registered account with phone ${formattedPhone} for Tax Year ${selectedYear}.`,
      },
    });
    await syncAuditLogToFirestore(auditLog);

    // 5. Notify Admins via FCM Push and Bell
    await notifyAdmins(
      `New Client Registration: ${user.firstName} ${user.lastName} (Pending Approval)`,
      `Phone: ${formattedPhone} registered and awaiting your approval on the Admin Portal.`,
      '/portal/admin'
    );

    // 6. Generate Session Token
    const token = await createSessionToken({
      userId: user.id,
      phone: user.phone,
      role: user.role as any,
      status: user.status as any,
      firstName: user.firstName,
      lastName: user.lastName,
    });

    const response = NextResponse.json({
      success: true,
      message: 'Account created successfully.',
      redirectUrl: `/portal/client?year=${selectedYear}`,
      user: {
        id: user.id,
        phone: user.phone,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        status: user.status,
      },
    });

    // Set Session Cookie
    response.cookies.set({
      name: 'advora_session',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error: any) {
    console.error('Error in auth register:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
