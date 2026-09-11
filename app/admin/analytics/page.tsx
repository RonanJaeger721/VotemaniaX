import { AdminShell } from '@/components/admin-shell';
import { requireChatGPTUser } from '@/app/chatgpt-auth';
import { getAdminMetrics, getPublicContestants } from '@/lib/platform-store';
export const dynamic = 'force-dynamic';
export default async function Analytics() {
  const [user, metrics, people] = await Promise.all([
    requireChatGPTUser('/admin/analytics'),
    getAdminMetrics(),
    getPublicContestants(),
  ]);
  const max = Math.max(...people.map((p) => p.votes), 1);
  return (
    <AdminShell user={user} active="analytics">
      <header>
        <div>
          <p>VERIFIED DATA ONLY</p>
          <h1>Analytics</h1>
        </div>
        <span>Live database view</span>
      </header>
      <div className="admin-stats">
        <article>
          <small>VERIFIED VOTES</small>
          <strong>{metrics.votes}</strong>
        </article>
        <article>
          <small>CONTESTANTS</small>
          <strong>{metrics.contestants}</strong>
        </article>
        <article>
          <small>TRANSACTIONS</small>
          <strong>{metrics.transactions}</strong>
        </article>
        <article>
          <small>SUBSCRIBERS</small>
          <strong>{metrics.subscribers}</strong>
        </article>
      </div>
      <section className="admin-panel">
        <div className="panel-title">
          <div>
            <small>TOP PERFORMERS</small>
            <h2>Current vote distribution</h2>
          </div>
        </div>
        {people.slice(0, 10).map((p, i) => (
          <div className="data-line" key={p.id}>
            <span>
              #{i + 1} {p.name}
            </span>
            <i>
              <b style={{ width: `${(p.votes / max) * 100}%` }} />
            </i>
            <strong>{p.votes}</strong>
          </div>
        ))}
      </section>
    </AdminShell>
  );
}
