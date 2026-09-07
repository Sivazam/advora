import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { createNotification, notifyAdmins } from '@/lib/notifications';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const targetUserId = searchParams.get('userId');

    let userId = session.userId;
    if ((session.role === 'ADMIN' || session.role === 'SUPER_ADMIN') && targetUserId) {
      userId = targetUserId;
    }

    const tickets = await db.supportTicket.findMany({
      where: { userId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json({ tickets });
  } catch (error: any) {
    console.error('Error fetching tickets:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { ticketId, subject, message, targetUserId } = await req.json();

    if (!message || message.trim() === '') {
      return NextResponse.json({ error: 'Message cannot be blank' }, { status: 400 });
    }

    const senderName = `${session.firstName} ${session.lastName}${session.role !== 'CLIENT' ? ' (Tax Preparer)' : ''}`;

    let ticket;

    if (ticketId) {
      // Reply to existing ticket
      ticket = await db.supportTicket.findUnique({
        where: { id: ticketId },
        include: { user: true },
      });

      if (!ticket) {
        return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
      }

      await db.ticketMessage.create({
        data: {
          ticketId: ticket.id,
          senderId: session.userId,
          senderName,
          senderRole: session.role,
          message: message.trim(),
        },
      });

      await db.supportTicket.update({
        where: { id: ticket.id },
        data: {
          status: session.role === 'CLIENT' ? 'OPEN' : 'IN_PROGRESS',
          updatedAt: new Date(),
        },
      });

      // Send notifications
      if (session.role === 'CLIENT') {
        await notifyAdmins(
          `New Question Reply from ${session.firstName} ${session.lastName}`,
          message.slice(0, 120),
          `/portal/admin?clientId=${session.userId}#advisor-chat`
        );
      } else {
        await createNotification({
          userId: ticket.userId,
          title: 'Reply from Tax Preparation Team',
          message: message.slice(0, 120),
          link: `/portal/client#advisor-chat`,
        });
      }
    } else {
      // Create new ticket
      if (!subject) {
        return NextResponse.json({ error: 'Subject is required' }, { status: 400 });
      }

      const clientUserId = session.role === 'CLIENT' ? session.userId : (targetUserId || session.userId);

      ticket = await db.supportTicket.create({
        data: {
          userId: clientUserId,
          subject: subject.trim(),
          status: 'OPEN',
          messages: {
            create: [
              {
                senderId: session.userId,
                senderName,
                senderRole: session.role,
                message: message.trim(),
              },
            ],
          },
        },
      });

      if (session.role === 'CLIENT') {
        await notifyAdmins(
          `New Support Question: ${subject}`,
          `${session.firstName} ${session.lastName}: ${message.slice(0, 100)}`,
          `/portal/admin?clientId=${clientUserId}#advisor-chat`
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Question / message submitted successfully',
      ticket,
    });
  } catch (error: any) {
    console.error('Error in support ticket route:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

// Close / End or change status of a conversation (e.g. RESOLVED or reopen to OPEN)
export async function PATCH(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { ticketId, status } = await req.json();
    if (!ticketId) {
      return NextResponse.json({ error: 'Ticket ID is required' }, { status: 400 });
    }

    const ticket = await db.supportTicket.findUnique({
      where: { id: ticketId },
      include: { user: true },
    });

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    if (session.role === 'CLIENT' && ticket.userId !== session.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const targetStatus = status || 'RESOLVED';

    const updated = await db.supportTicket.update({
      where: { id: ticketId },
      data: {
        status: targetStatus,
        updatedAt: new Date(),
      },
    });

    // Notify parties on status change
    if (targetStatus === 'OPEN') {
      if (session.role === 'CLIENT') {
        await notifyAdmins(
          `Inquiry Reopened by ${session.firstName} ${session.lastName}`,
          `Question "${ticket.subject}" was reopened by the client.`,
          `/portal/admin?clientId=${ticket.userId}#advisor-chat`
        );
      } else {
        await createNotification({
          userId: ticket.userId,
          title: 'Inquiry Reopened by CPA Advisor',
          message: `Your inquiry "${ticket.subject}" has been reopened for follow-up.`,
          link: `/portal/client#advisor-chat`,
        });
      }
    } else if (targetStatus === 'RESOLVED') {
      if (session.role === 'CLIENT') {
        await notifyAdmins(
          `Chat Ended by ${session.firstName} ${session.lastName}`,
          `Client closed conversation "${ticket.subject}".`,
          `/portal/admin?clientId=${ticket.userId}#advisor-chat`
        );
      } else {
        await createNotification({
          userId: ticket.userId,
          title: 'Inquiry Marked Resolved',
          message: `Your CPA has closed "${ticket.subject}". You can review the past transcript or reopen anytime.`,
          link: `/portal/client#advisor-chat`,
        });
      }
    }

    return NextResponse.json({ success: true, ticket: updated });
  } catch (error: any) {
    console.error('Error updating ticket status:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
