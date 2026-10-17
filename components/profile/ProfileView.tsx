import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PersonalData } from "@/components/profile/PersonalData";
import { PrivacyCard } from "@/components/profile/PrivacyCard";
import { UserAvatar } from "@/components/profile/UserAvatar";
import { ROLE_LABEL } from "@/lib/roles";
import { ProfileApiError, getProfile } from "@/services/profile.service";
import type { ProfileResponse } from "@/types/profile";

export async function ProfileView() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  // REAL(sesion de NextAuth): nombre, correo y rol vienen del backend por medio de POST /auth/google.
  // la foto de perfil viene de Google(token.picture → session.user.image).
  const name = session.user.name ?? "Sin nombre";
  const email = session.user.email ?? "";
  const roleLabel = ROLE_LABEL[session.user.role]; // "usuario" o "administrador".
  const photoUrl = session.user.image ?? null; 

  // El número viene de GET /profile (PROVISIONAL). Si falla, el resto del perfil sigue visible.
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

  return (
    <div className="space-y-6">
      {/* Sin overflow-hidden en la tarjeta: no puede recortar el avatar que sobresale del banner. */}
      <section
        aria-label="Datos de la cuenta"
        className="rounded-3xl border border-usco-line bg-white shadow-sm"
      >
        <div aria-hidden="true" className="h-24 rounded-t-3xl bg-usco-wine sm:h-32" />

        <div className="px-6 pb-8 sm:px-8">
            {/* Margen negativo + relative z-10: el avatar se pinta ENCIMA del banner. */}
            <UserAvatar
              name={name}
              photoUrl={photoUrl}
              className="relative z-10 -mt-14 size-28 shrink-0 sm:-mt-16 sm:size-32"  
          />

          <h2 className="mt-4 wrap-break-word text-2xl font-bold text-usco-ink">{name}</h2>
          <p className="mt-2">
            <span className="inline-block rounded-full bg-usco-sand px-3 py-1 text-sm font-semibold text-usco-wine">
              {roleLabel}
            </span>
          </p>

          <PersonalData
            name={name}
            email={email}
            role={roleLabel}
            numero={profile?.numero ?? null}
            loadError={loadError}
          />
        </div>
      </section>

      <PrivacyCard />
    </div>
  );
}