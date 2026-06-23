import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api/client';
import { AdminLayout } from '../../components/AdminLayout';
import { DataTable } from '../../components/DataTable';

export function AdminMessagesPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'messages'],
    queryFn: () => api.getMessages(),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => api.updateMessage(id, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'messages'] }),
  });

  const messages = (data?.messages ?? []) as Array<Record<string, unknown>>;

  return (
    <AdminLayout>
      <h1>Contact Messages</h1>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <DataTable
          data={messages}
          columns={[
            { key: 'name', label: 'Name' },
            { key: 'email', label: 'Email' },
            { key: 'topic', label: 'Topic' },
            { key: 'message', label: 'Message', render: (r) => String(r.message).slice(0, 80) + '...' },
            {
              key: 'status',
              label: 'Status',
              render: (r) => (
                <select
                  className="form-select"
                  value={r.status as string}
                  onChange={(e) => updateMutation.mutate({ id: r.id as string, status: e.target.value })}
                >
                  <option value="new">New</option>
                  <option value="read">Read</option>
                  <option value="archived">Archived</option>
                </select>
              ),
            },
            {
              key: 'createdAt',
              label: 'Date',
              render: (r) => new Date(r.createdAt as string).toLocaleString(),
            },
          ]}
        />
      )}
    </AdminLayout>
  );
}
