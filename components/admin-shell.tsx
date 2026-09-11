import Link from 'next/link';
import {
  Activity,
  ArrowLeft,
  CalendarClock,
  CalendarDays,
  CreditCard,
  FileClock,
  LayoutDashboard,
  LogIn,
  LogOut,
  Settings,
  ShieldCheck,
  Users,
  WalletCards,
  Shapes,
  Video,
  Mail,
  HelpCircle,
} from 'lucide-react';
import { chatGPTSignInPath } from '@/app/chatgpt-auth';
import { Brand } from '@/components/public-shell';

export const adminNav = [
  ['Overview', LayoutDashboard, ''],
  ['Events', CalendarDays, 'events'],
  ['Categories', Shapes, 'categories'],
  ['Participants', Users, 'participants'],
  ['Video review', Video, 'video-review'],
  ['Voting rounds', CalendarClock, 'voting-rounds'],
  ['Votes', Activity, 'votes'],
  ['Payments', WalletCards, 'payments'],
  ['Payment methods', CreditCard, 'payment-methods'],
  ['Analytics', Activity, 'analytics'],
  ['Subscribers', Mail, 'subscribers'],
  ['FAQ', HelpCircle, 'faqs'],
  ['Settings', Settings, 'settings'],
  ['Admins', ShieldCheck, 'admins'],
  ['Audit log', FileClock, 'audit-log'],
] as const;

export function AdminShell({
  user,
  active,
  children,
}: {
  user: { displayName: string } | null;
  active: string;
  children: React.ReactNode;
}) {
  return (
    <main className="admin-shell">
      <aside>
        <Link href="/admin" className="brand">
          <Brand />
        </Link>
        <Link className="back-public" href="/">
          <ArrowLeft size={14} /> Back to public site
        </Link>
        <small>PLATFORM</small>
        <nav>
          {adminNav.map(([label, Icon, path]) => (
            <Link
              className={active === path ? 'active' : ''}
              href={`/admin/${path}`}
              key={path}
            >
              <Icon size={17} />
              {label}
            </Link>
          ))}
        </nav>
        {user ? (
          <div className="admin-user">
            <span>{user.displayName.charAt(0).toUpperCase()}</span>
            <div>
              <strong>{user.displayName}</strong>
              <small>Administrator</small>
            </div>
            <form action="/api/auth/logout" method="post"><button aria-label="Sign out"><LogOut size={16} /></button></form>
          </div>
        ) : (
          <div className="admin-user admin-guest">
            <span>VX</span>
            <div>
              <strong>Read-only view</strong>
              <small>Sign in to manage</small>
            </div>
            <Link
              href={chatGPTSignInPath(`/admin/${active}`)}
              aria-label="Sign in to manage"
            >
              <LogIn size={16} />
            </Link>
          </div>
        )}
      </aside>
      <section className="admin-main">{children}</section>
    </main>
  );
}
