import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, Play, Radio, Sparkles } from 'lucide-react';
import { PublicFooter } from '@/components/public-shell';
import { NewsletterForm } from '@/components/newsletter-form';
import { getLiveEvent, getPublicContestants } from '@/lib/platform-store';

export const dynamic='force-dynamic';
export default async function Home() {
  const contestants=await getPublicContestants(); const liveEvent=await getLiveEvent(); const totalVotes=contestants.reduce((sum,item)=>sum+item.votes,0); const leaders=contestants.slice(0,3);
  return (
    <main className="site-shell">
      <nav className="topbar" aria-label="Primary navigation">
        <Link href="/" className="brand" aria-label="VoteManiaX home"><span className="brand-mark">V</span><span>VOTEMANIAX</span></Link>
        <div className="nav-links"><Link href="/events">Events</Link><Link href="/contestants">Contestants</Link><Link href="/leaderboard">Leaderboard</Link></div>
        <Link className="nav-cta" href="/contestants">Vote now <ArrowUpRight size={16} /></Link>
      </nav>
      <section className="hero">
        <div className="hero-copy">
          <div className="live-pill"><Radio size={14} /> {liveEvent?'Voting live':'No live voting'} <span>{liveEvent?.name??'Next event soon'}</span></div>
          <p className="eyebrow">THE CROWD DECIDES</p>
          <h1>Every vote<br />moves the <em>moment.</em></h1>
          <p className="hero-deck">Back the performers you believe in. Watch the rankings shift and help turn a rising voice into the name everyone remembers.</p>
          <div className="hero-actions"><Link className="primary-action" href="/contestants">Meet the talent <ArrowUpRight size={18} /></Link><Link className="text-action" href="/leaderboard"><Play size={15} fill="currentColor" /> Live leaderboard</Link></div>
          <div className="signal-line"><span /> {totalVotes} verified votes and counting</div>
        </div>
        <div className="hero-stage" aria-label="Featured performer Rachel Rashyn">
          <div className="stage-orbit orbit-one" /><div className="stage-orbit orbit-two" /><p className="vertical-type">VOTE · SUPPORT · RISE · WIN</p>
          <div className="portrait-frame"><Image src="/performer-hero.png" alt="Featured singer performing on stage" fill priority sizes="(max-width: 760px) 88vw, 42vw" /></div>
          <div className="rank-chip"><strong>#01</strong><span>Live rank</span></div>
          {leaders[0]&&<div className="artist-card"><span className="artist-number">01</span><div><p>{leaders[0].name}</p><span>{leaders[0].category} · {leaders[0].votes} votes</span></div><Link href={`/contestants/${leaders[0].slug}`} aria-label={`View ${leaders[0].name}`}><ArrowUpRight size={18} /></Link></div>}
          <div className="pulse-button"><Sparkles size={18} /><span>Vote pulse</span></div>
        </div>
      </section>
      <section className="leader-preview">
        <div className="section-kicker"><span>Live signal</span><p>Rankings update when verified votes land.</p></div>
        <div className="leader-list">{leaders.map((leader,index) => <Link href={`/contestants/${leader.slug}`} className="leader-row" key={leader.name}><span className="leader-rank">0{index+1}</span><div className="leader-name"><strong>{leader.name}</strong><small>{leader.category}</small></div><div className="vote-meter"><i style={{ width: `${Math.max(24, leader.votes)}%` }} /></div><span className="vote-count">{leader.votes}<small>votes</small></span><ArrowUpRight size={18} /></Link>)}</div>
      </section>
      <section className="public-stats" aria-label="Competition totals">
        <p>THE NUMBERS SO FAR</p>
        <div><span><strong>{contestants.length}</strong>Performers</span><span><strong>{totalVotes}</strong>Verified votes</span><span><strong>21</strong>Days left</span></div>
      </section>
      <section className="home-steps">
        <header><p className="eyebrow">HOW VOTING WORKS</p><h2>Three moves.<br/>Real <em>impact.</em></h2></header>
        <div>{[['01','Find your favourite','Browse the performers and choose the talent that moves you.'],['02','Choose your support','Select how many votes to cast and review your total.'],['03','Cast your vote','Verified votes move your favourite up the live rankings.']].map(step=><article key={step[0]}><span>{step[0]}</span><h3>{step[1]}</h3><p>{step[2]}</p></article>)}</div>
      </section>
      <section className="newsletter-section">
        <div><p className="eyebrow">STAY IN THE LOOP</p><h2>Don’t miss<br/>the next <em>moment.</em></h2></div>
        <div><p>Get VoteManiaX updates about new events, voting deadlines, results and the talent everyone is talking about.</p><NewsletterForm/><small>We respect your privacy. Unsubscribe anytime.</small></div>
      </section>
      <section className="final-cta"><span>YOUR VOTE. THEIR MOMENT.</span><h2>Ready to move<br/>the ranking?</h2><Link className="primary-action" href="/contestants">Meet the performers <ArrowUpRight size={18}/></Link></section>
      <PublicFooter />
    </main>
  );
}
