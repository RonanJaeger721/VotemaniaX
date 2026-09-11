import { cookies } from 'next/headers';
import { and, eq, gt } from 'drizzle-orm';
import { getDb } from '@/db';
import { sessions, users } from '@/db/schema';

const COOKIE = 'vmx_session';
const encoder = new TextEncoder();
function hex(bytes: Uint8Array) {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}
async function digest(value: string) {
  return hex(
    new Uint8Array(
      await crypto.subtle.digest('SHA-256', encoder.encode(value)),
    ),
  );
}
export async function hashPassword(
  password: string,
  salt = crypto.randomUUID(),
) {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      hash: 'SHA-256',
      salt: encoder.encode(salt),
      iterations: 120000,
    },
    key,
    256,
  );
  return `${salt}:${hex(new Uint8Array(bits))}`;
}
export async function verifyPassword(password: string, stored: string) {
  const [salt] = stored.split(':');
  return (await hashPassword(password, salt)) === stored;
}
export async function createSession(userId: number) {
  const token = `${crypto.randomUUID()}${crypto.randomUUID()}`;
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  await getDb()
    .insert(sessions)
    .values({
      tokenHash: await digest(token),
      userId,
      expiresAt,
      createdAt: new Date(),
    });
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    expires: expiresAt,
  });
}
export async function clearSession() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (token)
    await getDb()
      .delete(sessions)
      .where(eq(sessions.tokenHash, await digest(token)));
  jar.delete(COOKIE);
}
export async function getSessionUser() {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  const rows = await getDb()
    .select({
      id: users.id,
      email: users.email,
      role: users.role,
      displayName: users.displayName,
      status: users.status,
    })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(
      and(
        eq(sessions.tokenHash, await digest(token)),
        gt(sessions.expiresAt, new Date()),
      ),
    )
    .limit(1);
  return rows[0] ?? null;
}
export async function getContestantForUser(userId: number) {
  const { contestantAccounts, contestants } = await import('@/db/schema');
  return (
    (
      await getDb()
        .select({
          id: contestants.id,
          name: contestants.name,
          slug: contestants.slug,
          category: contestants.category,
          bio: contestants.bio,
          status: contestants.status,
          eventId: contestants.eventId,
        })
        .from(contestantAccounts)
        .innerJoin(
          contestants,
          eq(contestantAccounts.contestantId, contestants.id),
        )
        .where(eq(contestantAccounts.userId, userId))
        .limit(1)
    )[0] ?? null
  );
}
