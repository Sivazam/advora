// Notification Service (In-app + Firebase FCM Push support)
import { db } from './db';
import { adminMessaging } from './firebaseAdmin';

interface CreateNotificationParams {
  userId: string;
  title: string;
  message: string;
  link?: string;
  fcmToken?: string;
}

export async function createNotification({ userId, title, message, link, fcmToken }: CreateNotificationParams) {
  try {
    // 1. Record notification in database for in-app bell
    const notif = await db.notification.create({
      data: {
        userId,
        title,
        message,
        link,
      },
    });

    console.log(`🔔 [IN-APP NOTIFICATION to ${userId}]: ${title} - ${message}`);

    // 2. Resolve FCM Token if not passed directly
    let targetToken = fcmToken;
    if (!targetToken) {
      const user = await db.user.findUnique({
        where: { id: userId },
        select: { fcmToken: true },
      });
      targetToken = user?.fcmToken || undefined;
    }

    // 3. Dispatch Firebase FCM Push Notification if token exists
    if (targetToken) {
      try {
        await adminMessaging.send({
          token: targetToken,
          notification: {
            title,
            body: message,
          },
          data: {
            link: link || '/portal',
          },
        });
        console.log(`🚀 [FCM PUSH SENT] to token: ${targetToken.slice(0, 15)}...`);
      } catch (fcmError: any) {
        console.warn('FCM Push notification warning:', fcmError?.message || fcmError);
      }
    }

    return notif;
  } catch (error) {
    console.error('Failed to create notification:', error);
    return null;
  }
}

export async function notifyAdmins(title: string, message: string, link: string = '/portal/admin') {
  try {
    const { syncAdminsFromFirestore } = await import('./firestoreSync');
    await syncAdminsFromFirestore().catch(() => {});

    const admins = await db.user.findMany({
      where: {
        role: { in: ['ADMIN', 'SUPER_ADMIN'] },
        status: 'ACTIVE',
      },
      select: { id: true, fcmToken: true },
    });

    const promises = admins.map((admin) =>
      createNotification({
        userId: admin.id,
        title,
        message,
        link,
        fcmToken: admin.fcmToken || undefined,
      })
    );

    await Promise.all(promises);
  } catch (error) {
    console.error('Failed to notify admins:', error);
  }
}
