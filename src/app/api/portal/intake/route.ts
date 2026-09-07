import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { saveUploadedFile } from '@/lib/storage';
import { notifyAdmins } from '@/lib/notifications';
import {
  syncUserToFirestore,
  syncApplicationToFirestore,
  syncDocumentToFirestore,
  syncAuditLogToFirestore,
  getLiveUserByPhone,
} from '@/lib/firestoreSync';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const firstName = formData.get('firstName')?.toString().trim();
    const lastName = formData.get('lastName')?.toString().trim();
    const phone = formData.get('phone')?.toString().trim();
    const email = formData.get('email')?.toString().trim() || null;
    const taxYear = formData.get('taxYear')?.toString().trim() || new Date().getFullYear().toString();
    const file = formData.get('document') as File | null;

    if (!firstName || !lastName || !phone) {
      return NextResponse.json(
        { error: 'First Name, Last Name, and Phone Number are mandatory.' },
        { status: 400 }
      );
    }

    const cleanDigits = phone.replace(/[^0-9]/g, '');
    if (cleanDigits.length < 10) {
      return NextResponse.json({ error: 'Please enter a valid phone number.' }, { status: 400 });
    }

    const formattedPhone = cleanDigits.length === 10 ? `+91${cleanDigits}` : `+${cleanDigits}`;

    // 1. Find or create User
    let user: any = null;
    try {
      user = await db.user.findUnique({
        where: { phone: formattedPhone },
      });
    } catch (dbErr) {
      console.warn('SQLite user lookup warning:', dbErr);
    }

    if (!user) {
      user = await getLiveUserByPhone(formattedPhone);
    }

    if (!user) {
      const newUserId = uuidv4();
      const userData = {
        id: newUserId,
        phone: formattedPhone,
        email,
        firstName,
        lastName,
        role: 'CLIENT',
        status: 'PENDING_APPROVAL', // Admin gate
      };

      try {
        user = await db.user.create({ data: userData });
      } catch (dbErr) {
        console.warn('SQLite user create skipped, using Firestore:', dbErr);
        user = userData;
      }
    }

    // Sync user to Firestore
    await syncUserToFirestore(user);

    // 2. Ensure Tax Year Section exists
    try {
      await db.taxYearSection.upsert({
        where: { userId_year: { userId: user.id, year: taxYear } },
        update: {},
        create: {
          userId: user.id,
          year: taxYear,
          isDefault: true,
        },
      });
    } catch (dbErr) {
      console.warn('SQLite taxYearSection notice:', dbErr);
    }

    // 3. Create or find Tax Application
    let application: any = {
      id: `${user.id}_${taxYear}`,
      userId: user.id,
      taxYear,
      status: 'INITIATED',
    };

    try {
      const foundApp = await db.taxApplication.findUnique({
        where: { userId_taxYear: { userId: user.id, taxYear } },
      });

      if (foundApp) {
        application = foundApp;
      } else {
        application = await db.taxApplication.create({
          data: {
            userId: user.id,
            taxYear,
            status: 'INITIATED',
          },
        });
      }
    } catch (dbErr) {
      console.warn('SQLite application notice:', dbErr);
    }

    // Sync application to Firestore
    await syncApplicationToFirestore(application);

    // 4. Save uploaded document if provided (saves to Firebase Cloud Storage)
    let storedDoc: any = null;
    if (file && file.size > 0) {
      const saved = await saveUploadedFile(file, 'supporting');
      const docId = uuidv4();
      storedDoc = {
        id: docId,
        userId: user.id,
        applicationId: application.id,
        taxYear,
        name: saved.name,
        fileUrl: saved.fileUrl,
        fileSize: saved.fileSize,
        fileType: saved.fileType,
        category: 'SUPPORTING_DOC',
        uploadedByRole: 'CLIENT',
      };

      try {
        const dbDoc = await db.document.create({
          data: storedDoc,
        });
        storedDoc = dbDoc;
      } catch (dbErr) {
        console.warn('SQLite document create notice:', dbErr);
      }

      // Sync document metadata to Firestore
      await syncDocumentToFirestore(storedDoc);
    }

    // 5. Create Audit Log
    try {
      const auditLog = await db.auditLog.create({
        data: {
          userId: user.id,
          performedById: user.id,
          applicationId: application.id,
          action: 'PUBLIC_ESTIMATION_SUBMITTED',
          newStatus: 'INITIATED',
          details: `Client submitted estimation intake for ${taxYear}${storedDoc ? ` with document: ${storedDoc.name}` : ''}.`,
        },
      });
      await syncAuditLogToFirestore(auditLog);
    } catch (dbErr) {
      console.warn('SQLite audit log notice:', dbErr);
    }

    // 6. Notify Admins
    await notifyAdmins(
      `New Estimation Request: ${firstName} ${lastName}`,
      `Phone: ${formattedPhone} for Tax Year ${taxYear}.${storedDoc ? ' (Document uploaded)' : ''}`,
      '/portal/admin'
    );

    return NextResponse.json({
      success: true,
      requestId: application.id,
      userId: user.id,
      message: 'Your estimation is in progress. We have received your information and document successfully.',
    });
  } catch (error: any) {
    console.error('Error in portal intake:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
