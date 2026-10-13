export function BrandLogo() {
  return (
    <div className="flex items-center gap-4">
      <div
        aria-hidden="true"
        className="flex h-14 w-14 items-center justify-center rounded-2xl bg-usco-wine text-2xl font-bold text-white"
      >
        U
      </div>
      <div>
        <p className="text-lg font-semibold leading-tight text-usco-ink">USCO Encuentra</p>
        <p className="text-[0.7rem] uppercase tracking-[0.2em] text-usco-muted">
          Universidad Surcolombiana
        </p>
      </div>
    </div>
  );
}