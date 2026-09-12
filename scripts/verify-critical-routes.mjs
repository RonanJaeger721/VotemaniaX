import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const routes = [
  '/', '/discover', '/watch', '/events', '/categories', '/contestants',
  '/leaderboard', '/results', '/search', '/how-it-works', '/faq', '/contact',
  '/terms', '/privacy', '/admin/login', '/admin', '/admin/dashboard', '/admin/events',
  '/admin/categories', '/admin/participants', '/admin/video-review', '/admin/voting-rounds',
  '/admin/votes', '/admin/payments', '/admin/payment-methods', '/admin/analytics',
  '/admin/subscribers', '/admin/faq', '/admin/settings', '/admin/admins', '/admin/audit-log',
  '/contestant/login', '/contestant/register',
];
const dynamicParent = new Set(['/admin/events', '/admin/participants', '/admin/votes', '/admin/payments', '/admin/payment-methods', '/admin/settings', '/admin/admins', '/admin/audit-log']);
const missing = routes.filter((route) => {
  if (dynamicParent.has(route)) return !existsSync(join(root, 'app/admin/[section]/page.tsx'));
  const file = route === '/' ? join(root, 'app/page.tsx') : join(root, 'app', route.slice(1), 'page.tsx');
  return !existsSync(file);
});

function files(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? files(path) : /\.(tsx|ts)$/.test(name) ? [path] : [];
  });
}
const deadLinks = [...files(join(root, 'app')), ...files(join(root, 'components'))]
  .filter((file) => /href\s*=\s*["']#["']/.test(readFileSync(file, 'utf8')));
if (missing.length || deadLinks.length) {
  console.error('Critical route verification failed.');
  if (missing.length) console.error(`Missing routes: ${missing.join(', ')}`);
  if (deadLinks.length) console.error(`Dead links: ${deadLinks.join(', ')}`);
  process.exit(1);
}
console.log(`Verified ${routes.length} critical route sources and found no href="#" placeholders.`);
