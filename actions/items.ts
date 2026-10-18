"use server"; // runs on the SERVER even though the modals (browser) call it

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { validateFailure, validateRecoveredNote } from "@/lib/recovery-validation";
import { HOME_PATH, MY_REPORTS_PATH } from "@/lib/roles";
import {
    ContactRegistrationError,
    ItemActionError,
    getItemHistory,
    markRecovered,
    registerContact,
    reportFailure,
} from "@/services/items.service";
import type { ActionResult, FailureReason, HistoryResult } from "@/types/item";

const SESSION_ERROR = "Tu sesión no es válida. Cierra sesión e ingresa de nuevo.";
const GENERIC_ERROR = "No pudimos completar la acción. Inténtalo de nuevo en unos minutos.";

function describeError(error: unknown): string {
    if (error instanceof ItemActionError) {
        if (error.code === "NotFound") return "Este reporte ya no existe.";
        if (error.code === "Forbidden") return "Solo quien publicó el reporte puede hacer esto.";
        return "El reporte ya cambió de estado. Actualiza la página para ver su estado actual.";
    }
    console.error("[items] Error en la acción:", error);
    return GENERIC_ERROR;
}

// The catalog and "Mis reportes" show the new state without a manual reload
function refreshLists() {
    revalidatePath(HOME_PATH);
    revalidatePath(MY_REPORTS_PATH);
}

// Called when the user presses the final contact button. It never throws and returns
// nothing: the contact link has already been opened, so a failure here must not bother
// the user.
export async function registerContactAction(itemId: string): Promise<void> {
    // A Server Action is a public endpoint: the session is always checked here.
    const session = await auth();
    if (!session?.user?.email) return;

    try {
        await registerContact(itemId);
        refreshLists();
    } catch (error) {
        if (error instanceof ContactRegistrationError) return; // expected: own item or already gone
        console.error("[items] Error al registrar el contacto:", error);
    }
}

export async function markRecoveredAction(itemId: string, rawNote: string): Promise<ActionResult> {
    const session = await auth();
    if (!session?.user?.email) return { ok: false, error: SESSION_ERROR };

    // The client is never the authority: the note is validated again here
    const note = String(rawNote).trim();
    const noteError = validateRecoveredNote(note);
    if (noteError) return { ok: false, error: noteError };

    try {
        await markRecovered(itemId, note || null);
        refreshLists();
        return { ok: true };
    } catch (error) {
        return { ok: false, error: describeError(error) };
    }
}

export async function reportFailureAction(
    itemId: string,
    reason: string,
    rawNote: string,
): Promise<ActionResult> {
    const session = await auth();
    if (!session?.user?.email) return { ok: false, error: SESSION_ERROR };

    const note = String(rawNote).trim();
    const errors = validateFailure(reason, note);
    const firstError = errors.reason ?? errors.note;
    if (firstError) return { ok: false, error: firstError };

    try {
        await reportFailure(itemId, reason as FailureReason, note || null); // reason validated above
        refreshLists();
        return { ok: true };
    } catch (error) {
        return { ok: false, error: describeError(error) };
    }
}

export async function getItemHistoryAction(itemId: string): Promise<HistoryResult> {
    const session = await auth();
    if (!session?.user?.email) return { ok: false, error: SESSION_ERROR };

    try {
        return { ok: true, events: await getItemHistory(itemId) };
    } catch (error) {
        return { ok: false, error: describeError(error) };
    }
}