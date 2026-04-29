import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { StarIcon } from './icons';
import { getAccent, hexToRgbTuple } from '../lib/palette';
import { useObjectUrl } from '../lib/useObjectUrl';
import type { Car } from '../lib/types';

interface CarCardProps {
  car: Car;
  onEdit: () => void;
  onDelete: () => void;
  onToggleFavorite: () => void;
}

export function CarCard({ car, onEdit, onDelete, onToggleFavorite }: CarCardProps) {
  const accent = useMemo(() => getAccent(car.accentId), [car.accentId]);
  const accentRgb = useMemo(() => hexToRgbTuple(accent.hex), [accent.hex]);
  const photoUrl = useObjectUrl(car.photo);

  return (
    <article
      className="card overflow-hidden flex flex-col"
      style={{ ['--car-accent' as string]: accentRgb }}
    >
      <Link
        to={`/garage/${car.id}`}
        className="relative block aspect-[16/10] w-full overflow-hidden bg-surface-muted"
        aria-label={`Open ${car.make} ${car.model}`}
      >
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={`${car.make} ${car.model}`}
            className="h-full w-full object-cover"
          />
        ) : (
          <div
            className="grid h-full place-items-center text-3xl font-semibold uppercase tracking-widest"
            style={{ color: 'rgb(var(--car-accent))', background: 'rgb(var(--car-accent) / 0.1)' }}
          >
            {car.make.slice(0, 1) || '?'}
            {car.model.slice(0, 1) || '?'}
          </div>
        )}
        <span
          className="absolute left-3 top-3 rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-white shadow-sm"
          style={{ background: 'rgb(var(--car-accent))' }}
        >
          {accent.label}
        </span>
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate text-lg font-semibold">
              {car.make} {car.model}
            </h3>
            <p className="text-sm text-ink-muted">
              {car.year}
              {car.licensePlate ? ` · ${car.licensePlate}` : ''}
            </p>
          </div>
          <button
            type="button"
            onClick={onToggleFavorite}
            aria-label={car.favorite ? 'Unfavorite' : 'Mark as favorite'}
            title={car.favorite ? 'Unfavorite' : 'Mark as favorite'}
            className={`btn-ghost h-9 w-9 rounded-full p-0 ${car.favorite ? 'text-warn' : ''}`}
          >
            <StarIcon
              className="h-5 w-5"
              fill={car.favorite ? 'currentColor' : 'none'}
            />
          </button>
        </div>
        {car.vin && (
          <p className="font-mono text-xs text-ink-subtle truncate" title={car.vin}>
            VIN · {car.vin}
          </p>
        )}

        <div className="mt-auto flex flex-wrap items-center gap-2">
          <Link to={`/garage/${car.id}`} className="btn-outline">
            Open
          </Link>
          <button type="button" onClick={onEdit} className="btn-ghost">
            Edit
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="btn-ghost ml-auto text-danger hover:bg-danger/10"
          >
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}
