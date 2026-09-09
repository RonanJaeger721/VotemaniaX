import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, Play, Radio, Sparkles } from 'lucide-react';

const leaders = [
  { rank: '01', name: 'Rachel Rashyn', category: 'Singers', votes: 70 },
  { rank: '02', name: 'Edith Masangu', category: 'Content creator', votes: 45 },
  { rank: '03', name: 'Maxwell Machisi', category: 'Singing', votes: 43 },
];

export default function Home() {
  return (
    <main className="site-shell">
      <nav className="topbar" aria-label="Primary navigation">
        <Link href="/" className="brand" aria-label="VoteMania home"><span className="brand-mark">V</span><span>VOTEMANIA</span></Link>
        <div className="nav-links"><Link href="/events">Events</Link><Link href="/contestants">Contestants</Link><Link href="/leaderboard">Leaderboard</Link></div>
        <Link className="nav-cta" href="/contestants">Vote now <ArrowUpRight size={16} /></Link>
      </nav>
      <section className="hero">
        <div className="hero-copy">
          <div className="live-pill"><Radio size={14} /> Voting live <span>Season 01</span></div>
          <p className="eyebrow">THE CROWD DECIDES</p>
          <h1>Every vote<br />moves the <em>moment.</em></h1>
          <p className="hero-deck">Back the performers you believe in. Watch the rankings shift and help turn a rising voice into the name everyone remembers.</p>
          <div className="hero-actions"><Link className="primary-action" href="/contestants">Meet the talent <ArrowUpRight size={18} /></Link><Link className="text-action" href="/leaderboard"><Play size={15} fill="currentColor" /> Live leaderboard</Link></div>
          <div className="signal-line"><span /> 319 verified votes and counting</div>
        </div>
        <div className="hero-stage" aria-label="Featured performer Rachel Rashyn">
          <div className="stage-orbit orbit-one" /><div className="stage-orbit orbit-two" /><p className="vertical-type">VOTE · SUPPORT · RISE · WIN</p>
          <div className="portrait-frame"><Image src="/performer-hero.png" alt="Featured singer performing on stage" fill priority sizes="(max-width: 760px) 88vw, 42vw" /></div>
          <div className="rank-chip"><strong>#01</strong><span>Live rank</span></div>
          <div className="artist-card"><span className="artist-number">01</span><div><p>Rachel Rashyn</p><span>Singers · 70 votes</span></div><Link href="/contestants/rachel-rashyn" aria-label="View Rachel Rashyn"><ArrowUpRight size={18} /></Link></div>
          <div className="pulse-button"><Sparkles size={18} /><span>Vote pulse</span></div>
        </div>
      </section>
      <section className="leader-preview">
        <div className="section-kicker"><span>Live signal</span><p>Rankings update when verified votes land.</p></div>
        <div className="leader-list">{leaders.map((leader) => <Link href={`/contestants/${leader.name.toLowerCase().replaceAll(' ', '-')}`} className="leader-row" key={leader.name}><span className="leader-rank">{leader.rank}</span><div className="leader-name"><strong>{leader.name}</strong><small>{leader.category}</small></div><div className="vote-meter"><i style={{ width: `${Math.max(24, leader.votes)}%` }} /></div><span className="vote-count">{leader.votes}<small>votes</small></span><ArrowUpRight size={18} /></Link>)}</div>
      </section>
    </main>
  );
}
