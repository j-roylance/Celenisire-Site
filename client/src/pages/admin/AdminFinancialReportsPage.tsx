import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, ApiError } from '../../api/client';
import { AdminLayout } from '../../components/AdminLayout';
import { DataTable } from '../../components/DataTable';
import { FormInput } from '../../components/FormInput';
import { FormTextarea } from '../../components/FormTextarea';
import { Button } from '../../components/Button';

const emptyForm = {
  title: '',
  slug: '',
  periodLabel: '',
  summary: '',
  externalUrl: '',
  published: false,
};

export function AdminFinancialReportsPage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [currentFile, setCurrentFile] = useState<{ url?: string | null; name?: string | null } | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'financial-reports'],
    queryFn: () => api.getFinancialReports(),
  });

  const saveMutation = useMutation({
    mutationFn: (fd: FormData) =>
      editId ? api.updateFinancialReport(editId, fd) : api.createFinancialReport(fd),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'financial-reports'] });
      queryClient.invalidateQueries({ queryKey: ['financial-reports', 'public'] });
      setForm(emptyForm);
      setEditId(null);
      setFile(null);
      setCurrentFile(null);
      setError('');
    },
    onError: (err) => {
      setError(err instanceof ApiError ? err.message : 'Failed to save report');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteFinancialReport(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'financial-reports'] });
      queryClient.invalidateQueries({ queryKey: ['financial-reports', 'public'] });
    },
  });

  const reports = data?.reports ?? [];

  function buildFormData(): FormData | null {
    if (!form.title.trim() || !form.periodLabel.trim()) {
      setError('Title and period label are required');
      return null;
    }
    if (!editId && !file && !form.externalUrl.trim()) {
      setError('Provide a PDF file or external URL');
      return null;
    }

    const fd = new FormData();
    fd.append('title', form.title);
    fd.append('periodLabel', form.periodLabel);
    if (form.slug) fd.append('slug', form.slug);
    if (form.summary) fd.append('summary', form.summary);
    if (form.externalUrl.trim()) fd.append('externalUrl', form.externalUrl.trim());
    fd.append('published', String(form.published));
    if (file) fd.append('file', file);
    return fd;
  }

  return (
    <AdminLayout>
      <h1>Financial Reports</h1>

      <div className="admin-form">
        <h3>{editId ? 'Edit Report' : 'Create Report'}</h3>
        {error && <p className="form-error">{error}</p>}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const fd = buildFormData();
            if (fd) saveMutation.mutate(fd);
          }}
        >
          <FormInput
            label="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
          <FormInput
            label="Slug (optional)"
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
          />
          <FormInput
            label="Period Label"
            value={form.periodLabel}
            onChange={(e) => setForm({ ...form, periodLabel: e.target.value })}
            placeholder="e.g. Q1 2026"
            required
          />
          <FormTextarea
            label="Summary (optional)"
            value={form.summary}
            onChange={(e) => setForm({ ...form, summary: e.target.value })}
            rows={4}
          />
          <div className="form-group">
            <label className="form-label">PDF File</label>
            <input
              type="file"
              accept="application/pdf"
              className="form-input"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            <p style={{ fontSize: '0.8rem', color: 'var(--text-light)', marginTop: '0.25rem' }}>
              Max 10 MB. Upload to Supabase Storage, or use external URL below.
            </p>
          </div>
          {currentFile?.url && (
            <p style={{ fontSize: '0.875rem', marginBottom: '0.75rem' }}>
              Current file:{' '}
              <a href={currentFile.url} target="_blank" rel="noopener noreferrer">
                {currentFile.name || 'View PDF'}
              </a>
            </p>
          )}
          <FormInput
            label="External URL (optional)"
            value={form.externalUrl}
            onChange={(e) => setForm({ ...form, externalUrl: e.target.value })}
            placeholder="https://..."
          />
          <label className="form-checkbox">
            <input
              type="checkbox"
              checked={form.published}
              onChange={(e) => setForm({ ...form, published: e.target.checked })}
            />
            <span>Published</span>
          </label>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
            <Button type="submit" disabled={saveMutation.isPending}>
              {editId ? 'Update' : 'Create'}
            </Button>
            {editId && (
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setEditId(null);
                  setForm(emptyForm);
                  setFile(null);
                  setCurrentFile(null);
                  setError('');
                }}
              >
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
          data={reports}
          columns={[
            { key: 'title', label: 'Title' },
            { key: 'periodLabel', label: 'Period' },
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
                        periodLabel: r.periodLabel as string,
                        summary: (r.summary as string) ?? '',
                        externalUrl: r.sourceType === 'external' ? (r.fileUrl as string) ?? '' : '',
                        published: r.published as boolean,
                      });
                      setCurrentFile({ url: r.fileUrl as string, name: r.fileName as string });
                      setFile(null);
                      setError('');
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
