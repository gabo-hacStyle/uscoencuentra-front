import { Suspense } from "react";
import { Alert } from "@/components/profile/Alert";
import { ProfileView } from "@/components/profile/ProfileView";

type ProfilePageProps = {
  showForbiddenNotice?: boolean;
};

function ProfileSkeleton() {
  return (
    <div role="status" aria-live="polite" className="animate-pulse space-y-6">
      <span className="sr-only">Cargando perfil…</span>
      <div className="h-80 rounded-3xl bg-usco-sand/70" />
      <div className="h-40 rounded-3xl bg-usco-sand/50" />
    </div>
  );
}

export function ProfilePage({ showForbiddenNotice = false }: ProfilePageProps) {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <header className="mb-8">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-usco-wine">
          Cuenta institucional
        </p>
        <h1 className="mt-2 text-3xl font-bold text-usco-ink sm:text-4xl">Mi perfil</h1>
      </header>

      {showForbiddenNotice && (
        <Alert variant="error" className="mb-6">
          No tienes permisos para entrar a esa sección. Te llevamos a tu perfil.
        </Alert>
      )}

      {/* Mientras ProfileView consulta el perfil al backend se muestra el esqueleto. */}
      <Suspense fallback={<ProfileSkeleton />}>
        <ProfileView />
      </Suspense>
    </main>
  );
}