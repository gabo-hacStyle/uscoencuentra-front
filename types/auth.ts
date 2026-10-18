// Contrato con el backend Spring Boot (POST /auth/google).

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
  role: string; // valor del backend; se convierte a UserRole con normalizeRole()
}

/** Respuesta que DEVUELVE el backend. */
export interface BackendAuthResponse {
  accessToken: string;
  refreshToken: string;
  user: BackendUser;
}