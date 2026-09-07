import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial data...');

  // 1. Super Admin Account
  const superAdmin = await prisma.user.upsert({
    where: { phone: '+919493395299' },
    update: {
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
      firstName: 'Advora',
      lastName: 'Super Admin',
      email: 'admin@advoraservices.com'
    },
    create: {
      phone: '+919493395299',
      email: 'admin@advoraservices.com',
      firstName: 'Advora',
      lastName: 'Super Admin',
      role: 'SUPER_ADMIN',
      status: 'ACTIVE'
    }
  });
  console.log('Super Admin ready:', superAdmin.phone);

  // 2. Staff Admins
  const admin1 = await prisma.user.upsert({
    where: { phone: '+919000000001' },
    update: { role: 'ADMIN', status: 'ACTIVE' },
    create: {
      phone: '+919000000001',
      email: 'preparer1@advoraservices.com',
      firstName: 'Sarah',
      lastName: 'Jenkins',
      role: 'ADMIN',
      status: 'ACTIVE'
    }
  });

  const admin2 = await prisma.user.upsert({
    where: { phone: '+919000000002' },
    update: { role: 'ADMIN', status: 'ACTIVE' },
    create: {
      phone: '+919000000002',
      email: 'preparer2@advoraservices.com',
      firstName: 'David',
      lastName: 'Miller',
      role: 'ADMIN',
      status: 'ACTIVE'
    }
  });
  console.log('Staff Admins ready:', admin1.phone, admin2.phone);

  // 3. Demo Active Client (John Smith)
  const client1 = await prisma.user.upsert({
    where: { phone: '+919876543210' },
    update: { status: 'ACTIVE' },
    create: {
      phone: '+919876543210',
      email: 'john.smith@example.com',
      firstName: 'John',
      lastName: 'Smith',
      role: 'CLIENT',
      status: 'ACTIVE',
      assignedAdminId: admin1.id
    }
  });

  // Create Tax Years for John Smith (2026, 2025, 2024)
  await prisma.taxYearSection.upsert({
    where: { userId_year: { userId: client1.id, year: '2026' } },
    update: {},
    create: { userId: client1.id, year: '2026', isDefault: true }
  });

  await prisma.taxYearSection.upsert({
    where: { userId_year: { userId: client1.id, year: '2025' } },
    update: {},
    create: { userId: client1.id, year: '2025', isDefault: false }
  });

  await prisma.taxYearSection.upsert({
    where: { userId_year: { userId: client1.id, year: '2024' } },
    update: {},
    create: { userId: client1.id, year: '2024', isDefault: false }
  });

  // Create Tax Application for 2025 (In Progress)
  const app2025 = await prisma.taxApplication.upsert({
    where: { userId_taxYear: { userId: client1.id, taxYear: '2025' } },
    update: { status: 'IN_PROGRESS' },
    create: {
      userId: client1.id,
      taxYear: '2025',
      status: 'IN_PROGRESS',
      estimatedRefund: 3450.00,
      feeAmount: 250.00,
      adminNotes: 'W-2 and 1099-INT received. Drafting 1040 form.'
    }
  });

  // Create Sample Documents for 2025
  await prisma.document.createMany({
    data: [
      {
        userId: client1.id,
        applicationId: app2025.id,
        taxYear: '2025',
        name: 'W2_Form_2025.pdf',
        fileUrl: '/uploads/sample_w2.pdf',
        fileSize: 1024 * 350,
        fileType: 'application/pdf',
        category: 'SUPPORTING_DOC',
        uploadedByRole: 'CLIENT'
      },
      {
        userId: client1.id,
        applicationId: app2025.id,
        taxYear: '2025',
        name: '2025_Tax_Return_Draft.pdf',
        fileUrl: '/uploads/sample_draft.pdf',
        fileSize: 1024 * 720,
        fileType: 'application/pdf',
        category: 'DRAFT_COPY',
        uploadedByRole: 'ADMIN'
      }
    ]
  });

  // Create Support Ticket for John Smith
  const ticket = await prisma.supportTicket.create({
    data: {
      userId: client1.id,
      subject: 'Question regarding education tax credits',
      status: 'IN_PROGRESS',
      messages: {
        create: [
          {
            senderId: client1.id,
            senderName: 'John Smith',
            senderRole: 'CLIENT',
            message: 'Hi team, can I include my 1098-T tuition statement for 2025?'
          },
          {
            senderId: admin1.id,
            senderName: 'Sarah Jenkins (Tax Preparer)',
            senderRole: 'ADMIN',
            message: 'Hello John! Yes, please upload your 1098-T under 2025 Supporting Documents.'
          }
        ]
      }
    }
  });

  // 4. Demo Pending Approval Client (Mary Jones)
  await prisma.user.upsert({
    where: { phone: '+919876543211' },
    update: {},
    create: {
      phone: '+919876543211',
      email: 'mary.jones@example.com',
      firstName: 'Mary',
      lastName: 'Jones',
      role: 'CLIENT',
      status: 'PENDING_APPROVAL'
    }
  });

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
