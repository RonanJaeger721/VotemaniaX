import Link from 'next/link';
import { PublicFooter, PublicHeader } from '@/components/public-shell';

export default function Terms() {
  return <main className="site-shell"><PublicHeader /><article className="legal legal-long">
    <p className="eyebrow">VOTEMANIAX LEGAL</p><h1>Terms of service</h1><p className="legal-updated">Last updated: 11 September 2026</p>
    <p>These terms explain the rules for using VoteManiaX as a visitor, voter or contestant. By using the platform, creating an account, submitting content or taking part in a vote, you agree to follow these terms and the rules published for the relevant event.</p>
    <h2>1. Using VoteManiaX</h2><p>You must use the platform lawfully and provide accurate information when an account or transaction requires it. You may not interfere with the service, misuse another person’s account, attempt to manipulate voting, or submit unlawful, harmful or misleading material.</p>
    <h2>2. Events and eligibility</h2><p>Each competition may have its own eligibility rules, dates, categories, judging or voting criteria and prizes. Event-specific rules form part of these terms. VoteManiaX may reject, suspend or disqualify an entry that does not meet those rules or threatens the fairness or safety of the competition.</p>
    <h2>3. Voting and payments</h2><p>The active event shows the price per vote and available payment methods before confirmation. The server calculates the final amount. A vote is counted only after the payment provider verifies the transaction. Pending, failed, cancelled and expired transactions do not create votes. Payment-provider delays may affect how quickly a verified vote appears.</p>
    <h2>4. Fair use</h2><p>Automated voting, payment abuse, chargeback fraud, account impersonation and attempts to alter results are prohibited. VoteManiaX may investigate suspicious activity, exclude invalid transactions and preserve an audit record of any authorised correction.</p>
    <h2>5. Contestant content</h2><p>Contestants must own or have permission to submit their photos, videos, music and other material. A submission remains non-public while pending review. Authorised administrators may review it, request changes, reject it or approve it for publication. Approval does not transfer ownership to VoteManiaX; it grants the permission described in the consent shown at upload.</p>
    <h2>6. Accounts</h2><p>You are responsible for protecting your login details and for activity carried out through your account. Contact VoteManiaX promptly if you believe an account has been compromised. Access may be suspended when necessary to protect users, records or the platform.</p>
    <h2>7. Results and availability</h2><p>Leaderboards use verified vote records for the selected round. Temporary interruptions or delayed provider callbacks may occur. VoteManiaX may correct confirmed technical errors through an auditable process, but administrators cannot silently rewrite transaction-backed totals.</p>
    <h2>8. Contact</h2><p>Questions about these terms, an event or a transaction can be sent to <a href="mailto:thevibehub26@gmail.com">thevibehub26@gmail.com</a> or raised by calling <a href="tel:+263719308153">+263 719 308 153</a>. See the <Link href="/privacy">Privacy notice</Link> for information about personal data.</p>
  </article><PublicFooter /></main>;
}
