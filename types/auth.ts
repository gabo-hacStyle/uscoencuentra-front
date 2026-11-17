// Contrato con el backend: POST /api/auth/google.

//Tipo de rol que entiende el fronted
export type UserRole = "USER" | "ADMIN";

/** Cuerpo que ENVIAMOS al backend. */
export interface GoogleLoginRequest {
  idToken: string;
}

/** Usuario que DEVUELVE el backend. */
export interface BackendUser {
  name: string;
  email: string;
  role: string; // valor del backend ("USER" | "ADMIN"); se convierte a UserRole con normalizeRole()
}

/** Respuesta que DEVUELVE el backend. */
export interface BackendAuthResponse {
  accessToken: string;
  /**
   * El backend lo envía, pero el contrato no ofrece refresh ni revocación:
   * el frontend no lo usa ni lo guarda en la sesión.
   */
  refreshToken?: string;
  user: BackendUser;
}
