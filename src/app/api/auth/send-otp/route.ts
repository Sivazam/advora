import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendOtpSms } from '@/lib/sms';
import { adminFirestore } from '@/lib/firebaseAdmin';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { phone } = await req.json();

    if (!phone || typeof phone !== 'string') {
      return NextResponse.json({ error: 'Valid phone number is required' }, { status: 400 });
    }

    // Standardize phone format (e.g., +919493395299 or 9493395299)
    const cleanDigits = phone.replace(/[^0-9]/g, '');
    if (cleanDigits.length < 10) {
      return NextResponse.json({ error: 'Please enter a valid 10-digit phone number' }, { status: 400 });
    }

    const formattedPhone = cleanDigits.length === 10 ? `+91${cleanDigits}` : `+${cleanDigits}`;

    // Generate 6-digit OTP
    const isDev = process.env.DEV_MODE_OTP === 'true';
    const otp = isDev ? '123456' : Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    // Save OTP to Firestore (shared globally across all serverless function instances)
    try {
      await adminFirestore.collection('otp_verifications').doc(formattedPhone).set({
        phone: formattedPhone,
        cleanDigits,
        otp,
        expiresAt: expiresAt.toISOString(),
        createdAt: new Date().toISOString(),
      });
    } catch (fsErr) {
      console.warn('Firestore OTP save warning:', fsErr);
    }

    // Also attempt local SQLite if accessible, without breaking if serverless filesystem differs
    try {
      await db.otpVerification.deleteMany({
        where: { phone: formattedPhone },
      });

      await db.otpVerification.create({
        data: {
          phone: formattedPhone,
          otp,
          expiresAt,
        },
      });
    } catch (dbErr) {
      console.warn('SQLite OTP save warning (relying on Firestore):', dbErr);
    }

    // Dispatch SMS
    const smsResult = await sendOtpSms(formattedPhone, otp);

    return NextResponse.json({
      success: true,
      message: 'OTP sent successfully to your phone number.',
      devOtp: isDev ? otp : undefined,
    });
  } catch (error: any) {
    console.error('Error in send-otp:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
