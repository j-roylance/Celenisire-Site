import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api/client';
import { AdminLayout } from '../../components/AdminLayout';
import { DataTable } from '../../components/DataTable';
import { FormInput } from '../../components/FormInput';
import { FormTextarea } from '../../components/FormTextarea';
import { Button } from '../../components/Button';

const emptyForm = {
  title: '',
  slug: '',
  excerpt: '',
  body: '',
  published: false,
};

export function AdminUpdatesPage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'updates'],
    queryFn: () => api.getUpdates(),
  });

  const saveMutation = useMutation({
    mutationFn: (d: unknown) =>
      editId ? api.updateUpdate(editId, d) : api.createUpdate(d),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'updates'] });
      queryClient.invalidateQueries({ queryKey: ['updates', 'public'] });
      setForm(emptyForm);
      setEditId(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteUpdate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'updates'] });
      queryClient.invalidateQueries({ queryKey: ['updates', 'public'] });
    },
  });

  const updates = data?.updates ?? [];

  return (
    <AdminLayout>
      <h1>Updates / Blog</h1>

      <div className="admin-form">
        <h3>{editId ? 'Edit Update' : 'Create Update'}</h3>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            saveMutation.mutate({ ...form, slug: form.slug || undefined });
          }}
        >
          <FormInput label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <FormInput label="Slug (optional)" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
          <FormInput label="Excerpt" value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} required />
          <FormTextarea label="Body" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} required rows={10} />
          <label className="form-checkbox">
            <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} />
            <span>Published</span>
          </label>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
            <Button type="submit">{editId ? 'Update' : 'Create'}</Button>
            {editId && (
              <Button type="button" variant="secondary" onClick={() => { setEditId(null); setForm(emptyForm); }}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </div>

      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <DataTable
          data={updates}
          columns={[
            { key: 'title', label: 'Title' },
            { key: 'slug', label: 'Slug' },
            { key: 'published', label: 'Published', render: (r) => (r.published ? 'Yes' : 'Draft') },
            {
              key: 'author',
              label: 'Author',
              render: (r) => (r.author as { name: string })?.name ?? '—',
            },
            {
              key: 'actions',
              label: '',
              render: (r) => (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setEditId(r.id as string);
                      setForm({
                        title: r.title as string,
                        slug: r.slug as string,
                        excerpt: r.excerpt as string,
                        body: r.body as string,
                        published: r.published as boolean,
                      });
                    }}
                  >
                    Edit
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => deleteMutation.mutate(r.id as string)}>
                    Delete
                  </Button>
                </div>
              ),
            },
          ]}
        />
      )}
    </AdminLayout>
  );
}
