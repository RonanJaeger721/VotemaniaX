import { desc } from 'drizzle-orm';
import { getDb } from '@/db';
import { subscribers } from '@/db/schema';
import { getChatGPTUser } from '@/app/chatgpt-auth';
import { AdminShell } from '@/components/admin-shell';
export const dynamic = 'force-dynamic';
export default async function Subscribers() {
  const [user, rows] = await Promise.all([
    getChatGPTUser(),
    getDb().select().from(subscribers).orderBy(desc(subscribers.createdAt)),
  ]);
  return (
    <AdminShell user={user} active="subscribers">
      <header>
        <div>
          <p>OPTED-IN AUDIENCE</p>
          <h1>Subscribers</h1>
        </div>
        <span>{rows.length} records</span>
      </header>
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
            {rows.map((r) => (
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
