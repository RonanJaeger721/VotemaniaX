import { NextResponse } from 'next/server';
import { appUrl } from '@/lib/app-url';
import { getChatGPTUser } from '@/app/chatgpt-auth';
import { getDb } from '@/db';
import { auditLogs, events, votingRounds } from '@/db/schema';
import { desc, eq } from 'drizzle-orm';
export async function POST(request: Request) {
  const user = await getChatGPTUser();
  if (!user)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const form = await request.formData();
  const action = String(form.get('action') || '');
  const roundId = Number(form.get('id') || 0);
  const db = getDb();
  if (['start', 'close'].includes(action) && roundId) {
    const now = new Date();
    await db.update(votingRounds).set(action === 'start'
      ? { status: 'live', startAt: now, endAt: new Date(now.getTime() + 7 * 86400000), publishedAt: now }
      : { status: 'closed', endAt: now, closedAt: now }
    ).where(eq(votingRounds.id, roundId));
    await db.insert(auditLogs).values({ adminUserId: user.userId, action: `${action}_voting_round`, entityType: 'voting_round', entityId: String(roundId), createdAt: now });
    return NextResponse.redirect(appUrl(request, `/admin/voting-rounds?saved=${action}`), 303);
  }
  if (action !== 'create-next')
    return NextResponse.json(
      { message: 'Unsupported action' },
      { status: 400 },
    );
  const latest = (
    await db
      .select()
      .from(votingRounds)
      .orderBy(desc(votingRounds.weekNumber))
      .limit(1)
  )[0];
  const event = (
    await db.select().from(events).orderBy(desc(events.createdAt)).limit(1)
  )[0];
  if (!event)
    return NextResponse.json(
      { message: 'Create an event first' },
      { status: 409 },
    );
  const week = (latest?.weekNumber ?? 0) + 1,
    now = new Date(),
    end = new Date(now.getTime() + 7 * 86400000),
    token = crypto.randomUUID().replaceAll('-', '').slice(0, 6),
    slug = `${event.slug}-week-${String(week).padStart(2, '0')}-${token}`;
  const [round] = await db
    .insert(votingRounds)
    .values({
      eventId: event.id,
      name: `Voting Week ${String(week).padStart(2, '0')}`,
      weekNumber: week,
      slug,
      publicToken: token,
      startAt: now,
      endAt: end,
      status: 'live',
      createdBy: user.userId,
      createdAt: now,
      publishedAt: now,
    })
    .returning();
  await db
    .insert(auditLogs)
    .values({
      adminUserId: user.userId,
      action: 'create_voting_round',
      entityType: 'voting_round',
      entityId: String(round.id),
      payload: JSON.stringify({
        slug,
        startAt: now.toISOString(),
        endAt: end.toISOString(),
      }),
      createdAt: now,
    });
  return NextResponse.redirect(
    appUrl(request, '/admin/voting-rounds'),
    303,
  );
}
