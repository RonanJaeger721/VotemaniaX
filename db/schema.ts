import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';
export const events = sqliteTable('events', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description').notNull().default(''),
  status: text('status').notNull().default('draft'),
  startAt: integer('start_at', { mode: 'timestamp' }),
  endAt: integer('end_at', { mode: 'timestamp' }),
  currency: text('currency').notNull().default('USD'),
  votePrice: real('vote_price').notNull().default(1),
  publicLeaderboard: integer('public_leaderboard', { mode: 'boolean' })
    .notNull()
    .default(true),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});
export const contestants = sqliteTable('contestants', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  eventId: integer('event_id').references(() => events.id),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  category: text('category').notNull(),
  bio: text('bio').notNull().default(''),
  imageKey: text('image_key'),
  status: text('status').notNull().default('pending'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});
export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: text('role').notNull().default('voter'),
  displayName: text('display_name').notNull(),
  phone: text('phone'),
  status: text('status').notNull().default('active'),
  lastLoginAt: integer('last_login_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});
export const sessions = sqliteTable('sessions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tokenHash: text('token_hash').notNull().unique(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});
export const categories = sqliteTable('categories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description').notNull().default(''),
  coverKey: text('cover_key'),
  displayOrder: integer('display_order').notNull().default(0),
  active: integer('active', { mode: 'boolean' }).notNull().default(true),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});
export const contestantAccounts = sqliteTable('contestant_accounts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id')
    .notNull()
    .unique()
    .references(() => users.id),
  contestantId: integer('contestant_id')
    .notNull()
    .unique()
    .references(() => contestants.id),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});
export const videoSubmissions = sqliteTable('video_submissions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  contestantId: integer('contestant_id')
    .notNull()
    .references(() => contestants.id),
  eventId: integer('event_id').references(() => events.id),
  roundId: integer('round_id').references(() => votingRounds.id),
  storageKey: text('storage_key').notNull().unique(),
  filename: text('filename').notNull(),
  contentType: text('content_type').notNull(),
  size: integer('size').notNull(),
  title: text('title').notNull(),
  caption: text('caption').notNull().default(''),
  status: text('status').notNull().default('pending'),
  adminNote: text('admin_note'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  reviewedAt: integer('reviewed_at', { mode: 'timestamp' }),
  publishedAt: integer('published_at', { mode: 'timestamp' }),
});
export const videoConsents = sqliteTable('video_consents', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  videoId: integer('video_id')
    .notNull()
    .unique()
    .references(() => videoSubmissions.id),
  contestantId: integer('contestant_id')
    .notNull()
    .references(() => contestants.id),
  version: text('version').notNull(),
  consentText: text('consent_text').notNull(),
  sessionMetadata: text('session_metadata'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});
export const paymentMethods = sqliteTable('payment_methods', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  code: text('code').notNull().unique(),
  enabled: integer('enabled', { mode: 'boolean' }).notNull().default(false),
  configured: integer('configured', { mode: 'boolean' })
    .notNull()
    .default(false),
  status: text('status').notNull().default('not_configured'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});
export const votingRounds = sqliteTable('voting_rounds', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  eventId: integer('event_id')
    .notNull()
    .references(() => events.id),
  name: text('name').notNull(),
  weekNumber: integer('week_number').notNull(),
  slug: text('slug').notNull().unique(),
  publicToken: text('public_token').notNull().unique(),
  startAt: integer('start_at', { mode: 'timestamp' }).notNull(),
  endAt: integer('end_at', { mode: 'timestamp' }).notNull(),
  status: text('status').notNull().default('draft'),
  createdBy: text('created_by').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  publishedAt: integer('published_at', { mode: 'timestamp' }),
  closedAt: integer('closed_at', { mode: 'timestamp' }),
});
export const payments = sqliteTable('payments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  reference: text('reference').notNull().unique(),
  eventId: integer('event_id')
    .notNull()
    .references(() => events.id),
  roundId: integer('round_id').references(() => votingRounds.id),
  contestantId: integer('contestant_id')
    .notNull()
    .references(() => contestants.id),
  quantity: integer('quantity').notNull(),
  amount: real('amount').notNull(),
  currency: text('currency').notNull(),
  method: text('method').notNull(),
  status: text('status').notNull().default('pending'),
  providerReference: text('provider_reference'),
  verifiedAt: integer('verified_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});
export const votes = sqliteTable('votes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  paymentId: integer('payment_id')
    .notNull()
    .unique()
    .references(() => payments.id),
  eventId: integer('event_id')
    .notNull()
    .references(() => events.id),
  roundId: integer('round_id').references(() => votingRounds.id),
  contestantId: integer('contestant_id')
    .notNull()
    .references(() => contestants.id),
  quantity: integer('quantity').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});
export const subscribers = sqliteTable('subscribers', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull().unique(),
  active: integer('active', { mode: 'boolean' }).notNull().default(true),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});
export const contactMessages = sqliteTable('contact_messages', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  email: text('email').notNull(),
  subject: text('subject').notNull(),
  message: text('message').notNull(),
  status: text('status').notNull().default('new'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});
export const auditLogs = sqliteTable('audit_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  adminUserId: text('admin_user_id').notNull(),
  action: text('action').notNull(),
  entityType: text('entity_type').notNull(),
  entityId: text('entity_id'),
  payload: text('payload'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});
export const faqs = sqliteTable('faqs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  question: text('question').notNull(),
  answer: text('answer').notNull(),
  active: integer('active', { mode: 'boolean' }).notNull().default(true),
  displayOrder: integer('display_order').notNull().default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});
export const siteSettings = sqliteTable('site_settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});
export const media = sqliteTable('media', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  storageKey: text('storage_key').notNull().unique(),
  filename: text('filename').notNull(),
  contentType: text('content_type').notNull(),
  size: integer('size').notNull(),
  uploadedBy: text('uploaded_by').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});
