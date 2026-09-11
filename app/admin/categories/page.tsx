import { AdminShell } from '@/components/admin-shell';
import { getChatGPTUser } from '@/app/chatgpt-auth';
import { getCategories } from '@/lib/application-store';
export const dynamic = 'force-dynamic';
export default async function Categories() {
  const [user, categories] = await Promise.all([
    getChatGPTUser(),
    getCategories(true),
  ]);
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
          <input name="name" placeholder="Category name" required />
          <input name="description" placeholder="Short description" />
          <input
            name="displayOrder"
            type="number"
            min="0"
            defaultValue={categories.length + 1}
          />
          <button>Add category</button>
        </form>
      ) : (
        <div className="admin-empty">
          <h2>Read-only view</h2>
          <p>Sign in to create or change categories.</p>
        </div>
      )}
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
                    <form action="/api/admin/categories" method="post">
                      <input type="hidden" name="id" value={c.id} />
                      <input type="hidden" name="intent" value="toggle" />
                      <button className="table-action">
                        {c.active ? 'Deactivate' : 'Activate'}
                      </button>
                    </form>
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
