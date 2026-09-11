import Link from 'next/link';
import { eq, desc, sql } from 'drizzle-orm';
import { getDb } from '@/db';
import { videoSubmissions, votes } from '@/db/schema';
import { ContestantShell } from '@/components/contestant-shell';
import { requireContestant } from '@/lib/contestant-page';
import { getCurrentRound } from '@/lib/platform-store';
export const dynamic = 'force-dynamic';
export default async function Portal() {
  const { contestant } = await requireContestant();
  const db = getDb();
  const [round, videos, total] = await Promise.all([
    getCurrentRound(),
    db
      .select()
      .from(videoSubmissions)
      .where(eq(videoSubmissions.contestantId, contestant.id))
      .orderBy(desc(videoSubmissions.createdAt)),
    db
      .select({ total: sql<number>`coalesce(sum(${votes.quantity}),0)` })
      .from(votes)
      .where(eq(votes.contestantId, contestant.id)),
  ]);
  return (
    <ContestantShell active="" name={contestant.name}>
      <section className="portal-intro">
        <p className="eyebrow">OVERVIEW</p>
        <h1>Your competition control room.</h1>
        <p>
          Complete your profile, submit clips for review and share your weekly
          link once approved.
        </p>
      </section>
      <div className="portal-stats">
        <article>
          <small>PROFILE</small>
          <strong>{contestant.status}</strong>
          <span>Admin controls public visibility.</span>
        </article>
        <article>
          <small>CURRENT ROUND</small>
          <strong>{round?.name ?? 'No live round'}</strong>
          <span>{round?.status ?? 'Waiting'}</span>
        </article>
        <article>
          <small>VERIFIED VOTES</small>
          <strong>{Number(total[0]?.total ?? 0)}</strong>
          <span>Across recorded rounds.</span>
        </article>
        <article>
          <small>VIDEO SUBMISSIONS</small>
          <strong>{videos.length}</strong>
          <span>
            {videos.filter((v) => v.status === 'pending').length} waiting for
            review.
          </span>
        </article>
      </div>
      {round && (
        <section className="portal-action">
          <div>
            <small>YOUR VOTING LINK</small>
            <code>{`/vote/${round.slug}/${contestant.slug}`}</code>
          </div>
          <Link href={`/vote/${round.slug}/${contestant.slug}`}>
            Open voting page
          </Link>
        </section>
      )}
      <section className="portal-list">
        <header>
          <h2>Recent clips</h2>
          <Link href="/contestant/videos">Manage videos</Link>
        </header>
        {videos.length ? (
          videos.slice(0, 4).map((v) => (
            <article key={v.id}>
              <div>
                <strong>{v.title}</strong>
                <small>{v.filename}</small>
              </div>
              <span className={`status ${v.status}`}>{v.status}</span>
            </article>
          ))
        ) : (
          <div className="empty-state">
            <h3>No clips submitted yet</h3>
            <p>
              Upload your first competition video. It remains private until an
              authorised admin publishes it.
            </p>
            <Link href="/contestant/videos">Upload video</Link>
          </div>
        )}
      </section>
    </ContestantShell>
  );
}
