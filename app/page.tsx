import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, Play, Trophy } from 'lucide-react';
import { PublicFooter, PublicHeader } from '@/components/public-shell';
import { NewsletterForm } from '@/components/newsletter-form';
import { RoundCountdown } from '@/components/round-countdown';
import { getCategories, getPublishedVideos } from '@/lib/application-store';
import {
  ensureSourceSnapshot,
  getCurrentRound,
  getLiveEvent,
  getPublicContestants,
} from '@/lib/platform-store';
export const dynamic = 'force-dynamic';
export default async function Home() {
  await ensureSourceSnapshot();
  const [contestants, event, round, categories, videos] = await Promise.all([
    getPublicContestants(),
    getLiveEvent(),
    getCurrentRound(),
    getCategories(),
    getPublishedVideos(),
  ]);
  const leaders = contestants.slice(0, 5);
  return (
    <main className="site-shell">
      <PublicHeader />
      <section className="round-banner">
        <div>
          <span>{round?.name?.toUpperCase() ?? 'NEXT ROUND'}</span>
          <strong>{event?.name ?? 'VoteManiaX Talent Showcase'}</strong>
          <small>
            {round?.status === 'live'
              ? `Closes ${round.endAt.toLocaleDateString('en', { weekday: 'long', hour: '2-digit', minute: '2-digit' })}`
              : 'Voting is currently closed'}
          </small>
        </div>
        {round && (
          <RoundCountdown
            startAt={round.startAt.toISOString()}
            endAt={round.endAt.toISOString()}
          />
        )}
        <div className="banner-actions">
          <Link href={round ? `/vote/${round.slug}` : '/events'}>
            Vote now <ArrowUpRight />
          </Link>
          <Link href={round ? `/leaderboard/${round.slug}` : '/leaderboard'}>
            View rankings
          </Link>
        </div>
      </section>
      <section className="feed-hero">
        <div className="featured-media">
          <Image
            src="/performer-hero.png"
            alt="Featured VoteManiaX contestant performing"
            fill
            priority
            sizes="(max-width: 700px) 100vw, 62vw"
          />
          <div className="featured-overlay">
            <small>FEATURED THIS WEEK</small>
            <h1>{leaders[0]?.name ?? 'The stage is ready'}</h1>
            <p>
              {leaders[0]?.category ?? 'Talent discovery'} ·{' '}
              {leaders[0]?.votes ?? 0} verified votes
            </p>
            <div>
              {leaders[0] && (
                <Link href={`/contestants/${leaders[0].slug}`}>
                  <Play /> Watch profile
                </Link>
              )}
              {round && leaders[0] && (
                <Link
                  className="gold"
                  href={`/vote/${round.slug}/${leaders[0].slug}`}
                >
                  Vote for {leaders[0].name}
                </Link>
              )}
            </div>
          </div>
        </div>
        <aside>
          <small>LIVE TOP FIVE</small>
          {leaders.map((c, i) => (
            <Link href={`/contestants/${c.slug}`} key={c.id}>
              <span>{String(i + 1).padStart(2, '0')}</span>
              <div>
                <strong>{c.name}</strong>
                <small>{c.category}</small>
              </div>
              <b>{c.votes}</b>
            </Link>
          ))}
          <Link className="board-link" href="/leaderboard">
            <Trophy /> Full leaderboard
          </Link>
        </aside>
      </section>
      <nav className="category-rail home-rail" aria-label="Talent categories">
        {categories.map((c) => (
          <Link href={`/category/${c.slug}`} key={c.id}>
            {c.name}
          </Link>
        ))}
      </nav>
      <section className="media-section">
        <header>
          <div>
            <small>WATCH</small>
            <h2>Fresh from review</h2>
          </div>
          <Link href="/watch">
            Open video feed <ArrowUpRight />
          </Link>
        </header>
        {videos.length ? (
          <div className="clip-grid">
            {videos.slice(0, 3).map((v) => (
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
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <h3>New clips are being prepared.</h3>
            <p>Only admin-approved, published contestant videos appear here.</p>
            <Link href="/contestants">Browse contestants</Link>
          </div>
        )}
      </section>
      <section className="how-flow">
        <header>
          <p className="eyebrow">HOW IT WORKS</p>
          <h2>
            Three quick steps.
            <br />
            That’s all it takes.
          </h2>
        </header>
        <div>
          {[
            [
              '01',
              'Find your favourite',
              'Watch performers’ clips and choose the talent that speaks to you.',
            ],
            [
              '02',
              'Chip in',
              'A small contribution unlocks your vote. Quick, easy, and every bit helps.',
            ],
            [
              '03',
              'Cast your vote',
              'Vote as many times as you want and help your favourite climb the leaderboard.',
            ],
          ].map(([n, t, p]) => (
            <article key={n}>
              <span>{n}</span>
              <i />
              <div>
                <h3>{t}</h3>
                <p>{p}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
      <section className="newsletter-section">
        <div>
          <p className="eyebrow">STAY IN THE LOOP</p>
          <h2>
            Never miss
            <br />a voting week.
          </h2>
        </div>
        <div>
          <p>
            Get VoteManiaX updates about new competitions, voting periods,
            results and featured talent.
          </p>
          <NewsletterForm />
          <small>Opt in only. Unsubscribe at any time.</small>
        </div>
      </section>
      <PublicFooter />
    </main>
  );
}
