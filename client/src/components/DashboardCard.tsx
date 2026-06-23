interface DashboardCardProps {
  label: string;
  value: string | number;
}

export function DashboardCard({ label, value }: DashboardCardProps) {
  return (
    <div className="dashboard-card">
      <div className="dashboard-card-label">{label}</div>
      <div className="dashboard-card-value">{value}</div>
    </div>
  );
}
