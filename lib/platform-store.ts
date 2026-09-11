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
    await ensureDefaultFaqs();
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
  await ensureDefaultFaqs();
}

const defaultFaqs = [
  ['How do I register as a contestant?', 'Open contestant sign up, complete your details and choose a talent category. Your profile and event participation remain subject to VoteManiaX approval.'],
  ['How do I vote?', 'Open a contestant profile or the current voting week, choose a vote quantity and follow the payment steps. Votes are added after payment is verified.'],
  ['Do I need an account to vote?', 'You can browse VoteManiaX without an account. Whether contact details or sign-in are required during voting depends on the active payment method and competition rules.'],
  ['Can I vote more than once?', 'Yes, where the active competition rules allow it. Each later vote is recorded as a separate verified transaction.'],
  ['How much does a vote cost?', 'The official price per vote appears on the active event and checkout screen. The server calculates the total from the quantity you select.'],
  ['Which payment methods are accepted?', 'Available methods are shown at checkout. EcoCash, OneMoney, InnBucks and OMari can be enabled after the required provider accounts are configured.'],
  ['How long does voting stay open?', 'A standard VoteManiaX voting week runs for seven days. The live countdown shows the exact closing time for the current round.'],
  ['How do I share my voting link?', 'Open your contestant profile or contestant portal and use Share or Copy Link. The link opens the relevant contestant inside the current voting round.'],
  ['How do contestants upload videos?', 'Signed-in contestants can open Videos in their portal, select one or more files, add the required details and submit them for review.'],
  ['Who can see a video before it is approved?', 'Pending submissions are available to the contestant and authorised VoteManiaX administrators for review. They are not shown in the public video feed.'],
  ['When does my video become public?', 'A video becomes public only after an authorised administrator approves and publishes it and the required contestant consent has been recorded.'],
  ['Can I request my content to be removed?', 'Yes. Contact VoteManiaX support with the content and account details needed to review your request under the published competition terms.'],
  ['How are winners decided?', 'Published results use verified votes for the selected event and voting round, together with any event-specific rules shown for that competition.'],
  ['What happens if my payment fails?', 'Failed, cancelled, expired and pending payments do not create votes. Follow the provider instructions or contact support with your transaction reference.'],
  ['How do I contact VoteManiaX support?', 'Email thevibehub26@gmail.com or call +263 719 308 153. Include a transaction reference when asking about a payment.'],
] as const;

async function ensureDefaultFaqs() {
  const db = getDb();
  const existing = await db.select({ question: faqs.question }).from(faqs);
  const questions = new Set(existing.map((item) => item.question));
  const missing = defaultFaqs.filter(([question]) => !questions.has(question));
  if (!missing.length) return;
  await db.insert(faqs).values(missing.map(([question, answer], index) => ({ question, answer, active: true, displayOrder: existing.length + index + 1, createdAt: new Date() })));
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
