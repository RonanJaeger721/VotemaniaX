import Link from 'next/link';
import { ArrowUpRight, Search as SearchIcon } from 'lucide-react';
import { PublicFooter, PublicHeader } from '@/components/public-shell';
import { getPublicContestants } from '@/lib/platform-store';
import { ensureSourceSnapshot } from '@/lib/platform-store';
import { getDb } from '@/db';
import { events } from '@/db/schema';
import { getCategories, getPublishedVideos } from '@/lib/application-store';
export const dynamic = 'force-dynamic';
export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = '' } = await searchParams;
  await ensureSourceSnapshot();
  const [contestants, eventRows, categories, videos] = await Promise.all([getPublicContestants(), getDb().select().from(events), getCategories(), getPublishedVideos()]);
  const needle = q.trim().toLowerCase();
  const people = needle
    ? contestants.filter((c) =>
        `${c.name} ${c.category}`.toLowerCase().includes(q.toLowerCase()),
      )
    : contestants.slice(0, 5);
  const foundEvents = needle
    ? eventRows.filter((e) =>
        `${e.name} ${e.description}`.toLowerCase().includes(q.toLowerCase()),
      )
    : eventRows.slice(0, 2);
  const foundCategories = needle ? categories.filter((c) => `${c.name} ${c.description}`.toLowerCase().includes(needle)) : [];
  const foundVideos = needle ? videos.filter((v) => `${v.title} ${v.caption} ${v.contestant} ${v.category}`.toLowerCase().includes(needle)) : [];
  const resultCount = people.length + foundEvents.length + foundCategories.length + foundVideos.length;
  return (
    <main className="site-shell">
      <PublicHeader />
      <section className="search-stage">
        <p className="eyebrow">DISCOVER VOTEMANIAX</p>
        <h1>
          Find the name
          <br />
          <em>you came for.</em>
        </h1>
        <form className="search-bar">
          <SearchIcon aria-hidden="true" />
          <input
            aria-label="Search performers, categories or events"
            name="q"
            defaultValue={q}
            placeholder="Search performers, categories or events"
          />
          <button>Search</button>
        </form>
        <small>
          {q
            ? `${resultCount} results for “${q}”`
            : 'Popular right now'}
        </small>
      </section>
      <section className="search-results">
        {q && <Link className="clear-search" href="/search">Clear search</Link>}
        <div>
          <p className="eyebrow">PERFORMERS</p>
          {people.map((c, i) => (
            <Link href={`/contestants/${c.slug}`} key={c.slug}>
              <span>
                {String(
                  contestants.findIndex((x) => x.id === c.id) + 1,
                ).padStart(2, '0')}
              </span>
              <div>
                <strong>{c.name}</strong>
                <small>
                  {c.category} · {c.votes} votes
                </small>
              </div>
              <ArrowUpRight />
            </Link>
          ))}
        </div>
        <div>
          <p className="eyebrow">EVENTS</p>
          {foundEvents.map((e) => (
            <Link href={`/events/${e.slug}`} key={e.slug}>
              <span className="status-dot">●</span>
              <div>
                <strong>{e.name}</strong>
                <small>
                  {e.status} · {e.currency} {e.votePrice.toFixed(2)} per vote
                </small>
              </div>
              <ArrowUpRight />
            </Link>
          ))}
        </div>
        {foundCategories.length > 0 && <div><p className="eyebrow">CATEGORIES</p>{foundCategories.map((c) => <Link href={`/category/${c.slug}`} key={c.id}><span>•</span><div><strong>{c.name}</strong><small>{c.description}</small></div><ArrowUpRight /></Link>)}</div>}
        {foundVideos.length > 0 && <div><p className="eyebrow">APPROVED CLIPS</p>{foundVideos.map((v) => <Link href={`/watch?video=${v.id}`} key={v.id}><span>▶</span><div><strong>{v.title}</strong><small>{v.contestant} · {v.category}</small></div><ArrowUpRight /></Link>)}</div>}
        {q && resultCount === 0 && (
          <div className="public-empty">
            <h2>No matches yet.</h2>
            <p>Try a performer name, category or event title.</p>
          </div>
        )}
      </section>
      <PublicFooter />
    </main>
  );
}
