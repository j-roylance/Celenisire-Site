import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from './Button';

const adminLinks = [
  { to: '/admin', label: 'Dashboard', exact: true },
  { to: '/admin/accounting', label: 'Accounting' },
  { to: '/admin/users', label: 'Users' },
  { to: '/admin/messages', label: 'Messages' },
  { to: '/admin/donations', label: 'Donations' },
  { to: '/admin/subscribers', label: 'Subscribers' },
  { to: '/admin/projects', label: 'Projects' },
  { to: '/admin/updates', label: 'Updates' },
  { to: '/admin/financial-reports', label: 'Financial Reports' },
  { to: '/admin/research-publications', label: 'Research' },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { user, logout } = useAuth();

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand">
          <img src="/logo.svg" alt="" aria-hidden="true" />
          <span>Admin</span>
        </div>
        <ul className="admin-nav">
          {adminLinks.map((link) => {
            const active = link.exact
              ? location.pathname === link.to
              : location.pathname.startsWith(link.to);
            return (
              <li key={link.to}>
                <Link to={link.to} className={active ? 'active' : ''}>
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </aside>
      <main className="admin-main">
        <div className="admin-header">
          <div>
            <p style={{ color: 'var(--text-light)', fontSize: '0.875rem' }}>Signed in as {user?.name}</p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button variant="ghost" to="/">
              View Site
            </Button>
            <Button variant="secondary" size="sm" onClick={() => logout()}>
              Logout
            </Button>
          </div>
        </div>
        {children}
      </main>
    </div>
  );
}
