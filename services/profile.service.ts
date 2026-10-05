import { isE164 } from "@/lib/phone";
import { API_URL, isMockBackendEnabled } from "@/services/auth.service";
import type { ProfileResponse, UpdateProfileRequest } from "@/types/profile";

const PROFILE_PATH = "/profile";

export type ProfileApiErrorKind =
  | "Unauthorized" // 401
  | "Forbidden" // 403
  | "Validation" // 400 / 422
  | "Unavailable" // sin conexión, timeout, 404, 5xx
  | "InvalidResponse"; // 2xx con JSON de forma inesperada

export class ProfileApiError extends Error {
  constructor(
    public readonly kind: ProfileApiErrorKind,
    message: string,
  ) {
    super(message);
    this.name = "ProfileApiError";
  }
}

/** "email" solo lo usa el modo dummy. Se quita cuando ya no exista el mock. */
export type ProfileContext = { accessToken: string; email: string };

/** Único lugar que traduce el JSON del backend. Si los campos se llaman distinto, se cambia AQUÍ. */
function parseProfile(data: unknown): ProfileResponse | null {
  if (typeof data !== "object" || data === null) return null;
  const d = data as Record<string, unknown>;
  if (d.numero != null && typeof d.numero !== "string") return null;

  const numero = typeof d.numero === "string" && d.numero.trim() !== "" ? d.numero.trim() : null;
  if (numero !== null && !isE164(numero)) {
    // BACKEND: debe responder siempre en E.164. No se imprime el valor (es un dato personal).
    console.warn('[profile] El backend devolvió "numero" fuera de formato E.164 (+57XXXXXXXXXX).');
  }

  return {
    numero,
    image: typeof d.image === "string" && d.image !== "" ? d.image : null,
  };
}

/** Petición autenticada al backend. Solo corre en el servidor (el token no pasa por el navegador). */
async function requestProfile(
  method: "GET" | "PATCH",
  accessToken: string,
  body?: UpdateProfileRequest,
): Promise<ProfileResponse> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}${PROFILE_PATH}`, {
      method,
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
  } catch {
    throw new ProfileApiError("Unavailable", `No se pudo conectar con ${API_URL}${PROFILE_PATH}`);
  }

  if (response.status === 401) throw new ProfileApiError("Unauthorized", "El backend respondió 401");
  if (response.status === 403) throw new ProfileApiError("Forbidden", "El backend respondió 403");
  if (response.status === 400 || response.status === 422) {
    const error = (await response.json().catch(() => null)) as { message?: unknown } | null;
    throw new ProfileApiError(
      "Validation",
      typeof error?.message === "string" ? error.message : "El servidor no aceptó el número ingresado.",
    );
  }
  if (!response.ok) throw new ProfileApiError("Unavailable", `El backend respondió ${response.status}`);

  const data: unknown = await response.json().catch(() => null);
  const profile = parseProfile(data);
  if (!profile) throw new ProfileApiError("InvalidResponse", "Respuesta del backend con forma inesperada");
  return profile;
}

// DATOS DUMMY (solo con MOCK_BACKEND=true): guarda el número en memoria del servidor,
// se pierde al reiniciar `npm run dev`.
const globalForMock = globalThis as unknown as { __uscoMockNumbers?: Map<string, string> };
const mockNumbers = (globalForMock.__uscoMockNumbers ??= new Map<string, string>());

export async function getProfile(ctx: ProfileContext): Promise<ProfileResponse> {
  if (isMockBackendEnabled()) return { numero: mockNumbers.get(ctx.email) ?? null, image: null };
  return requestProfile("GET", ctx.accessToken);
}

export async function updatePhone(ctx: ProfileContext, numero: string): Promise<ProfileResponse> {
  if (isMockBackendEnabled()) {
    mockNumbers.set(ctx.email, numero);
    return { numero, image: null };
  }
  return requestProfile("PATCH", ctx.accessToken, { numero });
}