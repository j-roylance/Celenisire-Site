import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, type User } from '../../api/client';
import { AdminLayout } from '../../components/AdminLayout';
import { DataTable } from '../../components/DataTable';
import { useAuth } from '../../context/AuthContext';

const roles = ['ADMIN', 'EDITOR', 'ACCOUNTANT', 'VIEWER'];

export function AdminUsersPage() {
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: () => api.getUsers(),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<{ role: string; isActive: boolean }> }) =>
      api.updateUser(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'users'] }),
  });

  const users = data?.users ?? [];

  if (currentUser?.role !== 'ADMIN') {
    return (
      <AdminLayout>
        <p className="form-error">You do not have permission to manage users.</p>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <h1>User Management</h1>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <DataTable<User>
          data={users}
          columns={[
            { key: 'name', label: 'Name' },
            { key: 'email', label: 'Email' },
            {
              key: 'role',
              label: 'Role',
              render: (row) => (
                <select
                  className="form-select"
                  value={row.role}
                  onChange={(e) => updateMutation.mutate({ id: row.id, data: { role: e.target.value } })}
                  disabled={row.id === currentUser?.id}
                >
                  {roles.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              ),
            },
            {
              key: 'isActive',
              label: 'Active',
              render: (row) => (
                <input
                  type="checkbox"
                  checked={row.isActive}
                  onChange={(e) => updateMutation.mutate({ id: row.id, data: { isActive: e.target.checked } })}
                  disabled={row.id === currentUser?.id}
                />
              ),
            },
            {
              key: 'createdAt',
              label: 'Created',
              render: (row) => new Date(row.createdAt).toLocaleDateString(),
            },
          ]}
        />
      )}
    </AdminLayout>
  );
}
