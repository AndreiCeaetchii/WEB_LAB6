import { PageHeader } from '../components/PageHeader';

export default function GaragePage() {
  return (
    <>
      <PageHeader
        title="Garage"
        description="Manage your family's vehicles. Add make, model, VIN, plates, and a registration photo."
      />
      <div className="card grid place-items-center p-12 text-center">
        <p className="max-w-md text-ink-muted">
          Cars CRUD ships in the next PR. This is the foundation pass — routing, theme, IndexedDB,
          and deploy are wired up so future features land cleanly.
        </p>
      </div>
    </>
  );
}
