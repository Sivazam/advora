import { PrismaClient } from '@prisma/client';
import {
  syncUserToFirestore,
  syncApplicationToFirestore,
  syncDocumentToFirestore,
  syncAuditLogToFirestore,
  syncTicketToFirestore,
} from '../src/lib/firestoreSync';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting full sync from SQLite to Firebase Firestore...');

  // 1. Sync all Users
  const users = await prisma.user.findMany();
  console.log(`Found ${users.length} users to sync...`);
  for (const user of users) {
    await syncUserToFirestore(user);
  }

  // 2. Sync all Tax Applications
  const apps = await prisma.taxApplication.findMany();
  console.log(`Found ${apps.length} tax applications to sync...`);
  for (const app of apps) {
    await syncApplicationToFirestore(app);
  }

  // 3. Sync all Documents
  const docs = await prisma.document.findMany();
  console.log(`Found ${docs.length} documents to sync...`);
  for (const doc of docs) {
    await syncDocumentToFirestore(doc);
  }

  // 4. Sync all Audit Logs
  const logs = await prisma.auditLog.findMany();
  console.log(`Found ${logs.length} audit logs to sync...`);
  for (const log of logs) {
    await syncAuditLogToFirestore(log);
  }

  // 5. Sync all Support Tickets
  const tickets = await prisma.supportTicket.findMany({
    include: { messages: true },
  });
  console.log(`Found ${tickets.length} tickets to sync...`);
  for (const ticket of tickets) {
    await syncTicketToFirestore(ticket);
  }

  console.log('✅ Full Firebase Firestore sync completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during Firestore sync:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
