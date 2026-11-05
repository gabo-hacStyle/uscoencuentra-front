/**
 * GET /profile --> ProfileResponse
 * PATCH /profile <-- UpdateProfileRequest, --> ProfileResponse
 * La fotografia no forma parte del contrato, es la de google(ssession.user.image).
*/
export interface ProfileResponse {
  numero: string | null; // E.164: "+573124567890". null = sin número registrado
  // true = autoriza que "numero" aparezca como "whatsapp" en el contacto privado de sus publicaciones.
  // false por defecto (preferencia nunca configurada).
  shareWhatsAppNumber: boolean;
}

/** Cuerpo de PATCH /profile: solo se envía el campo que cambia; el otro no se toca. */
export type UpdateProfileRequest =
  | { numero: string } // E.164: "+573124567890" (el frontend agrega el +57 antes de enviar)
  | { shareWhatsAppNumber: boolean };

/** Lo que la Server Action devuelve al modal. */
export type PhoneUpdateResult =
  | { ok: true; numero: string | null }
  | { ok: false; field: "numero" | "form"; error: string };

/** Lo que la Server Action devuelve a la sección "Privacidad y seguridad". */
export type ShareWhatsAppNumberResult =
  | { ok: true; shareWhatsAppNumber: boolean }
  | { ok: false; error: string };
