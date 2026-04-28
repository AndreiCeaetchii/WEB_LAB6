import { useEffect, useState } from 'react';

/**
 * Returns an object URL for the given blob and revokes it when the blob
 * changes or the component truly unmounts. Uses an effect-driven setState so
 * that StrictMode's simulated unmount/remount in development re-creates the
 * URL after its cleanup revokes the previous one — the useMemo + cleanup
 * pattern leaks a revoked URL across StrictMode's double-fire.
 */
export function useObjectUrl(blob: Blob | undefined | null): string | undefined {
  const [url, setUrl] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!blob) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUrl(undefined);
      return;
    }
    const next = URL.createObjectURL(blob);
    setUrl(next);
    return () => URL.revokeObjectURL(next);
  }, [blob]);

  return url;
}
