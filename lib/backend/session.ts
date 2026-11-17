import "server-only";

import { headers } from "next/headers";
import { getToken } from "next-auth/jwt";
import { readUsableBackendAccessToken } from "./token";

/**
 * Lectura COMPARTIDA del accessToken del backend, solo en el servidor
 * (Server Components, Server Actions y Route Handlers).
 *
 * Lo lee directamente del JWT cifrado de Auth.js (cookie de sesión), no de `session.accessToken`,
 * para que en el futuro el token deje de publicarse en `/api/auth/session` sin romper a nadie.
 *
 * Auth.js advierte que su módulo `jwt` puede cambiar: por eso su uso queda aislado aquí.
 */

/** Mismo secreto que usa auth.ts para cifrar la cookie. */
function sessionSecret(): string | undefined {
    return process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET;
}

/**
 * accessToken vigente del usuario autenticado, o null si no hay sesión o el token venció.
 * Un null debe tratarse como 401 (pedir un nuevo inicio de sesión).
 */
export async function getBackendAccessToken(): Promise<string | null> {
    const secret = sessionSecret();
    if (!secret) return null;

    const cookie = (await headers()).get("cookie");
    if (!cookie) return null;

    // Solo se pasa la cookie: no se acepta un JWT de Auth.js enviado en el header Authorization.
    const req = { headers: { cookie } };

    // Auth.js usa la cookie "__Secure-authjs.session-token" en HTTPS y "authjs.session-token" en HTTP.
    // Se prueban ambos nombres para no depender de cómo se detecta el protocolo detrás de un proxy.
    for (const secureCookie of [true, false]) {
        const token = await getToken({ req, secret, secureCookie });
        if (token) return readUsableBackendAccessToken(token);
    }
    return null;
}
