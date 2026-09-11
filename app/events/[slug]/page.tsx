import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowUpRight, Clock, Radio } from 'lucide-react';
import { ContestantCard } from '@/components/contestant-card';
import { PublicFooter, PublicHeader } from '@/components/public-shell';
import { ShareButton } from '@/components/share-button';
import { RoundCountdown } from '@/components/round-countdown';
import {
  ensureSourceSnapshot,
  getRounds,
  getPublicContestants,
  getRoundContestants,
  isRoundOpen,
} from '@/lib/platform-store';
import { getDb } from '@/db';
import { events } from '@/db/schema';
import { eq } from 'drizzle-orm';
export const dynamic = 'force-dynamic';
export default async function Event({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  await ensureSourceSnapshot();
  const event = (
    await getDb().select().from(events).where(eq(events.slug, slug)).limit(1)
  )[0];
  if (!event) notFound();
  const rounds = (await getRounds()).filter((round) => round.eventId === event.id);
  const currentRound = rounds.find((round) => isRoundOpen(round)) ?? null;
  const contestants = currentRound ? await getRoundContestants(currentRound.id) : await getPublicContestants(event.id);
  return (
    <main className="site-shell">
      <PublicHeader />
      <section className="event-detail">
        <p className="live-pill">
          <Radio size={13} /> {event.status}
        </p>
        <h1>{event.name}</h1>
        <p>{event.description}</p>
        <div className="event-meta">
          <span>
            <Clock size={16} /> {date(event.startAt)} — {date(event.endAt)}
          </span>
          <span>
            {event.currency} {event.votePrice.toFixed(2)} per vote
          </span>
        </div>
        {currentRound && <RoundCountdown startAt={currentRound.startAt.toISOString()} endAt={currentRound.endAt.toISOString()} />}
        <div className="hero-actions">
          {currentRound && (
            <Link className="primary-action" href={`/vote/${currentRound.slug}`}>
              Back your favourite <ArrowUpRight size={18} />
            </Link>
          )}
          <ShareButton title={event.name} />
        </div>
      </section>
      <section className="event-module-head">
        <p className="eyebrow">COMPETING NOW</p>
        <h2>{contestants.length} contestants</h2>
        <Link href={currentRound ? `/leaderboard/${currentRound.slug}` : '/leaderboard'}>View full leaderboard</Link>
      </section>
      {rounds.length > 0 && <section className="event-rules"><p className="eyebrow">VOTING WEEKS</p><h2>Round history</h2><div className="round-link-list">{rounds.map((round) => <Link key={round.id} href={round.status === 'closed' ? `/results/${round.slug}` : `/vote/${round.slug}`}><strong>{round.name}</strong><span>{round.status} · {date(round.startAt)} — {date(round.endAt)}</span></Link>)}</div></section>}
      <section className="contestant-grid compact">
        {contestants.map((item, index) => (
          <ContestantCard item={item} index={index} key={item.slug} />
        ))}
      </section>
      <section className="event-rules">
        <p className="eyebrow">EVENT INFORMATION</p>
        <h2>Vote with confidence.</h2>
        <p>
          Vote totals include only verified transactions. Pending, failed,
          expired and cancelled payments never change the ranking. The final
          leaderboard remains available after voting closes.
        </p>
      </section>
      <PublicFooter />
    </main>
  );
}
function date(value: Date | null) {
  return value
    ? new Intl.DateTimeFormat('en-GB', { dateStyle: 'long' }).format(value)
    : 'TBA';
}
