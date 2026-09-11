import { AdminShell } from '@/components/admin-shell';
import { requireChatGPTUser } from '@/app/chatgpt-auth';
import { getCategories } from '@/lib/application-store';
export const dynamic = 'force-dynamic';
export default async function Categories({ searchParams }: { searchParams: Promise<{ edit?: string; saved?: string }> }) {
  const query = await searchParams;
  const [user, categories] = await Promise.all([
    requireChatGPTUser('/admin/categories'),
    getCategories(true),
  ]);
  const editing = categories.find((category) => String(category.id) === query.edit);
  return (
    <AdminShell user={user} active="categories">
      <header>
        <div>
          <p>CONTENT TAXONOMY</p>
          <h1>Categories</h1>
        </div>
        <span>{categories.length} configured</span>
      </header>
      {user ? (
        <form
          className="admin-create"
          action="/api/admin/categories"
          method="post"
        >
          {editing && <input type="hidden" name="id" value={editing.id} />}
          <input name="name" defaultValue={editing?.name} placeholder="Category name" required />
          <input name="description" defaultValue={editing?.description} placeholder="Short description" />
          <input
            name="displayOrder"
            type="number"
            min="0"
            defaultValue={editing?.displayOrder ?? categories.length + 1}
          />
          <button>{editing ? 'Save category' : 'Add category'}</button>
        </form>
      ) : (
        <div className="admin-empty">
          <h2>Read-only view</h2>
          <p>Sign in to create or change categories.</p>
        </div>
      )}
      {query.saved === '1' && <p className="admin-success" role="status">Category changes saved.</p>}
      <div className="admin-table">
        <table>
          <thead>
            <tr>
              <th>Order</th>
              <th>Category</th>
              <th>Description</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c.id}>
                <td>{c.displayOrder}</td>
                <td>
                  <strong>{c.name}</strong>
                  <br />
                  <small>/{c.slug}</small>
                </td>
                <td>{c.description}</td>
                <td>
                  <span
                    className={`status ${c.active ? 'published' : 'inactive'}`}
                  >
                    {c.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  {user && (
                    <div className="admin-row-actions"><a href={`/admin/categories?edit=${c.id}`}>Edit</a><form action="/api/admin/categories" method="post">
                      <input type="hidden" name="id" value={c.id} />
                      <input type="hidden" name="intent" value="toggle" />
                      <button className="table-action">
                        {c.active ? 'Deactivate' : 'Activate'}
                      </button>
                    </form></div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
