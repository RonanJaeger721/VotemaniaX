import Link from 'next/link';
import { PublicFooter, PublicHeader } from '@/components/public-shell';
import { ContestantCard } from '@/components/contestant-card';
import { getCurrentRound, getPublicContestants } from '@/lib/platform-store';
export const dynamic = 'force-dynamic';
export default async function Contestants({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const all = await getPublicContestants(),
    round = await getCurrentRound();
  const { q = '', category = '' } = await searchParams;
  const categories = [...new Set(all.map((c) => c.category))];
  const filtered = all.filter(
    (c) =>
      (!q ||
        `${c.name} ${c.category}`.toLowerCase().includes(q.toLowerCase())) &&
      (!category || c.category === category),
  );
  const voteHref = round?.status === 'live' ? `/vote/${round.slug}` : undefined;
  return (
    <main className="site-shell">
      <PublicHeader />
      <section className="page-intro">
        <p className="eyebrow">CURRENT COMPETITION</p>
        <h1>
          All
          <br />
          <em>contestants.</em>
        </h1>
        <p>
          Search the active field and vote directly without unnecessary steps.
        </p>
        <form className="directory-tools">
          <input
            name="q"
            defaultValue={q}
            placeholder="Search contestants"
            aria-label="Search contestants"
          />
          <select
            name="category"
            defaultValue={category}
            aria-label="Filter by category"
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <button>Apply filters</button>
        </form>
        <div className="filter-chips">
          <Link href="/contestants">All</Link>
          {categories.map((c) => (
            <Link
              href={`/contestants?category=${encodeURIComponent(c)}`}
              key={c}
            >
              {c}
            </Link>
          ))}
        </div>
      </section>
      {filtered.length ? (
        <section className="contestant-grid">
          {filtered.map((item, index) => (
            <ContestantCard
              item={item}
              index={index}
              voteHref={voteHref}
              key={item.slug}
            />
          ))}
        </section>
      ) : (
        <section className="public-empty">
          <h2>No contestants found.</h2>
          <p>Try another name or clear the category filter.</p>
          <Link className="primary-action" href="/contestants">
            Clear filters
          </Link>
        </section>
      )}
      <PublicFooter />
    </main>
  );
}
