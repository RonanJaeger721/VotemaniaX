import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { getDb } from '@/db';
import { users } from '@/db/schema';
import { createSession, verifyPassword } from '@/lib/auth';

const INITIAL_ADMIN_LOGIN = 'traqchitida';
const INITIAL_ADMIN_HASH =
  '$2b$12$POW2h7ozkU.OZDJxMPh9/eUppfobU4FCUAlGbZKR7D3UHgOR41gou';

async function ensureInitialAdmin() {
  await getDb()
    .insert(users)
    .values({
      email: INITIAL_ADMIN_LOGIN,
      passwordHash: INITIAL_ADMIN_HASH,
      role: 'super-admin',
      displayName: 'Traqchitida',
      status: 'active',
      createdAt: new Date(),
    })
    .onConflictDoNothing({ target: users.email });
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
      new URL(portal === 'admin' ? '/admin/login?error=invalid' : '/auth/contestant/login?error=invalid', request.url),
      303,
    );
  await createSession(user.id);
  await getDb()
    .update(users)
    .set({ lastLoginAt: new Date() })
    .where(eq(users.id, user.id));
  return NextResponse.redirect(
    new URL(['admin', 'super-admin'].includes(user.role) ? '/admin' : user.role === 'contestant' ? '/contestant' : '/', request.url),
    303,
  );
}

function formText(data: FormData, key: string) {
  const value = data.get(key);
  return typeof value === 'string' ? value : '';
}
