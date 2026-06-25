import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api, ApiError } from '../api/client';
import { Button } from './Button';

export function Footer() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api.subscribe({ name, email, interestArea: 'general', consent: true });
      setStatus('success');
      setName('');
      setEmail('');
    } catch (err) {
      setStatus('error');
      if (err instanceof ApiError) console.error(err.message);
    }
  }

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div className="footer-brand">
              <img src="/logo.png" alt="" className="site-logo" aria-hidden="true" />
              <span>Celenisire</span>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.75)' }}>
              An early-stage charity initiative researching technology to prevent catastrophe and relieve human
              suffering.
            </p>
            <div className="footer-signup">
              <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem', color: 'rgba(255,255,255,0.85)' }}>
                Join the email list
              </p>
              <form className="footer-signup-form" onSubmit={handleSignup}>
                <input
                  className="form-input"
                  name="name"
                  placeholder="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  aria-label="Name"
                />
                <input
                  className="form-input"
                  name="email"
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  aria-label="Email"
                />
                <Button type="submit" size="sm">
                  Subscribe
                </Button>
              </form>
              {status === 'success' && (
                <p style={{ color: 'var(--pastel-lime-primary)', marginTop: '0.5rem', fontSize: '0.875rem' }}>
                  Subscribed!
                </p>
              )}
              {status === 'error' && (
                <p className="form-error mt-1">Something went wrong.</p>
              )}
            </div>
          </div>
          <div>
            <p style={{ fontWeight: 600, color: 'var(--white)', marginBottom: '0.75rem' }}>Explore</p>
            <ul className="footer-links">
              <li><Link to="/about">About</Link></li>
              <li><Link to="/life-packs">Celenirises</Link></li>
              <li><Link to="/projects">Projects</Link></li>
              <li><Link to="/updates">Updates</Link></li>
              <li><Link to="/financial-reports">Financial Reports</Link></li>
              <li><Link to="/research">Research</Link></li>
            </ul>
          </div>
          <div>
            <p style={{ fontWeight: 600, color: 'var(--white)', marginBottom: '0.75rem' }}>Get Involved</p>
            <ul className="footer-links">
              <li><Link to="/donate">Support the Mission</Link></li>
              <li><Link to="/join">Join the Email List</Link></li>
              <li><Link to="/contact">Contact</Link></li>
              <li><Link to="/transparency">Transparency</Link></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Celenisire: Humankind Resilience Initiative</span>
          <span>Early-stage initiative — not yet legally formed as a nonprofit</span>
        </div>
      </div>
    </footer>
  );
}
