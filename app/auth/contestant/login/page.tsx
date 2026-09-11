import Link from 'next/link';
import { Brand } from '@/components/public-shell';
export default async function Login({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <main className="auth-screen">
      <section className="auth-panel">
        <Link href="/">
          <Brand />
        </Link>
        <p className="eyebrow">CONTESTANT PORTAL</p>
        <h1>Welcome back.</h1>
        <p>Sign in to manage your profile, clips and weekly voting link.</p>
        {error && (
          <div className="form-error">
            That email or password was not accepted.
          </div>
        )}
        <form action="/api/auth/login" method="post">
          <label>
            Email
            <input name="email" type="email" autoComplete="email" required />
          </label>
          <label>
            Password
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              minLength={8}
              required
            />
          </label>
          <button>Sign in</button>
        </form>
        <p>
          New contestant?{' '}
          <Link href="/auth/contestant/signup">Create your account</Link>
        </p>
        <Link className="back-link" href="/">
          Back to public site
        </Link>
      </section>
    </main>
  );
}
