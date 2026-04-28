import { PageHeader } from '../components/PageHeader';

export default function InsurancePage() {
  return (
    <>
      <PageHeader
        title="Insurance (RCA)"
        description="Active, expiring, and expired RCA policies for every car in your fleet — with photo gallery."
      />
      <div className="card grid place-items-center p-12 text-center">
        <p className="max-w-md text-ink-muted">
          Insurance management ships in the Documents PR.
        </p>
      </div>
    </>
  );
}
