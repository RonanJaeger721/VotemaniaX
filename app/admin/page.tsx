import Link from 'next/link';
import {
  Activity,
  CalendarDays,
  CircleDollarSign,
  LockKeyhole,
  Users,
} from 'lucide-react';
import { chatGPTSignInPath, getChatGPTUser } from '@/app/chatgpt-auth';
import { AdminShell } from '@/components/admin-shell';
import {
  ensureSourceSnapshot,
  getAdminMetrics,
  getLiveEvent,
  getPublicContestants,
} from '@/lib/platform-store';
import { getDb } from '@/db';
import { auditLogs, payments } from '@/db/schema';
import { desc, sql } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export default async function Admin({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const user = await getChatGPTUser();
  const { range = '30' } = await searchParams;
  const rangeDays = ['7', '30', '90'].includes(range) ? Number(range) : 30;
  await ensureSourceSnapshot();
  const [metrics, contestants, event, allPayments, allActivity] =
    await Promise.all([
      getAdminMetrics(),
      getPublicContestants(),
      getLiveEvent(),
      getDb().select().from(payments).orderBy(desc(payments.createdAt)),
      getDb().select().from(auditLogs).orderBy(desc(auditLogs.createdAt)),
    ]);
  const cutoff = Date.now() - rangeDays * 86400000;
  const paymentRows = allPayments
    .filter((p) => p.createdAt.getTime() >= cutoff)
    .slice(0, 5);
  const activity = allActivity
    .filter((a) => a.createdAt.getTime() >= cutoff)
    .slice(0, 5);
  const [{ revenue }] = await getDb()
    .select({ revenue: sql<number>`coalesce(sum(${payments.amount}),0)` })
    .from(payments);
  const categoryTotals = Object.entries(
    contestants.reduce<Record<string, number>>(
      (a, c) => ({ ...a, [c.category]: (a[c.category] || 0) + c.votes }),
      {},
    ),
  );
  const max = Math.max(...contestants.map((c) => c.votes), 1);
  return (
    <AdminShell user={user} active="">
      <header>
        <div>
          <p>VOTEMANIAX COMMAND CENTRE</p>
          <h1>Platform overview</h1>
        </div>
        <span>
          <i className="health-dot" /> Live platform health <b>Operational</b>
        </span>
      </header>
      {!user && (
        <div className="admin-access-banner">
          <LockKeyhole />
          <div>
            <strong>Live data is visible. Management is protected.</strong>
            <span>
              Sign in to create events, add participants, change settings, or
              alter records.
            </span>
          </div>
          <Link href={chatGPTSignInPath('/admin')}>Sign in to manage</Link>
        </div>
      )}
      <div className="admin-range" aria-label="Dashboard date range">
        <span>Reporting window</span>
        {[7, 30, 90].map((days) => (
          <Link
            className={rangeDays === days ? 'active' : ''}
            href={`/admin?range=${days}`}
            key={days}
          >
            {days} days
          </Link>
        ))}
      </div>
      <div className="admin-stats">
        <article>
          <CalendarDays />
          <small>ACTIVE EVENT</small>
          <strong>{event?.name ?? 'None'}</strong>
          <span>{event?.endAt ? 'Closing scheduled' : 'No live event'}</span>
        </article>
        <article>
          <Users />
          <small>TOTAL CONTESTANTS</small>
          <strong>{metrics.contestants}</strong>
          <span>Approved public records</span>
        </article>
        <article>
          <Activity />
          <small>VERIFIED VOTES</small>
          <strong>{metrics.votes}</strong>
          <span>Auditable vote ledger</span>
        </article>
        <article>
          <CircleDollarSign />
          <small>TOTAL REVENUE</small>
          <strong>USD {Number(revenue).toFixed(2)}</strong>
          <span>Verified transaction value</span>
        </article>
      </div>
      <div className="report-grid">
        <article className="admin-panel span-two">
          <Panel
            title="Vote pulse"
            label="LIVE MOMENTUM"
            action={<Link href="/admin/votes">Open ledger</Link>}
          />
          <div className="spark-bars" aria-label="Votes by performer">
            {contestants.slice(0, 9).map((c, index) => (
              <i
                key={c.id}
                style={{
                  height: `${Math.max(12, (c.votes / max) * 100)}%`,
                  animationDelay: `${index * 55}ms`,
                }}
                title={`${c.name}: ${c.votes}`}
              />
            ))}
          </div>
          <div className="chart-caption">
            <span>Top {Math.min(9, contestants.length)} performers</span>
            <b>{metrics.votes} verified votes</b>
          </div>
        </article>
        <article className="admin-panel">
          <Panel title="Category distribution" label="BY VERIFIED VOTES" />
          {categoryTotals.map(([name, value]) => (
            <div className="data-line" key={name}>
              <span>{name}</span>
              <i>
                <b
                  style={{
                    width: `${metrics.votes ? (value / metrics.votes) * 100 : 0}%`,
                  }}
                />
              </i>
              <strong>{value}</strong>
            </div>
          ))}
        </article>
        <article className="admin-panel">
          <Panel
            title="Payment methods"
            label="PROVIDER MIX"
            action={<Link href="/admin/payment-methods">Configure</Link>}
          />
          <div className="data-line">
            <span>Legacy import</span>
            <i>
              <b style={{ width: '100%' }} />
            </i>
            <strong>{metrics.transactions}</strong>
          </div>
          <p className="empty-note">
            EcoCash and InnBucks activate only after merchant verification.
          </p>
        </article>
        <article className="admin-panel span-two">
          <Panel
            title="Top performers"
            label="CURRENT LEADERBOARD"
            action={<Link href="/leaderboard">Public view</Link>}
          />
          {contestants.slice(0, 5).map((c, i) => (
            <Link
              href={`/contestants/${c.slug}`}
              className="mini-rank"
              key={c.slug}
            >
              <span>0{i + 1}</span>
              <b>{c.name.charAt(0)}</b>
              <div>
                <strong>{c.name}</strong>
                <small>{c.category}</small>
              </div>
              <i>
                <em style={{ width: `${(c.votes / max) * 100}%` }} />
              </i>
              <strong>{c.votes}</strong>
            </Link>
          ))}
        </article>
        <article className="admin-panel">
          <Panel
            title="Quick actions"
            label={user ? 'MANAGE PLATFORM' : 'EXPLORE PLATFORM'}
          />
          <Link
            className="quick"
            href={user ? '/admin/events' : chatGPTSignInPath('/admin/events')}
          >
            Create an event <span>↗</span>
          </Link>
          <Link
            className="quick"
            href={
              user
                ? '/admin/participants'
                : chatGPTSignInPath('/admin/participants')
            }
          >
            Add participant <span>↗</span>
          </Link>
          <Link className="quick" href="/admin/payments">
            Review payments <span>↗</span>
          </Link>
          <Link className="quick" href="/admin/audit-log">
            Audit activity <span>↗</span>
          </Link>
        </article>
        <article className="admin-panel span-two">
          <Panel
            title="Recent payments"
            label={`LAST ${rangeDays} DAYS`}
            action={<Link href="/admin/payments">View all</Link>}
          />
          {paymentRows.length ? (
            <SimpleTable
              headers={['Reference', 'Method', 'Amount', 'Status']}
              rows={paymentRows.map((p) => [
                p.reference,
                p.method,
                `${p.currency} ${p.amount.toFixed(2)}`,
                p.status,
              ])}
            />
          ) : (
            <p className="empty-note">No payments in this reporting window.</p>
          )}
        </article>
        <article className="admin-panel">
          <Panel
            title="Recent activity"
            label="AUDIT TRAIL"
            action={<Link href="/admin/audit-log">View all</Link>}
          />
          {activity.length ? (
            activity.map((a) => (
              <div className="activity-row" key={a.id}>
                <strong>{a.action.replaceAll('_', ' ')}</strong>
                <small>
                  {a.entityType} · {date(a.createdAt)}
                </small>
              </div>
            ))
          ) : (
            <p className="empty-note">
              No admin activity in this reporting window.
            </p>
          )}
        </article>
      </div>
    </AdminShell>
  );
}

function Panel({
  title,
  label,
  action,
}: {
  title: string;
  label: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="panel-title">
      <div>
        <small>{label}</small>
        <h2>{title}</h2>
      </div>
      {action}
    </div>
  );
}
function SimpleTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: (string | number)[][];
}) {
  return (
    <div className="inline-table">
      <table>
        <thead>
          <tr>
            {headers.map((h) => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              {r.map((c, j) => (
                <td key={j}>{c}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
function date(value: Date) {
  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(value);
}
