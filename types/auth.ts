// Contrato con el backend Spring Boot (POST /auth/google).
// TODO: confirmar con backend los nombres exactos de campos (¿hay más? ¿id de usuario, expiresIn?).

/** Cuerpo que ENVIAMOS al backend. */
export interface GoogleLoginRequest {
  idToken: string;
}

/** Usuario que DEVUELVE el backend. */
export interface BackendUser {
  name: string;
  email: string;
  role: string; // TODO: confirmar valores posibles con backend (ej. "STUDENT", "ADMIN")
}

/** Respuesta que DEVUELVE el backend. */
export interface BackendAuthResponse {
  accessToken: string;
  refreshToken: string;
  user: BackendUser;
}