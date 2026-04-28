export interface AccentSlot {
  /** Stable id used to reference the accent in records. */
  id: string;
  /** Hex color used in light mode (also the source for CSS var). */
  hex: string;
  /** Friendly label, never shown to the user during pick — used in legends. */
  label: string;
}

export const ACCENT_PALETTE: readonly AccentSlot[] = [
  { id: 'teal',   hex: '#0e7490', label: 'Teal' },
  { id: 'amber',  hex: '#d97706', label: 'Amber' },
  { id: 'violet', hex: '#7c3aed', label: 'Violet' },
  { id: 'rose',   hex: '#e11d48', label: 'Rose' },
  { id: 'emerald',hex: '#059669', label: 'Emerald' },
  { id: 'sky',    hex: '#0284c7', label: 'Sky' },
  { id: 'pink',   hex: '#db2777', label: 'Pink' },
  { id: 'lime',   hex: '#65a30d', label: 'Lime' },
];

export function getAccent(id: string): AccentSlot {
  return ACCENT_PALETTE.find((a) => a.id === id) ?? ACCENT_PALETTE[0];
}

/**
 * Picks the next least-used accent so cars get visually distinct colors.
 * After 8 cars, palette cycles in the same least-used order.
 */
export function pickNextAccent(usedAccentIds: readonly string[]): AccentSlot {
  const counts = new Map<string, number>();
  for (const slot of ACCENT_PALETTE) counts.set(slot.id, 0);
  for (const id of usedAccentIds) {
    counts.set(id, (counts.get(id) ?? 0) + 1);
  }
  let best = ACCENT_PALETTE[0];
  let bestCount = Infinity;
  for (const slot of ACCENT_PALETTE) {
    const c = counts.get(slot.id) ?? 0;
    if (c < bestCount) {
      best = slot;
      bestCount = c;
    }
  }
  return best;
}

/** Convert a hex like #0e7490 to "14 116 144" suitable for `rgb(var(--x))`. */
export function hexToRgbTuple(hex: string): string {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!m) return '14 116 144';
  return `${parseInt(m[1], 16)} ${parseInt(m[2], 16)} ${parseInt(m[3], 16)}`;
}
