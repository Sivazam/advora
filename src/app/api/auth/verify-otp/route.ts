import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createSessionToken } from '@/lib/auth';
import { getLiveUser, getLiveUserByPhone } from '@/lib/firestoreSync';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { phone, otp } = await req.json();

    if (!phone || !otp) {
      return NextResponse.json({ error: 'Phone and OTP are required' }, { status: 400 });
    }

    // Clean phone
    const cleanDigits = phone.replace(/[^0-9]/g, '');
    const formattedPhone = cleanDigits.length === 10 ? `+91${cleanDigits}` : `+${cleanDigits}`;

    // Verify OTP record in database
    const verification = await db.otpVerification.findFirst({
      where: {
        phone: formattedPhone,
        otp: otp.toString().trim(),
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: {
        expiresAt: 'desc',
      },
    });

    const isDev = process.env.DEV_MODE_OTP === 'true';
    const isMasterOtp = isDev && otp.toString().trim() === '123456';

    if (!verification && !isMasterOtp) {
      return NextResponse.json({ error: 'Invalid or expired OTP. Please try again.' }, { status: 401 });
    }

    // Delete used OTP
    if (verification) {
      await db.otpVerification.delete({
        where: { id: verification.id },
      });
    }

    // Lookup user by phone in local database
    let user = await db.user.findUnique({
      where: { phone: formattedPhone },
    });

    if (!user) {
      user = await db.user.findFirst({
        where: {
          phone: {
            contains: cleanDigits.slice(-10),
          },
        },
      });
    }

    // If not found in SQLite, check if user exists in Firestore (e.g. Admin or previously registered)
    if (!user) {
      user = await getLiveUserByPhone(formattedPhone);
    }

    // If still not found, signal to frontend to collect profile details
    if (!user) {
      return NextResponse.json({
        success: true,
        isNewUser: true,
        phone: formattedPhone,
        message: 'Phone number verified. Please complete your registration.',
      });
    }

    // Reconcile status & role live from Firestore if changed in Console
    const liveUser = await getLiveUser(user.id);
    const userStatus = liveUser?.status || user.status;
    const userRole = liveUser?.role || user.role;

    if (liveUser?.role && liveUser.role !== user.role) {
      await db.user.update({
        where: { id: user.id },
        data: { role: liveUser.role },
      }).catch(() => {});
    }

    // Generate session JWT with correct role
    const token = await createSessionToken({
      userId: user.id,
      phone: user.phone,
      role: userRole as any,
      status: userStatus as any,
      firstName: user.firstName,
      lastName: user.lastName,
    });

    // Determine target URL based on role and status
    let redirectUrl = '/portal/client';
    if (userRole === 'SUPER_ADMIN' || userRole === 'ADMIN') {
      redirectUrl = '/portal/admin';
    }

    const response = NextResponse.json({
      success: true,
      isNewUser: false,
      user: {
        id: user.id,
        phone: user.phone,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: userRole,
        status: userStatus,
      },
      redirectUrl,
    });

    // Set HTTP-only session cookie
    response.cookies.set({
      name: 'advora_session',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error: any) {
    console.error('Error in verify-otp:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
