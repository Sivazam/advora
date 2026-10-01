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
        // Reconcile status in local DB (upsert to ensure user exists on fresh containers)
        await db.user.upsert({
          where: { id: userId },
          update: {
            status: fsUser.status,
            firstName: fsUser.firstName || 'User',
            lastName: fsUser.lastName || '',
            role: fsUser.role || 'CLIENT',
            phone: fsUser.phone || '',
            email: fsUser.email || undefined,
            fcmToken: fsUser.fcmToken || undefined,
            assignedAdminId: fsUser.assignedAdminId || undefined,
          },
          create: {
            id: userId,
            phone: fsUser.phone || '',
            firstName: fsUser.firstName || 'User',
            lastName: fsUser.lastName || '',
            role: fsUser.role || 'CLIENT',
            status: fsUser.status || 'PENDING_APPROVAL',
            email: fsUser.email || null,
            fcmToken: fsUser.fcmToken || null,
            assignedAdminId: fsUser.assignedAdminId || null,
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

      let user: any = null;
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
            assignedAdminId: fsUser.assignedAdminId || undefined,
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
            assignedAdminId: fsUser.assignedAdminId || null,
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
        assignedAdminId: fsUser.assignedAdminId || null,
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
 * Sync all users who have role CLIENT in Firestore into local database
 */
export async function syncClientsFromFirestore() {
  try {
    const clientsSnap = await adminFirestore
      .collection('users')
      .where('role', '==', 'CLIENT')
      .get();

    for (const doc of clientsSnap.docs) {
      const data: any = doc.data();
      await db.user.upsert({
        where: { id: doc.id },
        update: {
          role: 'CLIENT',
          status: data.status || 'PENDING_APPROVAL',
          phone: data.phone || '',
          firstName: data.firstName || 'Client',
          lastName: data.lastName || '',
          email: data.email || null,
          fcmToken: data.fcmToken || undefined,
          assignedAdminId: data.assignedAdminId || undefined,
        },
        create: {
          id: doc.id,
          phone: data.phone || '',
          role: 'CLIENT',
          status: data.status || 'PENDING_APPROVAL',
          firstName: data.firstName || 'Client',
          lastName: data.lastName || '',
          email: data.email || null,
          fcmToken: data.fcmToken || null,
          assignedAdminId: data.assignedAdminId || null,
        },
      }).catch(() => {});
    }
  } catch (err) {
    console.error('Error syncing clients from Firestore:', err);
  }
}

/**
 * Fetch fresh application details (status, refund, notes) from Firestore
 * and reconcile with local database so console edits reflect immediately.
 */
export async function getLiveApplication(userId: string, taxYear: string) {
  try {
    const deterministicId = `${userId}_${taxYear}`;
    let fsApp: any = null;
    let docId = deterministicId;

    // 1. Try deterministic primary key first
    const directDoc = await adminFirestore.collection('tax_applications').doc(deterministicId).get();
    if (directDoc.exists) {
      fsApp = directDoc.data();
    } else {
      // 2. Fallback query for legacy documents
      const snapshot = await adminFirestore
        .collection('tax_applications')
        .where('userId', '==', userId)
        .where('taxYear', '==', taxYear)
        .limit(1)
        .get();

      if (!snapshot.empty) {
        fsApp = snapshot.docs[0].data();
        docId = snapshot.docs[0].id;
      }
    }

    if (fsApp) {
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
          id: docId,
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
    // 1. Ensure user exists locally if on a fresh container
    const existing = await db.user.findUnique({ where: { id: userId } }).catch(() => null);
    if (!existing) {
      await getLiveUser(userId);
    }

    // 2. Update SQLite safely
    await db.user.upsert({
      where: { id: userId },
      update: { fcmToken },
      create: {
        id: userId,
        phone: '',
        firstName: 'User',
        lastName: '',
        role: 'CLIENT',
        status: 'ACTIVE',
        fcmToken,
      },
    }).catch(() => {});

    // 3. Update Firestore
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
  assignedAdminId?: string | null;
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
        assignedAdminId: user.assignedAdminId || null,
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
    const docId = `${app.userId}_${app.taxYear}`;
    await adminFirestore.collection('tax_applications').doc(docId).set(
      {
        id: docId,
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
    console.log(`🔥 [FIRESTORE SYNC] Tax Application synced: ${docId} (${app.taxYear})`);
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

    // Clean up associated documents in Firestore to prevent orphaned files
    const docsSnap = await adminFirestore.collection('documents').where('applicationId', '==', appId).get();
    if (!docsSnap.empty) {
      const batch = adminFirestore.batch();
      docsSnap.docs.forEach((d) => batch.delete(d.ref));
      await batch.commit();
      console.log(`🔥 [FIRESTORE SYNC] Cleaned up ${docsSnap.size} associated documents for ${appId}`);
    }
  } catch (error) {
    console.error('Error deleting application from Firestore:', error);
  }
}

/**
 * Ensures a client has the last 3 tax years initialized (e.g. 2026, 2025, 2024),
 * plus any specifically requested year.
 */
export async function ensureDefaultTaxYears(userId: string, activeYear?: string) {
  // Fast-path: if default tax years already exist in local DB, skip heavy network round-trips
  try {
    const existingCount = await db.taxYearSection.count({ where: { userId } });
    if (existingCount >= 3) {
      if (activeYear && /^\d{4}$/.test(activeYear)) {
        const hasActive = await db.taxYearSection.findUnique({
          where: { userId_year: { userId, year: activeYear } },
        });
        if (hasActive) return;
      } else {
        return;
      }
    }
  } catch (e) {}

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

    // 2. Check if taxApplication already exists in SQLite or Firestore to avoid overwriting real status
    let app: any = null;
    try {
      app = await db.taxApplication.findUnique({
        where: { userId_taxYear: { userId, taxYear: year } },
      });
    } catch (e) {}

    let fsApp: any = null;
    try {
      const docRef = adminFirestore.collection('tax_applications').doc(`${userId}_${year}`);
      const snap = await docRef.get();
      if (snap.exists) {
        fsApp = snap.data();
      }
    } catch (fsErr) {
      console.warn(`Firestore check error for ${year}:`, fsErr);
    }

    const appStatus = fsApp?.status || app?.status || 'INITIATED';

    if (!app) {
      try {
        app = await db.taxApplication.create({
          data: {
            id: `${userId}_${year}`,
            userId,
            taxYear: year,
            status: appStatus,
            estimatedRefund: fsApp?.estimatedRefund || null,
            feeAmount: fsApp?.feeAmount || null,
            adminNotes: fsApp?.adminNotes || null,
          },
        });
      } catch (e) {
        console.warn(`SQLite taxApplication notice for ${year}:`, e);
      }
    }

    // 3. Only initialize in Firestore if document didn't already exist
    if (!fsApp) {
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

/**
 * Fetch fresh documents for a user and tax year from Firestore
 * and reconcile them with local database. Returns the documents array.
 */
export async function getLiveDocuments(userId: string, taxYear: string) {
  try {
    const snapshot = await adminFirestore
      .collection('documents')
      .where('userId', '==', userId)
      .where('taxYear', '==', taxYear)
      .get();

    if (!snapshot.empty) {
      const docs: any[] = [];
      for (const docSnap of snapshot.docs) {
        const data: any = docSnap.data();
        const docId = docSnap.id;
        const createdAt = data.createdAt ? new Date(data.createdAt) : new Date();

        try {
          const upserted = await db.document.upsert({
            where: { id: docId },
            update: {
              name: data.name || 'Document',
              fileUrl: data.fileUrl,
              fileSize: Number(data.fileSize) || 0,
              fileType: data.fileType || 'pdf',
              category: data.category || 'SUPPORTING_DOC',
              uploadedByRole: data.uploadedByRole || 'ADMIN',
              taxYear: data.taxYear || taxYear,
              userId,
            },
            create: {
              id: docId,
              userId,
              applicationId: data.applicationId || `${userId}_${taxYear}`,
              taxYear: data.taxYear || taxYear,
              name: data.name || 'Document',
              fileUrl: data.fileUrl,
              fileSize: Number(data.fileSize) || 0,
              fileType: data.fileType || 'pdf',
              category: data.category || 'SUPPORTING_DOC',
              uploadedByRole: data.uploadedByRole || 'ADMIN',
              createdAt,
            },
          });
          docs.push(upserted);
        } catch (dbErr) {
          console.warn(`Local SQLite document upsert notice (${docId}):`, dbErr);
          docs.push({
            id: docId,
            userId,
            applicationId: data.applicationId || `${userId}_${taxYear}`,
            taxYear: data.taxYear || taxYear,
            name: data.name || 'Document',
            fileUrl: data.fileUrl,
            fileSize: Number(data.fileSize) || 0,
            fileType: data.fileType || 'pdf',
            category: data.category || 'SUPPORTING_DOC',
            uploadedByRole: data.uploadedByRole || 'ADMIN',
            createdAt,
          });
        }
      }
      return docs;
    }
  } catch (err) {
    console.error(`Error reconciling live documents from Firestore (${taxYear}):`, err);
  }
  return [];
}

/**
 * Fetch fresh support tickets for a user from Firestore and reconcile with local SQLite database
 */
export async function getLiveTickets(userId: string) {
  try {
    const snapshot = await adminFirestore
      .collection('support_tickets')
      .where('userId', '==', userId)
      .get();

    if (!snapshot.empty) {
      for (const docSnap of snapshot.docs) {
        const data: any = docSnap.data();
        const ticketId = docSnap.id;
        const createdAt = data.createdAt ? new Date(data.createdAt) : new Date();
        const updatedAt = data.updatedAt ? new Date(data.updatedAt) : new Date();

        await db.supportTicket.upsert({
          where: { id: ticketId },
          update: {
            subject: data.subject || 'Inquiry',
            status: data.status || 'OPEN',
            updatedAt,
          },
          create: {
            id: ticketId,
            userId,
            subject: data.subject || 'Inquiry',
            status: data.status || 'OPEN',
            createdAt,
            updatedAt,
          },
        }).catch(() => {});

        if (Array.isArray(data.messages)) {
          for (const msg of data.messages) {
            if (!msg.id) continue;
            await db.ticketMessage.upsert({
              where: { id: msg.id },
              update: {
                message: msg.message || '',
              },
              create: {
                id: msg.id,
                ticketId,
                senderId: msg.senderId || userId,
                senderName: msg.senderName || 'User',
                senderRole: msg.senderRole || 'CLIENT',
                message: msg.message || '',
                createdAt: msg.createdAt ? new Date(msg.createdAt) : new Date(),
              },
            }).catch(() => {});
          }
        }
      }
    }
  } catch (err) {
    console.error(`Error reconciling live tickets from Firestore (${userId}):`, err);
  }
}

/**
 * Fetch fresh in-app notifications for a user from Firestore and reconcile with local SQLite database
 */
export async function getLiveNotifications(userId: string) {
  try {
    let snap;
    try {
      snap = await adminFirestore
        .collection('notifications')
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .limit(25)
        .get();
    } catch (orderErr) {
      // Fallback if composite index on (userId, createdAt) is not yet active in Firestore
      snap = await adminFirestore
        .collection('notifications')
        .where('userId', '==', userId)
        .limit(25)
        .get();
    }

    for (const doc of snap.docs) {
      const data: any = doc.data();
      await db.notification.upsert({
        where: { id: doc.id },
        update: {
          isRead: data.isRead ?? false,
        },
        create: {
          id: doc.id,
          userId,
          title: data.title || '',
          message: data.message || '',
          link: data.link || null,
          isRead: data.isRead ?? false,
          createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
        },
      }).catch(() => {});
    }
  } catch (err) {
    console.warn('Error syncing notifications from Firestore:', err);
  }
}



