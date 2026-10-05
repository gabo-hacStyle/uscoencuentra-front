"use server"; // esta función se ejecuta en el SERVIDOR aunque el modal (navegador) la llame

import { auth } from "@/auth";
import { isColombianMobileE164 } from "@/lib/phone";
import { ProfileApiError, updatePhone } from "@/services/profile.service";
import type { PhoneUpdateResult } from "@/types/profile";

export async function updatePhoneAction(rawNumero: string): Promise<PhoneUpdateResult> {
  // Una Server Action es un endpoint público: siempre se comprueba la sesión aquí dentro.
  const session = await auth();
  if (!session?.user?.email || !session.accessToken) {
    return { ok: false, field: "form", error: "Tu sesión no es válida. Cierra sesión e ingresa de nuevo." };
  }

  // El modal ya normalizó a E.164; aquí se vuelve a comprobar: el cliente nunca es la autoridad.
  const numero = String(rawNumero).trim();
  if (!isColombianMobileE164(numero)) {
    return { ok: false, field: "numero", error: "El número no tiene un formato válido. Revísalo e inténtalo de nuevo." };
  }

  try {
    const updated = await updatePhone(
      { accessToken: session.accessToken, email: session.user.email },
      numero,
    );
    return { ok: true, numero: updated.numero };
  } catch (error) {
    if (error instanceof ProfileApiError) {
      if (error.kind === "Validation") return { ok: false, field: "numero", error: error.message };
      if (error.kind === "Unauthorized") {
        return { ok: false, field: "form", error: "Tu sesión con el servidor expiró. Cierra sesión e ingresa de nuevo." };
      }
      if (error.kind === "Forbidden") {
        return { ok: false, field: "form", error: "No tienes permiso para actualizar este dato." };
      }
    }
    console.error("[profile] Error al actualizar el número:", error);
    return { ok: false, field: "form", error: "No pudimos guardar tus cambios. Inténtalo de nuevo en unos minutos." };
  }
}