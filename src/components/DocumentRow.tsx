import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PhotoLightbox } from './PhotoLightbox';
import { useObjectUrl } from '../lib/useObjectUrl';
import { getAccent, hexToRgbTuple } from '../lib/palette';
import { formatDate, formatMoney } from '../lib/format';
import { daysUntil, getStatus, statusLabel, statusToken } from '../lib/validity';
import type { Car, VehicleDocument } from '../lib/types';

interface DocumentRowProps {
  document: VehicleDocument;
  car?: Car;
  onEdit: () => void;
  onDelete: () => void;
  onPhotosChange: (photos: Blob[]) => void;
}

export function DocumentRow({
  document: doc,
  car,
  onEdit,
  onDelete,
  onPhotosChange,
}: DocumentRowProps) {
  const accent = useMemo(() => (car ? getAccent(car.accentId) : undefined), [car]);
  const accentRgb = useMemo(
    () => (accent ? hexToRgbTuple(accent.hex) : '14 116 144'),
    [accent],
  );
  const status = useMemo(() => getStatus(doc.endDate), [doc.endDate]);
  const days = useMemo(() => daysUntil(doc.endDate), [doc.endDate]);
  const token = statusToken(status);

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const firstPhotoUrl = useObjectUrl(doc.photos[0]);

  const removePhotoAt = (idx: number) => {
    onPhotosChange(doc.photos.filter((_, i) => i !== idx));
  };

  return (
    <article
      className="card flex flex-wrap items-center gap-4 p-4"
      style={{ ['--car-accent' as string]: accentRgb }}
    >
      <button
        type="button"
        onClick={() => doc.photos.length > 0 && setLightboxOpen(true)}
        disabled={doc.photos.length === 0}
        className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-border bg-surface-muted disabled:cursor-default"
        aria-label={
          doc.photos.length > 0
            ? `View ${doc.photos.length} photo${doc.photos.length === 1 ? '' : 's'}`
            : 'No photos attached'
        }
      >
        {firstPhotoUrl ? (
          <>
            <img
              src={firstPhotoUrl}
              alt=""
              className="h-full w-full object-cover"
            />
            {doc.photos.length > 1 && (
              <span className="absolute bottom-1 right-1 rounded-full bg-black/70 px-1.5 py-0.5 text-[10px] font-medium text-white">
                +{doc.photos.length - 1}
              </span>
            )}
          </>
        ) : (
          <span className="grid h-full w-full place-items-center text-xs text-ink-subtle">
            No photo
          </span>
        )}
      </button>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-2">
          <span className="font-medium">{doc.insurer || 'Untitled insurer'}</span>
          {car ? (
            <Link
              to={`/garage/${car.id}`}
              className="text-sm text-ink-muted hover:underline"
            >
              {car.make} {car.model}
              {car.licensePlate ? ` · ${car.licensePlate}` : ''}
            </Link>
          ) : (
            <span className="text-sm text-ink-subtle">Unknown car</span>
          )}
          <StatusPill status={token} label={statusLabel(status)} />
        </div>
        <p className="mt-0.5 text-sm text-ink-muted">
          {formatDate(doc.startDate)} → {formatDate(doc.endDate)}
          {status === 'expired'
            ? ` · expired ${Math.abs(days)} day${Math.abs(days) === 1 ? '' : 's'} ago`
            : ` · ${days} day${days === 1 ? '' : 's'} left`}
        </p>
        {doc.policyNumber && (
          <p className="mt-1 truncate font-mono text-xs text-ink-subtle" title={doc.policyNumber}>
            #{doc.policyNumber}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2">
        <span className="text-base font-semibold tabular-nums">
          {formatMoney(doc.cost)}
        </span>
        <button type="button" onClick={onEdit} className="btn-ghost">
          Edit
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="btn-ghost text-danger hover:bg-danger/10"
        >
          Delete
        </button>
      </div>

      <PhotoLightbox
        open={lightboxOpen}
        photos={doc.photos}
        onClose={() => setLightboxOpen(false)}
        onDelete={removePhotoAt}
      />
    </article>
  );
}

function StatusPill({
  status,
  label,
}: {
  status: 'success' | 'warn' | 'danger';
  label: string;
}) {
  const tokenClass = {
    success: 'bg-success/15 text-success',
    warn: 'bg-warn/15 text-warn',
    danger: 'bg-danger/15 text-danger',
  }[status];
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${tokenClass}`}
    >
      {label}
    </span>
  );
}
