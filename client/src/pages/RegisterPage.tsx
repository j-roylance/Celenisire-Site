import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../api/client';
import { FormInput } from '../components/FormInput';
import { Button } from '../components/Button';

export function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      await register(name, email, password);
      navigate('/admin');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Registration failed');
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
          <img src="/logo.svg" alt="Celenisire" style={{ height: 48, margin: '0 auto' }} />
        </div>
        <div className="dev-warning">
          TODO: Restrict admin registration before production. Registration is currently open for development.
        </div>
        <h1>Create Admin Account</h1>
        <p>The first registered user receives ADMIN role.</p>
        <form onSubmit={handleSubmit}>
          <FormInput label="Name" name="name" value={name} onChange={(e) => setName(e.target.value)} required />
          <FormInput label="Email" name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <FormInput label="Password" name="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
          {error && <p className="form-error">{error}</p>}
          <Button type="submit" className="mt-2" style={{ width: '100%' }}>Register</Button>
        </form>
        <p className="mt-3" style={{ fontSize: '0.875rem' }}>
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
