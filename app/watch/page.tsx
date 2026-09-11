import Link from 'next/link';
import { Vote, Share2 } from 'lucide-react';
import { PublicHeader } from '@/components/public-shell';
import { getPublishedVideos } from '@/lib/application-store';
import { getCurrentRound } from '@/lib/platform-store';
export const dynamic = 'force-dynamic';
export default async function Watch() {
  const [videos, round] = await Promise.all([
    getPublishedVideos(),
    getCurrentRound(),
  ]);
  return (
    <main className="site-shell watch-page">
      <PublicHeader />
      <header className="watch-head">
        <div>
          <small>VOTEMANIAX WATCH</small>
          <h1>Approved clips.</h1>
        </div>
        <p>One clip plays at a time. Sound stays under your control.</p>
      </header>
      {videos.length ? (
        <section className="video-feed">
          {videos.map((v) => (
            <article key={v.id}>
              <video
                controls
                playsInline
                preload="metadata"
                src={`/media/${v.id}`}
              >
                <track
                  kind="captions"
                  srcLang="en"
                  label="Captions when supplied"
                />
              </video>
              <div className="video-meta">
                <small>{v.category}</small>
                <h2>{v.contestant}</h2>
                <p>{v.caption}</p>
                <div>
                  <Link
                    href={
                      round
                        ? `/vote/${round.slug}/${v.slug}`
                        : `/contestants/${v.slug}`
                    }
                  >
                    <Vote /> Vote
                  </Link>
                  <Link href={`/contestants/${v.slug}`}>
                    <Share2 /> Profile
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </section>
      ) : (
        <div className="empty-state public-empty">
          <h2>No published clips yet.</h2>
          <p>
            Pending and rejected uploads are private. This feed activates as
            soon as an admin publishes approved content.
          </p>
          <Link href="/contestants">Meet the contestants</Link>
        </div>
      )}
    </main>
  );
}
