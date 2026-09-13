import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { getDb } from '@/db';
import { users } from '@/db/schema';
import { createSession, verifyPassword } from '@/lib/auth';
import { appUrl } from '@/lib/app-url';

const INITIAL_ADMIN_LOGIN =
  process.env.VOTEMANIAX_INITIAL_ADMIN_EMAIL?.trim().toLowerCase() ||
  'traqchitida@gmail.com';
const LEGACY_ADMIN_LOGIN = 'traqchitida';
async function ensureInitialAdmin() {
  const passwordHash = process.env.VOTEMANIAX_INITIAL_ADMIN_PASSWORD_HASH;
  if (!passwordHash) return;
  const db = getDb();
  const existing = (
    await db.select().from(users).where(eq(users.email, INITIAL_ADMIN_LOGIN)).limit(1)
  )[0];
  if (existing) {
    await db.update(users).set({ passwordHash, role: 'super-admin', status: 'active' }).where(eq(users.id, existing.id));
  } else {
    const legacy = (
      await db.select().from(users).where(eq(users.email, LEGACY_ADMIN_LOGIN)).limit(1)
    )[0];
    if (legacy) {
      await db.update(users).set({ email: INITIAL_ADMIN_LOGIN, passwordHash, role: 'super-admin', status: 'active' }).where(eq(users.id, legacy.id));
    } else {
      await db.insert(users).values({
        email: INITIAL_ADMIN_LOGIN,
        passwordHash,
        role: 'super-admin',
        displayName: 'Traqchitida',
        status: 'active',
        createdAt: new Date(),
      });
    }
  }
}

export async function POST(request: Request) {
  const data = await request.formData();
  const login = (formText(data, 'username') || formText(data, 'email'))
    .trim()
    .toLowerCase();
  const password = formText(data, 'password');
  const portal = formText(data, 'portal') || 'contestant';
  if (portal === 'admin') await ensureInitialAdmin();
  const user = (
    await getDb().select().from(users).where(eq(users.email, login)).limit(1)
  )[0];
  if (
    !user ||
    user.status !== 'active' ||
    (portal === 'admin' && !['admin', 'super-admin'].includes(user.role)) ||
    !(await verifyPassword(password, user.passwordHash))
  )
    return NextResponse.redirect(
      appUrl(request, portal === 'admin' ? '/admin/login?error=invalid' : '/auth/contestant/login?error=invalid'),
      303,
    );
  await createSession(user.id);
  await getDb()
    .update(users)
    .set({ lastLoginAt: new Date() })
    .where(eq(users.id, user.id));
  return NextResponse.redirect(
    appUrl(request, ['admin', 'super-admin'].includes(user.role) ? '/admin/dashboard' : user.role === 'contestant' ? '/contestant' : '/'),
    303,
  );
}

function formText(data: FormData, key: string) {
  const value = data.get(key);
  return typeof value === 'string' ? value : '';
}
