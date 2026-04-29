import { useEffect, useState, type FormEvent } from 'react';
import toast from 'react-hot-toast';
import { Modal } from './Modal';
import { PhotoUpload } from './PhotoUpload';
import { useCarsStore } from '../stores/carsStore';
import type { Car, CarInput } from '../lib/types';

interface CarFormProps {
  open: boolean;
  onClose: () => void;
  /** when provided, form is in edit mode */
  car?: Car;
}

const CURRENT_YEAR = new Date().getFullYear();
const EARLIEST_YEAR = 1950;

interface FormState {
  make: string;
  model: string;
  year: string;
  vin: string;
  licensePlate: string;
  isElectric: boolean;
  photo?: Blob;
}

const initialState: FormState = {
  make: '',
  model: '',
  year: String(CURRENT_YEAR),
  vin: '',
  licensePlate: '',
  isElectric: false,
};

function fromCar(car: Car): FormState {
  return {
    make: car.make,
    model: car.model,
    year: String(car.year),
    vin: car.vin,
    licensePlate: car.licensePlate,
    isElectric: car.isElectric,
    photo: car.photo,
  };
}

export function CarForm({ open, onClose, car }: CarFormProps) {
  const add = useCarsStore((s) => s.add);
  const update = useCarsStore((s) => s.update);
  const [form, setForm] = useState<FormState>(initialState);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm(car ? fromCar(car) : initialState);
    }
  }, [open, car]);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((s) => ({ ...s, [k]: v }));

  const validate = (): string | null => {
    if (!form.make.trim()) return 'Make is required';
    if (!form.model.trim()) return 'Model is required';
    const year = Number(form.year);
    if (!Number.isFinite(year) || year < EARLIEST_YEAR || year > CURRENT_YEAR + 1) {
      return `Year must be between ${EARLIEST_YEAR} and ${CURRENT_YEAR + 1}`;
    }
    if (form.vin && form.vin.trim().length < 5) return 'VIN looks too short';
    return null;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) {
      toast.error(err);
      return;
    }
    const input: CarInput = {
      make: form.make,
      model: form.model,
      year: Number(form.year),
      vin: form.vin,
      licensePlate: form.licensePlate,
      isElectric: form.isElectric,
      photo: form.photo,
    };
    setSubmitting(true);
    try {
      if (car) await update(car.id, input);
      else await add(input);
      onClose();
    } catch (e) {
      console.error(e);
      toast.error('Could not save the car');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={car ? 'Edit car' : 'Add a car'}
      description={
        car
          ? 'Update your vehicle’s details.'
          : 'A unique accent color is auto-assigned so the dashboard donut stays readable.'
      }
      footer={
        <>
          <button type="button" onClick={onClose} className="btn-ghost">
            Cancel
          </button>
          <button
            type="submit"
            form="car-form"
            disabled={submitting}
            className="btn-primary"
          >
            {submitting ? 'Saving…' : car ? 'Save changes' : 'Add car'}
          </button>
        </>
      }
    >
      <form id="car-form" onSubmit={handleSubmit} className="grid gap-4">
        <PhotoUpload
          label="Registration document photo"
          hint="Optional — handy if you ever need to show proof of registration."
          value={form.photo}
          onChange={(blob) => set('photo', blob)}
        />

        <div className="grid grid-cols-2 gap-3">
          <label>
            <span className="label">Make</span>
            <input
              className="input"
              placeholder="Toyota"
              value={form.make}
              onChange={(e) => set('make', e.target.value)}
              autoFocus
            />
          </label>
          <label>
            <span className="label">Model</span>
            <input
              className="input"
              placeholder="Corolla"
              value={form.model}
              onChange={(e) => set('model', e.target.value)}
            />
          </label>
          <label>
            <span className="label">Year</span>
            <input
              className="input"
              type="number"
              min={EARLIEST_YEAR}
              max={CURRENT_YEAR + 1}
              value={form.year}
              onChange={(e) => set('year', e.target.value)}
            />
          </label>
          <label>
            <span className="label">License plate</span>
            <input
              className="input"
              placeholder="ABC 123"
              value={form.licensePlate}
              onChange={(e) => set('licensePlate', e.target.value)}
            />
          </label>
        </div>

        <label>
          <span className="label">VIN</span>
          <input
            className="input font-mono"
            placeholder="17-character VIN"
            value={form.vin}
            onChange={(e) => set('vin', e.target.value)}
            maxLength={32}
          />
        </label>

        <div>
          <span className="label">Powertrain</span>
          <div role="tablist" className="grid grid-cols-2 gap-2">
            {([
              { id: false, label: 'Combustion', icon: '⛽', hint: 'Petrol / diesel / hybrid' },
              { id: true, label: 'Electric', icon: '⚡', hint: 'Battery EV — charged in kWh' },
            ] as const).map((opt) => {
              const active = form.isElectric === opt.id;
              return (
                <button
                  type="button"
                  key={String(opt.id)}
                  role="tab"
                  aria-selected={active}
                  onClick={() => set('isElectric', opt.id)}
                  className={`flex items-center gap-2 rounded-xl border px-3 py-3 text-left text-sm transition-colors ${
                    active
                      ? 'border-brand bg-brand/10 text-brand'
                      : 'border-border bg-surface-muted text-ink-muted hover:border-brand/40'
                  }`}
                >
                  <span aria-hidden className="text-lg">
                    {opt.icon}
                  </span>
                  <span className="flex flex-col">
                    <span className="font-medium">{opt.label}</span>
                    <span className="text-xs text-ink-subtle">{opt.hint}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </form>
    </Modal>
  );
}
