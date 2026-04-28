import { useEffect, useMemo } from 'react';

/**
 * Returns a stable object URL for the given blob and automatically revokes
 * the previous URL when the blob changes or the component unmounts.
 */
export function useObjectUrl(blob: Blob | undefined | null): string | undefined {
  const url = useMemo(
    () => (blob ? URL.createObjectURL(blob) : undefined),
    [blob],
  );

  useEffect(() => {
    if (!url) return;
    return () => URL.revokeObjectURL(url);
  }, [url]);

  return url;
}
