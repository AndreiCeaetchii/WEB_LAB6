import { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { compressImage } from '../lib/photos';
import { useObjectUrl } from '../lib/useObjectUrl';

interface PhotoUploadProps {
  value?: Blob;
  onChange: (blob: Blob | undefined) => void;
  label?: string;
  hint?: string;
}

export function PhotoUpload({
  value,
  onChange,
  label = 'Photo',
  hint = 'JPEG/PNG/HEIC — compressed to WebP automatically.',
}: PhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const previewUrl = useObjectUrl(value);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    try {
      const compressed = await compressImage(file);
      onChange(compressed);
    } catch (err) {
      console.error(err);
      toast.error('Could not process that image');
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div>
      <span className="label">{label}</span>
      <div className="flex items-start gap-4">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="relative grid h-28 w-28 shrink-0 place-items-center overflow-hidden rounded-xl border border-dashed border-border bg-surface-muted text-xs text-ink-muted transition-colors hover:border-brand hover:text-brand"
        >
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Selected"
              className="h-full w-full object-cover"
            />
          ) : busy ? (
            'Compressing…'
          ) : (
            <span className="px-2 text-center leading-snug">Click to upload</span>
          )}
        </button>
        <div className="flex-1 text-xs text-ink-muted">
          <p>{hint}</p>
          {value && (
            <button
              type="button"
              onClick={() => onChange(undefined)}
              className="mt-2 text-danger hover:underline"
            >
              Remove photo
            </button>
          )}
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </div>
  );
}
