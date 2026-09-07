// JWT Session & Authentication Helpers
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { db } from './db';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'advora_super_secure_jwt_secret_key_2026'
);

export interface SessionPayload {
  userId: string;
  phone: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'CLIENT';
  status: 'PENDING_APPROVAL' | 'ACTIVE' | 'SUSPENDED';
  firstName: string;
  lastName: string;
}

export async function createSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(JWT_SECRET);
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as SessionPayload;
  } catch (error) {
    return null;
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('advora_session')?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export async function getCurrentUser() {
  const session = await getSession();
  if (!session?.userId) return null;

  return db.user.findUnique({
    where: { id: session.userId },
  });
}
