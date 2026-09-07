import { adminFirestore, adminStorage } from './firebaseAdmin';
import { db } from './db';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

/**
 * Fetch fresh user status from Firestore and reconcile with local database
 */
export async function getLiveUser(userId: string) {
  try {
    const doc = await adminFirestore.collection('users').doc(userId).get();
    if (doc.exists) {
      const fsUser: any = doc.data();
      if (fsUser && fsUser.status) {
        // Reconcile status in local DB
        await db.user.update({
          where: { id: userId },
          data: {
            status: fsUser.status,
            firstName: fsUser.firstName,
            lastName: fsUser.lastName,
            role: fsUser.role,
            phone: fsUser.phone,
            fcmToken: fsUser.fcmToken || undefined,
          },
        }).catch(() => {});
        return fsUser;
      }
    }
  } catch (err) {
    console.error('Error fetching live user from Firestore:', err);
  }
  return null;
}

/**
 * Lookup user in Firestore by phone number and import/reconcile with local database
 */
export async function getLiveUserByPhone(phone: string) {
  try {
    const cleanDigits = phone.replace(/[^0-9]/g, '');
    const formattedPhone = cleanDigits.length === 10 ? `+91${cleanDigits}` : `+${cleanDigits}`;

    let snapshot = await adminFirestore
      .collection('users')
      .where('phone', '==', formattedPhone)
      .limit(1)
      .get();

    if (snapshot.empty && cleanDigits.length >= 10) {
      snapshot = await adminFirestore
        .collection('users')
        .where('phone', '==', cleanDigits)
        .limit(1)
        .get();
    }

    if (!snapshot.empty) {
      const doc = snapshot.docs[0];
      const fsUser: any = doc.data();

      let user = null;
      try {
        user = await db.user.upsert({
          where: { id: doc.id },
          update: {
            phone: fsUser.phone || formattedPhone,
            status: fsUser.status || 'PENDING_APPROVAL',
            firstName: fsUser.firstName || 'User',
            lastName: fsUser.lastName || '',
            role: fsUser.role || 'CLIENT',
            email: fsUser.email || null,
            fcmToken: fsUser.fcmToken || undefined,
          },
          create: {
            id: doc.id,
            phone: fsUser.phone || formattedPhone,
            email: fsUser.email || null,
            firstName: fsUser.firstName || 'User',
            lastName: fsUser.lastName || '',
            role: fsUser.role || 'CLIENT',
            status: fsUser.status || 'PENDING_APPROVAL',
            fcmToken: fsUser.fcmToken || null,
          },
        });
      } catch (upsertErr) {
        console.warn('Local SQLite upsert notice (using Firestore record):', upsertErr);
      }

      return user || {
        id: doc.id,
        phone: fsUser.phone || formattedPhone,
        email: fsUser.email || null,
        firstName: fsUser.firstName || 'User',
        lastName: fsUser.lastName || '',
        role: fsUser.role || 'CLIENT',
        status: fsUser.status || 'PENDING_APPROVAL',
        fcmToken: fsUser.fcmToken || null,
      };
    }
  } catch (err) {
    console.error('Error finding user by phone in Firestore:', err);
  }
  return null;
}

/**
 * Sync all users who have role ADMIN or SUPER_ADMIN in Firestore into local database
 */
export async function syncAdminsFromFirestore() {
  try {
    const adminSnap = await adminFirestore
      .collection('users')
      .where('role', 'in', ['ADMIN', 'SUPER_ADMIN'])
      .get();

    for (const doc of adminSnap.docs) {
      const data: any = doc.data();
      await db.user.upsert({
        where: { id: doc.id },
        update: {
          role: data.role,
          status: data.status || 'ACTIVE',
          phone: data.phone,
          firstName: data.firstName || 'Admin',
          lastName: data.lastName || 'User',
          fcmToken: data.fcmToken || undefined,
        },
        create: {
          id: doc.id,
          phone: data.phone,
          role: data.role,
          status: data.status || 'ACTIVE',
          firstName: data.firstName || 'Admin',
          lastName: data.lastName || 'User',
          email: data.email || null,
          fcmToken: data.fcmToken || null,
        },
      }).catch(() => {});
    }
  } catch (err) {
    console.error('Error syncing admins from Firestore:', err);
  }
}

