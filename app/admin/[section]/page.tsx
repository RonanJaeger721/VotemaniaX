import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireChatGPTUser } from '@/app/chatgpt-auth';
import { AdminShell } from '@/components/admin-shell';
import { ensureSourceSnapshot } from '@/lib/platform-store';
import { getDb } from '@/db';
import {
  auditLogs,
  contestants,
  events,
  faqs,
  media,
  payments,
  siteSettings,
  subscribers,
  votes,
} from '@/db/schema';
import { desc, eq, sql } from 'drizzle-orm';
export const dynamic = 'force-dynamic';
const sections = [
  'events',
  'participants',
  'payments',
  'payment-methods',
  'settings',
  'admins',
  'audit-log',
  'votes',
];
export default async function AdminSection({
  params,
  searchParams,
}: {
  params: Promise<{ section: string }>;
  searchParams: Promise<{ q?: string; status?: string; edit?: string; saved?: string }>;
}) {
  const { section } = await params;
  if (!sections.includes(section)) notFound();
  const user = await requireChatGPTUser(`/admin/${section}`);
  const { q = '', status = '', edit = '', saved = '' } = await searchParams;
  await ensureSourceSnapshot();
  const db = getDb();
  const [
    eventRows,
    contestantRows,
    paymentRows,
    voteRows,
    settingRows,
    auditRows,
  ] = await Promise.all([
    db.select().from(events).orderBy(desc(events.createdAt)),
    db.select({ id: contestants.id, eventId: contestants.eventId, name: contestants.name, slug: contestants.slug, category: contestants.category, bio: contestants.bio, status: contestants.status, votes: sql<number>`coalesce(sum(${votes.quantity}),0)` }).from(contestants).leftJoin(votes, eq(contestants.id, votes.contestantId)).groupBy(contestants.id).orderBy(desc(sql`coalesce(sum(${votes.quantity}),0)`)),
    db.select().from(payments).orderBy(desc(payments.createdAt)),
    db.select().from(votes).orderBy(desc(votes.createdAt)),
    db.select().from(siteSettings),
    db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)),
  ]);
  const filteredEvents = eventRows.filter(
    (e) =>
      (!q || e.name.toLowerCase().includes(q.toLowerCase())) &&
      (!status || e.status === status),
  );
  const filteredPeople = contestantRows.filter(
    (c) =>
      (!q || c.name.toLowerCase().includes(q.toLowerCase())) &&
      (!status || c.status === status),
  );
  const filteredPayments = paymentRows.filter(
    (p) =>
      (!q ||
        `${p.reference} ${p.method}`.toLowerCase().includes(q.toLowerCase())) &&
      (!status || p.status === status),
  );
  const methods = Object.entries(
    paymentRows.reduce<Record<string, number>>(
      (a, p) => ({ ...a, [p.method]: (a[p.method] || 0) + 1 }),
      {},
    ),
  );
  const editing = contestantRows.find((row) => String(row.id) === edit);
  return (
    <AdminShell user={user} active={section}>
      <header>
        <div>
          <p>VOTEMANIAX ADMIN</p>
          <h1>{title(section)}</h1>
        </div>
        <Link href="/admin">Back to overview</Link>
      </header>
      {section === 'events' && (
        <>
          <Toolbar
            statuses={['draft', 'published', 'upcoming', 'completed']}
            q={q}
            status={status}
            dataset="events"
          />
          <form
            className="admin-create"
            method="post"
            action="/api/admin/manage"
          >
            <input type="hidden" name="type" value="event" />
            <input name="name" placeholder="Event name" required />
            <input name="slug" placeholder="event-slug" required />
            <input name="endDate" type="date" required />
            <input
              name="price"
              type="number"
              min="0"
              step="0.01"
              placeholder="Vote price"
              required
            />
            <select name="status">
              <option value="draft">Draft</option>
              <option value="upcoming">Upcoming</option>
              <option value="live">Published / live</option>
              <option value="closed">Completed</option>
            </select>
            <button>Create event</button>
          </form>
          <AdminTable
            headers={['Event', 'Status', 'Start', 'End', 'Price']}
            rows={filteredEvents.map((e) => [
              e.name,
              e.status,
              date(e.startAt),
              date(e.endAt),
              `${e.currency} ${e.votePrice}`,
            ])}
          />
        </>
      )}
      {section === 'participants' && (
        <>
          <Toolbar
            statuses={[
              'pending',
              'awaiting-upload',
              'approved',
              'disqualified',
            ]}
            q={q}
            status={status}
            dataset="participants"
          />
          <form
            className="admin-create"
            method="post"
            action="/api/admin/manage"
          >
            <input type="hidden" name="type" value="contestant" />
            {editing && <input type="hidden" name="id" value={editing.id} />}
            <input name="name" defaultValue={editing?.name} placeholder="Participant name" required />
            <input name="slug" defaultValue={editing?.slug} placeholder="participant-slug" required />
            <input name="category" defaultValue={editing?.category} placeholder="Category" required />
            <select name="eventId" defaultValue={editing?.eventId ?? eventRows[0]?.id}>
              {eventRows.map((e) => (
                <option value={e.id} key={e.id}>
                  {e.name}
                </option>
              ))}
            </select>
            <input name="bio" defaultValue={editing?.bio} placeholder="Public biography" />
            <select name="status" defaultValue={editing?.status ?? 'pending'}><option value="pending">Pending</option><option value="awaiting-upload">Awaiting upload</option><option value="approved">Approved</option><option value="disqualified">Disqualified</option><option value="inactive">Archived</option></select>
            <button>{editing ? 'Save participant' : 'Add participant'}</button>
          </form>
          <AdminTable
            headers={[
              'Participant',
              'Category',
              'Rank',
              'Verified votes',
              'Status',
              'Actions',
            ]}
            rows={filteredPeople.map((c, i) => [
              c.name,
              c.category,
              `#${i + 1}`,
              c.votes,
              c.status,
              <div className="admin-row-actions"><Link href={`/admin/participants?edit=${c.id}`}>Edit</Link><form method="post" action="/api/admin/manage"><input type="hidden" name="type" value="contestant-status"/><input type="hidden" name="id" value={c.id}/><input type="hidden" name="status" value="awaiting-upload"/><button>Request upload</button></form><form method="post" action="/api/admin/manage"><input type="hidden" name="type" value="contestant-status"/><input type="hidden" name="id" value={c.id}/><input type="hidden" name="status" value={c.status === 'approved' ? 'inactive' : 'approved'}/><button>{c.status === 'approved' ? 'Archive' : 'Approve'}</button></form></div>,
            ])}
          />
        </>
      )}
      {section === 'payments' && (
        <>
          <Toolbar
            statuses={[
              'pending',
              'verified',
              'paid',
              'failed',
              'expired',
              'cancelled',
            ]}
            q={q}
            status={status}
            dataset="payments"
          />
          <AdminTable
            headers={[
              'Reference',
              'Method',
              'Amount',
              'Quantity',
              'Status',
              'Provider ref',
            ]}
            rows={filteredPayments.map((p) => [
              p.reference,
              p.method,
              `${p.currency} ${p.amount}`,
              p.quantity,
              p.status,
              p.providerReference ?? '—',
            ])}
          />
        </>
      )}
      {section === 'payment-methods' && (
        <section className="method-overview">
          {methods.map(([name, count]) => (
            <article key={name}>
              <span>{name}</span>
              <strong>{count}</strong>
              <small>
                {Math.round((count / paymentRows.length) * 100) || 0}% of
                transactions
              </small>
            </article>
          ))}
          <article className="provider-pending">
            <span>EcoCash</span>
            <strong>Pending</strong>
            <small>Merchant credentials required</small>
          </article>
          <article className="provider-pending">
            <span>InnBucks</span>
            <strong>Pending</strong>
            <small>Merchant credentials required</small>
          </article>
        </section>
      )}
      {section === 'settings' && (
        <>
          <div className="settings-tabs">
            <span className="active">General</span>
            <span>Notifications</span>
            <span>Security</span>
            <span>Storage</span>
            <span>Database</span>
            <span>Appearance</span>
          </div>
          {saved === '1' && <p className="admin-success" role="status">Settings saved.</p>}
          <form
            className="settings-form"
            method="post"
            action="/api/admin/manage"
          >
            <input type="hidden" name="type" value="settings-bundle" />
            <label>
              Company name
              <input
                name="company_name"
                defaultValue={setting(
                  settingRows,
                  'company_name',
                  'VoteManiaX',
                )}
              />
            </label>
            <label>
              Support email
              <input
                name="support_email"
                type="email"
                defaultValue={setting(
                  settingRows,
                  'support_email',
                  'thevibehub26@gmail.com',
                )}
              />
            </label>
            <label>
              Support phone
              <input name="support_phone" defaultValue={setting(settingRows, 'support_phone', '+263 719 308 153')} />
            </label>
            <label>
              Timezone
              <input
                name="timezone"
                defaultValue={setting(settingRows, 'timezone', 'Africa/Harare')}
              />
            </label>
            <label>Default round duration (days)<input name="default_round_duration" type="number" min="1" defaultValue={setting(settingRows, 'default_round_duration', '7')} /></label>
            <button>Save changes</button>
          </form>
          <AdminTable
            headers={['Stored setting', 'Value', 'Updated']}
            rows={settingRows.map((s) => [s.key, s.value, date(s.updatedAt)])}
          />
        </>
      )}
      {section === 'admins' && (
        <section className="admin-profile-list">
          <article>
            <span>{user.displayName.charAt(0)}</span>
            <div>
              <strong>{user.displayName}</strong>
              <small>Authenticated platform administrator</small>
            </div>
            <b>Active</b>
          </article>
        </section>
      )}
      {section === 'audit-log' && (
        <AdminTable
          headers={['Date', 'Administrator', 'Action', 'Entity', 'ID']}
          rows={auditRows.map((a) => [
            date(a.createdAt),
            a.adminUserId,
            a.action,
            a.entityType,
            a.entityId ?? '—',
          ])}
        />
      )}{' '}
      {section === 'votes' && (
        <AdminTable
          headers={[
            'Date',
            'Contestant ID',
            'Event ID',
            'Quantity',
            'Payment ID',
          ]}
          rows={voteRows.map((v) => [
            date(v.createdAt),
            v.contestantId,
            v.eventId,
            v.quantity,
            v.paymentId,
          ])}
        />
      )}
    </AdminShell>
  );
}
function Toolbar({
  statuses,
  q,
  status,
  dataset,
}: {
  statuses: string[];
  q: string;
  status: string;
  dataset: string;
}) {
  return (
    <form className="admin-toolbar">
      <input name="q" defaultValue={q} placeholder="Search records" />
      <select name="status" defaultValue={status}>
        <option value="">All statuses</option>
        {statuses.map((s) => (
          <option key={s}>{s}</option>
        ))}
      </select>
      <button>Filter</button>
      <a href={`/api/admin/export?dataset=${dataset}`}>Export CSV</a>
    </form>
  );
}
function title(s: string) {
  return s
    .split('-')
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(' ');
}
function setting(
  rows: { key: string; value: string }[],
  key: string,
  fallback: string,
) {
  return rows.find((r) => r.key === key)?.value ?? fallback;
}
function date(value: Date | null) {
  return value
    ? new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium' }).format(value)
    : '—';
}
function AdminTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: React.ReactNode[][];
}) {
  return (
    <div className="admin-table">
      <table>
        <thead>
          <tr>
            {headers.map((h) => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length ? (
            rows.map((row, i) => (
              <tr key={i}>
                {row.map((cell, j) => (
                  <td key={j}>{cell ?? '—'}</td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={headers.length}>
                <div className="table-empty">
                  <strong>No records found.</strong>
                  <span>
                    Adjust filters or use the action above to add the first
                    record.
                  </span>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
