import Link from 'next/link';
import { Copy, ExternalLink, LockKeyhole } from 'lucide-react';
import { getChatGPTUser, chatGPTSignInPath } from '@/app/chatgpt-auth';
import { AdminShell } from '@/components/admin-shell';
import {
  getCurrentRound,
  getRoundContestants,
  getRounds,
} from '@/lib/platform-store';
export const dynamic = 'force-dynamic';
export default async function VotingRounds() {
  const user = await getChatGPTUser();
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
                <td>
                  <Link href={`/vote/${round.slug}`}>
                    <Copy size={14} /> Open link
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
function date(d: Date) {
  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Africa/Harare',
  }).format(d);
}
