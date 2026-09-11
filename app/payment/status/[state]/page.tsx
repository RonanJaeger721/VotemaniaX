import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CheckCircle2, Clock3, XCircle } from 'lucide-react';
import { PublicHeader } from '@/components/public-shell';
const states = {
  success: {
    title: 'Payment verified',
    copy: 'Your verified votes have entered the ledger and will appear on the live leaderboard.',
    icon: CheckCircle2,
  },
  pending: {
    title: 'Verification pending',
    copy: 'The provider has not confirmed settlement yet. Your ranking will not change until verification succeeds.',
    icon: Clock3,
  },
  failed: {
    title: 'Payment failed',
    copy: 'No vote was created and no leaderboard total changed. You can safely return and try again.',
    icon: XCircle,
  },
  cancelled: {
    title: 'Payment cancelled',
    copy: 'The checkout was cancelled. No vote or payment was recorded as successful.',
    icon: XCircle,
  },
};
export default async function PaymentStatus({
  params,
}: {
  params: Promise<{ state: string }>;
}) {
  const { state } = await params;
  const item = states[state as keyof typeof states];
  if (!item) notFound();
  const Icon = item.icon;
  return (
    <main className="site-shell">
      <PublicHeader />
      <section className={`payment-state ${state}`}>
        <Icon />
        <p className="eyebrow">PAYMENT STATUS</p>
        <h1>{item.title}</h1>
        <p>{item.copy}</p>
        <div className="hero-actions">
          <Link className="primary-action" href="/leaderboard">
            View leaderboard
          </Link>
          <Link className="text-action" href="/contestants">
            Back to contestants
          </Link>
        </div>
      </section>
    </main>
  );
}
