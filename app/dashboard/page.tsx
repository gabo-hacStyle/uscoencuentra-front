import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { isMockBackendEnabled } from "@/services/auth.service";

export default async function DashboardPage() {
  // Segunda barrera: aunque proxy.ts ya protege esta ruta, la página también verifica.
  const session = await auth();
  if (!session?.user) redirect("/login");

  const fields = [
    { label: "Nombre", value: session.user.name },
    { label: "Correo", value: session.user.email },
    { label: "Rol", value: session.user.role },
  ];

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-4 py-10">
      <section className="rounded-[2rem] border border-usco-line bg-white p-8 shadow-[0_24px_60px_-20px_rgba(90,30,30,0.25)] sm:p-10">
        <BrandLogo />
        <h1 className="mt-10 text-4xl font-bold text-usco-ink">Bienvenido</h1>
        <p className="mt-2 text-usco-muted">Sesión autenticada correctamente.</p>

        {isMockBackendEnabled() && (
          <p className="mt-4 rounded-xl bg-usco-sand px-4 py-2 text-sm text-usco-ink">
            Modo dummy activo: nombre, correo y rol NO vienen del backend real.
          </p>
        )}

        <dl className="mt-8 grid gap-4 rounded-2xl bg-usco-sand p-6 sm:grid-cols-3">
          {fields.map(({ label, value }) => (
            <div key={label}>
              <dt className="text-sm text-usco-muted">{label}</dt>
              <dd className="mt-1 break-words font-semibold text-usco-ink">
                {value ?? "No disponible"}
              </dd>
            </div>
          ))}
        </dl>

        <div className="mt-8">
          <SignOutButton />
        </div>
      </section>
    </main>
  );
}