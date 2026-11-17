import "server-only";

import { BACKEND_TIMEOUT_MS, backendUrl } from "./config";

/**
 * Transporte HTTP COMPARTIDO hacia el backend. Solo corre en el servidor de Next.js
 * (Server Components, Server Actions, callbacks de Auth.js): el token nunca pasa por el navegador
 * y no hay problemas de CORS.
 *
 * Se encarga únicamente de lo que es igual para todos los módulos: URL base + "/api", Accept,
 * Bearer, sin caché y timeout. NO interpreta la respuesta: cada servicio conserva su propio
 * modelo de errores (BackendAuthError, ProfileApiError, ApiResult de admin, ContactApiError...).
 */

/** No hubo respuesta HTTP: conexión rechazada, DNS, timeout... */
export class BackendNetworkError extends Error {
    constructor(
        public readonly url: string,
        options?: { cause?: unknown },
    ) {
        super(`No se pudo conectar con ${url}`, options);
        this.name = "BackendNetworkError";
    }
}

export type BackendRequestOptions = {
    method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
    /** Se agrega como "?..." a la URL. */
    query?: string | URLSearchParams;
    /** Cuerpo JSON (agrega Content-Type: application/json). Excluyente con `formData`. */
    json?: unknown;
    /** Cuerpo multipart/form-data. El Content-Type (con su boundary) lo pone fetch. */
    formData?: FormData;
    /** Si se envía, agrega `Authorization: Bearer <token>`. Omitir en rutas públicas. */
    accessToken?: string | null;
    timeoutMs?: number;
};

/**
 * Hace la petición y devuelve el Response tal cual (incluidos 4xx/5xx).
 * Lanza BackendNetworkError solo cuando no hubo respuesta.
 *
 * @example backendFetch("/profile", { accessToken })            // GET {API_URL}/api/profile
 * @example backendFetch("/items", { method: "POST", formData, accessToken })
 */
export async function backendFetch(path: string, options: BackendRequestOptions = {}): Promise<Response> {
    const { method = "GET", query, json, formData, accessToken, timeoutMs = BACKEND_TIMEOUT_MS } = options;
    if (json !== undefined && formData !== undefined) {
        throw new Error("[backend] `json` y `formData` no se pueden enviar en la misma petición.");
    }

    const url = backendUrl(path, query);
    const headers: Record<string, string> = { Accept: "application/json" };
    if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

    let body: BodyInit | undefined;
    if (json !== undefined) {
        headers["Content-Type"] = "application/json";
        body = JSON.stringify(json);
    } else if (formData !== undefined) {
        body = formData;
    }

    try {
        return await fetch(url, {
            method,
            headers,
            body,
            cache: "no-store",
            signal: AbortSignal.timeout(timeoutMs),
        });
    } catch (error) {
        throw new BackendNetworkError(url, { cause: error });
    }
}
