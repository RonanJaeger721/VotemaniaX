import { desc, eq } from 'drizzle-orm';
import { getDb } from '@/db';
import { videoSubmissions } from '@/db/schema';
import { ContestantShell } from '@/components/contestant-shell';
import { requireContestant } from '@/lib/contestant-page';
export const dynamic = 'force-dynamic';
export default async function Videos({
  searchParams,
}: {
  searchParams: Promise<{ uploaded?: string; error?: string }>;
}) {
  const [{ contestant }, { uploaded, error }] = await Promise.all([
    requireContestant(),
    searchParams,
  ]);
  const videos = await getDb()
    .select()
    .from(videoSubmissions)
    .where(eq(videoSubmissions.contestantId, contestant.id))
    .orderBy(desc(videoSubmissions.createdAt));
  return (
    <ContestantShell active="videos" name={contestant.name}>
      <section className="portal-intro">
        <p className="eyebrow">VIDEO SUBMISSIONS</p>
        <h1>Send your best clips.</h1>
        <p>
          Each file is reviewed separately. Pending and rejected videos are
          never exposed in the public feed.
        </p>
      </section>
      {uploaded && (
        <div className="form-success">
          Upload received. Your clips are pending admin review.
        </div>
      )}
      {error && (
        <div className="form-error">
          Upload failed. Use MP4, WebM or QuickTime video under 100 MB per file.
        </div>
      )}
      <form
        className="upload-panel"
        action="/api/contestant/videos"
        method="post"
        encType="multipart/form-data"
      >
        <label>
          Title
          <input name="title" required maxLength={80} />
        </label>
        <label>
          Caption
          <textarea name="caption" maxLength={500} />
        </label>
        <label>
          Video files
          <input
            name="videos"
            type="file"
            accept="video/mp4,video/webm,video/quicktime"
            multiple
            required
          />
          <small>
            Select several clips to submit them as a batch. Maximum 100 MB each.
          </small>
        </label>
        <label className="consent-row">
          <input name="consent" type="checkbox" required /> I confirm I own or
          have permission to submit this content and allow VoteManiaX
          administrators to review it. If approved, I allow VoteManiaX to
          display it for this competition.
        </label>
        <button>Upload for review</button>
      </form>
      <section className="portal-list">
        <header>
          <h2>Submission history</h2>
          <span>{videos.length} clips</span>
        </header>
        {videos.map((v) => (
          <article key={v.id}>
            <div>
              <strong>{v.title}</strong>
              <small>
                {v.filename} · {(v.size / 1024 / 1024).toFixed(1)} MB
              </small>
              {v.adminNote && <p>Admin note: {v.adminNote}</p>}
            </div>
            <span className={`status ${v.status}`}>
              {v.status.replace('_', ' ')}
            </span>
          </article>
        ))}
      </section>
    </ContestantShell>
  );
}
