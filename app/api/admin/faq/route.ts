import { NextResponse } from 'next/server';
import { getDb } from '@/db';
import { auditLogs, faqs } from '@/db/schema';
import { getChatGPTUser } from '@/app/chatgpt-auth';
export async function POST(request: Request) {
  const user = await getChatGPTUser();
  if (!user)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const data = await request.formData();
  const [row] = await getDb()
    .insert(faqs)
    .values({
      question: String(data.get('question')),
      answer: String(data.get('answer')),
      displayOrder: Number(data.get('displayOrder')) || 0,
      active: true,
      createdAt: new Date(),
    })
    .returning();
  await getDb()
    .insert(auditLogs)
    .values({
      adminUserId: user.userId,
      action: 'faq.create',
      entityType: 'faq',
      entityId: String(row.id),
      createdAt: new Date(),
    });
  return NextResponse.redirect(new URL('/admin/faqs', request.url), 303);
}
