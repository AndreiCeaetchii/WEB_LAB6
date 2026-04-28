import { useEffect, useState } from 'react';
import { useObjectUrl } from '../lib/useObjectUrl';

interface PhotoLightboxProps {
  open: boolean;
  photos: Blob[];
  startIndex?: number;
  onClose: () => void;
  onDelete?: (index: number) => void;
}

interface SlideProps {
  blob: Blob;
}

function Slide({ blob }: SlideProps) {
  const url = useObjectUrl(blob);
  if (!url) return null;
  return <img src={url} alt="Document" className="max-h-full max-w-full object-contain" />;
}

export function PhotoLightbox({
  open,
  photos,
  startIndex = 0,
  onClose,
  onDelete,
}: PhotoLightboxProps) {
  const [index, setIndex] = useState(startIndex);

  useEffect(() => {
    if (!open) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIndex(Math.min(startIndex, Math.max(0, photos.length - 1)));
  }, [open, startIndex, photos.length]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') setIndex((i) => Math.max(0, i - 1));
      if (e.key === 'ArrowRight')
        setIndex((i) => Math.min(photos.length - 1, i + 1));
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, photos.length, onClose]);

  if (!open || photos.length === 0) return null;

  const safeIndex = Math.min(index, photos.length - 1);
  const blob = photos[safeIndex];

  return (
    <div
      className="fixed inset-0 z-[60] grid grid-rows-[auto_1fr_auto] bg-black/95"
      role="dialog"
      aria-modal="true"
      aria-label="Document gallery"
    >
      <header className="flex items-center justify-between gap-4 px-4 py-3 text-white">
        <span className="text-sm">
          {safeIndex + 1} / {photos.length}
        </span>
        <div className="flex items-center gap-2">
          {onDelete && (
            <button
              type="button"
              onClick={() => {
                if (confirm('Delete this photo?')) onDelete(safeIndex);
              }}
              className="rounded-xl border border-white/20 px-3 py-1 text-sm hover:bg-white/10"
            >
              Delete photo
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid h-9 w-9 place-items-center rounded-full border border-white/20 text-xl leading-none hover:bg-white/10"
          >
            ×
          </button>
        </div>
      </header>

      <div className="grid place-items-center px-6 pb-6">
        <Slide blob={blob} />
      </div>

      <footer className="flex items-center justify-center gap-3 pb-6 text-white">
        <button
          type="button"
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          disabled={safeIndex === 0}
          className="rounded-full border border-white/20 px-4 py-1.5 text-sm hover:bg-white/10 disabled:opacity-30"
        >
          ← Prev
        </button>
        <button
          type="button"
          onClick={() => setIndex((i) => Math.min(photos.length - 1, i + 1))}
          disabled={safeIndex >= photos.length - 1}
          className="rounded-full border border-white/20 px-4 py-1.5 text-sm hover:bg-white/10 disabled:opacity-30"
        >
          Next →
        </button>
      </footer>
    </div>
  );
}
