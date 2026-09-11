import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { PublicFooter, PublicHeader } from '@/components/public-shell';
import { getLiveEvent, getPublicContestants } from '@/lib/platform-store';
import { ShareButton } from '@/components/share-button';
export const dynamic = 'force-dynamic';
export default async function Leaderboard({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const all = await getPublicContestants();
  const event = await getLiveEvent();
  const { q = '', category = '' } = await searchParams;
  const categories = [...new Set(all.map((c) => c.category))];
  const sorted = all.filter(
    (c) =>
      (!q || c.name.toLowerCase().includes(q.toLowerCase())) &&
      (!category || c.category === category),
  );
  const totalVotes = all.reduce((sum, c) => sum + c.votes, 0);
  return (
    <main className="site-shell">
      <PublicHeader />
      <section className="board-head">
        <div>
          <p className="live-pill">
            ● {event ? 'Live leaderboard' : 'Final results'}
          </p>
          <h1>
            The crowd
            <br />
            <em>has spoken.</em>
          </h1>
          <ShareButton title={event?.name ?? 'VoteManiaX leaderboard'} />
        </div>
        <div>
          <span>{event?.name ?? 'VoteManiaX'}</span>
          <strong>{totalVotes}</strong>
          <small>verified votes</small>
        </div>
      </section>
      <section className="podium">
        {all.slice(0, 3).map((c, i) => (
          <Link
            href={`/contestants/${c.slug}`}
            className={`podium-card place-${i + 1}`}
            key={c.slug}
          >
            <span>0{i + 1}</span>
            <b>{c.name.charAt(0)}</b>
            <h2>{c.name}</h2>
            <p>{c.votes} votes</p>
          </Link>
        ))}
      </section>
      <form className="board-filters">
        <input
          aria-label="Search performers"
          name="q"
          defaultValue={q}
          placeholder="Search performers"
        />
        <select
          aria-label="Filter leaderboard by category"
          name="category"
          defaultValue={category}
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <button>Filter ranking</button>
      </form>
      <section className="full-board">
        {sorted.map((c) => {
          const rank = all.findIndex((x) => x.id === c.id) + 1;
          return (
            <Link
              href={`/contestants/${c.slug}`}
              className="board-row"
              key={c.slug}
            >
              <strong>{String(rank).padStart(2, '0')}</strong>
              <span className="avatar">{c.name.charAt(0)}</span>
              <div>
                <b>{c.name}</b>
                <small>{c.category}</small>
              </div>
              <span>{c.votes} votes</span>
              <ArrowUpRight size={18} />
            </Link>
          );
        })}
      </section>
      <PublicFooter />
    </main>
  );
}
