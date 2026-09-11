import { PublicFooter, PublicHeader } from '@/components/public-shell';
export default function Privacy() {
  return (
    <main className="site-shell">
      <PublicHeader />
      <article className="legal">
        <p className="eyebrow">LEGAL</p>
        <h1>Privacy notice</h1>
        <p>
          The definitive privacy notice must be supplied and approved by the
          platform operator before launch. It should describe payment
          processing, subscriber data, analytics, retention and user rights.
        </p>
      </article>
      <PublicFooter />
    </main>
  );
}
