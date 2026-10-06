import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { PersonalData } from "@/components/profile/PersonalData";
import { PrivacyCard } from "@/components/profile/PrivacyCard";
import { UserAvatar } from "@/components/profile/UserAvatar";
import { ProfileApiError, getProfile } from "@/services/profile.service";
import type { UserRole } from "@/types/auth";
import type { ProfileResponse } from "@/types/profile";

const BANNER_BY_ROLE: Record<UserRole, string> = {
  USER: "bg-usco-wine",
  ADMIN: "bg-usco-wine",
};

export async function ProfileView() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  // REAL: nombre, correo, rol y foto de Google vienen de la sesión (NextAuth + backend del login).
  const { role } = session.user;
  const name = session.user.name ?? "Sin nombre";
  const email = session.user.email ?? "";

  // Número y foto propia vienen de GET /profile (PROVISIONAL). Si falla, el resto del perfil sigue visible.
  let profile: ProfileResponse | null = null;
  let loadError: string | null = null;
  try {
    profile = await getProfile({ accessToken: session.accessToken ?? "", email });
  } catch (error) {
    console.error("[profile] No se pudo cargar el perfil:", error);
    loadError =
      error instanceof ProfileApiError && error.kind === "Unauthorized"
        ? "Tu sesión con el servidor expiró. Cierra sesión e ingresa de nuevo."
        : "No pudimos cargar tu número de contacto. Recarga la página en unos minutos.";
  }

  // Prioridad de foto: la del backend, luego la de Google, luego iniciales.
  const photoUrl = profile?.image ?? session.user.image ?? null;

  return (
    <div className="space-y-6">
      {/* Sin overflow-hidden en la tarjeta: no puede recortar el avatar que sobresale del banner. */}
      <section
        aria-label="Datos de la cuenta"
        className="rounded-3xl border border-usco-line bg-white shadow-sm"
      >
        <div aria-hidden="true" className={`h-24 rounded-t-3xl sm:h-32 ${BANNER_BY_ROLE[role]}`} />

        <div className="px-6 pb-8 sm:px-8">
          <div className="flex items-start justify-between gap-4">
            {/* Margen negativo + relative z-10: el avatar se pinta ENCIMA del banner. */}
            <UserAvatar
              name={name}
              photoUrl={photoUrl}
              className="relative z-10 -mt-14 size-28 shrink-0 sm:-mt-16 sm:size-32"
            />
            <div className="pt-4">
              <SignOutButton />
            </div>
          </div>

          <h2 className="mt-4 wrap-break-word text-2xl font-bold text-usco-ink">{name}</h2>
          <p className="mt-2">
            <span className="inline-block rounded-full bg-usco-sand px-3 py-1 text-sm font-semibold text-usco-wine">
              {role}
            </span>
          </p>

          <PersonalData
            name={name}
            email={email}
            role={role}
            numero={profile?.numero ?? null}
            loadError={loadError}
          />
        </div>
      </section>

      <PrivacyCard />
    </div>
  );
}