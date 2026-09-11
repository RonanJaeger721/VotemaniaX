import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { getDb } from '@/db';
import { users } from '@/db/schema';
import { createSession, verifyPassword } from '@/lib/auth';
export async function POST(request: Request) {
  const data = await request.formData();
  const email = String(data.get('email') ?? '')
    .trim()
    .toLowerCase();
  const password = String(data.get('password') ?? '');
  const user = (
    await getDb().select().from(users).where(eq(users.email, email)).limit(1)
  )[0];
  if (
    !user ||
    user.status !== 'active' ||
    !(await verifyPassword(password, user.passwordHash))
  )
    return NextResponse.redirect(
      new URL('/auth/contestant/login?error=invalid', request.url),
      303,
    );
  await createSession(user.id);
  await getDb()
    .update(users)
    .set({ lastLoginAt: new Date() })
    .where(eq(users.id, user.id));
  return NextResponse.redirect(
    new URL(user.role === 'contestant' ? '/contestant' : '/', request.url),
    303,
  );
}
