import { Mail, Phone } from 'lucide-react';
import Link from 'next/link';
import { PublicFooter, PublicHeader } from '@/components/public-shell';
import { getDb } from '@/db';
import { siteSettings } from '@/db/schema';
export const dynamic = 'force-dynamic';
export default async function Contact({ searchParams }: { searchParams: Promise<{ sent?: string; error?: string }> }) {
  const [settings, query] = await Promise.all([getDb().select().from(siteSettings), searchParams]);
  const supportEmail = settings.find((s) => s.key === 'support_email')?.value || 'thevibehub26@gmail.com';
  const supportPhone = settings.find((s) => s.key === 'support_phone')?.value || '+263 719 308 153';
  const telephone = supportPhone.replaceAll(/[^+\d]/g, '');
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
        <a href={`mailto:${supportEmail}`}>
          <Mail />
          <small>EMAIL SUPPORT</small>
          <strong>{supportEmail}</strong>
        </a>
        <a href={`tel:${telephone}`}>
          <Phone />
          <small>CALL SUPPORT</small>
          <strong>{supportPhone}</strong>
        </a>
      </section>
      <section className="contact-form-section">
        <div><p className="eyebrow">SEND A MESSAGE</p><h2>Tell us what you need help with.</h2><p>Messages are stored securely for the VoteManiaX support team. Never include a password, PIN or one-time code.</p></div>
        <form className="settings-form" action="/api/contact" method="post">
          {query.sent === '1' && <p className="admin-success" role="status">Your message has been received.</p>}
          {query.error && <p className="form-error" role="alert">Complete every field with a valid email and enough detail.</p>}
          <label>Name<input name="name" required minLength={2} /></label>
          <label>Email<input name="email" type="email" required /></label>
          <label>Subject<input name="subject" required minLength={3} /></label>
          <label>Message<textarea name="message" required minLength={10} rows={6} /></label>
          <button>Send message</button>
        </form>
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
