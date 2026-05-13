import axios from 'axios';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';
import { useCarsStore } from '../stores/carsStore';

interface CarPreviewResponse {
  carId: string;
  make: string;
  model: string;
  year: number;
  ownerEmail: string;
  expiresAt: string;
}

type State =
  | { status: 'loading' }
  | { status: 'preview'; data: CarPreviewResponse }
  | { status: 'error'; message: string }
  | { status: 'redeemed'; carId: string };

export default function ShareLandingPage() {
  const { token = '' } = useParams<{ token: string }>();
  const { isAuthenticated, isInitializing } = useAuth();
  const navigate = useNavigate();
  const invalidateCars = useCarsStore((s) => s.invalidate);
  const [state, setState] = useState<State>({ status: 'loading' });
  const [accepting, setAccepting] = useState(false);

  useEffect(() => {
    if (!token) return;
    axios.get<CarPreviewResponse>(`/api/shares/${token}`)
      .then(({ data }) => setState({ status: 'preview', data }))
      .catch((err) => {
        const msg = err.response?.status === 404
          ? 'This share link is invalid or has expired.'
          : 'Could not load share info. Please try again.';
        setState({ status: 'error', message: msg });
      });
  }, [token]);

  const handleAccept = async () => {
    setAccepting(true);
    try {
      const { data } = await api.post<{ carId: string }>(`/shares/${token}/redeem`);
      invalidateCars();
      setState({ status: 'redeemed', carId: data.carId });
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 409) {
        setState({ status: 'error', message: 'This invite has already been used.' });
      } else {
        setState({ status: 'error', message: 'Failed to accept invite. Please try again.' });
      }
    } finally {
      setAccepting(false);
    }
  };

  if (isInitializing || state.status === 'loading') {
    return (
      <div className="grid min-h-screen place-items-center bg-surface">
        <p className="text-ink-muted">Loading…</p>
      </div>
    );
  }

  if (state.status === 'redeemed') {
    return (
      <div className="grid min-h-screen place-items-center bg-surface p-4">
        <div className="card w-full max-w-sm p-8 text-center">
          <h1 className="font-display text-2xl font-semibold">You're in!</h1>
          <p className="mt-2 text-sm text-ink-muted">You now have collaborator access to this car.</p>
          <button
            type="button"
            onClick={() => navigate(`/garage/${state.carId}`)}
            className="btn-primary mt-6 w-full"
          >
            Go to Car
          </button>
        </div>
      </div>
    );
  }

  if (state.status === 'error') {
    return (
      <div className="grid min-h-screen place-items-center bg-surface p-4">
        <div className="card w-full max-w-sm p-8 text-center">
          <h1 className="font-display text-2xl font-semibold">Link unavailable</h1>
          <p className="mt-2 text-sm text-ink-muted">{state.message}</p>
          <Link to="/" className="btn-primary mt-6 inline-block w-full text-center">
            Go to CarTrack
          </Link>
        </div>
      </div>
    );
  }

  const { data } = state;

  return (
    <div className="grid min-h-screen place-items-center bg-surface p-4">
      <div className="card w-full max-w-sm p-8">
        <h1 className="font-display text-2xl font-semibold">Car invite</h1>
        <p className="mt-1 text-sm text-ink-muted">
          {data.ownerEmail} wants to share a car with you.
        </p>

        <div className="mt-6 rounded-lg border border-border p-4">
          <p className="text-lg font-semibold">{data.year} {data.make} {data.model}</p>
          <p className="mt-1 text-sm text-ink-muted">
            Expires {new Date(data.expiresAt).toLocaleTimeString()}
          </p>
        </div>

        {isAuthenticated ? (
          <button
            type="button"
            onClick={handleAccept}
            disabled={accepting}
            className="btn-primary mt-6 w-full"
          >
            {accepting ? 'Accepting…' : 'Accept invite'}
          </button>
        ) : (
          <div className="mt-6 grid gap-3">
            <Link
              to="/login"
              state={{ returnTo: `/share/${token}` }}
              className="btn-primary w-full text-center"
            >
              Log in to accept
            </Link>
            <Link
              to="/register"
              state={{ returnTo: `/share/${token}` }}
              className="btn-outline w-full text-center"
            >
              Create account
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
