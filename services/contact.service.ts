import "server-only";

import { isE164 } from "@/lib/phone";
import { contactsMock, itemsMock } from "@/mocks/items.mock";
import { API_URL, isMockBackendEnabled } from "@/services/auth.service";
import { getMockAuthorWhatsApp } from "@/services/profile.service";
import type { PrivateContact } from "@/types/item";

/**
 * GET /items/:id/contact — "Contacto privado del publicador" (contract defined by the team).
 * SERVER-SIDE ONLY: reached through actions/contact.ts, so the token, the mock contacts and the
 * publishers' numbers never ship in the browser bundle.
 *
 * Who decides "whatsapp" is the backend: it identifies the PUBLISHER of the item and returns their
 * profile "numero" only when it exists and shareWhatsAppNumber is true; otherwise null.
 * The MOCK below applies the same rule to simulated data; it is not the backend's protection.
 */

const contactPath = (itemId: string) => `/items/${encodeURIComponent(itemId)}/contact`;

export type ContactApiErrorKind =
    | "Unauthorized" // 401 "No se pudo autenticar la identidad"
    | "NotFound" // 404 "Objeto no encontrado" (missing or inactive item)
    | "ServerError" // 500 "Error interno del servidor" (or any other unexpected status)
    | "Unavailable" // no answer: connection refused, timeout
    | "InvalidResponse"; // 2xx with a body that does not follow the contract

export class ContactApiError extends Error {
    constructor(
        public readonly kind: ContactApiErrorKind,
        message: string,
    ) {
        super(message);
        this.name = "ContactApiError";
    }
}

/** Only place that translates the backend JSON. A "whatsapp" that is not E.164 is not shown. */
function parseContact(data: unknown): PrivateContact | null {
    if (typeof data !== "object" || data === null) return null;
    const d = data as Record<string, unknown>;
    if (typeof d.publishedBy !== "string" || typeof d.email !== "string") return null;
    if (d.whatsapp != null && typeof d.whatsapp !== "string") return null;

    const whatsapp = typeof d.whatsapp === "string" && isE164(d.whatsapp.trim()) ? d.whatsapp.trim() : null;
    if (typeof d.whatsapp === "string" && whatsapp === null) {
        // BACKEND: "whatsapp" must be E.164. The value is not logged (personal data).
        console.warn('[contact] El backend devolvió "whatsapp" fuera de formato E.164; no se muestra.');
    }
    return { publishedBy: d.publishedBy, whatsapp, email: d.email };
}

async function requestContact(itemId: string, accessToken: string): Promise<PrivateContact> {
    let response: Response;
    try {
        response = await fetch(`${API_URL}${contactPath(itemId)}`, {
            method: "GET",
            headers: { Accept: "application/json", Authorization: `Bearer ${accessToken}` },
            cache: "no-store",
            signal: AbortSignal.timeout(10_000),
        });
    } catch {
        throw new ContactApiError("Unavailable", `No se pudo conectar con ${API_URL}${contactPath(itemId)}`);
    }

    if (response.status === 401) throw new ContactApiError("Unauthorized", "El backend respondió 401");
    if (response.status === 404) throw new ContactApiError("NotFound", "El backend respondió 404");
    if (!response.ok) throw new ContactApiError("ServerError", `El backend respondió ${response.status}`);

    const contact = parseContact(await response.json().catch(() => null));
    if (!contact) throw new ContactApiError("InvalidResponse", "Respuesta del backend con forma inesperada");
    return contact;
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function getPrivateContact(itemId: string, accessToken: string): Promise<PrivateContact> {
    if (isMockBackendEnabled()) {
        // DUMMY GET /items/:id/contact
        await delay(400); // simulates network delay
        const item = itemsMock.find((candidate) => candidate.id === itemId);
        const publisher = contactsMock[itemId];
        if (!item || item.closed || !publisher) throw new ContactApiError("NotFound", "Objeto no encontrado (mock)");
        // "whatsapp" comes from the PUBLISHER's profile, never from the signed-in viewer
        return { ...publisher, whatsapp: getMockAuthorWhatsApp(publisher.email) };
    }
    return requestContact(itemId, accessToken);
}
