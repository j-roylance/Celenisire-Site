import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api/client';
import { AdminLayout } from '../../components/AdminLayout';
import { DataTable } from '../../components/DataTable';

export function AdminDonationsPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'pledges'],
    queryFn: () => api.getPledges(),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => api.updatePledge(id, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'pledges'] }),
  });

  const pledges = (data?.pledges ?? []) as Array<Record<string, unknown>>;

  return (
    <AdminLayout>
      <h1>Donation Pledges</h1>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <DataTable
          data={pledges}
          columns={[
            { key: 'name', label: 'Name' },
            { key: 'email', label: 'Email' },
            { key: 'amount', label: 'Amount', render: (r) => `$${Number(r.amount).toFixed(2)}` },
            { key: 'message', label: 'Message', render: (r) => (r.message ? String(r.message).slice(0, 60) : '—') },
            {
              key: 'acknowledgedStatus',
              label: 'Acknowledged',
              render: (r) => (r.acknowledgedStatus ? 'Yes' : 'No'),
            },
            {
              key: 'status',
              label: 'Status',
              render: (r) => (
                <select
                  className="form-select"
                  value={r.status as string}
                  onChange={(e) => updateMutation.mutate({ id: r.id as string, status: e.target.value })}
                >
                  <option value="pledged">Pledged</option>
                  <option value="contacted">Contacted</option>
                  <option value="received">Received</option>
                  <option value="cancelled">Cancelled</option>
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
