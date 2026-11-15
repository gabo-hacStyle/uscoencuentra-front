import "server-only";

/**
 * Vigencia del accessToken del backend dentro de la sesión de Auth.js.
 *
 * La sesión del backend dura 30 días y no existe refresh ni revocación.
 * La cookie de Auth.js, en cambio, se renueva con el uso (ventana deslizante), así que podría
 * sobrevivir al token del backend. Por eso se guarda la fecha de vencimiento del token y la
 * sesión de Auth.js se cierra cuando llega (callback `jwt` de auth.ts).
 */

/** 30 días, en segundos (acuerdo de sesión del contrato). */
export const BACKEND_SESSION_MAX_AGE_SECONDS = 30 * 24 * 60 * 60;

function nowInSeconds(): number {
    return Math.floor(Date.now() / 1000);
}

/**
 * Lee el claim `exp` si el accessToken es un JWT. NO verifica la firma: solo sirve para no seguir
 * usando un token vencido; quien valida el token es el backend.
 */
function readJwtExpiration(accessToken: string): number | null {
    const parts = accessToken.split(".");
    if (parts.length !== 3) return null;
    try {
        const payload: unknown = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8"));
        if (typeof payload !== "object" || payload === null) return null;
        const exp = (payload as Record<string, unknown>).exp;
        return typeof exp === "number" && Number.isFinite(exp) ? exp : null;
    } catch {
        return null;
    }
}

/**
 * Momento (epoch en segundos) en que vence el accessToken recién emitido: su `exp` si es un JWT
 * con una fecha futura; si no, inicio de sesión + 30 días.
 */
export function computeBackendTokenExpiresAt(accessToken: string, now: number = nowInSeconds()): number {
    const exp = readJwtExpiration(accessToken);
    return exp !== null && exp > now ? exp : now + BACKEND_SESSION_MAX_AGE_SECONDS;
}

/**
 * Devuelve el accessToken guardado en el JWT de Auth.js si sigue vigente; si no, null.
 * Una sesión sin fecha de vencimiento (creada antes de este cambio) se considera vencida.
 */
export function readUsableBackendAccessToken(
    token: { accessToken?: unknown; backendTokenExpiresAt?: unknown },
    now: number = nowInSeconds(),
): string | null {
    const { accessToken, backendTokenExpiresAt } = token;
    if (typeof accessToken !== "string" || accessToken === "") return null;
    if (typeof backendTokenExpiresAt !== "number" || now >= backendTokenExpiresAt) return null;
    return accessToken;
}
