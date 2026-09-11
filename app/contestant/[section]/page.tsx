import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ContestantShell } from '@/components/contestant-shell';
import { requireContestant } from '@/lib/contestant-page';
import { getCurrentRound } from '@/lib/platform-store';
const copy = {
  profile: [
    'Profile',
    'Your public identity',
    'Your display name, biography, category and profile image become public only after admin approval.',
  ],
  events: [
    'Events',
    'Your competitions',
    'See the event and voting round attached to your contestant profile.',
  ],
  voting: [
    'Voting',
    'Your voting link',
    'Copy and share the unique route for the current round.',
  ],
  results: [
    'Results',
    'Your round history',
    'Verified voting totals remain scoped to their original round.',
  ],
  settings: [
    'Settings',
    'Account & privacy',
    'Review content privacy, consent and account preferences.',
  ],
} as const;
export const dynamic = 'force-dynamic';
export default async function Section({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  if (!(section in copy)) notFound();
  const { contestant } = await requireContestant();
  const round = await getCurrentRound();
  const [label, title, description] = copy[section as keyof typeof copy];
  return (
    <ContestantShell active={section} name={contestant.name}>
      <section className="portal-intro">
        <p className="eyebrow">{label.toUpperCase()}</p>
        <h1>{title}</h1>
        <p>{description}</p>
      </section>
      <section className="portal-detail">
        <dl>
          <div>
            <dt>Display name</dt>
            <dd>{contestant.name}</dd>
          </div>
          <div>
            <dt>Category</dt>
            <dd>{contestant.category}</dd>
          </div>
          <div>
            <dt>Profile state</dt>
            <dd>{contestant.status}</dd>
          </div>
          {round && (
            <div>
              <dt>Current round</dt>
              <dd>{round.name}</dd>
            </div>
          )}
        </dl>
        {section === 'voting' && round && (
          <div className="portal-action">
            <code>{`/vote/${round.slug}/${contestant.slug}`}</code>
            <Link href={`/vote/${round.slug}/${contestant.slug}`}>
              Open link
            </Link>
          </div>
        )}
        {section === 'settings' && (
          <div className="privacy-note">
            <h2>Content & privacy</h2>
            <p>
              Pending submissions are available to you and authorised VoteManiaX
              administrators for review. Content is only published after
              approval and recorded publication consent. Contact VoteManiaX to
              request removal according to the published terms.
            </p>
          </div>
        )}
      </section>
    </ContestantShell>
  );
}
