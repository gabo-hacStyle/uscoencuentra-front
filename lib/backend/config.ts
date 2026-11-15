import "server-only";

/**
 * Configuración COMPARTIDA de la conexión con el backend (todos los módulos del equipo).
 *
 * - `API_URL` (.env): SOLO el host del backend, sin "/api" ni barra final.
 *   Ej.: https://usco-encuentra-back-63bc0491defc.herokuapp.com
 * - `MOCK_BACKEND=true` (.env): interruptor ÚNICO de datos simulados para todos los módulos.
 *   Nunca aplica en producción.
 */

export const API_PREFIX = "/api";

/** Timeout por defecto de cada petición al backend. */
export const BACKEND_TIMEOUT_MS = 10_000;

/** Solo desarrollo: host usado cuando API_URL no está definida. */
const DEV_FALLBACK_API_URL = "http://localhost:8080";

/** Quita espacios, barras finales y un "/api" final puesto por error (el prefijo lo agrega el código). */
function normalizeBaseUrl(raw: string): string {
    const withoutSlash = raw.trim().replace(/\/+$/, "");
    if (withoutSlash.endsWith(API_PREFIX)) {
        console.warn(`[backend] API_URL no debe terminar en "${API_PREFIX}": el prefijo se agrega en lib/backend/config.ts.`);
        return withoutSlash.slice(0, -API_PREFIX.length);
    }
    return withoutSlash;
}

const configuredApiUrl: string | null = process.env.API_URL?.trim() ? normalizeBaseUrl(process.env.API_URL) : null;

/**
 * Host del backend sin lanzar errores (sirve para valores que se calculan al cargar un módulo,
 * incluso durante `next build`). Devuelve el host de desarrollo si API_URL no está definida.
 */
export function resolveApiBaseUrl(): string {
    return configuredApiUrl ?? DEV_FALLBACK_API_URL;
}

/**
 * Host del backend para hacer peticiones. En producción, si falta API_URL, falla de forma
 * explícita en vez de llamar en silencio a localhost.
 */
export function getApiBaseUrl(): string {
    if (configuredApiUrl) return configuredApiUrl;
    if (process.env.NODE_ENV === "production") {
        throw new Error("[backend] Falta la variable de entorno API_URL (host del backend, sin /api).");
    }
    return DEV_FALLBACK_API_URL;
}

/**
 * URL absoluta de una ruta del contrato: host + "/api" + ruta (+ query).
 * `path` empieza por "/" y NO incluye el prefijo: backendUrl("/admin/filters").
 */
export function backendUrl(path: string, query?: string | URLSearchParams): string {
    if (!path.startsWith("/")) {
        throw new Error(`[backend] La ruta "${path}" debe empezar por "/".`);
    }
    if (path === API_PREFIX || path.startsWith(`${API_PREFIX}/`)) {
        throw new Error(`[backend] La ruta "${path}" no debe incluir "${API_PREFIX}": backendUrl() ya lo agrega.`);
    }
    const queryString = query === undefined ? "" : query.toString();
    return `${getApiBaseUrl()}${API_PREFIX}${path}${queryString ? `?${queryString}` : ""}`;
}

/**
 * SOLO DESARROLLO: `MOCK_BACKEND=true` reemplaza al backend por datos simulados en todos los
 * módulos (login dummy, perfil, contacto, administración...).
 * En producción SIEMPRE es false: un login dummy con MOCK_ROLE=ADMIN daría acceso de
 * administrador a cualquier cuenta.
 */
export function isMockBackendEnabled(): boolean {
    if (process.env.NODE_ENV === "production") return false;
    return process.env.MOCK_BACKEND === "true";
}
