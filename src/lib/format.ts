const moneyFormatter = new Intl.NumberFormat('ro-MD', {
  style: 'currency',
  currency: 'MDL',
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat('ro-MD', {
  year: 'numeric',
  month: 'short',
  day: '2-digit',
});

const monthFormatter = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'short',
});

export function formatMoney(amount: number | undefined | null): string {
  if (amount === undefined || amount === null || Number.isNaN(amount)) return '—';
  return moneyFormatter.format(amount);
}

export function formatDate(iso: string | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return dateFormatter.format(d);
}

export function formatMonth(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return monthFormatter.format(d);
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}
