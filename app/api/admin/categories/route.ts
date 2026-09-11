import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { getDb } from '@/db';
import { auditLogs, categories } from '@/db/schema';
import { getChatGPTUser } from '@/app/chatgpt-auth';
function slug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replaceAll(/[^a-z0-9]+/g, '-')
    .replaceAll(/(^-|-$)/g, '');
}
export async function POST(request: Request) {
  const user = await getChatGPTUser();
  if (!user)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const data = await request.formData();
  const id = Number(data.get('id'));
  const db = getDb();
  if (data.get('intent') === 'toggle' && id) {
    const row = (
      await db.select().from(categories).where(eq(categories.id, id)).limit(1)
    )[0];
    if (row)
      await db
        .update(categories)
        .set({ active: !row.active })
        .where(eq(categories.id, id));
    await db
      .insert(auditLogs)
      .values({
        adminUserId: user.userId,
        action: 'category.toggle',
        entityType: 'category',
        entityId: String(id),
        createdAt: new Date(),
      });
  } else {
    const name = String(data.get('name') ?? '').trim();
    const values = { name, slug: slug(name), description: String(data.get('description') ?? ''), displayOrder: Number(data.get('displayOrder')) || 0 };
    if (name && id) await db.update(categories).set(values).where(eq(categories.id, id));
    else if (name) await db.insert(categories).values({ ...values, active: true, createdAt: new Date() });
    await db
      .insert(auditLogs)
      .values({
        adminUserId: user.userId,
        action: id ? 'category.update' : 'category.create',
        entityType: 'category',
        payload: JSON.stringify({ name }),
        createdAt: new Date(),
      });
  }
  return NextResponse.redirect(new URL('/admin/categories?saved=1', request.url), 303);
}
