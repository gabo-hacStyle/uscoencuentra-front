/** Respuesta de GET /profile y PATCH /profile (solo lo que usa el frontend). */
export interface ProfileResponse {
  numero: string | null; // null = sin número registrado
  image: string | null; // URL de la foto propia; null = usar la de Google o iniciales
}

/** Cuerpo de PATCH /profile. */
export interface UpdateProfileRequest {
  numero: string; // 10 dígitos, sin +57
}

/** Lo que la Server Action devuelve al modal. */
export type PhoneUpdateResult =
  | { ok: true; numero: string | null }
  | { ok: false; field: "numero" | "form"; error: string };