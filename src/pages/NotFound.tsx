import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="card mx-auto max-w-md p-8 text-center">
      <p className="text-sm font-medium uppercase tracking-wide text-ink-subtle">404</p>
      <h1 className="mt-2 text-2xl font-semibold">Page not found</h1>
      <p className="mt-2 text-sm text-ink-muted">
        The page you’re looking for doesn’t exist.
      </p>
      <Link to="/" className="btn-primary mt-6 inline-flex">
        Back to Dashboard
      </Link>
    </div>
  );
}
