import Link from 'next/link';
import { ArrowLeft, LockKeyhole } from 'lucide-react';
import { Brand } from '@/components/public-shell';

export const dynamic = 'force-dynamic';

export default async function AdminLogin({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return <main className="admin-login"><section className="admin-login-panel">
    <Link className="brand" href="/"><Brand /></Link><p className="eyebrow">VOTEMANIAX ADMIN</p><h1>Secure platform access.</h1>
    <p>Authorised administrators can manage events, contestants, voting rounds, videos, payments and platform content.</p>
    {error && <div className="form-error">Incorrect email or password.</div>}
    <form className="admin-login-form" action="/api/auth/login" method="post"><input type="hidden" name="portal" value="admin"/><label>Email<input name="email" type="email" autoComplete="username" required/></label><label>Password<input name="password" type="password" autoComplete="current-password" minLength={8} required/></label><button className="admin-login-submit">Sign in</button></form>
    <div className="admin-login-security"><LockKeyhole /><div><strong>Protected sign-in</strong><span>Only active administrator accounts can enter. Passwords are verified securely and are never displayed or emailed.</span></div></div>
    <Link className="admin-login-back" href="/"><ArrowLeft /> Back to public site</Link>
  </section></main>;
}
