"use server"; // runs on the SERVER even though the modal (browser) calls it

import { auth } from "@/auth";
import { getBackendAccessToken } from "@/lib/backend/session";
import { validateReport } from "@/lib/report-validation";
import { ItemsApiError, createItem } from "@/services/items.service";
import type { CreateItemPayload, ItemCategory } from "@/types/item";
import type { ItemLocation } from "@/lib/item-locations";

export type CreateItemResult = { ok: true } | { ok: false; error: string };

const GENERIC_ERROR = "No pudimos publicar tu reporte. Inténtalo de nuevo en unos minutos.";

/** Publishes a report (POST /items). A Server Action is a public endpoint: session and data are checked here. */
export async function createItemAction(rawInput: unknown): Promise<CreateItemResult> {
    const session = await auth();
    const accessToken = await getBackendAccessToken();
    if (!session?.user || !accessToken) {
        return { ok: false, error: "Tu sesión no es válida. Cierra sesión e ingresa de nuevo." };
    }

    // The client is never the authority: shape and rules are checked again.
    if (typeof rawInput !== "object" || rawInput === null) return { ok: false, error: GENERIC_ERROR };
    const d = rawInput as Record<string, unknown>;
    const isText = (value: unknown): value is string => typeof value === "string";
    if (
        (d.type !== "lost" && d.type !== "found") ||
        !isText(d.title) ||
        !isText(d.category) ||
        !isText(d.description) ||
        !isText(d.location) ||
        !isText(d.eventDate) ||
        (d.locationDetail != null && !isText(d.locationDetail))
    ) {
        return { ok: false, error: GENERIC_ERROR };
    }

    // The server may be a day ahead of the user (UTC): a lenient "today" avoids rejecting valid dates.
    // The backend validates the date again.
    const lenientToday = new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleDateString("en-CA");
    const errors = validateReport(
        {
            type: d.type,
            title: d.title,
            category: d.category as ItemCategory,
            description: d.description,
            location: d.location as ItemLocation,
            locationDetail: d.locationDetail ?? "",
            date: d.eventDate,
            accepted: true, // privacy checkbox: only exists in the form
        },
        lenientToday,
    );
    if (Object.keys(errors).length > 0) {
        return { ok: false, error: "Revisa los datos del reporte e inténtalo de nuevo." };
    }

    const payload: CreateItemPayload = {
        type: d.type,
        title: d.title.trim(),
        category: d.category as ItemCategory, // validated by validateReport
        description: d.description.trim(),
        location: d.location as ItemLocation, // validated by validateReport
        locationDetail: d.locationDetail?.trim() || null,
        eventDate: d.eventDate,
    };

    try {
        await createItem(payload, accessToken);
        return { ok: true };
    } catch (error) {
        if (error instanceof ItemsApiError) {
            if (error.kind === "Conflict") return { ok: false, error: error.message };
            if (error.kind === "Validation") {
                return { ok: false, error: "El servidor no aceptó los datos. Revisa el formulario e inténtalo de nuevo." };
            }
            if (error.kind === "Unauthorized") {
                return { ok: false, error: "Tu sesión con el servidor expiró. Cierra sesión e ingresa de nuevo." };
            }
            if (error.kind === "Forbidden") return { ok: false, error: "No tienes permiso para publicar reportes." };
        }
        console.error("[items] Error al crear el reporte:", error);
        return { ok: false, error: GENERIC_ERROR };
    }
}