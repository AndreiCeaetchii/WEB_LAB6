import { CarForm } from './CarForm';
import { ExpenseForm } from './ExpenseForm';
import { DocumentForm } from './DocumentForm';
import { useUIStore } from '../stores/uiStore';

export function QuickAddForms() {
  const quick = useUIStore((s) => s.quick);
  const close = useUIStore((s) => s.close);

  return (
    <>
      <CarForm open={quick.type === 'car'} onClose={close} />
      <ExpenseForm open={quick.type === 'expense'} onClose={close} />
      <DocumentForm
        open={quick.type === 'document'}
        kind={quick.type === 'document' ? quick.kind : 'rca'}
        onClose={close}
      />
    </>
  );
}
