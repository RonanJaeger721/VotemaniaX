import { desc } from 'drizzle-orm';
import { getDb } from '@/db';
import { subscribers } from '@/db/schema';
import { requireChatGPTUser } from '@/app/chatgpt-auth';
import { AdminShell } from '@/components/admin-shell';
export const dynamic = 'force-dynamic';
export default async function Subscribers({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = '' } = await searchParams;
  const [user, rows] = await Promise.all([
    requireChatGPTUser('/admin/subscribers'),
    getDb().select().from(subscribers).orderBy(desc(subscribers.createdAt)),
  ]);
  const visible = rows.filter((row) => !q || row.email.toLowerCase().includes(q.toLowerCase()));
  return (
    <AdminShell user={user} active="subscribers">
      <header>
        <div>
          <p>OPTED-IN AUDIENCE</p>
          <h1>Subscribers</h1>
        </div>
        <span>{rows.length} records</span>
      </header>
      <form className="admin-toolbar"><input name="q" defaultValue={q} placeholder="Search subscribers"/><button>Search</button><a href="/api/admin/export?dataset=subscribers">Export CSV</a></form>
      <div className="admin-table">
        <table>
          <thead>
            <tr>
              <th>Email</th>
              <th>Date joined</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((r) => (
              <tr key={r.id}>
                <td>{r.email}</td>
                <td>{r.createdAt.toLocaleDateString()}</td>
                <td>{r.active ? 'Active' : 'Inactive'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
