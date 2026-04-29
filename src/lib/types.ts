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
  /** True for battery-electric cars; drives fuel-vs-charge UI on expense entry. */
  isElectric: boolean;
  favorite: boolean;
  createdAt: number;
  updatedAt: number;
}

export type CarInput = Omit<Car, 'id' | 'createdAt' | 'updatedAt' | 'accentId' | 'favorite'> & {
  favorite?: boolean;
};

export type ExpenseCategory = 'fuel' | 'repair' | 'parts' | 'inspection' | 'other';

interface ExpenseBase {
  id: ID;
  carId: ID;
  /** ISO date (yyyy-mm-dd) — date the expense actually happened. */
  date: string;
  /** Total amount paid in MDL (or whatever the user inputs). */
  cost: number;
  /** Optional free-form note. */
  note?: string;
  createdAt: number;
  updatedAt: number;
}

/** 'L' for combustion (petrol/diesel/hybrid), 'kWh' for electric charging. */
export type FuelUnit = 'L' | 'kWh';

export interface FuelExpense extends ExpenseBase {
  category: 'fuel';
  /** Unit captured at entry time so historical rows render correctly even if the car later switches type. */
  unit: FuelUnit;
  /** Amount of fuel/energy: liters or kWh. */
  quantity: number;
  /** Price per liter or per kWh. */
  unitPrice: number;
  odometerKm?: number;
}

export interface RepairExpense extends ExpenseBase {
  category: 'repair';
  description: string;
  mechanic?: string;
}

export interface PartsExpense extends ExpenseBase {
  category: 'parts';
  partName: string;
  quantity: number;
}

export interface InspectionExpense extends ExpenseBase {
  category: 'inspection';
  /** ISO date — when the next inspection is due. */
  nextDueDate?: string;
}

export interface OtherExpense extends ExpenseBase {
  category: 'other';
  /** Free-form label (e.g. "Car wash", "Toll", "Road tax"). */
  description: string;
}

export type Expense =
  | FuelExpense
  | RepairExpense
  | PartsExpense
  | InspectionExpense
  | OtherExpense;

export type ExpenseInput = Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>;

export type DocumentKind = 'rca' | 'cartea-verde';

export interface VehicleDocument {
  id: ID;
  carId: ID;
  kind: DocumentKind;
  insurer: string;
  policyNumber: string;
  /** ISO yyyy-mm-dd */
  startDate: string;
  /** ISO yyyy-mm-dd */
  endDate: string;
  cost: number;
  /** Compressed photo blobs of the policy/document. */
  photos: Blob[];
  note?: string;
  createdAt: number;
  updatedAt: number;
}

export type DocumentInput = Omit<VehicleDocument, 'id' | 'createdAt' | 'updatedAt'>;

export type DocumentStatus = 'active' | 'expiring' | 'expired';
