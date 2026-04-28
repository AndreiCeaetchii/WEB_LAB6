import { PageHeader } from '../components/PageHeader';

export default function CarteaVerdePage() {
  return (
    <>
      <PageHeader
        title="Cartea Verde"
        description="International coverage cards — track which are active and which are about to expire."
      />
      <div className="card grid place-items-center p-12 text-center">
        <p className="max-w-md text-ink-muted">
          Cartea Verde management ships in the Documents PR.
        </p>
      </div>
    </>
  );
}
