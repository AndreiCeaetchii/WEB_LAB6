import type { Expense, FuelUnit } from './types';

export interface ApiExpenseDto {
  id: string;
  carId: string;
  category: string;
  date: string;
  cost: number;
  note?: string | null;
  fuelUnit?: string | null;
  fuelQuantity?: number | null;
  fuelUnitPrice?: number | null;
  odometerKm?: number | null;
  repairDescription?: string | null;
  mechanic?: string | null;
  partName?: string | null;
  partsQuantity?: number | null;
  nextDueDate?: string | null;
  otherDescription?: string | null;
  createdAt: string;
  updatedAt: string;
}

export function mapExpenseDto(dto: ApiExpenseDto): Expense {
  const base = {
    id: dto.id,
    carId: dto.carId,
    date: dto.date,
    cost: dto.cost,
    note: dto.note ?? undefined,
    createdAt: new Date(dto.createdAt).getTime(),
    updatedAt: new Date(dto.updatedAt).getTime(),
  };
  switch (dto.category) {
    case 'fuel':
      return {
        ...base,
        category: 'fuel',
        unit: (dto.fuelUnit ?? 'L') as FuelUnit,
        quantity: dto.fuelQuantity ?? 0,
        unitPrice: dto.fuelUnitPrice ?? 0,
        odometerKm: dto.odometerKm ?? undefined,
      };
    case 'repair':
      return {
        ...base,
        category: 'repair',
        description: dto.repairDescription ?? '',
        mechanic: dto.mechanic ?? undefined,
      };
    case 'parts':
      return {
        ...base,
        category: 'parts',
        partName: dto.partName ?? '',
        quantity: dto.partsQuantity ?? 0,
      };
    case 'inspection':
      return {
        ...base,
        category: 'inspection',
        nextDueDate: dto.nextDueDate ?? undefined,
      };
    default:
      return {
        ...base,
        category: 'other',
        description: dto.otherDescription ?? '',
      };
  }
}

export function mapExpenseToInput(expense: Expense): Omit<ApiExpenseDto, 'id' | 'carId' | 'createdAt' | 'updatedAt'> {
  return {
    category: expense.category,
    date: expense.date,
    cost: expense.cost,
    note: expense.note,
    fuelUnit: expense.category === 'fuel' ? expense.unit : undefined,
    fuelQuantity: expense.category === 'fuel' ? expense.quantity : undefined,
    fuelUnitPrice: expense.category === 'fuel' ? expense.unitPrice : undefined,
    odometerKm: expense.category === 'fuel' ? (expense.odometerKm ?? null) : undefined,
    repairDescription: expense.category === 'repair' ? expense.description : undefined,
    mechanic: expense.category === 'repair' ? (expense.mechanic ?? null) : undefined,
    partName: expense.category === 'parts' ? expense.partName : undefined,
    partsQuantity: expense.category === 'parts' ? expense.quantity : undefined,
    nextDueDate: expense.category === 'inspection' ? (expense.nextDueDate ?? null) : undefined,
    otherDescription: expense.category === 'other' ? expense.description : undefined,
  };
}
