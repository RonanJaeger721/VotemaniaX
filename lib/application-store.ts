import { asc, desc, eq } from 'drizzle-orm';
import { getDb } from '@/db';
import {
  categories,
  contestants,
  paymentMethods,
  videoConsents,
  videoSubmissions,
} from '@/db/schema';

const initialCategories = [
  'Singing',
  'Dancing',
  'DJing',
  'Comedy',
  'Content Creation',
  'Poetry',
  'Music / Instrumental',
  'Other Talent',
];
export async function ensureApplicationData() {
  const db = getDb();
  await db
    .insert(categories)
    .values(
      initialCategories.map((name, index) => ({
        name,
        slug: name
          .toLowerCase()
          .replaceAll(/[^a-z0-9]+/g, '-')
          .replaceAll(/(^-|-$)/g, ''),
        description: `Discover VoteManiaX talent in ${name.toLowerCase()}.`,
        displayOrder: index + 1,
        active: true,
        createdAt: new Date(),
      })),
    )
    .onConflictDoNothing();
  await db
    .insert(paymentMethods)
    .values(
      [
        ['EcoCash', 'ecocash'],
        ['OneMoney', 'onemoney'],
        ['InnBucks', 'innbucks'],
        ['OMari', 'omari'],
      ].map(([name, code]) => ({
        name,
        code,
        enabled: false,
        configured: false,
        status: 'not_configured',
        createdAt: new Date(),
      })),
    )
    .onConflictDoNothing();
}
export async function getCategories(all = false) {
  await ensureApplicationData();
  const query = getDb().select().from(categories);
  return all
    ? query.orderBy(asc(categories.displayOrder))
    : query
        .where(eq(categories.active, true))
        .orderBy(asc(categories.displayOrder));
}
export async function getPublishedVideos() {
  await ensureApplicationData();
  return getDb()
    .select({
      id: videoSubmissions.id,
      title: videoSubmissions.title,
      caption: videoSubmissions.caption,
      contentType: videoSubmissions.contentType,
      createdAt: videoSubmissions.createdAt,
      contestantId: contestants.id,
      contestant: contestants.name,
      slug: contestants.slug,
      category: contestants.category,
    })
    .from(videoSubmissions)
    .innerJoin(contestants, eq(videoSubmissions.contestantId, contestants.id))
    .where(eq(videoSubmissions.status, 'published'))
    .orderBy(desc(videoSubmissions.publishedAt));
}
export async function getReviewVideos() {
  await ensureApplicationData();
  return getDb()
    .select({
      id: videoSubmissions.id,
      title: videoSubmissions.title,
      caption: videoSubmissions.caption,
      status: videoSubmissions.status,
      adminNote: videoSubmissions.adminNote,
      createdAt: videoSubmissions.createdAt,
      contestant: contestants.name,
      category: contestants.category,
      consent: videoConsents.version,
    })
    .from(videoSubmissions)
    .innerJoin(contestants, eq(videoSubmissions.contestantId, contestants.id))
    .leftJoin(videoConsents, eq(videoConsents.videoId, videoSubmissions.id))
    .orderBy(desc(videoSubmissions.createdAt));
}
export async function getPaymentMethods() {
  await ensureApplicationData();
  return getDb().select().from(paymentMethods).orderBy(asc(paymentMethods.id));
}
