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
  accentId: string;
  photoUrls: string[];
  isElectric: boolean;
  favorite: boolean;
  createdAt: number;
  updatedAt: number;
}

export type CarInput = Omit<Car, 'id' | 'createdAt' | 'updatedAt' | 'photoUrls'> & {
  favorite?: boolean;
};

export type ExpenseCategory = 'fuel' | 'repair' | 'parts' | 'inspection' | 'other';

interface ExpenseBase {
  id: ID;
  carId: ID;
  date: string;
  cost: number;
  note?: string;
  createdAt: number;
  updatedAt: number;
}

export type FuelUnit = 'L' | 'kWh';

export interface FuelExpense extends ExpenseBase {
  category: 'fuel';
  unit: FuelUnit;
  quantity: number;
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
  nextDueDate?: string;
}

export interface OtherExpense extends ExpenseBase {
  category: 'other';
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
  startDate: string;
  endDate: string;
  cost: number;
  photoUrls: string[];
  note?: string;
  createdAt: number;
  updatedAt: number;
}

export type DocumentInput = Omit<VehicleDocument, 'id' | 'createdAt' | 'updatedAt' | 'photoUrls'>;

export type DocumentStatus = 'active' | 'expiring' | 'expired';
