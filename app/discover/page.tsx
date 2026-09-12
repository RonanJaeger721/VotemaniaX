import Link from 'next/link';
import { Search, ArrowUpRight, Play } from 'lucide-react';
import { PublicHeader, PublicFooter } from '@/components/public-shell';
import { getCategories, getPublishedVideos } from '@/lib/application-store';
import { getActiveRound, getPublicContestants } from '@/lib/platform-store';
export const dynamic = 'force-dynamic';
export default async function Discover() {
  const [categories, videos, contestants, round] = await Promise.all([
    getCategories(),
    getPublishedVideos(),
    getPublicContestants(),
    getActiveRound(),
  ]);
  return (
    <main className="site-shell">
      <PublicHeader />
      <section className="app-page-head">
        <p className="eyebrow">DISCOVER TALENT</p>
        <h1>
          Find the voice
          <br />
          you’ll back.
        </h1>
        <form action="/search">
          <Search />
          <input
            name="q"
            aria-label="Search talent"
            placeholder="Search talent..."
          />
          <button>Search</button>
        </form>
        <div className="category-rail">
          {categories.map((c) => (
            <Link key={c.id} href={`/category/${c.slug}`}>
              {c.name}
            </Link>
          ))}
        </div>
      </section>
      <section className="media-section">
        <header>
          <div>
            <small>APPROVED CONTENT</small>
            <h2>New clips</h2>
          </div>
          <Link href="/watch">
            Open video feed <ArrowUpRight />
          </Link>
        </header>
        {videos.length ? (
          <div className="clip-grid">
            {videos.slice(0, 4).map((v) => (
              <article key={v.id}>
                <div className="clip-frame">
                  <video controls preload="metadata" src={`/media/${v.id}`}>
                    <track
                      kind="captions"
                      srcLang="en"
                      label="Captions when supplied"
                    />
                  </video>
                </div>
                <div>
                  <small>{v.category}</small>
                  <h3>{v.contestant}</h3>
                  <p>{v.caption}</p>
                  <Link href={`/contestants/${v.slug}`}>
                    <Play /> View profile
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <h3>The review queue is clear.</h3>
            <p>
              No contestant clips are published yet. Approved submissions will
              appear here automatically.
            </p>
          </div>
        )}
      </section>
      <section className="talent-strip">
        <header>
          <h2>Trending this week</h2>
          <Link href="/contestants">All contestants</Link>
        </header>
        {contestants.slice(0, 6).map((c, i) => (
          <article className="talent-row" key={c.id}>
            <span>0{i + 1}</span>
            <Link href={`/contestants/${c.slug}`}><strong>{c.name}</strong><small>{c.category}</small></Link>
            <b>{c.votes} votes</b>
            {round && <Link className="inline-vote-action" href={`/vote/${round.slug}/${c.slug}`}>Vote for {c.name}</Link>}
          </article>
        ))}
      </section>
      <PublicFooter />
    </main>
  );
}
