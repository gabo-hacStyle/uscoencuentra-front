import { isE164 } from "@/lib/phone";
import { profilesMock } from "@/mocks/profiles.mock";
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

/**
 * Único lugar que traduce el JSON del backend. Si los campos se llaman distinto, se cambia AQUÍ.
 * `requireShareWhatsAppNumber`: tras guardar la preferencia, la respuesta debe confirmarla
 * explícitamente; si no la trae, no se presenta como guardada.
 */
function parseProfile(data: unknown, requireShareWhatsAppNumber = false): ProfileResponse | null {
  if (typeof data !== "object" || data === null) return null;
  const d = data as Record<string, unknown>;
  if (d.numero != null && typeof d.numero !== "string") return null;
  if (d.shareWhatsAppNumber != null && typeof d.shareWhatsAppNumber !== "boolean") return null;
  if (requireShareWhatsAppNumber && typeof d.shareWhatsAppNumber !== "boolean") return null;

  const numero = typeof d.numero === "string" && d.numero.trim() !== "" ? d.numero.trim() : null;
  if (numero !== null && !isE164(numero)) {
    // BACKEND: debe responder siempre en E.164. No se imprime el valor (es un dato personal).
    console.warn('[profile] El backend devolvió "numero" fuera de formato E.164 (+57XXXXXXXXXX).');
  }
  if (d.shareWhatsAppNumber == null) {
    // BACKEND: el campo es obligatorio. Sin él se usa el valor por defecto (no compartir).
    console.warn('[profile] El backend no envió "shareWhatsAppNumber"; se usa false.');
  }
  return { numero, shareWhatsAppNumber: d.shareWhatsAppNumber === true };
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
  const profile = parseProfile(data, body !== undefined && "shareWhatsAppNumber" in body);
  if (!profile) throw new ProfileApiError("InvalidResponse", "Respuesta del backend con forma inesperada");
  return profile;
}

// DATOS DUMMY (solo con MOCK_BACKEND=true): perfiles (numero + shareWhatsAppNumber) en memoria del
// servidor, por correo, partiendo de mocks/profiles.mock.ts. Se pierden al reiniciar `npm run dev`.
const globalForMock = globalThis as unknown as { __uscoMockProfiles?: Map<string, ProfileResponse> };
const mockProfiles = (globalForMock.__uscoMockProfiles ??= new Map(
  Object.entries(profilesMock).map(([email, profile]) => [email, { ...profile }]),
));

// Perfil que nunca se ha configurado: sin número y sin permiso.
const DEFAULT_PROFILE: ProfileResponse = { numero: null, shareWhatsAppNumber: false };

function readMockProfile(email: string): ProfileResponse {
  return { ...(mockProfiles.get(email) ?? DEFAULT_PROFILE) };
}

/** Igual que PATCH /profile: solo cambia el campo enviado; el otro se conserva. */
function patchMockProfile(email: string, changes: UpdateProfileRequest): ProfileResponse {
  const updated = { ...readMockProfile(email), ...changes };
  mockProfiles.set(email, updated);
  return { ...updated };
}

export async function getProfile(ctx: ProfileContext): Promise<ProfileResponse> {
  if (isMockBackendEnabled()) return readMockProfile(ctx.email);
  return requestProfile("GET", ctx.accessToken);
}

export async function updatePhone(ctx: ProfileContext, numero: string): Promise<ProfileResponse> {
  if (isMockBackendEnabled()) return patchMockProfile(ctx.email, { numero });
  return requestProfile("PATCH", ctx.accessToken, { numero });
}

/** PATCH /profile { shareWhatsAppNumber }: no envía ni modifica "numero". */
export async function updateShareWhatsAppNumber(
  ctx: ProfileContext,
  shareWhatsAppNumber: boolean,
): Promise<ProfileResponse> {
  if (isMockBackendEnabled()) return patchMockProfile(ctx.email, { shareWhatsAppNumber });
  return requestProfile("PATCH", ctx.accessToken, { shareWhatsAppNumber });
}

/**
 * SOLO MODO DUMMY: valor de "whatsapp" del contacto privado para el AUTOR de una publicación,
 * con la misma regla que debe aplicar GET /items/:id/contact en el backend:
 * su "numero" si lo registró y shareWhatsAppNumber es true; si no, null.
 */
export function getMockAuthorWhatsApp(authorEmail: string): string | null {
  const { numero, shareWhatsAppNumber } = readMockProfile(authorEmail);
  return shareWhatsAppNumber && numero ? numero : null;
}