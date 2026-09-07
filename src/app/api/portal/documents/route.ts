import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { saveUploadedFile } from '@/lib/storage';
import { createNotification, notifyAdmins } from '@/lib/notifications';
import { syncDocumentToFirestore } from '@/lib/firestoreSync';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';

const ALLOWED_EXTENSIONS = ['.pdf', '.png', '.jpg', '.jpeg', '.xlsx', '.xls', '.docx', '.doc'];
const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const taxYear = formData.get('taxYear')?.toString().trim() || new Date().getFullYear().toString();
    const category = formData.get('category')?.toString() || 'SUPPORTING_DOC';
    const targetUserId = formData.get('targetUserId')?.toString();

    if (!file || file.size === 0) {
      return NextResponse.json({ error: 'Please select a valid document to upload.' }, { status: 400 });
    }

    // 1. File Size Validation
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json({ error: 'File size exceeds maximum allowable limit of 25MB.' }, { status: 400 });
    }

    // 2. Extension Validation
    const fileName = file.name.toLowerCase();
    const isAllowed = ALLOWED_EXTENSIONS.some((ext) => fileName.endsWith(ext));
    if (!isAllowed) {
      return NextResponse.json(
        { error: 'Invalid file format. Supported formats: PDF, PNG, JPG, Excel (XLSX/XLS), Word (DOCX/DOC).' },
        { status: 400 }
      );
    }

    // 3. Determine owner of the document
    let ownerUserId = session.userId;
    let uploadedByRole = session.role;

    if (session.role === 'ADMIN' || session.role === 'SUPER_ADMIN') {
      if (targetUserId) {
        ownerUserId = targetUserId;
      }
    }

    // Ensure TaxYearSection exists
    await db.taxYearSection.upsert({
      where: {
        userId_year: {
          userId: ownerUserId,
          year: taxYear,
        },
      },
      update: {},
      create: {
        userId: ownerUserId,
        year: taxYear,
        isDefault: false,
      },
    });

    // Find or create Tax Application
    let application: any = {
      id: `${ownerUserId}_${taxYear}`,
      userId: ownerUserId,
      taxYear,
      status: 'INITIATED',
    };

    try {
      application = await db.taxApplication.upsert({
        where: {
          userId_taxYear: {
            userId: ownerUserId,
            taxYear,
          },
        },
        update: {},
        create: {
          userId: ownerUserId,
          taxYear,
          status: 'INITIATED',
        },
      });
    } catch (dbErr) {
      console.warn('SQLite application upsert notice:', dbErr);
    }

    // Save File to Firebase Cloud Storage
    const subfolder = category.toLowerCase().replace(/_/g, '-');
    const saved = await saveUploadedFile(file, subfolder);

    // Save Document Record strictly bound to owner and taxYear
    let document: any = {
      id: uuidv4(),
      userId: ownerUserId,
      applicationId: application.id,
      taxYear,
      name: saved.name,
      fileUrl: saved.fileUrl,
      fileSize: saved.fileSize,
      fileType: saved.fileType,
      category,
      uploadedByRole,
      createdAt: new Date(),
    };

    try {
      const dbDoc = await db.document.create({
        data: {
          id: document.id,
          userId: ownerUserId,
          applicationId: application.id,
          taxYear,
          name: saved.name,
          fileUrl: saved.fileUrl,
          fileSize: saved.fileSize,
          fileType: saved.fileType,
          category,
          uploadedByRole,
        },
      });
      document = dbDoc;
    } catch (dbErr) {
      console.warn('SQLite document create notice:', dbErr);
    }

    // Sync document metadata to Firestore
    try {
      await syncDocumentToFirestore(document);
    } catch (fsErr) {
      console.warn('Firestore document sync notice:', fsErr);
    }

    // Notify respective parties with FCM push
    if (uploadedByRole === 'CLIENT') {
      await notifyAdmins(
        `New Client Document Uploaded (${taxYear})`,
        `${session.firstName} ${session.lastName} uploaded: ${saved.name}`,
        `/portal/admin`
      );
    } else {
      let docLabel = 'Tax Document';
      if (category === 'ESTIMATE') docLabel = 'Tax Estimate Quotation';
      if (category === 'DRAFT_COPY') docLabel = 'Draft Tax Return Copy';
      if (category === 'FILED_FINAL') docLabel = 'Official Filed Tax Return Copy';

      await createNotification({
        userId: ownerUserId,
        title: `New ${docLabel} Available (${taxYear})`,
        message: `Our tax preparation team uploaded: ${saved.name}. View it in your portal now.`,
        link: `/portal/client?year=${taxYear}`,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Document uploaded successfully',
      document,
    });
  } catch (error: any) {
    console.error('Error uploading document:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { documentId } = await req.json();
    if (!documentId) {
      return NextResponse.json({ error: 'Document ID is required' }, { status: 400 });
    }

    const doc = await db.document.findUnique({
      where: { id: documentId },
    });

    if (!doc) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Permission check: only admin or owner can delete
    if (session.role === 'CLIENT' && doc.userId !== session.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await db.document.delete({
      where: { id: documentId },
    });

    // Delete from Firestore
    try {
      const { adminFirestore } = await import('@/lib/firebaseAdmin');
      await adminFirestore.collection('documents').doc(documentId).delete();
    } catch (e) {
      console.warn('Could not delete document from Firestore:', e);
    }

    return NextResponse.json({ success: true, message: 'Document deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting document:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
