import "server-only";

import { BackendNetworkError, backendFetch } from "@/lib/backend/client";
import { getBackendAccessToken } from "@/lib/backend/session";
import { DEFAULT_FILTERS, filterItems, type ItemFilters } from "@/lib/filter-items";
import { CATEGORY_CONFIG } from "@/lib/item-categories";
import { ITEM_LOCATIONS, type ItemLocation } from "@/lib/item-locations";
import type { CategorySummary, CreateItemPayload, Item, ItemCategory, MyItems } from "@/types/item";

// Contract: GET /api/items, GET /api/items/categories, GET /api/items/mine, POST /api/items,
// POST /api/items/:id/verification and PATCH /api/items/:id/resolution.
// The /api prefix is added by lib/backend/config.ts. SERVER-SIDE ONLY: the token never reaches the browser.

export type ItemsApiErrorKind =
    | "Unauthorized" // 401, or no usable session token
    | "Forbidden" // 403
    | "NotFound" // 404
    | "Validation" // 400 / 422
    | "Conflict" // 409 (e.g. five active reports already, or report already linked)
    | "Unavailable" // no connection, timeout, 5xx
    | "InvalidResponse"; // 2xx with a body that does not follow the contract

export class ItemsApiError extends Error {
    constructor(
        public readonly kind: ItemsApiErrorKind,
        message: string,
    ) {
        super(message);
        this.name = "ItemsApiError";
    }
}

const CATEGORIES = new Set<string>(CATEGORY_CONFIG.map(({ category }) => category));
const LOCATIONS = new Set<string>(ITEM_LOCATIONS);
const ISO_DAY = /^\d{4}-\d{2}-\d{2}/;

// DEV ONLY: shows local sample photos while the backend sends imageUrl = null (S3 pending).
// Never active in production. The photos do NOT match the real object.
const DEMO_IMAGES = process.env.NODE_ENV !== "production" && process.env.DEMO_ITEM_IMAGES === "true";
const DEMO_IMAGES_BY_CATEGORY: Record<ItemCategory, string[]> = {
    Tecnología: ["/mocks/calculator.jpg", "/mocks/airpods.jpg", "/mocks/phone.jpg", "/mocks/laptop.jpg", "/mocks/charger.jpg"],
    Documentos: ["/mocks/studentID.jpg", "/mocks/wallet.jpg", "/mocks/notebook.jpg"],
    Accesorios: ["/mocks/backpack.jpg", "/mocks/glasses.jpg", "/mocks/umbrella.jpg", "/mocks/bottle.jpg", "/mocks/watch.jpg"],
    Llaves: ["/mocks/keychain.jpg", "/mocks/keys-2.jpg"],
    Ropa: ["/mocks/jacket.jpg", "/mocks/hoodie.jpg", "/mocks/cap.jpg"],
    Otros: ["/mocks/book.jpg", "/mocks/pencil-case.jpg", "/mocks/glasses.jpg"],
};

// Stable pick: the same report id always gets the same photo
function demoImageFor(category: ItemCategory, id: string): string | null {
    const options = DEMO_IMAGES_BY_CATEGORY[category];
    if (!options.length) return null;
    let hash = 0;
    for (const char of id) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
    return options[hash % options.length];
}

/**
 * Only place that translates ONE backend item into the frontend `Item`.
 * Returns the item, or a string with the reason it was rejected (enum values are safe to log;
 * titles, descriptions and other free text never are).
 * If the backend names a field differently, change it HERE.
 */
