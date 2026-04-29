import { getDB } from './db';
import { base64ToBlob, blobToBase64 } from './photos';
import type { Car, Expense, VehicleDocument } from './types';

export const BACKUP_VERSION = 1;

export interface CarTrackBackup {
  version: number;
  exportedAt: string;
  cars: Array<Omit<Car, 'photo'> & { photo?: string }>;
  expenses: Expense[];
  documents: Array<Omit<VehicleDocument, 'photos'> & { photos: string[] }>;
}

export async function buildBackup(): Promise<CarTrackBackup> {
  const db = await getDB();
  const [cars, expenses, documents] = await Promise.all([
    db.getAll('cars'),
    db.getAll('expenses'),
    db.getAll('documents'),
  ]);

  const carsOut = await Promise.all(
    cars.map(async (c) => ({
      ...c,
      photo: c.photo ? await blobToBase64(c.photo) : undefined,
    })),
  );

  const documentsOut = await Promise.all(
    documents.map(async (d) => ({
      ...d,
      photos: await Promise.all(d.photos.map((b) => blobToBase64(b))),
    })),
  );

  return {
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    cars: carsOut,
    expenses,
    documents: documentsOut,
  };
}

export async function downloadBackup(): Promise<void> {
  const backup = await buildBackup();
  const json = JSON.stringify(backup, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const stamp = new Date().toISOString().slice(0, 10);
  a.download = `cartrack-backup-${stamp}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export async function restoreBackup(backup: CarTrackBackup): Promise<{
  cars: number;
  expenses: number;
  documents: number;
}> {
  if (!backup || typeof backup !== 'object' || backup.version === undefined) {
    throw new Error('Not a valid CarTrack backup file');
  }
  if (backup.version > BACKUP_VERSION) {
    throw new Error(
      `Backup is from a newer app version (${backup.version}). Update CarTrack first.`,
    );
  }

  const db = await getDB();
  const tx = db.transaction(['cars', 'expenses', 'documents'], 'readwrite');
  await Promise.all([
    tx.objectStore('cars').clear(),
    tx.objectStore('expenses').clear(),
    tx.objectStore('documents').clear(),
  ]);

  for (const carRow of backup.cars ?? []) {
    const { photo, ...rest } = carRow;
    const car: Car = {
      ...rest,
      photo: photo ? await base64ToBlob(photo) : undefined,
    };
    await tx.objectStore('cars').put(car);
  }
  for (const e of backup.expenses ?? []) {
    await tx.objectStore('expenses').put(e);
  }
  for (const docRow of backup.documents ?? []) {
    const { photos, ...rest } = docRow;
    const doc: VehicleDocument = {
      ...rest,
      photos: await Promise.all(
        (photos ?? []).map((b64) => base64ToBlob(b64)),
      ),
    };
    await tx.objectStore('documents').put(doc);
  }
  await tx.done;

  return {
    cars: backup.cars?.length ?? 0,
    expenses: backup.expenses?.length ?? 0,
    documents: backup.documents?.length ?? 0,
  };
}

export async function wipeAllData(): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(['cars', 'expenses', 'documents'], 'readwrite');
  await Promise.all([
    tx.objectStore('cars').clear(),
    tx.objectStore('expenses').clear(),
    tx.objectStore('documents').clear(),
  ]);
  await tx.done;
}
