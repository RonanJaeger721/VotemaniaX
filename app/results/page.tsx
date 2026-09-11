import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { PublicFooter, PublicHeader } from '@/components/public-shell';
import { getRounds, getRoundContestants } from '@/lib/platform-store';
export const dynamic = 'force-dynamic';
export default async function Results() {
  const rounds = await getRounds();
  const closed = rounds.filter((r) => r.status === 'closed');
  const rows = await Promise.all(
    closed.map(async (r) => ({
      round: r,
      people: await getRoundContestants(r.id),
    })),
  );
  return (
    <main className="site-shell">
      <PublicHeader />
      <section className="page-intro">
        <p className="eyebrow">PERMANENT ROUND ARCHIVE</p>
        <h1>
          Past
          <br />
          <em>results.</em>
        </h1>
        <p>
          Every completed VoteManiaX voting week remains available at its
          original link.
        </p>
      </section>
      <section className="results-list">
        {rows.length ? (
          rows.map(({ round, people }) => (
            <Link href={`/results/${round.slug}`} key={round.id}>
              <span>WEEK {String(round.weekNumber).padStart(2, '0')}</span>
              <div>
                <h2>{round.name}</h2>
                <p>
                  {people[0]
                    ? `Winner: ${people[0].name}`
                    : 'No verified votes'}{' '}
                  · {people.reduce((s, p) => s + p.votes, 0)} votes
                </p>
              </div>
              <ArrowUpRight />
            </Link>
          ))
        ) : (
          <div className="public-empty">
            <h2>No completed rounds yet.</h2>
            <p>
              Results will appear here as soon as the first seven-day voting
              week closes.
            </p>
          </div>
        )}
      </section>
      <PublicFooter />
    </main>
  );
}
