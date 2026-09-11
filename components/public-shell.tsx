import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowUpRight,
  House,
  Menu,
  Search,
  Trophy,
  Users2,
  Vote,
} from 'lucide-react';

const links = [
  ['Discover', '/discover'],
  ['Watch', '/watch'],
  ['Events', '/events'],
  ['Categories', '/categories'],
  ['Leaderboard', '/leaderboard'],
  ['Results', '/results'],
  ['Admin', '/admin/login'],
] as const;
export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <span className={compact ? 'brand-logo compact' : 'brand-logo'}>
      <Image
        src="/votemaniax-logo.png"
        alt="VoteManiaX Voting Platform"
        width={850}
        height={240}
        priority
      />
    </span>
  );
}
export async function PublicHeader() {
  const voteHref = '/vote';
  return (
    <>
      <nav className="topbar" aria-label="Primary navigation">
        <Link href="/" className="brand" aria-label="VoteManiaX home">
          <Brand />
        </Link>
        <div className="nav-links">
          {links.map(([label, href]) => (
            <Link href={href} key={href}>
              {label}
            </Link>
          ))}
        </div>
        <div className="nav-actions">
          <details className="menu-drawer">
            <summary aria-label="Open menu">
              <Menu size={18} />
            </summary>
            <div className="drawer-panel">
              <small>EXPLORE VOTEMANIAX</small>
              {links.map(([label, href]) => (
                <Link href={href} key={href}>
                  {label}
                  <ArrowUpRight size={15} />
                </Link>
              ))}
            </div>
          </details>
          <Link className="nav-cta" href={voteHref}>
            Vote now <ArrowUpRight size={16} />
          </Link>
        </div>
      </nav>
      <nav className="mobile-bottom" aria-label="Mobile navigation">
        <Link href="/">
          <House />
          Home
        </Link>
        <Link href="/contestants">
          <Users2 />
          Talent
        </Link>
        <Link className="mobile-vote" href={voteHref}>
          <Vote />
          Vote
        </Link>
        <Link href="/leaderboard">
          <Trophy />
          Ranks
        </Link>
        <Link href="/search">
          <Search />
          Search
        </Link>
      </nav>
    </>
  );
}
export function PublicFooter() {
  return (
    <footer className="public-footer">
      <div>
        <Link href="/" className="brand">
          <Brand />
        </Link>
        <p>Seven days. One leaderboard.</p>
        <a href="mailto:thevibehub26@gmail.com">thevibehub26@gmail.com</a>
        <a href="tel:+263719308153">+263 719 308 153</a>
      </div>
      <div>
        <span>Explore</span>
        <Link href="/events">Events</Link>
        <Link href="/contestants">Contestants</Link>
        <Link href="/leaderboard">Leaderboard</Link>
        <Link href="/results">Results</Link>
      </div>
      <div>
        <span>Support</span>
        <Link href="/how-it-works">How it works</Link>
        <Link href="/faq">FAQ</Link>
        <Link href="/contact">Contact</Link>
        <Link href="/terms">Terms</Link>
        <Link href="/privacy">Privacy</Link>
        <Link href="/admin/login">Admin portal</Link>
      </div>
      <div className="footer-signoff">
        <strong>
          THE CROWD
          <br />
          DECIDES.
        </strong>
        <small>© 2026 VoteManiaX. All rights reserved.</small>
      </div>
    </footer>
  );
}
