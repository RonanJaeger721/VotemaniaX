import { NextResponse } from 'next/server';
import { getDb } from '@/db';
import { auditLogs, faqs } from '@/db/schema';
import { getChatGPTUser } from '@/app/chatgpt-auth';
import { eq } from 'drizzle-orm';
export async function POST(request: Request) {
  const user = await getChatGPTUser();
  if (!user)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const data = await request.formData();
  const id = Number(data.get('id') || 0);
  const intent = String(data.get('intent') || 'save');
  let action = 'faq.create';
  if (intent === 'delete' && id) {
    await getDb().delete(faqs).where(eq(faqs.id, id));
    action = 'faq.delete';
  } else if (intent === 'toggle' && id) {
    const row = (await getDb().select().from(faqs).where(eq(faqs.id, id)).limit(1))[0];
    if (row) await getDb().update(faqs).set({ active: !row.active }).where(eq(faqs.id, id));
    action = 'faq.toggle';
  } else {
    const values = {
      question: String(data.get('question')).trim(),
      answer: String(data.get('answer')).trim(),
      displayOrder: Number(data.get('displayOrder')) || 0,
    };
    if (!values.question || !values.answer) return NextResponse.json({ error: 'Question and answer are required' }, { status: 400 });
    if (id) {
      await getDb().update(faqs).set(values).where(eq(faqs.id, id));
      action = 'faq.update';
    } else {
      const [created] = await getDb().insert(faqs).values({ ...values, active: true, createdAt: new Date() }).returning();
      data.set('id', String(created.id));
    }
  }
  await getDb()
    .insert(auditLogs)
    .values({
      adminUserId: user.userId,
      action,
      entityType: 'faq',
      entityId: id ? String(id) : String(data.get('id') || ''),
      createdAt: new Date(),
    });
  return NextResponse.redirect(new URL('/admin/faqs?saved=1', request.url), 303);
}
