import { useEffect, useState, type FormEvent } from 'react';
import toast from 'react-hot-toast';
import { Modal } from './Modal';
import { MultiPhotoUpload } from './MultiPhotoUpload';
import { useCarsStore } from '../stores/carsStore';
import { useDocumentsStore } from '../stores/documentsStore';
import { todayISO } from '../lib/format';
import type { DocumentKind, ID, VehicleDocument } from '../lib/types';

interface DocumentFormProps {
  open: boolean;
  onClose: () => void;
  kind: DocumentKind;
  document?: VehicleDocument;
  defaultCarId?: ID;
}

const KIND_TITLE: Record<DocumentKind, string> = {
  rca: 'RCA insurance',
  'cartea-verde': 'Cartea Verde',
};

interface FormState {
  carId: string;
  insurer: string;
  policyNumber: string;
  startDate: string;
  endDate: string;
  cost: string;
  note: string;
  photos: Blob[];
}

const blankState = (defaultCarId: string = ''): FormState => ({
  carId: defaultCarId,
  insurer: '',
  policyNumber: '',
  startDate: todayISO(),
  endDate: '',
  cost: '',
  note: '',
  photos: [],
});

function fromDoc(d: VehicleDocument): FormState {
  return {
    carId: d.carId,
    insurer: d.insurer,
    policyNumber: d.policyNumber,
    startDate: d.startDate,
    endDate: d.endDate,
    cost: String(d.cost),
    note: d.note ?? '',
    photos: [...d.photos],
  };
}

export function DocumentForm({
  open,
  onClose,
  kind,
  document,
  defaultCarId,
}: DocumentFormProps) {
  const cars = useCarsStore((s) => s.cars);
  const add = useDocumentsStore((s) => s.add);
  const update = useDocumentsStore((s) => s.update);
  const [form, setForm] = useState<FormState>(() => blankState(defaultCarId));
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setForm(document ? fromDoc(document) : blankState(defaultCarId ?? cars[0]?.id ?? ''));
  }, [open, document, defaultCarId, cars]);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((s) => ({ ...s, [k]: v }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.carId) {
      toast.error('Pick a car');
      return;
    }
    if (!form.insurer.trim()) {
      toast.error('Insurer is required');
      return;
    }
    if (!form.startDate || !form.endDate) {
      toast.error('Both start and end dates are required');
      return;
    }
    if (form.endDate < form.startDate) {
      toast.error('End date must be after start date');
      return;
    }

    setSubmitting(true);
    try {
      const input = {
        carId: form.carId,
        kind,
        insurer: form.insurer.trim(),
        policyNumber: form.policyNumber.trim(),
        startDate: form.startDate,
        endDate: form.endDate,
        cost: Number(form.cost) || 0,
        note: form.note.trim() || undefined,
        photos: form.photos,
      };
      if (document) await update(document.id, input);
      else await add(input);
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('Could not save the document');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={document ? `Edit ${KIND_TITLE[kind]}` : `Add ${KIND_TITLE[kind]}`}
      description={
        kind === 'rca'
          ? 'Local liability insurance — track validity and keep photos handy for traffic stops.'
          : 'International coverage — useful for travel; track when it lapses.'
      }
      width="max-w-2xl"
      footer={
        <>
          <button type="button" onClick={onClose} className="btn-ghost">
            Cancel
          </button>
          <button
            type="submit"
            form="document-form"
            disabled={submitting}
            className="btn-primary"
          >
            {submitting ? 'Saving…' : document ? 'Save changes' : `Add ${KIND_TITLE[kind]}`}
          </button>
        </>
      }
    >
      <form id="document-form" onSubmit={handleSubmit} className="grid gap-4">
        <div className="grid gap-3 md:grid-cols-2">
          <label>
            <span className="label">Car</span>
            <select
              className="input"
              value={form.carId}
              onChange={(e) => set('carId', e.target.value)}
            >
              <option value="" disabled>
                Select a car
              </option>
              {cars.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.make} {c.model}
                  {c.licensePlate ? ` — ${c.licensePlate}` : ''}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="label">Insurer</span>
            <input
              className="input"
              placeholder="MoldAsig, Donaris, ASITO…"
              value={form.insurer}
              onChange={(e) => set('insurer', e.target.value)}
            />
          </label>
          <label className="md:col-span-2">
            <span className="label">Policy number</span>
            <input
              className="input font-mono"
              placeholder="Optional"
              value={form.policyNumber}
              onChange={(e) => set('policyNumber', e.target.value)}
            />
          </label>
          <label>
            <span className="label">Start date</span>
            <input
              className="input"
              type="date"
              value={form.startDate}
              onChange={(e) => set('startDate', e.target.value)}
            />
          </label>
          <label>
            <span className="label">End date</span>
            <input
              className="input"
              type="date"
              value={form.endDate}
              onChange={(e) => set('endDate', e.target.value)}
            />
          </label>
          <label>
            <span className="label">Cost</span>
            <input
              className="input"
              type="number"
              step="0.01"
              min="0"
              placeholder="0"
              value={form.cost}
              onChange={(e) => set('cost', e.target.value)}
            />
          </label>
          <label>
            <span className="label">Note</span>
            <input
              className="input"
              placeholder="Optional"
              value={form.note}
              onChange={(e) => set('note', e.target.value)}
            />
          </label>
        </div>

        <MultiPhotoUpload
          value={form.photos}
          onChange={(blobs) => set('photos', blobs)}
          label="Photos of the document"
          hint="Snap the policy front and back. They’re stored in your browser only."
        />
      </form>
    </Modal>
  );
}
