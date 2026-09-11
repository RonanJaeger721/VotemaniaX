import { AdminShell } from '@/components/admin-shell';
import { requireChatGPTUser } from '@/app/chatgpt-auth';
import { getReviewVideos } from '@/lib/application-store';
export const dynamic = 'force-dynamic';
export default async function Review() {
  const [user, videos] = await Promise.all([
    requireChatGPTUser('/admin/video-review'),
    getReviewVideos(),
  ]);
  return (
    <AdminShell user={user} active="video-review">
      <header>
        <div>
          <p>CONTENT MODERATION</p>
          <h1>Video review</h1>
        </div>
        <span>
          {videos.filter((v) => v.status === 'pending').length} waiting
        </span>
      </header>
      <div className="review-filters">
        <span className="active">All</span>
        <span>Pending</span>
        <span>Approved</span>
        <span>Needs changes</span>
        <span>Published</span>
      </div>
      {videos.length ? (
        <section className="review-grid">
          {videos.map((v) => (
            <article key={v.id}>
              <video controls preload="metadata" src={`/media/${v.id}`}>
                <track
                  kind="captions"
                  srcLang="en"
                  label="Captions when supplied"
                />
              </video>
              <div>
                <small>
                  {v.category} · {v.contestant}
                </small>
                <h2>{v.title}</h2>
                <p>{v.caption || 'No caption supplied.'}</p>
                <span className={`status ${v.status}`}>
                  {v.status.replace('_', ' ')}
                </span>
                {v.consent ? (
                  <p className="consent-proof">Consent {v.consent} recorded</p>
                ) : (
                  <p className="form-error">Consent record missing</p>
                )}
                {user && (
                  <form action="/api/admin/videos" method="post">
                    <input type="hidden" name="id" value={v.id} />
                    <label>
                      Review note
                      <textarea name="note" defaultValue={v.adminNote ?? ''} />
                    </label>
                    <div>
                      <button name="status" value="published">
                        Approve & publish
                      </button>
                      <button name="status" value="approved">
                        Approve for later
                      </button>
                      <button name="status" value="needs_changes">
                        Request changes
                      </button>
                      <button className="danger" name="status" value="rejected">
                        Reject
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </article>
          ))}
        </section>
      ) : (
        <div className="admin-empty">
          <h2>No video submissions</h2>
          <p>
            New contestant uploads will appear here automatically with their
            consent record.
          </p>
        </div>
      )}
    </AdminShell>
  );
}
