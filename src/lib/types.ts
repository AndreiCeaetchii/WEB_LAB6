export type ID = string;

export type ThemeMode = 'light' | 'dark';

export interface AppMeta {
  schemaVersion: number;
}

export interface Car {
  id: ID;
  make: string;
  model: string;
  year: number;
  vin: string;
  licensePlate: string;
  /** Accent palette slot id, auto-assigned (see lib/palette.ts). */
  accentId: string;
  /** Compressed registration photo, optional. */
  photo?: Blob;
  favorite: boolean;
  createdAt: number;
  updatedAt: number;
}

export type CarInput = Omit<Car, 'id' | 'createdAt' | 'updatedAt' | 'accentId' | 'favorite'> & {
  favorite?: boolean;
};
