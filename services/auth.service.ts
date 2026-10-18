import type { BackendAuthResponse, GoogleLoginRequest } from "@/types/auth";

// TODO: reemplazar por URL real del backend (se define en .env.local).
export const API_URL = process.env.API_URL ?? "http://localhost:8080";
const GOOGLE_LOGIN_PATH = "/auth/google";

export type BackendAuthErrorCode =
  | "BackendRejected" // el backend respondió 401/403: no autoriza esta cuenta
  | "BackendUnavailable" // apagado, timeout, error 5xx...
  | "InvalidBackendResponse"; // respondió 200 pero con otra forma de JSON

export class BackendAuthError extends Error {
  constructor(
    public readonly code: BackendAuthErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "BackendAuthError";
  }
}

/** SOLO DESARROLLO: permite probar la interfaz sin backend. */
export function isMockBackendEnabled(): boolean {
  return (
    process.env.MOCK_BACKEND === "true" && process.env.NODE_ENV !== "production"
  );
}

function isBackendAuthResponse(value: unknown): value is BackendAuthResponse {
  if (typeof value !== "object" || value === null) return false;
  const data = value as Record<string, unknown>;
  const user = data.user as Record<string, unknown> | null | undefined;
  return (
    typeof data.accessToken === "string" &&
    typeof data.refreshToken === "string" &&
    typeof user === "object" &&
    user !== null &&
    typeof user.name === "string" &&
    typeof user.email === "string" &&
    typeof user.role === "string"
  );
}

/**
 * Envía el id_token de Google al backend y devuelve los tokens PROPIOS del backend.
 * Se ejecuta SOLO en el servidor de Next.js (no en el navegador):
 * por eso no hay problemas de CORS y API_URL no se expone al público.
 */
export async function exchangeGoogleIdToken(
  idToken: string,
): Promise<BackendAuthResponse> {
  if (isMockBackendEnabled()) {
    // DUMMY: respuesta inventada. Reemplaza al backend(por el momento).
    return {
      accessToken: "dummy-access-token",
      refreshToken: "dummy-refresh-token",
      user: {
        name: "Usuario de prueba (dummy)",
        email: "dummy@usco.edu.co",
        role: process.env.MOCK_ROLE ?? "USER", // "USER" o "ADMIN"; solo con MOCK_BACKEND=true
      },
    };
  }

  const body: GoogleLoginRequest = { idToken };

  let response: Response;
  try {
    response = await fetch(`${API_URL}${GOOGLE_LOGIN_PATH}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
      signal: AbortSignal.timeout(10_000), // no esperar eternamente
    });
  } catch {
    throw new BackendAuthError(
      "BackendUnavailable",
      `No se pudo conectar con ${API_URL}${GOOGLE_LOGIN_PATH}`,
    );
  }

  if (response.status === 401 || response.status === 403) {
    throw new BackendAuthError("BackendRejected", `El backend respondió ${response.status}`);
  }
  if (!response.ok) {
    throw new BackendAuthError("BackendUnavailable", `El backend respondió ${response.status}`);
  }

  const data: unknown = await response.json().catch(() => null);
  if (!isBackendAuthResponse(data)) {
    throw new BackendAuthError(
      "InvalidBackendResponse",
      "La respuesta del backend no tiene la forma esperada",
    );
  }
  return data;
}