import { useState } from 'react';
import { api } from '../api/client';
import { Button } from './Button';

export function EmailSignupCompact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api.subscribe({ name, email, interestArea: 'general', consent: true });
      setStatus('success');
      setName('');
      setEmail('');
    } catch {
      setStatus('error');
    }
  }

  return (
    <div className="cta-section">
      <h2>Join the Email List</h2>
      <p>Receive updates on research progress, milestones, and ways to help.</p>
      <form onSubmit={handleSubmit} style={{ maxWidth: 480, margin: '0 auto' }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <input
            className="form-input"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            aria-label="Name"
            style={{ flex: 1, minWidth: 140 }}
          />
          <input
            className="form-input"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            aria-label="Email"
            style={{ flex: 1, minWidth: 180 }}
          />
          <Button type="submit">Subscribe</Button>
        </div>
      </form>
      {status === 'success' && <p className="form-success mt-2">Thank you for subscribing!</p>}
      {status === 'error' && <p className="form-error mt-2">Something went wrong. Please try again.</p>}
    </div>
  );
}
