import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { PublicHeader, PublicFooter } from '@/components/public-shell';
import { getCategories } from '@/lib/application-store';
export const dynamic = 'force-dynamic';
export default async function Categories() {
  const categories = await getCategories();
  return (
    <main className="site-shell">
      <PublicHeader />
      <section className="app-page-head">
        <p className="eyebrow">CATEGORIES</p>
        <h1>
          Every kind
          <br />
          of talent.
        </h1>
      </section>
      <section className="category-directory">
        {categories.map((c, i) => (
          <Link href={`/category/${c.slug}`} key={c.id}>
            <span>{String(i + 1).padStart(2, '0')}</span>
            <div>
              <h2>{c.name}</h2>
              <p>{c.description}</p>
            </div>
            <ArrowUpRight />
          </Link>
        ))}
      </section>
      <PublicFooter />
    </main>
  );
}
