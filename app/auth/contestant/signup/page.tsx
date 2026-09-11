import Link from 'next/link';
import { Brand } from '@/components/public-shell';
import { getCategories } from '@/lib/application-store';
export const dynamic = 'force-dynamic';
export default async function Signup({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const [cats, { error }] = await Promise.all([getCategories(), searchParams]);
  return (
    <main className="auth-screen">
      <section className="auth-panel wide">
        <Link href="/">
          <Brand />
        </Link>
        <p className="eyebrow">JOIN THE STAGE</p>
        <h1>Contestant sign up.</h1>
        {error && (
          <div className="form-error">
            Please check your details or use a different email.
          </div>
        )}
        <form action="/api/auth/signup" method="post">
          <label>
            Full name
            <input name="fullName" required />
          </label>
          <label>
            Display name
            <input name="displayName" required />
          </label>
          <label>
            Email
            <input name="email" type="email" required />
          </label>
          <label>
            Phone
            <input name="phone" type="tel" required />
          </label>
          <label>
            Category
            <select name="category">
              {cats.map((c) => (
                <option key={c.id}>{c.name}</option>
              ))}
            </select>
          </label>
          <label>
            Password
            <input name="password" type="password" minLength={8} required />
            <small>At least 8 characters.</small>
          </label>
          <label className="consent-row">
            <input name="terms" type="checkbox" required /> I accept the
            platform terms and content policy.
          </label>
          <button>Create contestant account</button>
        </form>
        <p>
          Already registered? <Link href="/auth/contestant/login">Sign in</Link>
        </p>
      </section>
    </main>
  );
}
