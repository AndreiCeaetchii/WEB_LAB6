import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const returnTo = (location.state as { returnTo?: string } | null)?.returnTo ?? '/';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await login(email, password);
      navigate(returnTo, { replace: true });
    } catch {
      setError('Invalid email or password');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center bg-surface p-4">
      <div className="card w-full max-w-sm p-8">
        <h1 className="font-display text-2xl font-semibold">Sign in</h1>
        <p className="mt-1 text-sm text-ink-muted">Welcome back to CarTrack</p>
        <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
          <label>
            <span className="label">Email</span>
            <input className="input" type="email" required autoFocus
              value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <label>
            <span className="label">Password</span>
            <input className="input" type="password" required
              value={password} onChange={(e) => setPassword(e.target.value)} />
          </label>
          {error && <p className="text-sm text-danger">{error}</p>}
          <button type="submit" disabled={busy} className="btn-primary w-full">
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-ink-muted">
          No account?{' '}
          <Link to="/register" className="text-brand hover:underline">Register</Link>
        </p>
      </div>
    </div>
  );
}
