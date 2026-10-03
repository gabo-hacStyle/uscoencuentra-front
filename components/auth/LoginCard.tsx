import { BrandLogo } from "@/components/brand/BrandLogo";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";

type LoginCardProps = {
  errorMessage?: string | null;
};

export function LoginCard({ errorMessage }: LoginCardProps) {
  return (
    <section className="w-full max-w-2xl rounded-[2.5rem] border border-usco-line bg-white p-8 shadow-[0_24px_60px_-20px_rgba(90,30,30,0.25)] sm:p-12">
      <BrandLogo />

      <div className="mt-12">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-usco-wine">
            Comunidad universitaria
          </p>
          <h1 className="mt-4 text-4xl font-bold leading-tight text-usco-ink sm:text-5xl">
            Iniciar sesión
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-usco-muted">
            Ingresa con tu cuenta de Google institucional para reportar, buscar y recuperar
            objetos dentro de la comunidad USCO.
          </p>

          {errorMessage && (
            <div
              role="alert"
              className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
            >
              {errorMessage}
            </div>
          )}

          <div className="mt-8">
            <GoogleSignInButton />
          </div>
        </div>
      </div>

      <p className="mt-10 text-sm text-usco-muted">
        El acceso está reservado para cuentas Google con dominio @usco.edu.co
      </p>
    </section>
  );
}