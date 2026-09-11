import Link from 'next/link';
import { ArrowUpRight, Radio } from 'lucide-react';
import { PublicFooter, PublicHeader } from '@/components/public-shell';
import { ensureSourceSnapshot } from '@/lib/platform-store';
import { getDb } from '@/db';
import { events } from '@/db/schema';
import { desc } from 'drizzle-orm';
export const dynamic = 'force-dynamic';
export default async function Events({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status = 'all' } = await searchParams;
  await ensureSourceSnapshot();
  const rows = await getDb()
    .select()
    .from(events)
    .orderBy(desc(events.createdAt));
  const filtered = rows.filter((event) => status === 'all' || (status === 'completed' ? event.status === 'closed' : event.status === status));
  return (
    <main className="site-shell">
      <PublicHeader />
      <section className="page-intro">
        <p className="eyebrow">COMPETITIONS</p>
        <h1>
          Every event.
          <br />
          <em>Every moment.</em>
        </h1>
        <div className="event-tabs">
          {['all', 'live', 'upcoming', 'completed'].map((item) => <Link className={status === item ? 'active' : ''} href={item === 'all' ? '/events' : `/events?status=${item}`} key={item}>{item}</Link>)}
        </div>
      </section>
      <section className="events-list">
        {filtered.map((event) => (
          <article className="event-feature" key={event.id}>
            <div className="event-art">
              <span>V</span>
              <div className="stage-orbit orbit-one" />
            </div>
            <div className="event-copy">
              <p className="live-pill">
                <Radio size={13} /> {event.status}
              </p>
              <h2>{event.name}</h2>
              <p>{event.description}</p>
              <dl>
                <div>
                  <dt>Starts</dt>
                  <dd>{date(event.startAt)}</dd>
                </div>
                <div>
                  <dt>Closes</dt>
                  <dd>{date(event.endAt)}</dd>
                </div>
                <div>
                  <dt>Vote price</dt>
                  <dd>
                    {event.currency} {event.votePrice.toFixed(2)}
                  </dd>
                </div>
              </dl>
              <Link className="primary-action" href={`/events/${event.slug}`}>
                {event.status === 'closed'
                  ? 'View results'
                  : event.status === 'live'
                    ? 'Vote now'
                    : 'View event'}{' '}
                <ArrowUpRight size={18} />
              </Link>
            </div>
          </article>
        ))}
        {!filtered.length && <div className="public-empty"><h2>No {status} events.</h2><p>Events will appear here when an administrator publishes them.</p></div>}
      </section>
      <PublicFooter />
    </main>
  );
}
function date(value: Date | null) {
  return value
    ? new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium' }).format(value)
    : 'TBA';
}
