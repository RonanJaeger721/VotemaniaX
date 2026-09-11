import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { PublicFooter, PublicHeader } from '@/components/public-shell';

const steps = [
  ['01', 'Find your favourite', 'Browse contestants, explore talent categories and watch clips that have been reviewed and published by VoteManiaX. Open a contestant’s profile to learn more and follow their progress.'],
  ['02', 'Chip in', 'Choose how many votes you want to cast. VoteManiaX calculates the total from the official price for the active competition round before you continue to payment.'],
  ['03', 'Cast your vote', 'Complete payment through an available authorised method. Your support is added only after the provider confirms the transaction, and you can vote again whenever the competition rules allow it.'],
];

export default function HowItWorks() {
  return <main className="site-shell"><PublicHeader />
    <section className="page-intro"><p className="eyebrow">HOW IT WORKS</p><h1>Three quick steps.<br/><em>That’s all it takes.</em></h1><p>Discover real talent, support your favourite and follow the verified leaderboard throughout each voting week.</p></section>
    <section className="how-guide">{steps.map(([number, title, copy]) => <article key={number}><span>{number}</span><div><h2>{title}</h2><p>{copy}</p></div></article>)}</section>
    <section className="process-note"><div><p className="eyebrow">VERIFIED VOTING</p><h2>Every counted vote has a payment record.</h2></div><p>Pending, failed, cancelled and expired payments do not affect the leaderboard. When a round closes, new votes stop and the final results remain available.</p><Link className="primary-action" href="/vote">Vote in the current round <ArrowUpRight /></Link></section>
    <PublicFooter /></main>;
}
