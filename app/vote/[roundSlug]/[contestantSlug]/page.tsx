import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PublicHeader } from '@/components/public-shell';
import { RoundCountdown } from '@/components/round-countdown';
import { RoundShare } from '@/components/round-share';
import { VoteCheckout } from '@/components/vote-checkout';
import { getDb } from '@/db';
import { events } from '@/db/schema';
import { eq } from 'drizzle-orm';
import {
  getRoundBySlug,
  getRoundContestants,
  isRoundOpen,
} from '@/lib/platform-store';
export const dynamic = 'force-dynamic';
export default async function DirectVote({
  params,
}: {
  params: Promise<{ roundSlug: string; contestantSlug: string }>;
}) {
  const { roundSlug, contestantSlug } = await params;
  const round = await getRoundBySlug(roundSlug);
  if (!round) notFound();
  const people = await getRoundContestants(round.id);
  const item = people.find((p) => p.slug === contestantSlug);
  if (!item) notFound();
  const event = (
    await getDb()
      .select()
      .from(events)
      .where(eq(events.id, round.eventId))
      .limit(1)
  )[0];
  const rank = people.findIndex((p) => p.id === item.id) + 1;
  const open = isRoundOpen(round);
  return (
    <main className="site-shell">
      <PublicHeader />
      <section className="direct-vote">
        <div className="direct-vote-copy">
          <Link href={`/vote/${round.slug}`}>← All contestants</Link>
          <p className="eyebrow">
            WEEK {String(round.weekNumber).padStart(2, '0')} · RANK #{rank}
          </p>
          <h1>
            Vote for
            <br />
            <em>{item.name}.</em>
          </h1>
          <p>
            {item.category} · {item.votes} verified round votes
          </p>
          <RoundCountdown
            startAt={round.startAt.toISOString()}
            endAt={round.endAt.toISOString()}
          />
          <RoundShare
            title={`Vote for ${item.name}`}
            endAt={round.endAt.toISOString()}
          />
        </div>
        {open ? (
          <VoteCheckout item={item} event={event} />
        ) : (
          <div className="voting-closed-card">
            <strong>Voting closed</strong>
            <p>
              This link remains available as a permanent record of {round.name}.
            </p>
            <Link href={`/results/${round.slug}`}>View final results</Link>
          </div>
        )}
      </section>
    </main>
  );
}
