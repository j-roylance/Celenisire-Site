import { useQuery } from '@tanstack/react-query';
import { api } from '../../api/client';
import { AdminLayout } from '../../components/AdminLayout';
import { DataTable } from '../../components/DataTable';

export function AdminSubscribersPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'subscribers'],
    queryFn: () => api.getSubscribers(),
  });

  const subscribers = (data?.subscribers ?? []) as Array<Record<string, unknown>>;

  return (
    <AdminLayout>
      <h1>Email Subscribers</h1>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <DataTable
          data={subscribers}
          columns={[
            { key: 'name', label: 'Name' },
            { key: 'email', label: 'Email' },
            { key: 'interestArea', label: 'Interest' },
            { key: 'message', label: 'Message', render: (r) => (r.message ? String(r.message).slice(0, 60) : '—') },
            { key: 'consent', label: 'Consent', render: (r) => (r.consent ? 'Yes' : 'No') },
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
