import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PublicFooter, PublicHeader } from '@/components/public-shell';
import { RoundCountdown } from '@/components/round-countdown';
import {
  getRoundBySlug,
  getRoundContestants,
  isRoundOpen,
} from '@/lib/platform-store';
export const dynamic = 'force-dynamic';
export default async function RoundLeaderboard({
  params,
}: {
  params: Promise<{ roundSlug: string }>;
}) {
  const { roundSlug } = await params;
  const round = await getRoundBySlug(roundSlug);
  if (!round) notFound();
  const people = await getRoundContestants(round.id),
    max = Math.max(people[0]?.votes ?? 0, 1),
    open = isRoundOpen(round);
  return (
    <main className="site-shell">
      <PublicHeader />
      <section className="board-head">
        <div>
          <p className="live-pill">
            <i /> {open ? 'LIVE ROUND' : 'FINAL RESULTS'}
          </p>
          <h1>
            {round.name}
            <br />
            <em>leaderboard.</em>
          </h1>
        </div>
        <RoundCountdown
          startAt={round.startAt.toISOString()}
          endAt={round.endAt.toISOString()}
        />
      </section>
      <section className="round-leaderboard">
        {people.map((p, i) => (
          <article className={i === 0 ? 'winner' : ''} key={p.id}>
            <span>{String(i + 1).padStart(2, '0')}</span>
            <div>
              <b>{p.name}</b>
              <small>{p.category}</small>
            </div>
            <i>
              <em style={{ width: `${(p.votes / max) * 100}%` }} />
            </i>
            <strong>{p.votes}</strong>
            {open ? (
              <Link href={`/vote/${round.slug}/${p.slug}`}>Vote</Link>
            ) : null}
          </article>
        ))}
      </section>
      <PublicFooter />
    </main>
  );
}
