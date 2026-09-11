import Link from 'next/link';
import { PublicFooter, PublicHeader } from '@/components/public-shell';

export default function Privacy() {
  return <main className="site-shell"><PublicHeader /><article className="legal legal-long">
    <p className="eyebrow">VOTEMANIAX LEGAL</p><h1>Privacy notice</h1><p className="legal-updated">Last updated: 11 September 2026</p>
    <p>This notice explains the information VoteManiaX uses to operate talent competitions, contestant accounts, video review, voting, payments, results and platform communications.</p>
    <h2>Information we collect</h2><p>Depending on how you use VoteManiaX, this may include your name, display name, email address, phone number, account details, contestant profile, category, event participation, uploaded media, consent records, subscription choice, vote quantity, transaction reference, payment status and technical security records.</p>
    <h2>How information is used</h2><p>Information is used to provide accounts and profiles, review and publish approved contestant content, run voting rounds, verify payments, update leaderboards, send requested competition updates, answer support enquiries, protect the platform and keep an audit trail of administrative actions.</p>
    <h2>Payments</h2><p>Payments are processed through the configured payment provider. VoteManiaX records the information needed to reconcile a transaction—such as the method, amount, reference and verification status—but merchant secrets are not exposed in the public application.</p>
    <h2>Contestant videos and photos</h2><p>Pending submissions are available to the contestant and authorised VoteManiaX administrators for review. Content is published publicly only after approval and the required publication permission. Rejected or unapproved submissions remain non-public. Contestants may contact VoteManiaX to ask about removal or use of their content under the published competition terms.</p>
    <h2>Sharing and service providers</h2><p>VoteManiaX may use hosting, storage, authentication, analytics and payment services to operate the platform. Information is shared only as needed for those services, legal obligations, fraud prevention or the administration of a competition. VoteManiaX does not automatically add voters or contestants to marketing lists without an explicit subscription.</p>
    <h2>Retention and security</h2><p>Records are retained for as long as reasonably required to operate competitions, handle disputes, meet payment or legal obligations and protect the platform. Appropriate access controls are used, but no internet service can promise absolute security.</p>
    <h2>Your choices</h2><p>You can unsubscribe from email updates, correct permitted profile information, or contact VoteManiaX about access, correction or removal requests. Some transaction, audit or legal records may need to be retained.</p>
    <h2>Contact us</h2><p>Email <a href="mailto:thevibehub26@gmail.com">thevibehub26@gmail.com</a> or call <a href="tel:+263719308153">+263 719 308 153</a> with privacy questions. You can also review the <Link href="/terms">Terms of service</Link>.</p>
  </article><PublicFooter /></main>;
}