function parseItem(data: unknown): Item | string {
    if (typeof data !== "object" || data === null) return "not an object";
    const d = data as Record<string, unknown>;

    if (typeof d.id !== "string" && typeof d.id !== "number") return 'missing "id"';
    if (d.type !== "lost" && d.type !== "found") return `unexpected type "${String(d.type)}"`;
    if (typeof d.title !== "string") return 'missing "title"';
    if (typeof d.description !== "string") return 'missing "description"';
    if (typeof d.category !== "string" || !CATEGORIES.has(d.category)) {
        return `unexpected category "${String(d.category)}"`;
    }
    if (typeof d.location !== "string" || !LOCATIONS.has(d.location)) {
        return `unexpected location "${String(d.location)}"`;
    }
    if (d.status !== "active" && d.status !== "in_verification") {
        return `unexpected status "${String(d.status)}"`;
    }
    if (typeof d.eventDate !== "string" || !ISO_DAY.test(d.eventDate)) return 'invalid "eventDate"';
    if (typeof d.publishedAt !== "string" || Number.isNaN(Date.parse(d.publishedAt))) {
        return 'invalid "publishedAt"';
    }

    const locationDetail =
        typeof d.locationDetail === "string" && d.locationDetail.trim() !== "" ? d.locationDetail.trim() : null;
    // Same rule as ItemImage: only real URLs. The backend sends null for now (S3 pending).
    const imageUrl =
        typeof d.imageUrl === "string" && (d.imageUrl.startsWith("/") || /^https?:\/\//.test(d.imageUrl))
            ? d.imageUrl
            : null;

    return {
        id: String(d.id),
        type: d.type,
        title: d.title,
        description: d.description,
        category: d.category as ItemCategory, // validated against CATEGORY_CONFIG above
        location: d.location as ItemLocation, // validated against ITEM_LOCATIONS above
        locationDetail,
        imageUrl: imageUrl ?? (DEMO_IMAGES ? demoImageFor(d.category as ItemCategory, String(d.id)) : null),
        eventDate: d.eventDate.slice(0, 10), // YYYY-MM-DD
        publishedAt: d.publishedAt,
        status: d.status,
        isOwner: d.isOwner === true, // computed by the backend; if it is missing, nobody is the owner
    };
}

/** A broken item is skipped (and reported); if EVERY item is broken the contract does not match: fail loudly. */
function parseItemList(data: unknown, label: string): Item[] {
    if (!Array.isArray(data)) throw new ItemsApiError("InvalidResponse", `${label}: expected a JSON array`);

    const items: Item[] = [];
    const failures: string[] = [];
    for (const entry of data) {
        const parsed = parseItem(entry);
        if (typeof parsed === "string") failures.push(parsed);
        else items.push(parsed);
    }

    if (failures.length > 0) {
        console.warn(`[items] ${label}: ${failures.length} de ${data.length} reportes descartados. Primer motivo: ${failures[0]}`);
        if (items.length === 0) {
            throw new ItemsApiError("InvalidResponse", `${label}: ningún reporte tiene la forma esperada`);
        }
    }
    return items;
}

/** Counts come from the backend; order and icons stay in CATEGORY_CONFIG. A missing category counts 0. */
function parseCategorySummaries(data: unknown): CategorySummary[] | null {
    if (!Array.isArray(data)) return null;
    const counts = new Map<string, number>();
    for (const entry of data) {
        if (typeof entry !== "object" || entry === null) return null;
        const e = entry as Record<string, unknown>;
        if (typeof e.category !== "string" || typeof e.count !== "number") return null;
        counts.set(e.category, e.count);
    }
    return CATEGORY_CONFIG.map(({ category }) => ({ category, count: counts.get(category) ?? 0 }));
}

/** Authenticated GET. Maps HTTP failures to ItemsApiError; the caller interprets the JSON. */
async function requestJson(path: string, accessToken: string | null): Promise<unknown> {
    let response: Response;
    try {
        response = await backendFetch(path, { accessToken });
    } catch (error) {
        if (error instanceof BackendNetworkError) throw new ItemsApiError("Unavailable", error.message);
        throw error;
    }

    if (response.status === 401) throw new ItemsApiError("Unauthorized", "El backend respondió 401");
    if (response.status === 403) throw new ItemsApiError("Forbidden", "El backend respondió 403");
    if (!response.ok) throw new ItemsApiError("Unavailable", `El backend respondió ${response.status}`);

    const data: unknown = await response.json().catch(() => null);
    if (data === null) throw new ItemsApiError("InvalidResponse", "Respuesta del backend sin JSON válido");
    return data;
}

// How many open reports each category has (both types). The backend always returns the six categories.
export async function getCategorySummaries(): Promise<CategorySummary[]> {
    const data = await requestJson("/items/categories", await getBackendAccessToken());
    const summaries = parseCategorySummaries(data);
    if (!summaries) throw new ItemsApiError("InvalidResponse", "GET /items/categories: forma inesperada");
    return summaries;
}

// Open reports matching the filters. GET /items has no pagination, so it is fetched whole and
// filterItems() is applied here. If the volume grows, send the filters to the backend instead.
export async function getItems(filters: ItemFilters = DEFAULT_FILTERS): Promise<Item[]> {
    const data = await requestJson("/items", await getBackendAccessToken());
    return filterItems(parseItemList(data, "GET /items"), filters);
}

// Reports of the signed-in user, already split by the backend into { active, history }.
// "history" is NOT only closed reports: after a failed verification a report can be in both lists.
// Do not infer "closed" from membership in history.
export async function getMyItems(): Promise<MyItems> {
    const accessToken = await getBackendAccessToken();
    if (!accessToken) throw new ItemsApiError("Unauthorized", "No hay token de sesión vigente");

    const data = await requestJson("/items/mine", accessToken);
    if (typeof data !== "object" || data === null) {
        throw new ItemsApiError("InvalidResponse", "GET /items/mine: forma inesperada");
    }
    const { active, history } = data as Record<string, unknown>;
    return {
        active: parseItemList(active, "GET /items/mine (active)"),
        history: parseItemList(history, "GET /items/mine (history)"),
    };
}

// POST /items (multipart/form-data, text fields only: no image while S3 is pending).
// The author and its role (loser / finder) come from the token, not from the body.
export async function createItem(input: CreateItemPayload, accessToken: string): Promise<void> {
    const formData = new FormData();
    formData.set("type", input.type);
    formData.set("title", input.title);
    formData.set("description", input.description);
    formData.set("category", input.category);
    formData.set("location", input.location);
    formData.set("eventDate", input.eventDate);
    if (input.locationDetail) formData.set("locationDetail", input.locationDetail);

    let response: Response;
    try {
        response = await backendFetch("/items", { method: "POST", formData, accessToken });
    } catch (error) {
        if (error instanceof BackendNetworkError) throw new ItemsApiError("Unavailable", error.message);
        throw error;
    }

    if (response.status === 401) throw new ItemsApiError("Unauthorized", "El backend respondió 401");
    if (response.status === 403) throw new ItemsApiError("Forbidden", "El backend respondió 403");
    if (response.status === 409) {
        const body = (await response.json().catch(() => null)) as { message?: unknown } | null;
        throw new ItemsApiError(
            "Conflict",
            typeof body?.message === "string" ? body.message : "Ya tienes cinco reportes activos.",
        );
    }
    if (response.status === 400 || response.status === 422) {
        const body = (await response.json().catch(() => null)) as { message?: unknown } | null;
        // The backend text may be technical: it is only logged, the user sees a fixed message
        console.warn(`[items] POST /items rechazado (${response.status}):`, body?.message);
        throw new ItemsApiError("Validation", "El servidor no aceptó los datos del reporte.");
    }
    if (!response.ok) throw new ItemsApiError("Unavailable", `El backend respondió ${response.status}`);
}

/** Authenticated command without a response body (204). Maps HTTP failures to ItemsApiError. */
async function sendCommand(
    method: "POST" | "PATCH",
    path: string,
    accessToken: string,
    json?: unknown,
): Promise<void> {
    let response: Response;
    try {
        response = await backendFetch(path, { method, json, accessToken });
    } catch (error) {
        if (error instanceof BackendNetworkError) throw new ItemsApiError("Unavailable", error.message);
        throw error;
    }

    if (response.status === 401) throw new ItemsApiError("Unauthorized", "El backend respondió 401");
    if (response.status === 403) throw new ItemsApiError("Forbidden", "El backend respondió 403");
    if (response.status === 404) throw new ItemsApiError("NotFound", "El backend respondió 404");
    if (response.status === 409) {
        const body = (await response.json().catch(() => null)) as { message?: unknown } | null;
        throw new ItemsApiError("Conflict", typeof body?.message === "string" ? body.message : "Conflicto con el estado del reporte.");
    }
    if (response.status === 400 || response.status === 422) throw new ItemsApiError("Validation", `El backend respondió ${response.status}`);
    if (!response.ok) throw new ItemsApiError("Unavailable", `El backend respondió ${response.status}`);
}

// POST /items/:id/verification (no body, 204). The viewer takes the role opposite to the author and
// the report goes active -> in_verification. Idempotent for the same person; 409 for another one.
export async function startVerification(itemId: string, accessToken: string): Promise<void> {
    await sendCommand("POST", `/items/${encodeURIComponent(itemId)}/verification`, accessToken);
}

// PATCH /items/:id/resolution { resolved } (204). Only the owner, which the backend computes.
// resolved = true closes the report; false records the failed attempt and it goes back to active.
export async function resolveReport(itemId: string, resolved: boolean, accessToken: string): Promise<void> {
    await sendCommand("PATCH", `/items/${encodeURIComponent(itemId)}/resolution`, accessToken, { resolved });
}