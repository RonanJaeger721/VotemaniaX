import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight, Play, Trophy } from 'lucide-react';
import { PublicFooter, PublicHeader } from '@/components/public-shell';
import { NewsletterForm } from '@/components/newsletter-form';
import { RoundCountdown } from '@/components/round-countdown';
import { getCategories, getPublishedVideos } from '@/lib/application-store';
import {
  ensureSourceSnapshot,
  getActiveFaqs,
  getActiveRound,
  getLiveEvent,
  getPublicContestants,
} from '@/lib/platform-store';
export const dynamic = 'force-dynamic';
export default async function Home() {
  await ensureSourceSnapshot();
  const [contestants, event, round, categories, videos, faqRows] = await Promise.all([
    getPublicContestants(),
    getLiveEvent(),
    getActiveRound(),
    getCategories(),
    getPublishedVideos(),
    getActiveFaqs(),
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
      <section className="stage-story" aria-labelledby="stage-story-title">
        <div className="stage-story-copy">
          <small>DISCOVER · SUPPORT · VOTE</small>
          <h2 id="stage-story-title">The stage is yours.</h2>
          <strong>Make it count.</strong>
          <p>Discover talent. Support your favourites. Vote and help them rise.</p>
          <Link href="/discover">
            Discover talent <ArrowUpRight />
          </Link>
        </div>
        <figure className="stage-photo stage-photo-wide">
          <Image src="/images/atmosphere/orange-stage-crowd.jpg" alt="A real concert crowd facing a stage illuminated by orange lights" fill priority sizes="(max-width: 700px) 100vw, 62vw" />
        </figure>
        <figure className="stage-photo stage-photo-tall">
          <Image src="/images/atmosphere/singer-silhouette.jpg" alt="A singer performing in silhouette under warm orange stage lights" fill sizes="(max-width: 700px) 48vw, 22vw" />
        </figure>
        <figure className="stage-photo stage-photo-detail">
          <Image src="/images/atmosphere/performer-orange-stage.jpg" alt="A live performer beneath a strong orange spotlight" fill sizes="(max-width: 700px) 48vw, 22vw" />
        </figure>
      </section>
      <section className="feed-hero">
        <div className="featured-round-summary">
          <small>CURRENT COMPETITION</small>
          <h1>{event?.name ?? 'VoteManiaX Talent Showcase'}</h1>
          <p>
            Explore the contestants, watch approved performances and support the
            talent that earns your vote.
          </p>
          <div>
            <Link href="/contestants">
              Browse contestants <ArrowUpRight />
            </Link>
            <Link href="/watch">Watch approved clips <Play /></Link>
          </div>
        </div>
        <aside>
          <small>LIVE TOP FIVE</small>
          {leaders.map((c, i) => (
            <article className="home-leader-row" key={c.id}>
              <span>{String(i + 1).padStart(2, '0')}</span>
              <Link href={`/contestants/${c.slug}`}>
                <strong>{c.name}</strong>
                <small>{c.category}</small>
              </Link>
              <b>{c.votes}</b>
              {round && <Link className="inline-vote-action" href={`/vote/${round.slug}/${c.slug}`}>Vote for {c.name}</Link>}
            </article>
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
              'Browse performers, watch their clips, and pick the one who speaks to you.',
            ],
            [
              '02',
              'Chip in',
              'A small contribution unlocks your vote. Quick, easy, and every bit helps.',
            ],
            [
              '03',
              'Cast your vote',
              'Vote as many times as you want. Help your favourite climb to the top.',
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
      <section className="faq-preview">
        <header>
          <div><p className="eyebrow">FREQUENTLY ASKED QUESTIONS</p><h2>Before you vote.</h2></div>
          <Link href="/faq">View all questions <ArrowUpRight /></Link>
        </header>
        {faqRows.length ? <div className="faq-list">{faqRows.slice(0, 3).map((item) => (
          <details key={item.id}><summary>{item.question}</summary><p>{item.answer}</p></details>
        ))}</div> : <div className="empty-state"><h3>Questions are being prepared.</h3><p>Published answers will appear here.</p></div>}
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
