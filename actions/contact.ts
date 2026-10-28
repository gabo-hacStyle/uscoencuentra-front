"use server"; // se ejecuta en el SERVIDOR aunque la modal (navegador) la llame

import { auth } from "@/auth";
import { ContactApiError, getPrivateContact } from "@/services/contact.service";
import type { PrivateContact } from "@/types/item";

export type PrivateContactResult =
    | { ok: true; contact: PrivateContact }
    | { ok: false; error: string };

const ITEM_ID_PATTERN = /^[A-Za-z0-9_-]{1,64}$/;

/**
 * Contacto privado del PUBLICADOR de la publicación `itemId` (GET /items/:id/contact).
 * Requiere sesión iniciada; la sesión solo autentica a quien consulta.
 */
export async function getPrivateContactAction(itemId: unknown): Promise<PrivateContactResult> {
    // Una Server Action es un endpoint público: siempre se comprueba la sesión aquí dentro.
    const session = await auth();
    if (!session?.user) return { ok: false, error: "No se pudo autenticar la identidad" };

    if (typeof itemId !== "string" || !ITEM_ID_PATTERN.test(itemId)) {
        return { ok: false, error: "Objeto no encontrado" };
    }

    try {
        return { ok: true, contact: await getPrivateContact(itemId, session.accessToken ?? "") };
    } catch (error) {
        if (error instanceof ContactApiError) {
            if (error.kind === "Unauthorized") return { ok: false, error: "No se pudo autenticar la identidad" };
            if (error.kind === "NotFound") return { ok: false, error: "Objeto no encontrado" };
        }
        console.error("[contact] Error al cargar el contacto privado:", error);
        return { ok: false, error: "Error interno del servidor" };
    }
}