/**
 * Fetch fresh application details (status, refund, notes) from Firestore
 * and reconcile with local database so console edits reflect immediately.
 */
export async function getLiveApplication(userId: string, taxYear: string) {
  try {
    const snapshot = await adminFirestore
      .collection('tax_applications')
      .where('userId', '==', userId)
      .where('taxYear', '==', taxYear)
      .limit(1)
      .get();

    if (!snapshot.empty) {
      const doc = snapshot.docs[0];
      const fsApp: any = doc.data();

      // Reconcile with local SQLite database
      const updated = await db.taxApplication.upsert({
        where: { userId_taxYear: { userId, taxYear } },
        update: {
          status: fsApp.status || 'INITIATED',
          estimatedRefund: fsApp.estimatedRefund !== undefined ? fsApp.estimatedRefund : undefined,
          feeAmount: fsApp.feeAmount !== undefined ? fsApp.feeAmount : undefined,
          adminNotes: fsApp.adminNotes !== undefined ? fsApp.adminNotes : undefined,
        },
        create: {
          id: doc.id,
          userId,
          taxYear,
          status: fsApp.status || 'INITIATED',
          estimatedRefund: fsApp.estimatedRefund || null,
          feeAmount: fsApp.feeAmount || null,
          adminNotes: fsApp.adminNotes || null,
        },
      });

      return updated;
    }
  } catch (err) {
    console.error(`Error fetching live application from Firestore (${taxYear}):`, err);
  }
  return null;
}

/**
 * Save browser FCM push token for a user in both local DB and Firestore
 */
