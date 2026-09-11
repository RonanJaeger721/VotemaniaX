import { Mail, Phone } from 'lucide-react';
import Link from 'next/link';
import { PublicFooter, PublicHeader } from '@/components/public-shell';
export default function Contact() {
  return (
    <main className="site-shell">
      <PublicHeader />
      <section className="page-intro">
        <p className="eyebrow">CONTACT & SUPPORT</p>
        <h1>
          Keep the signal
          <br />
          <em>moving.</em>
        </h1>
        <p>
          Questions about an event, contestant or payment status? Reach the
          VoteManiaX team through the active platform contacts.
        </p>
      </section>
      <section className="contact-panel">
        <a href="mailto:thevibehub26@gmail.com">
          <Mail />
          <small>EMAIL SUPPORT</small>
          <strong>thevibehub26@gmail.com</strong>
        </a>
        <a href="tel:+263719308153">
          <Phone />
          <small>CALL SUPPORT</small>
          <strong>+263 719 308 153</strong>
        </a>
      </section>
      <section className="contact-help">
        <article><span>01</span><h2>Payment support</h2><p>Include your payment reference, payment method, contestant and voting round so the team can trace the correct record. Never send a password or one-time PIN.</p></article>
        <article><span>02</span><h2>Contestant support</h2><p>Contact the team about profile approval, event participation, upload review, administrator notes or a request concerning published content.</p></article>
        <article><span>03</span><h2>General questions</h2><p>Start with the frequently asked questions for voting, accounts, videos, payment states and results.</p><Link href="/faq">Read the FAQ</Link></article>
      </section>
      <PublicFooter />
    </main>
  );
}
