import { asc, desc, eq, sql } from 'drizzle-orm';
import { getDb } from '@/db';
import {
  contestants as contestantTable,
  events,
  faqs,
  payments,
  subscribers,
  votes,
  votingRounds,
} from '@/db/schema';
import {
  contestants as sourceContestants,
  currentEvent as sourceEvent,
} from '@/lib/platform-data';

export async function ensureSourceSnapshot() {
  const db = getDb();
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(events);
  if (Number(count) > 0) {
    await db
      .update(events)
      .set({ name: 'VoteManiaX Season 01' })
      .where(eq(events.name, 'VoteMania Season 01'));
    return;
  }
  const now = new Date();
  const [event] = await db
    .insert(events)
    .values({
      name: sourceEvent.name,
      slug: sourceEvent.slug,
      description: sourceEvent.description,
      status: 'live',
      startAt: new Date(sourceEvent.startDate),
      endAt: new Date(sourceEvent.endDate),
      currency: sourceEvent.currency,
      votePrice: sourceEvent.price,
      publicLeaderboard: true,
      createdAt: now,
    })
    .returning();
  for (const contestant of sourceContestants) {
    const [saved] = await db
      .insert(contestantTable)
      .values({
        eventId: event.id,
        name: contestant.name,
        slug: contestant.slug,
        category: contestant.category,
        bio: contestant.bio,
        status: 'approved',
        createdAt: now,
      })
      .returning();
    if (contestant.votes > 0) {
      const reference = `SOURCE-${saved.id}`;
      const [payment] = await db
        .insert(payments)
        .values({
          reference,
          eventId: event.id,
          contestantId: saved.id,
          quantity: contestant.votes,
          amount: 0,
          currency: sourceEvent.currency,
          method: 'legacy-import',
          status: 'verified',
          providerReference: reference,
          verifiedAt: now,
          createdAt: now,
        })
        .returning();
      await db
        .insert(votes)
        .values({
          paymentId: payment.id,
          eventId: event.id,
          contestantId: saved.id,
          quantity: contestant.votes,
          createdAt: now,
        });
    }
  }
  await db.insert(faqs).values([
    {
      question: 'When does my vote count?',
      answer:
        'Only after the payment provider returns a verified success. Pending, failed, cancelled and expired payments never change the leaderboard.',
      active: true,
      displayOrder: 1,
      createdAt: now,
    },
    {
      question: 'Can I vote more than once?',
      answer:
        'Yes. Choose your vote quantity during checkout, subject to the active event settings.',
      active: true,
      displayOrder: 2,
      createdAt: now,
    },
    {
      question: 'Where can I see results?',
      answer:
        'Open the live leaderboard. Closed events remain available as final results.',
      active: true,
      displayOrder: 3,
      createdAt: now,
    },
  ]);
}
export async function getPublicContestants(eventId?: number) {
  await ensureSourceSnapshot();
  return getDb()
    .select({
      id: contestantTable.id,
      slug: contestantTable.slug,
      name: contestantTable.name,
      category: contestantTable.category,
      bio: contestantTable.bio,
      imageKey: contestantTable.imageKey,
      status: contestantTable.status,
      votes: sql<number>`coalesce(sum(${votes.quantity}),0)`,
    })
    .from(contestantTable)
    .leftJoin(votes, eq(contestantTable.id, votes.contestantId))
    .where(eventId ? sql`${contestantTable.status}='approved' and ${contestantTable.eventId}=${eventId}` : eq(contestantTable.status, 'approved'))
    .groupBy(contestantTable.id)
    .orderBy(desc(sql`coalesce(sum(${votes.quantity}),0)`));
}
export async function getLiveEvent() {
  await ensureSourceSnapshot();
  return (
    (
      await getDb()
        .select()
        .from(events)
        .where(eq(events.status, 'live'))
        .limit(1)
    )[0] ?? null
  );
}
export async function getActiveFaqs() {
  await ensureSourceSnapshot();
  return getDb()
    .select()
    .from(faqs)
    .where(eq(faqs.active, true))
    .orderBy(asc(faqs.displayOrder));
}
export async function getAdminMetrics() {
  await ensureSourceSnapshot();
  const db = getDb();
  const [contestantCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(contestantTable);
  const [voteCount] = await db
    .select({ count: sql<number>`coalesce(sum(${votes.quantity}),0)` })
    .from(votes);
  const [paymentCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(payments);
  const [subscriberCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(subscribers);
  return {
    contestants: Number(contestantCount.count),
    votes: Number(voteCount.count),
    transactions: Number(paymentCount.count),
    subscribers: Number(subscriberCount.count),
  };
}

export async function ensureVotingRound() {
  await ensureSourceSnapshot();
  const db = getDb();
  const current = (
    await db
      .select()
      .from(votingRounds)
      .orderBy(desc(votingRounds.createdAt))
      .limit(1)
  )[0];
  if (current) return closeExpiredRound(current);
  const event = await getLiveEvent();
  if (!event) return null;
  const now = new Date();
  const end = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const token = crypto.randomUUID().replaceAll('-', '').slice(0, 6);
  const [round] = await db
    .insert(votingRounds)
    .values({
      eventId: event.id,
      name: 'Voting Week 01',
      weekNumber: 1,
      slug: `${event.slug}-week-01-${token}`,
      publicToken: token,
      startAt: now,
      endAt: end,
      status: 'live',
      createdBy: 'system-migration',
      createdAt: now,
      publishedAt: now,
    })
    .returning();
  await db
    .update(payments)
    .set({ roundId: round.id })
    .where(sql`${payments.roundId} is null`);
  await db
    .update(votes)
    .set({ roundId: round.id })
    .where(sql`${votes.roundId} is null`);
  return round;
}
async function closeExpiredRound<
  T extends { id: number; status: string; endAt: Date },
>(round: T) {
  if (round.status === 'live' && Date.now() >= round.endAt.getTime()) {
    const now = new Date();
    await getDb()
      .update(votingRounds)
      .set({ status: 'closed', closedAt: now })
      .where(eq(votingRounds.id, round.id));
    return { ...round, status: 'closed', closedAt: now };
  }
  return round;
}
export async function getCurrentRound() {
  return ensureVotingRound();
}
export async function getActiveRound() {
  const round = await ensureVotingRound();
  return round && isRoundOpen(round) ? round : null;
}
export async function getRoundBySlug(slug: string) {
  await ensureVotingRound();
  const round = (
    await getDb()
      .select()
      .from(votingRounds)
      .where(eq(votingRounds.slug, slug))
      .limit(1)
  )[0];
  return round ? closeExpiredRound(round) : null;
}
export async function getRounds() {
  await ensureVotingRound();
  return getDb()
    .select()
    .from(votingRounds)
    .orderBy(desc(votingRounds.startAt));
}
export async function getRoundContestants(roundId: number) {
  return getDb()
    .select({
      id: contestantTable.id,
      slug: contestantTable.slug,
      name: contestantTable.name,
      category: contestantTable.category,
      bio: contestantTable.bio,
      imageKey: contestantTable.imageKey,
      votes: sql<number>`coalesce(sum(${votes.quantity}),0)`,
    })
    .from(contestantTable)
    .leftJoin(
      votes,
      sql`${contestantTable.id}=${votes.contestantId} and ${votes.roundId}=${roundId}`,
    )
    .where(eq(contestantTable.status, 'approved'))
    .groupBy(contestantTable.id)
    .orderBy(desc(sql`coalesce(sum(${votes.quantity}),0)`));
}
export function isRoundOpen(
  round: { status: string; startAt: Date; endAt: Date },
  now = new Date(),
) {
  return round.status === 'live' && now >= round.startAt && now < round.endAt;
}
