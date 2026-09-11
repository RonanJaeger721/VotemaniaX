import { asc } from 'drizzle-orm';
import { getDb } from '@/db';
import { faqs } from '@/db/schema';
import { getChatGPTUser } from '@/app/chatgpt-auth';
import { AdminShell } from '@/components/admin-shell';
export const dynamic = 'force-dynamic';
export default async function Faqs() {
  const [user, rows] = await Promise.all([
    getChatGPTUser(),
    getDb().select().from(faqs).orderBy(asc(faqs.displayOrder)),
  ]);
  return (
    <AdminShell user={user} active="faqs">
      <header>
        <div>
          <p>PUBLIC HELP</p>
          <h1>FAQ</h1>
        </div>
        <span>{rows.filter((r) => r.active).length} active</span>
      </header>
      {user && (
        <form
          className="admin-create stacked"
          action="/api/admin/faq"
          method="post"
        >
          <input name="question" placeholder="Question" required />
          <textarea
            name="answer"
            placeholder="Clear, factual answer"
            required
          />
          <input
            name="displayOrder"
            type="number"
            defaultValue={rows.length + 1}
          />
          <button>Add FAQ</button>
        </form>
      )}
      <div className="admin-table">
        <table>
          <thead>
            <tr>
              <th>Order</th>
              <th>Question</th>
              <th>Answer</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>{r.displayOrder}</td>
                <td>{r.question}</td>
                <td>{r.answer}</td>
                <td>{r.active ? 'Active' : 'Disabled'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
