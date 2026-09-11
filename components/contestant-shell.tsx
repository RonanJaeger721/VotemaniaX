import Link from 'next/link';
import { Brand } from '@/components/public-shell';
import {
  Gauge,
  UserRound,
  Video,
  CalendarDays,
  Vote,
  Trophy,
  Settings,
  LogOut,
} from 'lucide-react';
const nav = [
  ['Overview', '', Gauge],
  ['Profile', 'profile', UserRound],
  ['Videos', 'videos', Video],
  ['Events', 'events', CalendarDays],
  ['Voting', 'voting', Vote],
  ['Results', 'results', Trophy],
  ['Settings', 'settings', Settings],
] as const;
export function ContestantShell({
  active,
  name,
  children,
}: {
  active: string;
  name: string;
  children: React.ReactNode;
}) {
  return (
    <main className="portal-shell">
      <aside>
        <Link href="/">
          <Brand />
        </Link>
        <p>CONTESTANT PORTAL</p>
        <nav>
          {nav.map(([label, path, Icon]) => (
            <Link
              key={path}
              className={active === path ? 'active' : ''}
              href={`/contestant/${path}`}
            >
              <Icon />
              {label}
            </Link>
          ))}
        </nav>
        <form action="/api/auth/logout" method="post">
          <button>
            <LogOut /> Sign out
          </button>
        </form>
      </aside>
      <section className="portal-main">
        <header>
          <div>
            <small>YOUR STAGE</small>
            <strong>{name}</strong>
          </div>
          <Link href="/">Public site</Link>
        </header>
        {children}
      </section>
      <nav className="portal-bottom">
        {nav.slice(0, 5).map(([label, path, Icon]) => (
          <Link
            key={path}
            className={active === path ? 'active' : ''}
            href={`/contestant/${path}`}
          >
            <Icon />
            {label}
          </Link>
        ))}
      </nav>
    </main>
  );
}