export async function saveFcmToken(userId: string, fcmToken: string) {
  try {
    // 1. Update SQLite
    await db.user.update({
      where: { id: userId },
      data: { fcmToken },
    });

    // 2. Update Firestore
    await adminFirestore.collection('users').doc(userId).set(
      {
        fcmToken,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    console.log(`📱 [FCM TOKEN REGISTERED]: user ${userId}`);
    return true;
  } catch (err) {
    console.error('Error saving FCM token:', err);
    return false;
  }
}

/**
 * Uploads a file buffer directly to Firebase Storage bucket
 */
export async function uploadToFirebaseStorage(
  fileBuffer: Buffer,
  originalName: string,
  contentType: string,
  subfolder: string = 'documents'
): Promise<{ fileUrl: string; storagePath: string }> {
  try {
    const ext = path.extname(originalName) || '';
    const baseName = path.basename(originalName, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const uniqueFileName = `${Date.now()}_${uuidv4().slice(0, 8)}_${baseName}${ext}`;
    const storagePath = `${subfolder}/${uniqueFileName}`;

    const bucket = adminStorage.bucket();
    const storageFile = bucket.file(storagePath);
    const downloadToken = uuidv4();

    await storageFile.save(fileBuffer, {
      contentType,
      resumable: false,
      metadata: {
        contentType,
        metadata: {
          originalName,
          uploadedAt: new Date().toISOString(),
          firebaseStorageDownloadTokens: downloadToken,
        },
      },
    });

    await storageFile.makePublic().catch(() => {});

    const fileUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(storagePath)}?alt=media&token=${downloadToken}`;

    return { fileUrl, storagePath };
  } catch (error) {
    console.error('Firebase Storage upload error:', error);
    return { fileUrl: `/uploads/${subfolder}/${originalName}`, storagePath: '' };
  }
}

/**
 * Sync User record to Firestore 'users' collection
 */
export async function syncUserToFirestore(user: {
  id: string;
  phone: string;
  email?: string | null;
  firstName: string;
  lastName: string;
  role: string;
  status: string;
  fcmToken?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}) {
  try {
    await adminFirestore.collection('users').doc(user.id).set(
      {
        id: user.id,
        phone: user.phone,
        email: user.email || null,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        status: user.status,
        fcmToken: user.fcmToken || null,
        updatedAt: new Date().toISOString(),
        createdAt: user.createdAt ? user.createdAt.toISOString() : new Date().toISOString(),
      },
      { merge: true }
    );
    console.log(`🔥 [FIRESTORE SYNC] User synced to Firestore: ${user.id} (${user.phone})`);
  } catch (error) {
    console.error('Error syncing user to Firestore:', error);
  }
}

/**
 * Sync Tax Application to Firestore 'tax_applications' collection
 */
export async function syncApplicationToFirestore(app: {
  id: string;
  userId: string;
  taxYear: string;
  status: string;
  estimatedRefund?: number | null;
  feeAmount?: number | null;
  adminNotes?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}) {
  try {
    await adminFirestore.collection('tax_applications').doc(app.id).set(
      {
        id: app.id,
        userId: app.userId,
        taxYear: app.taxYear,
        status: app.status,
        estimatedRefund: app.estimatedRefund || null,
        feeAmount: app.feeAmount || null,
        adminNotes: app.adminNotes || null,
        updatedAt: new Date().toISOString(),
        createdAt: app.createdAt ? app.createdAt.toISOString() : new Date().toISOString(),
      },
      { merge: true }
    );
    console.log(`🔥 [FIRESTORE SYNC] Tax Application synced: ${app.id} (${app.taxYear})`);
  } catch (error) {
    console.error('Error syncing application to Firestore:', error);
  }
}

/**
 * Sync Document to Firestore 'documents' collection
 */
export async function syncDocumentToFirestore(doc: {
  id: string;
  userId: string;
  applicationId?: string | null;
  taxYear: string;
  name: string;
  fileUrl: string;
  fileSize: number;
  fileType: string;
  category: string;
  uploadedByRole: string;
  createdAt?: Date;
}) {
  try {
    await adminFirestore.collection('documents').doc(doc.id).set(
      {
        id: doc.id,
        userId: doc.userId,
        applicationId: doc.applicationId || null,
        taxYear: doc.taxYear,
        name: doc.name,
        fileUrl: doc.fileUrl,
        fileSize: doc.fileSize,
        fileType: doc.fileType,
        category: doc.category,
        uploadedByRole: doc.uploadedByRole,
        createdAt: doc.createdAt ? doc.createdAt.toISOString() : new Date().toISOString(),
      },
      { merge: true }
    );
    console.log(`🔥 [FIRESTORE SYNC] Document synced: ${doc.id} (${doc.name})`);
  } catch (error) {
    console.error('Error syncing document to Firestore:', error);
  }
}

/**
 * Sync Audit Log to Firestore 'audit_logs' collection
 */
export async function syncAuditLogToFirestore(log: {
  id: string;
  userId: string;
  performedById?: string | null;
  applicationId?: string | null;
  action: string;
  previousStatus?: string | null;
  newStatus?: string | null;
  details?: string | null;
  createdAt?: Date;
}) {
  try {
    await adminFirestore.collection('audit_logs').doc(log.id).set({
      id: log.id,
      userId: log.userId,
      performedById: log.performedById || null,
      applicationId: log.applicationId || null,
      action: log.action,
      previousStatus: log.previousStatus || null,
      newStatus: log.newStatus || null,
      details: log.details || null,
      createdAt: log.createdAt ? log.createdAt.toISOString() : new Date().toISOString(),
    });
    console.log(`🔥 [FIRESTORE SYNC] Audit Log synced: ${log.id} (${log.action})`);
  } catch (error) {
    console.error('Error syncing audit log to Firestore:', error);
  }
}

/**
 * Sync Support Ticket to Firestore 'support_tickets' collection
 */
export async function syncTicketToFirestore(ticket: {
  id: string;
  userId: string;
  subject: string;
  status: string;
  messages?: any[];
  createdAt?: Date;
  updatedAt?: Date;
}) {
  try {
    await adminFirestore.collection('support_tickets').doc(ticket.id).set(
      {
        id: ticket.id,
        userId: ticket.userId,
        subject: ticket.subject,
        status: ticket.status,
        messages: ticket.messages || [],
        updatedAt: new Date().toISOString(),
        createdAt: ticket.createdAt ? ticket.createdAt.toISOString() : new Date().toISOString(),
      },
      { merge: true }
    );
    console.log(`🔥 [FIRESTORE SYNC] Support Ticket synced: ${ticket.id}`);
  } catch (error) {
    console.error('Error syncing ticket to Firestore:', error);
  }
}

/**
 * Delete Tax Application from Firestore 'tax_applications' collection
 */
export async function deleteApplicationFromFirestore(appId: string) {
  try {
    await adminFirestore.collection('tax_applications').doc(appId).delete();
    console.log(`🔥 [FIRESTORE SYNC] Deleted tax application from Firestore: ${appId}`);
  } catch (error) {
    console.error('Error deleting application from Firestore:', error);
  }
}

/**
 * Ensures a client has the last 3 tax years initialized (e.g. 2026, 2025, 2024),
 * plus any specifically requested year.
 */
export async function ensureDefaultTaxYears(userId: string, activeYear?: string) {
  const currentYear = new Date().getFullYear();
  const targetYears = [
    currentYear.toString(),
    (currentYear - 1).toString(),
    (currentYear - 2).toString(),
  ];

  if (activeYear && /^\d{4}$/.test(activeYear) && !targetYears.includes(activeYear)) {
    targetYears.push(activeYear);
  }

  // Sort descending
  targetYears.sort((a, b) => parseInt(b) - parseInt(a));

  // Ensure user exists in SQLite first so foreign key constraints succeed
  try {
    const exists = await db.user.findUnique({ where: { id: userId } });
    if (!exists) {
      const liveUser = await getLiveUser(userId);
      if (liveUser) {
        await db.user.create({
          data: {
            id: userId,
            phone: liveUser.phone || '',
            firstName: liveUser.firstName || 'User',
            lastName: liveUser.lastName || '',
            role: liveUser.role || 'CLIENT',
            status: liveUser.status || 'PENDING_APPROVAL',
            email: liveUser.email || null,
          },
        }).catch(() => {});
      }
    }
  } catch (e) {
    console.warn('User prep for tax years warning:', e);
  }

  for (const year of targetYears) {
    // 1. Ensure taxYearSection exists in SQLite
    try {
      await db.taxYearSection.upsert({
        where: { userId_year: { userId, year } },
        update: {},
        create: {
          userId,
          year,
          isDefault: year === (activeYear || currentYear.toString()),
        },
      });
    } catch (e) {
      console.warn(`SQLite taxYearSection notice for ${year}:`, e);
    }

    // 2. Ensure taxApplication exists in SQLite
    let app: any = null;
    try {
      app = await db.taxApplication.findUnique({
        where: { userId_taxYear: { userId, taxYear: year } },
      });
      if (!app) {
        app = await db.taxApplication.create({
          data: {
            userId,
            taxYear: year,
            status: 'INITIATED',
          },
        });
      }
    } catch (e) {
      console.warn(`SQLite taxApplication notice for ${year}:`, e);
    }

    // 3. Ensure taxApplication exists in Firestore
    if (app) {
      await syncApplicationToFirestore(app).catch(() => {});
    } else {
      await adminFirestore.collection('tax_applications').doc(`${userId}_${year}`).set(
        {
          id: `${userId}_${year}`,
          userId,
          taxYear: year,
          status: 'INITIATED',
          updatedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        },
        { merge: true }
      ).catch(() => {});
    }
  }
}

