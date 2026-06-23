import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api/client';
import { AdminLayout } from '../../components/AdminLayout';
import { DataTable } from '../../components/DataTable';
import { FormInput } from '../../components/FormInput';
import { FormTextarea } from '../../components/FormTextarea';
import { FormSelect } from '../../components/FormSelect';
import { Button } from '../../components/Button';
import { StatusBadge } from '../../components/StatusBadge';

const statusOptions = [
  { value: 'concept', label: 'Concept' },
  { value: 'researching', label: 'Researching' },
  { value: 'prototyping', label: 'Prototyping' },
  { value: 'active', label: 'Active' },
  { value: 'paused', label: 'Paused' },
];

const emptyForm = {
  title: '',
  slug: '',
  status: 'concept',
  impactArea: '',
  description: '',
  isPublic: true,
};

export function AdminProjectsPage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'projects'],
    queryFn: () => api.getProjects(),
  });

  const saveMutation = useMutation({
    mutationFn: (d: unknown) =>
      editId ? api.updateProject(editId, d) : api.createProject(d),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'projects'] });
      queryClient.invalidateQueries({ queryKey: ['projects', 'public'] });
      setForm(emptyForm);
      setEditId(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'projects'] });
      queryClient.invalidateQueries({ queryKey: ['projects', 'public'] });
    },
  });

  const projects = data?.projects ?? [];

  return (
    <AdminLayout>
      <h1>Projects</h1>

      <div className="admin-form">
        <h3>{editId ? 'Edit Project' : 'Add Project'}</h3>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            saveMutation.mutate({
              ...form,
              slug: form.slug || undefined,
              isPublic: form.isPublic,
            });
          }}
        >
          <FormInput label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <FormInput label="Slug (optional)" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
          <FormSelect label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} options={statusOptions} />
          <FormInput label="Impact Area" value={form.impactArea} onChange={(e) => setForm({ ...form, impactArea: e.target.value })} required />
          <FormTextarea label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
          <label className="form-checkbox">
            <input type="checkbox" checked={form.isPublic} onChange={(e) => setForm({ ...form, isPublic: e.target.checked })} />
            <span>Public visibility</span>
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
          data={projects}
          columns={[
            { key: 'title', label: 'Title' },
            { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status as string} /> },
            { key: 'impactArea', label: 'Impact' },
            { key: 'isPublic', label: 'Public', render: (r) => (r.isPublic ? 'Yes' : 'No') },
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
                        status: r.status as string,
                        impactArea: r.impactArea as string,
                        description: r.description as string,
                        isPublic: r.isPublic as boolean,
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
