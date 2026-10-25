/**
 * GET /profile --> ProfileResponse
 * PATCH /profile <-- UpdateProfileRequest, --> ProfileResponse
 * La fotografia no forma parte del contrato, es la de google(ssession.user.image).
*/
export interface ProfileResponse {
  numero: string | null; // E.164: "+573124567890". null = sin número registrado
}

/** Cuerpo de PATCH /profile. */
export interface UpdateProfileRequest {
  numero: string; // E.164: "+573124567890" (el frontend agrega el +57 antes de enviar)
}

/** Lo que la Server Action devuelve al modal. */
export type PhoneUpdateResult =
  | { ok: true; numero: string | null }
  | { ok: false; field: "numero" | "form"; error: string };