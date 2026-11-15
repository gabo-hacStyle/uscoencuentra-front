import type { BackendAuthResponse, GoogleLoginRequest } from "@/types/auth";
import { BackendNetworkError, backendFetch } from "@/lib/backend/client";
import { isMockBackendEnabled, resolveApiBaseUrl } from "@/lib/backend/config";

// Contrato: POST /api/auth/google (sin Bearer). El prefijo /api lo agrega lib/backend/config.ts.
const GOOGLE_LOGIN_PATH = "/auth/google";

const LOGIN_TIMEOUT_MS = 10_000;

// ---------- Re-exportaciones de compatibilidad ----------
// Otros módulos (p. ej. services/contact.service.ts) aún importan estos valores desde aquí.

/**
 * Host del backend, SIN el prefijo /api.
 * @deprecated Usar `backendFetch()` de "@/lib/backend/client" (agrega /api, Bearer y timeout)
 * o `backendUrl()` de "@/lib/backend/config". Concatenar API_URL + ruta omite el prefijo /api.
 */
export const API_URL: string = resolveApiBaseUrl();

/** Re-exportado por compatibilidad: la fuente es "@/lib/backend/config". */
export { isMockBackendEnabled };

// ---------- Errores ----------

export type BackendAuthErrorCode =
  | "BackendRejected" // 400/401/403/422: el backend no autoriza esta cuenta o este id_token
  | "BackendMisconfigured" // 404: la ruta no existe (URL base o prefijo /api mal configurados)
  | "BackendUnavailable" // sin respuesta, timeout o 5xx
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

/** Solo se exige lo que el frontend usa. `refreshToken` llega, pero el contrato no permite usarlo. */
function isBackendAuthResponse(value: unknown): value is BackendAuthResponse {
  if (typeof value !== "object" || value === null) return false;
  const data = value as Record<string, unknown>;
  const user = data.user as Record<string, unknown> | null | undefined;
  return (
    typeof data.accessToken === "string" &&
    data.accessToken !== "" &&
    typeof user === "object" &&
    user !== null &&
    typeof user.name === "string" &&
    typeof user.email === "string" &&
    typeof user.role === "string"
  );
}

/**
 * Envía el id_token de Google al backend y devuelve los datos de sesión PROPIOS del backend.
 * Se ejecuta SOLO en el servidor de Next.js (callback signIn de auth.ts).
 */
export async function exchangeGoogleIdToken(
  idToken: string,
): Promise<BackendAuthResponse> {
  if (isMockBackendEnabled()) {
    // DUMMY (solo desarrollo): respuesta inventada que reemplaza al backend.
    return {
      accessToken: "dummy-access-token",
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
    response = await backendFetch(GOOGLE_LOGIN_PATH, {
      method: "POST",
      json: body,
      timeoutMs: LOGIN_TIMEOUT_MS,
    });
  } catch (error) {
    if (error instanceof BackendNetworkError) {
      throw new BackendAuthError("BackendUnavailable", error.message);
    }
    throw error;
  }

  // Con un id_token enviado, un 4xx de validación significa que el backend no acepta esta cuenta
  // (dominio usco.edu.co, claim hd, correo no verificado, audiencia...).
  if ([400, 401, 403, 422].includes(response.status)) {
    throw new BackendAuthError("BackendRejected", `El backend respondió ${response.status}`);
  }
  if (response.status === 404) {
    throw new BackendAuthError(
      "BackendMisconfigured",
      `El backend respondió 404 en ${GOOGLE_LOGIN_PATH}: revisar API_URL y el prefijo /api`,
    );
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
