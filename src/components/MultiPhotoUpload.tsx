import { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { compressImage } from '../lib/photos';
import { useObjectUrl } from '../lib/useObjectUrl';

interface MultiPhotoUploadProps {
  existingUrls: string[];
  newBlobs: Blob[];
  onExistingRemove: (url: string) => void;
  onNewBlobsChange: (blobs: Blob[]) => void;
  label?: string;
  hint?: string;
  max?: number;
}

interface ExistingThumbProps { url: string; onRemove: () => void; }
function ExistingThumb({ url, onRemove }: ExistingThumbProps) {
  return (
    <div className="group relative aspect-square overflow-hidden rounded-xl border border-border bg-surface-muted">
      <img src={url} alt="Document" className="h-full w-full object-cover" />
      <button
        type="button"
        onClick={onRemove}
        aria-label="Remove photo"
        className="absolute right-1.5 top-1.5 grid h-6 w-6 place-items-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100"
      >
        ×
      </button>
    </div>
  );
}

interface BlobThumbProps { blob: Blob; onRemove: () => void; }
function BlobThumb({ blob, onRemove }: BlobThumbProps) {
  const url = useObjectUrl(blob);
  return (
    <div className="group relative aspect-square overflow-hidden rounded-xl border border-border bg-surface-muted">
      {url && <img src={url} alt="Document" className="h-full w-full object-cover" />}
      <button
        type="button"
        onClick={onRemove}
        aria-label="Remove photo"
        className="absolute right-1.5 top-1.5 grid h-6 w-6 place-items-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100"
      >
        ×
      </button>
    </div>
  );
}

export function MultiPhotoUpload({
  existingUrls,
  newBlobs,
  onExistingRemove,
  onNewBlobsChange,
  label = 'Photos',
  hint = 'Add photos of the policy or card. Compressed to WebP automatically.',
  max = 8,
}: MultiPhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const total = existingUrls.length + newBlobs.length;

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    const remaining = Math.max(0, max - total);
    if (remaining === 0) { toast.error(`Up to ${max} photos`); return; }
    const picks = Array.from(files).slice(0, remaining);
    setBusy(true);
    try {
      const compressed = await Promise.all(picks.map((f) => compressImage(f)));
      onNewBlobsChange([...newBlobs, ...compressed]);
    } catch (err) {
      console.error(err);
      toast.error('Could not process those images');
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between gap-2">
        <span className="label !mb-0">{label}</span>
        <span className="text-xs text-ink-subtle">{total} / {max}</span>
      </div>
      <p className="mb-2 text-xs text-ink-subtle">{hint}</p>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {existingUrls.map((url) => (
          <ExistingThumb key={url} url={url} onRemove={() => onExistingRemove(url)} />
        ))}
        {newBlobs.map((blob, i) => (
          <BlobThumb key={i} blob={blob} onRemove={() => onNewBlobsChange(newBlobs.filter((_, j) => j !== i))} />
        ))}
        {total < max && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="grid aspect-square place-items-center rounded-xl border border-dashed border-border bg-surface-muted text-xs text-ink-muted transition-colors hover:border-brand hover:text-brand"
          >
            {busy ? 'Compressing…' : '+ Add'}
          </button>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/*" multiple className="sr-only"
        onChange={(e) => handleFiles(e.target.files)} />
    </div>
  );
}
