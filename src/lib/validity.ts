import type { DocumentStatus, VehicleDocument } from './types';

export const EXPIRING_WINDOW_DAYS = 30;

const MS_PER_DAY = 1000 * 60 * 60 * 24;

function startOfDay(d: Date): Date {
  const out = new Date(d);
  out.setHours(0, 0, 0, 0);
  return out;
}

export function daysUntil(iso: string, now: Date = new Date()): number {
  const end = startOfDay(new Date(iso));
  const today = startOfDay(now);
  if (Number.isNaN(end.getTime())) return Infinity;
  return Math.round((end.getTime() - today.getTime()) / MS_PER_DAY);
}

export function getStatus(
  endDate: string,
  windowDays = EXPIRING_WINDOW_DAYS,
  now: Date = new Date(),
): DocumentStatus {
  const days = daysUntil(endDate, now);
  if (days < 0) return 'expired';
  if (days <= windowDays) return 'expiring';
  return 'active';
}

export function statusLabel(status: DocumentStatus): string {
  switch (status) {
    case 'active':
      return 'Active';
    case 'expiring':
      return 'Expiring soon';
    case 'expired':
      return 'Expired';
  }
}

export type StatusToken = 'success' | 'warn' | 'danger';

export function statusToken(status: DocumentStatus): StatusToken {
  switch (status) {
    case 'active':
      return 'success';
    case 'expiring':
      return 'warn';
    case 'expired':
      return 'danger';
  }
}

export function isExpiringWithin(
  doc: VehicleDocument,
  windowDays: number,
  now: Date = new Date(),
): boolean {
  const days = daysUntil(doc.endDate, now);
  return days >= 0 && days <= windowDays;
}
