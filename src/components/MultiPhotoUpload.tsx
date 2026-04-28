import { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { compressImage } from '../lib/photos';
import { useObjectUrl } from '../lib/useObjectUrl';

interface MultiPhotoUploadProps {
  value: Blob[];
  onChange: (blobs: Blob[]) => void;
  label?: string;
  hint?: string;
  /** Max number of photos. Defaults to 8 to keep IndexedDB size sane. */
  max?: number;
}

interface ThumbProps {
  blob: Blob;
  onRemove: () => void;
}

function Thumb({ blob, onRemove }: ThumbProps) {
  const url = useObjectUrl(blob);

  return (
    <div className="group relative aspect-square overflow-hidden rounded-xl border border-border bg-surface-muted">
      {url && (
        <img src={url} alt="Document" className="h-full w-full object-cover" />
      )}
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
  value,
  onChange,
  label = 'Photos',
  hint = 'Add photos of the policy or card. Compressed to WebP automatically.',
  max = 8,
}: MultiPhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    const remaining = Math.max(0, max - value.length);
    if (remaining === 0) {
      toast.error(`Up to ${max} photos`);
      return;
    }
    const picks = Array.from(files).slice(0, remaining);
    setBusy(true);
    try {
      const compressed = await Promise.all(picks.map((f) => compressImage(f)));
      onChange([...value, ...compressed]);
    } catch (err) {
      console.error(err);
      toast.error('Could not process those images');
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const removeAt = (idx: number) => {
    onChange(value.filter((_, i) => i !== idx));
  };

  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between gap-2">
        <span className="label !mb-0">{label}</span>
        <span className="text-xs text-ink-subtle">
          {value.length} / {max}
        </span>
      </div>
      <p className="mb-2 text-xs text-ink-subtle">{hint}</p>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {value.map((blob, i) => (
          <Thumb key={i} blob={blob} onRemove={() => removeAt(i)} />
        ))}
        {value.length < max && (
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
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="sr-only"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}
