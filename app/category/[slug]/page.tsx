import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { getDb } from '@/db';
import { categories, contestants } from '@/db/schema';
import { PublicHeader, PublicFooter } from '@/components/public-shell';
import { ContestantCard } from '@/components/contestant-card';
export const dynamic = 'force-dynamic';
export default async function Category({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = (
    await getDb()
      .select()
      .from(categories)
      .where(eq(categories.slug, slug))
      .limit(1)
  )[0];
  if (!category || !category.active) notFound();
  const people = await getDb()
    .select({
      id: contestants.id,
      slug: contestants.slug,
      name: contestants.name,
      category: contestants.category,
      bio: contestants.bio,
      status: contestants.status,
    })
    .from(contestants)
    .where(eq(contestants.category, category.name));
  return (
    <main className="site-shell">
      <PublicHeader />
      <section className="app-page-head">
        <p className="eyebrow">CATEGORY</p>
        <h1>{category.name}</h1>
        <p>{category.description}</p>
      </section>
      <section className="contestant-grid compact">
        {people
          .filter((p) => p.status === 'approved')
          .map((p, i) => (
            <ContestantCard key={p.id} item={{ ...p, votes: 0 }} index={i} />
          ))}
      </section>
      <PublicFooter />
    </main>
  );
}
