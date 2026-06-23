import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../api/client';
import { FormInput } from '../components/FormInput';
import { Button } from '../components/Button';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/admin');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Login failed');
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <img src="/logo.svg" alt="Celenisire" style={{ height: 56, margin: '0 auto' }} />
        </div>
        <h1>Admin Login</h1>
        <p>Sign in to access the Celenisire admin dashboard.</p>
        <form onSubmit={handleSubmit}>
          <FormInput label="Email" name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <FormInput label="Password" name="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          {error && <p className="form-error">{error}</p>}
          <Button type="submit" className="mt-2" style={{ width: '100%' }}>Sign In</Button>
        </form>
        <p className="mt-3" style={{ fontSize: '0.875rem' }}>
          No account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}
