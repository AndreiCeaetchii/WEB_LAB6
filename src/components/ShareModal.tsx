import { useEffect, useState } from 'react';
import { api } from '../lib/api';

interface ShareTokenResponse {
  token: string;
  url: string;
  qrPngBase64: string;
  expiresAt: string;
}

interface ShareModalProps {
  carId: string;
  onClose: () => void;
}

export function ShareModal({ carId, onClose }: ShareModalProps) {
  const [data, setData] = useState<ShareTokenResponse | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    api.post<ShareTokenResponse>(`/cars/${carId}/shares`)
      .then(({ data }) => setData(data))
      .catch(() => setError('Failed to generate share link'));
  }, [carId]);

  const handleCopy = async () => {
    if (!data) return;
    await navigator.clipboard.writeText(data.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const expiresAt = data ? new Date(data.expiresAt).toLocaleTimeString() : '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="card w-full max-w-sm p-6">
        <h2 className="font-display text-xl font-semibold">Share this car</h2>
        <p className="mt-1 text-sm text-ink-muted">
          Anyone with this link can join as a collaborator. Expires at {expiresAt || '…'}.
        </p>

        {error && <p className="mt-4 text-sm text-danger">{error}</p>}

        {!data && !error && (
          <div className="mt-6 grid place-items-center py-8 text-ink-muted text-sm">
            Generating QR code…
          </div>
        )}

        {data && (
          <>
            <div className="mt-4 flex justify-center rounded-lg border border-border bg-white p-3">
              <img
                src={`data:image/png;base64,${data.qrPngBase64}`}
                alt="Share QR code"
                className="h-48 w-48"
              />
            </div>
            <div className="mt-4 flex gap-2">
              <input
                readOnly
                value={data.url}
                className="input flex-1 text-sm"
              />
              <button
                type="button"
                onClick={handleCopy}
                className="btn-outline shrink-0"
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </>
        )}

        <button
          type="button"
          onClick={onClose}
          className="btn-ghost mt-4 w-full"
        >
          Close
        </button>
      </div>
    </div>
  );
}
