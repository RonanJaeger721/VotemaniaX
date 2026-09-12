import { asc } from 'drizzle-orm';
import { getDb } from '@/db';
import { faqs } from '@/db/schema';
import { requireChatGPTUser } from '@/app/chatgpt-auth';
import { AdminShell } from '@/components/admin-shell';
export const dynamic = 'force-dynamic';
export default async function Faqs({ searchParams }: { searchParams: Promise<{ edit?: string; saved?: string }> }) {
  const query = await searchParams;
  const [user, rows] = await Promise.all([
    requireChatGPTUser('/admin/faq'),
    getDb().select().from(faqs).orderBy(asc(faqs.displayOrder)),
  ]);
  const editing = rows.find((row) => String(row.id) === query.edit);
  return (
    <AdminShell user={user} active="faq">
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
          {editing && <input type="hidden" name="id" value={editing.id} />}
          <input name="question" defaultValue={editing?.question} placeholder="Question" required />
          <textarea
            name="answer"
            defaultValue={editing?.answer}
            placeholder="Clear, factual answer"
            required
          />
          <input
            name="displayOrder"
            type="number"
            defaultValue={editing?.displayOrder ?? rows.length + 1}
          />
          <button>{editing ? 'Save FAQ' : 'Add FAQ'}</button>
        </form>
      )}
      {query.saved === '1' && <p className="admin-success" role="status">FAQ changes saved.</p>}
      <div className="admin-table">
        <table>
          <thead>
            <tr>
              <th>Order</th>
              <th>Question</th>
              <th>Answer</th>
              <th>Status</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>{r.displayOrder}</td>
                <td>{r.question}</td>
                <td>{r.answer}</td>
                <td>{r.active ? 'Active' : 'Disabled'}</td>
                <td><div className="admin-row-actions"><a href={`/admin/faq?edit=${r.id}`}>Edit</a><form action="/api/admin/faq" method="post"><input type="hidden" name="id" value={r.id}/><input type="hidden" name="intent" value="toggle"/><button>{r.active ? 'Disable' : 'Enable'}</button></form><form action="/api/admin/faq" method="post"><input type="hidden" name="id" value={r.id}/><input type="hidden" name="intent" value="delete"/><button>Delete</button></form></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
