import Link from 'next/link';
import { ExternalLink, LockKeyhole } from 'lucide-react';
import { chatGPTSignInPath, requireChatGPTUser } from '@/app/chatgpt-auth';
import { AdminShell } from '@/components/admin-shell';
import {
  getCurrentRound,
  getRoundContestants,
  getRounds,
} from '@/lib/platform-store';
export const dynamic = 'force-dynamic';
export default async function VotingRounds({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string }> }) {
  const query = await searchParams;
  const user = await requireChatGPTUser('/admin/voting-rounds');
  const rounds = await getRounds();
  const current = await getCurrentRound();
  const rows = await Promise.all(
    rounds.map(async (round) => ({
      round,
      people: await getRoundContestants(round.id),
    })),
  );
  return (
    <AdminShell user={user} active="voting-rounds">
      <header>
        <div>
          <p>SEVEN-DAY WINDOWS</p>
          <h1>Voting rounds</h1>
        </div>
        {user ? (
          <form method="post" action="/api/admin/rounds">
            <input type="hidden" name="action" value="create-next" />
            <button className="admin-primary">Create next voting week</button>
          </form>
        ) : (
          <Link
            href={chatGPTSignInPath('/admin/voting-rounds')}
            className="admin-primary"
          >
            <LockKeyhole size={15} /> Sign in to create
          </Link>
        )}
      </header>
      {query.saved && <p className="admin-success" role="status">{query.saved === 'schedule' ? 'Voting schedule saved. The public countdown has been updated.' : `Voting round ${query.saved === 'start' ? 'started' : 'closed'}.`}</p>}
      {query.error && <p className="form-error" role="alert">The closing time must be later than the starting time.</p>}
      {current && (
        <section className="current-round">
          <div>
            <small>CURRENT VOTING ROUND</small>
            <h2>{current.name}</h2>
            <p>
              <b>LIVE</b> · Week {String(current.weekNumber).padStart(2, '0')}
            </p>
          </div>
          <dl>
            <div>
              <dt>Started</dt>
              <dd>{date(current.startAt)}</dd>
            </div>
            <div>
              <dt>Closes</dt>
              <dd>{date(current.endAt)}</dd>
            </div>
            <div>
              <dt>Public link</dt>
              <dd>/vote/{current.slug}</dd>
            </div>
          </dl>
          <div>
            <Link href={`/vote/${current.slug}`}>
              <ExternalLink />
              Open public page
            </Link>
            <Link href={`/leaderboard/${current.slug}`}>View leaderboard</Link>
          </div>
          <form className="round-schedule-form" method="post" action="/api/admin/rounds">
            <input type="hidden" name="action" value="schedule" />
            <input type="hidden" name="id" value={current.id} />
            <label>Voting starts<input name="startAt" type="datetime-local" defaultValue={localInput(current.startAt)} required /></label>
            <label>Voting closes<input name="endAt" type="datetime-local" defaultValue={localInput(current.endAt)} required /></label>
            <label>Public status<select name="status" defaultValue={current.status}><option value="draft">Scheduled / hidden</option><option value="live">Voting open</option><option value="closed">Voting closed</option></select></label>
            <button className="admin-primary">Save voting schedule</button>
          </form>
          <form className="round-reset-form" method="post" action="/api/admin/rounds">
            <input type="hidden" name="id" value={current.id}/>
            <button name="action" value="start">Reset to seven days from now</button>
            <small>This opens voting immediately and sets a new 168-hour countdown.</small>
          </form>
        </section>
      )}
      <div className="admin-table rounds-table">
        <table>
          <thead>
            <tr>
              {[
                'Round',
                'Event',
                'Window',
                'Status',
                'Contestants',
                'Votes',
                'Public link',
              ].map((h) => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(({ round, people }) => (
              <tr key={round.id}>
                <td>{round.name}</td>
                <td>Event #{round.eventId}</td>
                <td>
                  {date(round.startAt)} → {date(round.endAt)}
                </td>
                <td>
                  <b className={`status-${round.status}`}>{round.status}</b>
                </td>
                <td>{people.length}</td>
                <td>{people.reduce((s, p) => s + p.votes, 0)}</td>
                <td><div className="admin-row-actions">
                  <Link href={`/vote/${round.slug}`}><ExternalLink size={14} /> Open</Link>
                  <form method="post" action="/api/admin/rounds"><input type="hidden" name="id" value={round.id}/><button name="action" value={round.status === 'live' ? 'close' : 'start'}>{round.status === 'live' ? 'Close' : 'Start'}</button></form>
                </div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
function localInput(dateValue: Date) {
  const parts = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Africa/Harare', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false,
  }).formatToParts(dateValue).reduce<Record<string, string>>((all, part) => ({ ...all, [part.type]: part.value }), {});
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
}
function date(d: Date) {
  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Africa/Harare',
  }).format(d);
}
