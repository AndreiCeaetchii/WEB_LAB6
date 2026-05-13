import axios from 'axios';
import { useEffect, useState, type FormEvent } from 'react';
import toast from 'react-hot-toast';
import { Modal } from './Modal';
import { MultiPhotoUpload } from './MultiPhotoUpload';
import { useCarsStore } from '../stores/carsStore';
import { useDocumentsStore } from '../stores/documentsStore';
import { api } from '../lib/api';
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

interface UploadUrlResponse { uploadUrl: string; objectKey: string; pictureId: string; }

interface ApiDocumentDto {
  id: string; carId: string; kind: string; insurer: string; policyNumber: string;
  startDate: string; endDate: string; cost: number; note?: string | null;
  photoUrls: string[]; createdAt: string; updatedAt: string;
}

interface FormState {
  carId: string;
  insurer: string;
  policyNumber: string;
  startDate: string;
  endDate: string;
  cost: string;
  note: string;
  existingUrls: string[];
  newBlobs: Blob[];
}

const blankState = (defaultCarId = ''): FormState => ({
  carId: defaultCarId,
  insurer: '',
  policyNumber: '',
  startDate: todayISO(),
  endDate: '',
  cost: '',
  note: '',
  existingUrls: [],
  newBlobs: [],
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
    existingUrls: [...d.photoUrls],
    newBlobs: [],
  };
}

export function DocumentForm({ open, onClose, kind, document, defaultCarId }: DocumentFormProps) {
  const cars = useCarsStore((s) => s.cars);
  const add = useDocumentsStore((s) => s.add);
  const update = useDocumentsStore((s) => s.update);
  const removePhoto = useDocumentsStore((s) => s.removePhoto);
  const setDocument = useDocumentsStore((s) => s.setDocument);
  const [form, setForm] = useState<FormState>(() => blankState(defaultCarId));
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm(document ? fromDoc(document) : blankState(defaultCarId ?? cars[0]?.id ?? ''));
  }, [open, document, defaultCarId, cars]);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((s) => ({ ...s, [k]: v }));

  const handleExistingRemove = async (url: string) => {
    if (!document) return;
    try {
      await removePhoto(document.carId, document.id, url);
      setForm((s) => ({ ...s, existingUrls: s.existingUrls.filter((u) => u !== url) }));
    } catch {
      toast.error('Could not remove photo');
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.carId) { toast.error('Pick a car'); return; }
    if (!form.insurer.trim()) { toast.error('Insurer is required'); return; }
    if (!form.startDate || !form.endDate) { toast.error('Both dates are required'); return; }
    if (form.endDate < form.startDate) { toast.error('End date must be after start date'); return; }

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
      };
      const savedDoc = document ? await update(document.id, input) : await add(input);
      const docId = savedDoc?.id ?? document!.id;

      if (form.newBlobs.length > 0) {
        for (const blob of form.newBlobs) {
          const { data: urlData } = await api.post<UploadUrlResponse>(
            `/cars/${form.carId}/documents/${docId}/photos/upload-url`,
          );
          await axios.put(urlData.uploadUrl, blob, { headers: { 'Content-Type': 'image/webp' } });
        }
        const { data: fresh } = await api.get<ApiDocumentDto>(
          `/cars/${form.carId}/documents/${docId}`,
        );
        setDocument({
          id: fresh.id, carId: fresh.carId, kind: fresh.kind as DocumentKind,
          insurer: fresh.insurer, policyNumber: fresh.policyNumber,
          startDate: fresh.startDate, endDate: fresh.endDate, cost: fresh.cost,
          note: fresh.note ?? undefined, photoUrls: fresh.photoUrls,
          createdAt: new Date(fresh.createdAt).getTime(),
          updatedAt: new Date(fresh.updatedAt).getTime(),
        });
      }
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
          <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
          <button type="submit" form="document-form" disabled={submitting} className="btn-primary">
            {submitting ? 'Saving…' : document ? 'Save changes' : `Add ${KIND_TITLE[kind]}`}
          </button>
        </>
      }
    >
      <form id="document-form" onSubmit={handleSubmit} className="grid gap-4">
        <div className="grid gap-3 md:grid-cols-2">
          <label>
            <span className="label">Car</span>
            <select className="input" value={form.carId}
              onChange={(e) => set('carId', e.target.value)}>
              <option value="" disabled>Select a car</option>
              {cars.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.make} {c.model}{c.licensePlate ? ` — ${c.licensePlate}` : ''}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="label">Insurer</span>
            <input className="input" placeholder="MoldAsig, Donaris, ASITO…"
              value={form.insurer} onChange={(e) => set('insurer', e.target.value)} />
          </label>
          <label className="md:col-span-2">
            <span className="label">Policy number</span>
            <input className="input font-mono" placeholder="Optional"
              value={form.policyNumber} onChange={(e) => set('policyNumber', e.target.value)} />
          </label>
          <label>
            <span className="label">Start date</span>
            <input className="input" type="date" value={form.startDate}
              onChange={(e) => set('startDate', e.target.value)} />
          </label>
          <label>
            <span className="label">End date</span>
            <input className="input" type="date" value={form.endDate}
              onChange={(e) => set('endDate', e.target.value)} />
          </label>
          <label>
            <span className="label">Cost</span>
            <input className="input" type="number" step="0.01" min="0" placeholder="0"
              value={form.cost} onChange={(e) => set('cost', e.target.value)} />
          </label>
          <label>
            <span className="label">Note</span>
            <input className="input" placeholder="Optional"
              value={form.note} onChange={(e) => set('note', e.target.value)} />
          </label>
        </div>

        <MultiPhotoUpload
          existingUrls={form.existingUrls}
          newBlobs={form.newBlobs}
          onExistingRemove={handleExistingRemove}
          onNewBlobsChange={(blobs) => set('newBlobs', blobs)}
          label="Photos of the document"
          hint="Snap the policy front and back."
        />
      </form>
    </Modal>
  );
}
