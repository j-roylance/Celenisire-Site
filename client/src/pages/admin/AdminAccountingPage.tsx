import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api/client';
import { AdminLayout } from '../../components/AdminLayout';
import { DataTable } from '../../components/DataTable';
import { FormInput } from '../../components/FormInput';
import { FormSelect } from '../../components/FormSelect';
import { FormTextarea } from '../../components/FormTextarea';
import { Button } from '../../components/Button';
import { DashboardCard } from '../../components/DashboardCard';

const categories = [
  'Research', 'Prototyping', 'LegalFormation', 'Operations', 'Software', 'Marketing', 'Donations', 'Other',
].map((c) => ({ value: c, label: c.replace(/([A-Z])/g, ' $1').trim() }));

export function AdminAccountingPage() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({ type: '', category: '' });
  const [form, setForm] = useState({
    type: 'expense',
    date: new Date().toISOString().split('T')[0],
    amount: '',
    category: 'Research',
    description: '',
    vendorOrSource: '',
    notes: '',
  });

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'accounting', filters],
    queryFn: () => api.getAccounting(filters as Record<string, string>),
  });

  const createMutation = useMutation({
    mutationFn: (d: unknown) => api.createTransaction(d),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'accounting'] });
      setForm({ ...form, amount: '', description: '', vendorOrSource: '', notes: '' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteTransaction(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'accounting'] }),
  });

  const transactions = (data?.transactions ?? []) as Array<Record<string, unknown>>;

  return (
    <AdminLayout>
      <h1>Accounting</h1>

      <div className="dashboard-grid">
        <DashboardCard label="Total Income" value={`$${(data?.totals.income ?? 0).toLocaleString()}`} />
        <DashboardCard label="Total Expenses" value={`$${(data?.totals.expenses ?? 0).toLocaleString()}`} />
        <DashboardCard label="Net Balance" value={`$${(data?.totals.net ?? 0).toLocaleString()}`} />
      </div>

      <div className="admin-form">
        <h3>Add Transaction</h3>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createMutation.mutate({ ...form, amount: Number(form.amount) });
          }}
        >
          <FormSelect
            label="Type"
            name="type"
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            options={[
              { value: 'income', label: 'Income' },
              { value: 'expense', label: 'Expense' },
            ]}
          />
          <FormInput label="Date" name="date" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
          <FormInput label="Amount" name="amount" type="number" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
          <FormSelect label="Category" name="category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} options={categories} />
          <FormInput label="Description" name="description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
          <FormInput label="Vendor / Source" name="vendorOrSource" value={form.vendorOrSource} onChange={(e) => setForm({ ...form, vendorOrSource: e.target.value })} />
          <FormTextarea label="Notes" name="notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          <Button type="submit">Add Transaction</Button>
        </form>
      </div>

      <div className="filters">
        <select className="form-select" value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value })}>
          <option value="">All Types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
        <select className="form-select" value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })}>
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <DataTable
          data={transactions}
          columns={[
            { key: 'date', label: 'Date', render: (r) => new Date(r.date as string).toLocaleDateString() },
            { key: 'type', label: 'Type' },
            { key: 'amount', label: 'Amount', render: (r) => `$${Number(r.amount).toFixed(2)}` },
            { key: 'category', label: 'Category' },
            { key: 'description', label: 'Description' },
            { key: 'vendorOrSource', label: 'Vendor/Source' },
            {
              key: 'actions',
              label: '',
              render: (r) => (
                <Button size="sm" variant="ghost" onClick={() => deleteMutation.mutate(r.id as string)}>
                  Delete
                </Button>
              ),
            },
          ]}
        />
      )}
    </AdminLayout>
  );
}
