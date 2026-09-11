import Link from 'next/link';
import { ArrowLeft, LockKeyhole } from 'lucide-react';
import { getChatGPTUser } from '@/app/chatgpt-auth';
import { Brand } from '@/components/public-shell';

export const dynamic = 'force-dynamic';

export default async function AdminLogin({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const user = await getChatGPTUser();
  const { error } = await searchParams;
  return <main className="admin-login"><section className="admin-login-panel">
    <Link className="brand" href="/"><Brand /></Link><p className="eyebrow">VOTEMANIAX ADMIN</p><h1>{user ? 'Welcome back.' : 'Secure platform access.'}</h1>
    <p>{user ? `You are signed in as ${user.email}. Continue to the command centre.` : 'Authorised administrators can manage events, contestants, voting rounds, videos, payments and platform content.'}</p>
    {error && <div className="form-error">Incorrect username or password.</div>}
    {user ? <Link className="admin-login-submit" href="/admin">Open admin portal</Link> : <form className="admin-login-form" action="/api/auth/login" method="post"><input type="hidden" name="portal" value="admin"/><label>Username<input name="username" type="text" autoComplete="username" required/></label><label>Password<input name="password" type="password" autoComplete="current-password" minLength={8} required/></label><button className="admin-login-submit">Sign in</button></form>}
    <div className="admin-login-security"><LockKeyhole /><div><strong>Protected sign-in</strong><span>Only active administrator accounts can enter. Passwords are verified securely and are never displayed or emailed.</span></div></div>
    <Link className="admin-login-back" href="/"><ArrowLeft /> Back to public site</Link>
  </section></main>;
}
