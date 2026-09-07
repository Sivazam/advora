import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

// In serverless platforms (Netlify / AWS Lambda), the root filesystem is read-only.
// Ensure SQLite database can be written to in /tmp.
if (process.env.NETLIFY || process.env.AWS_LAMBDA_FUNCTION_NAME) {
  try {
    const tmpDbPath = '/tmp/dev.db';
    if (!fs.existsSync(tmpDbPath)) {
      const candidatePaths = [
        path.join(process.cwd(), 'prisma', 'dev.db'),
        path.join(process.cwd(), 'dev.db'),
      ];
      for (const p of candidatePaths) {
        if (fs.existsSync(p)) {
          fs.copyFileSync(p, tmpDbPath);
          break;
        }
      }
    }
    process.env.DATABASE_URL = `file:${tmpDbPath}`;
  } catch (err) {
    console.warn('Serverless SQLite /tmp notice:', err);
  }
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;