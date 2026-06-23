import { useQuery } from '@tanstack/react-query';
import { api } from '../../api/client';
import { AdminLayout } from '../../components/AdminLayout';
import { DashboardCard } from '../../components/DashboardCard';
import { DataTable } from '../../components/DataTable';

export function AdminDashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: () => api.getDashboard(),
  });

  const stats = data?.stats;
  const activity = (data?.recentActivity ?? []) as Array<{
    id: string;
    action: string;
    entityType: string;
    createdAt: string;
    user?: { name: string };
  }>;

  return (
    <AdminLayout>
      <h1>Dashboard</h1>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <>
          <div className="dashboard-grid">
            <DashboardCard label="Donation Pledges" value={stats?.pledgeCount ?? 0} />
            <DashboardCard label="Total Pledged" value={`$${(stats?.totalPledged ?? 0).toLocaleString()}`} />
            <DashboardCard label="Email Subscribers" value={stats?.subscriberCount ?? 0} />
            <DashboardCard label="New Messages" value={stats?.newMessageCount ?? 0} />
            <DashboardCard label="Active Projects" value={stats?.activeProjectCount ?? 0} />
            <DashboardCard label="Published Updates" value={stats?.publishedUpdateCount ?? 0} />
            <DashboardCard label="Published Reports" value={stats?.publishedReportCount ?? 0} />
            <DashboardCard label="Published Research" value={stats?.publishedPublicationCount ?? 0} />
          </div>

          <h2 style={{ marginBottom: '1rem' }}>Recent Activity</h2>
          <DataTable
            data={activity}
            columns={[
              { key: 'action', label: 'Action' },
              { key: 'entityType', label: 'Entity' },
              { key: 'user', label: 'User', render: (row) => row.user?.name ?? 'System' },
              {
                key: 'createdAt',
                label: 'Date',
                render: (row) => new Date(row.createdAt).toLocaleString(),
              },
            ]}
          />
        </>
      )}
    </AdminLayout>
  );
}
