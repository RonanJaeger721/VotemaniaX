import Link from 'next/link';
import { redirect } from 'next/navigation';
import { PublicFooter, PublicHeader } from '@/components/public-shell';
import { getActiveRound, getRounds } from '@/lib/platform-store';

export const dynamic = 'force-dynamic';

export default async function VoteEntry() {
  const active = await getActiveRound();
  if (active) redirect(`/vote/${active.slug}`);
  const rounds = await getRounds();
  const latestClosed = rounds.find((round) => round.status === 'closed');
  return <main className="site-shell"><PublicHeader /><section className="public-empty standalone-empty">
    <p className="eyebrow">VOTING</p><h1>No voting round is open.</h1>
    <p>The next VoteManiaX voting week will appear here as soon as it starts.</p>
    <div className="hero-actions"><Link className="primary-action" href="/events">View events</Link>{latestClosed && <Link href={`/results/${latestClosed.slug}`}>View final results</Link>}</div>
  </section><PublicFooter /></main>;
}
