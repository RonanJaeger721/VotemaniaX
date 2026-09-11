import { NextResponse } from 'next/server';
import { getChatGPTUser } from '@/app/chatgpt-auth';
import { getDb } from '@/db';
import {
  auditLogs,
  contestants,
  events,
  faqs,
  siteSettings,
} from '@/db/schema';
import { eq } from 'drizzle-orm';
export async function POST(request: Request) {
  const user = await getChatGPTUser();
  if (!user)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const form = await request.formData();
  const type = String(form.get('type') || '');
  const now = new Date();
  const db = getDb();
  let destination = '/admin';
  if (type === 'event') {
    const id = Number(form.get('id') || 0);
    const values = {
        name: String(form.get('name')),
        slug: String(form.get('slug')),
        description: String(form.get('description') || ''),
        status: String(form.get('status') || 'draft'),
        startAt: form.get('startDate') ? new Date(String(form.get('startDate'))) : null,
        endAt: new Date(String(form.get('endDate'))),
        currency: 'USD',
        votePrice: Number(form.get('price')),
        publicLeaderboard: true,
      };
    if (id) await db.update(events).set(values).where(eq(events.id, id));
    else await db.insert(events).values({ ...values, createdAt: now });
    destination = '/admin/events?saved=1';
  } else if (type === 'event-status') {
    const id = Number(form.get('id'));
    const status = String(form.get('status'));
    if (!['draft', 'published', 'upcoming', 'live', 'completed', 'archived'].includes(status)) return NextResponse.json({ message: 'Invalid event status' }, { status: 400 });
    await db.update(events).set({ status }).where(eq(events.id, id));
    destination = '/admin/events?saved=1';
  } else if (type === 'contestant') {
    const id = Number(form.get('id') || 0);
    const values = {
        eventId: Number(form.get('eventId')),
        name: String(form.get('name')),
        slug: String(form.get('slug')),
        category: String(form.get('category')),
        bio: String(form.get('bio') || ''),
        status: String(form.get('status') || 'pending'),
      };
    if (id) await db.update(contestants).set(values).where(eq(contestants.id, id));
    else await db.insert(contestants).values({ ...values, createdAt: now });
    destination = '/admin/participants';
  } else if (type === 'contestant-status') {
    const id = Number(form.get('id'));
    const status = String(form.get('status'));
    if (!['pending', 'awaiting-upload', 'approved', 'disqualified', 'inactive'].includes(status)) return NextResponse.json({ message: 'Invalid contestant status' }, { status: 400 });
    await db.update(contestants).set({ status }).where(eq(contestants.id, id));
    destination = '/admin/participants';
  } else if (type === 'faq') {
    await db
      .insert(faqs)
      .values({
        question: String(form.get('question')),
        answer: String(form.get('answer')),
        active: true,
        displayOrder: Date.now(),
        createdAt: now,
      });
    destination = '/admin/faqs';
  } else if (type === 'settings-bundle') {
    for (const key of ['company_name', 'support_email', 'support_phone', 'timezone', 'default_round_duration']) {
      const value = String(form.get(key) || '');
      await db
        .insert(siteSettings)
        .values({ key, value, updatedAt: now })
        .onConflictDoUpdate({
          target: siteSettings.key,
          set: { value, updatedAt: now },
        });
    }
    destination = '/admin/settings?saved=1';
  } else if (type === 'setting') {
    await db
      .insert(siteSettings)
      .values({
        key: String(form.get('key')),
        value: String(form.get('value')),
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: siteSettings.key,
        set: { value: String(form.get('value')), updatedAt: now },
      });
    destination = '/admin/settings';
  } else
    return NextResponse.json(
      { message: 'Unsupported operation' },
      { status: 400 },
    );
  await db
    .insert(auditLogs)
    .values({
      adminUserId: user.userId,
      action: type === 'contestant-status' ? `change_contestant_status_${String(form.get('status'))}` : idAction(type, form),
      entityType: type,
      payload: JSON.stringify(Object.fromEntries(form)),
      createdAt: now,
    });
  return NextResponse.redirect(new URL(destination, request.url), 303);
}
function idAction(type: string, form: FormData) {
  return form.get('id') ? `update_${type}` : `create_${type}`;
}
