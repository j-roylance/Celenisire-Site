const statusMap: Record<string, string> = {
  concept: 'badge-concept',
  researching: 'badge-researching',
  prototyping: 'badge-prototyping',
  active: 'badge-active',
  paused: 'badge-paused',
  pledged: 'badge-lime',
  contacted: 'badge-warning',
  received: 'badge-active',
  cancelled: 'badge-paused',
  new: 'badge-lime',
  read: 'badge-muted',
  archived: 'badge-muted',
};

interface StatusBadgeProps {
  status: string;
  label?: string;
}

export function StatusBadge({ status, label }: StatusBadgeProps) {
  const cls = statusMap[status] || 'badge-muted';
  return <span className={`badge ${cls}`}>{label || status}</span>;
}
