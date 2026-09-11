import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { getDb } from '@/db';
import { contestantAccounts, contestants, users } from '@/db/schema';
import { createSession, hashPassword } from '@/lib/auth';
import { ensureSourceSnapshot } from '@/lib/platform-store';
function slug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replaceAll(/[^a-z0-9]+/g, '-')
    .replaceAll(/(^-|-$)/g, '');
}
export async function POST(request: Request) {
  await ensureSourceSnapshot();
  const data = await request.formData();
  const fullName = String(data.get('fullName') ?? '').trim();
  const displayName = String(data.get('displayName') ?? fullName).trim();
  const email = String(data.get('email') ?? '')
    .trim()
    .toLowerCase();
  const phone = String(data.get('phone') ?? '').trim();
  const password = String(data.get('password') ?? '');
  const category = String(data.get('category') ?? 'Other Talent');
  if (fullName.length < 2 || !email.includes('@') || password.length < 8)
    return NextResponse.redirect(
      new URL('/auth/contestant/signup?error=check-details', request.url),
      303,
    );
  const db = getDb();
  if (
    (
      await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, email))
        .limit(1)
    )[0]
  )
    return NextResponse.redirect(
      new URL('/auth/contestant/signup?error=account-exists', request.url),
      303,
    );
  const now = new Date();
  const [user] = await db
    .insert(users)
    .values({
      email,
      passwordHash: await hashPassword(password),
      role: 'contestant',
      displayName,
      phone,
      status: 'active',
      createdAt: now,
    })
    .returning();
  let uniqueSlug = slug(displayName) || `talent-${user.id}`;
  if (
    (
      await db
        .select({ id: contestants.id })
        .from(contestants)
        .where(eq(contestants.slug, uniqueSlug))
        .limit(1)
    )[0]
  )
    uniqueSlug += `-${user.id}`;
  const [contestant] = await db
    .insert(contestants)
    .values({
      name: displayName,
      slug: uniqueSlug,
      category,
      bio: '',
      status: 'pending',
      createdAt: now,
    })
    .returning();
  await db
    .insert(contestantAccounts)
    .values({ userId: user.id, contestantId: contestant.id, createdAt: now });
  await createSession(user.id);
  return NextResponse.redirect(new URL('/contestant', request.url), 303);
}
