import { getDB } from './db';
import type { Car, Expense, VehicleDocument } from './types';

export const BACKUP_VERSION = 1;

export interface CarTrackBackup {
  version: number;
  exportedAt: string;
  cars: Car[];
  expenses: Expense[];
  documents: VehicleDocument[];
}

export async function buildBackup(): Promise<CarTrackBackup> {
  const db = await getDB();
  const [cars, expenses, documents] = await Promise.all([
    db.getAll('cars'),
    db.getAll('expenses'),
    db.getAll('documents'),
  ]);

  return {
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    cars,
    expenses,
    documents,
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

  const cars = (backup.cars ?? []) as Car[];

  const documents = (backup.documents ?? []) as VehicleDocument[];

  const expenses = backup.expenses ?? [];

  const db = await getDB();
  const tx = db.transaction(['cars', 'expenses', 'documents'], 'readwrite');
  tx.objectStore('cars').clear();
  tx.objectStore('expenses').clear();
  tx.objectStore('documents').clear();

  const carStore = tx.objectStore('cars');
  const expenseStore = tx.objectStore('expenses');
  const documentStore = tx.objectStore('documents');

  cars.forEach((car) => carStore.put(car));
  expenses.forEach((expense) => expenseStore.put(expense));
  documents.forEach((doc) => documentStore.put(doc));

  await tx.done;

  return {
    cars: cars.length,
    expenses: expenses.length,
    documents: documents.length,
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
