import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navLinks = [
  { to: '/about', label: 'About' },
  { to: '/life-packs', label: 'Celenirises' },
  { to: '/projects', label: 'Projects' },
  { to: '/updates', label: 'Updates' },
  { to: '/transparency', label: 'Transparency' },
  { to: '/donate', label: 'Support' },
  { to: '/contact', label: 'Contact' },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          <img src="/logo.svg" alt="" className="navbar-logo" aria-hidden="true" />
          <span className="navbar-brand-text">Celenisire</span>
        </Link>

        <ul className="navbar-links">
          {navLinks.map((link) => (
            <li key={link.to}>
              <Link to={link.to} className={location.pathname === link.to ? 'active' : ''}>
                {link.label}
              </Link>
            </li>
          ))}
          {isAuthenticated && (
            <li>
              <Link to="/admin">Admin</Link>
            </li>
          )}
        </ul>

        <button className="navbar-toggle" onClick={() => setOpen(!open)} aria-label="Toggle menu">
          {open ? '✕' : '☰'}
        </button>
      </div>

      <div className={`navbar-mobile ${open ? 'open' : ''}`}>
        <ul>
          {navLinks.map((link) => (
            <li key={link.to}>
              <Link to={link.to} onClick={() => setOpen(false)}>
                {link.label}
              </Link>
            </li>
          ))}
          {isAuthenticated && (
            <li>
              <Link to="/admin" onClick={() => setOpen(false)}>
                Admin
              </Link>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
}
