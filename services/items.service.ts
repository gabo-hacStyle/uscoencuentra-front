import { contactsMock, itemsMock } from "@/mocks/items.mock";
import { CATEGORY_CONFIG } from "@/lib/item-categories";
import { DEFAULT_FILTERS, filterItems, type ItemFilters } from "@/lib/filter-items";
import type {
    CategorySummary,
    CreateItemInput,
    FailureReason,
    HistoryEvent,
    Item,
    PrivateContact,
} from "@/types/item";

const daysAgoIso = (days: number) =>
    new Date(Date.now() - days * 86_400_000).toISOString();

// DUMMY STORE. It lives on globalThis so it survives hot reloads and is shared by server
// components and server actions. It starts as a copy of the mock and is lost when
// `npm run dev` restarts. The real backend replaces all of this.
const globalForMock = globalThis as unknown as {
    __uscoMockItems?: Item[];
    __uscoMockHistory?: Map<string, HistoryEvent[]>;
};
const store = (globalForMock.__uscoMockItems ??= structuredClone(itemsMock));
const history = (globalForMock.__uscoMockHistory ??= new Map<string, HistoryEvent[]>([
    [
        "3",
        [
            { id: "seed-3a", type: "contacted", at: daysAgoIso(2), reason: null, note: null },
            { id: "seed-3b", type: "failed", at: daysAgoIso(1), reason: "no_response", note: null },
        ],
    ],
    ["4", [{ id: "seed-4", type: "contacted", at: daysAgoIso(3), reason: null, note: null }]],
    [
        "6",
        [
            {
                id: "seed-6a",
                type: "failed",
                at: daysAgoIso(5),
                reason: "could_not_meet",
                note: "No coincidimos en horario.",
            },
            { id: "seed-6b", type: "contacted", at: daysAgoIso(1), reason: null, note: null },
        ],
    ],
    [
        "8",
        [
            { id: "seed-8a", type: "contacted", at: daysAgoIso(6), reason: null, note: null },
            {
                id: "seed-8b",
                type: "recovered",
                at: daysAgoIso(5),
                reason: null,
                note: "Entregado en la sala de cómputo.",
            },
        ],
    ],
]));

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function addEvent(itemId: string, event: Omit<HistoryEvent, "id" | "at">) {
    const events = history.get(itemId) ?? [];
    events.push({ id: `evt-${Date.now()}-${events.length}`, at: new Date().toISOString(), ...event });
    history.set(itemId, events);
}

// The backend returns only items that are still in play (not recovered)
const visibleItems = () => store.filter((item) => item.status !== "recovered");

export async function getPrivateContact(itemId: string): Promise<PrivateContact> {
    // TODO(backend): replace with fetch(`/api/items/${itemId}/contact`)
    await delay(400); // simulates network delay

    const contact = contactsMock[itemId];
    if (!contact) {
        throw new Error("Item not found"); // simulates the backend 404
    }
    return contact;
}

// Returns how many publications each category has (only items still in play).
// TODO: replace with fetch("/api/items/categories") once the backend is ready.
export async function getCategorySummaries(): Promise<CategorySummary[]> {
    const items = visibleItems();
    return CATEGORY_CONFIG.map(({ category }) => ({
        category,
        count: items.filter((item) => item.category === category).length,
    }));
}

// Returns the published items matching the filters.
// TODO: replace with fetch(`/api/items?${toSearchParams(filters)}`) once the backend is ready.
export async function getItems(filters: ItemFilters = DEFAULT_FILTERS): Promise<Item[]> {
    return filterItems(visibleItems(), filters);
}

// Publishes a new report. Dummy: simulates the network and returns the created item.
// It is NOT persisted, so it will not appear in the catalog until the backend exists.
// TODO: replace with a POST /api/items (multipart/form-data) through a route handler
// or server action that attaches the session access token.
export async function createItem(input: CreateItemInput): Promise<Item> {
    await delay(800); // simulates network delay

    return {
        id: `dummy-${Date.now()}`,
        type: input.type,
        title: input.title,
        description: input.description,
        category: input.category,
        location: input.location,
        imageUrl: null, // the real backend uploads the file and returns its URL
        eventDate: input.eventDate,
        publishedAt: new Date().toISOString(),
        status: "active",
        failedAttempts: 0,
        recoveredAt: null,
        isOwner: true,
    };
}

export type ContactRegistrationErrorCode = "NotFound" | "OwnItem";

// Mirrors the backend errors: 404 and 403
export class ContactRegistrationError extends Error {
    constructor(
        public readonly code: ContactRegistrationErrorCode,
        message: string,
    ) {
        super(message);
        this.name = "ContactRegistrationError";
    }
}

// Records that someone contacted the publisher. An "active" item moves to "in_verification";
// in any other state only the event is recorded. Runs on the server only (called from a
// server action). The backend also puts the item back to "active" after VERIFICATION_DAYS.
// TODO: replace with POST /items/{id}/contact-requests, sending the session access token.
export async function registerContact(itemId: string): Promise<void> {
    await delay(300); // simulates network delay

    const item = store.find((candidate) => candidate.id === itemId);
    if (!item) throw new ContactRegistrationError("NotFound", "Item not found"); // 404
    if (item.isOwner) throw new ContactRegistrationError("OwnItem", "Cannot contact your own item"); // 403

    if (item.status === "active") item.status = "in_verification";
    addEvent(itemId, { type: "contacted", reason: null, note: null });
}

export type ItemActionErrorCode = "NotFound" | "Forbidden" | "Conflict";

// Mirrors the backend errors: 404, 403 and 409
export class ItemActionError extends Error {
    constructor(
        public readonly code: ItemActionErrorCode,
        message: string,
    ) {
        super(message);
        this.name = "ItemActionError";
    }
}

// Only the publisher can resolve an item. Here isOwner is simulated in the mock;
// the real backend decides it from the token.
function findOwned(itemId: string): Item {
    const item = store.find((candidate) => candidate.id === itemId);
    if (!item) throw new ItemActionError("NotFound", "Item not found"); // 404
    if (!item.isOwner) throw new ItemActionError("Forbidden", "Not the publisher"); // 403
    return item;
}

// All the reports of the signed-in user, including the recovered ones, newest first.
// TODO: replace with fetch("/api/items/mine") sending the session access token.
export async function getMyItems(): Promise<Item[]> {
    return store
        .filter((item) => item.isOwner)
        .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));
}

// Closes the case: the item leaves the public catalog and goes to the history.
// TODO: replace with POST /items/{id}/recovered.
export async function markRecovered(itemId: string, note: string | null): Promise<void> {
    await delay(300);
    const item = findOwned(itemId);
    if (item.status === "recovered") throw new ItemActionError("Conflict", "Already recovered"); // 409

    item.status = "recovered";
    item.recoveredAt = new Date().toISOString();
    addEvent(itemId, { type: "recovered", reason: null, note });
}

// The contact did not work out: the item goes back to "active" and the attempt is recorded.
// Only valid while the item is "in_verification".
// TODO: replace with POST /items/{id}/failed.
export async function reportFailure(
    itemId: string,
    reason: FailureReason,
    note: string | null,
): Promise<void> {
    await delay(300);
    const item = findOwned(itemId);
    if (item.status !== "in_verification") throw new ItemActionError("Conflict", "Not in verification"); // 409

    item.status = "active";
    item.failedAttempts += 1;
    addEvent(itemId, { type: "failed", reason, note });
}

// Events of one report, newest first. Only its publisher can read them.
// TODO: replace with GET /items/{id}/history.
export async function getItemHistory(itemId: string): Promise<HistoryEvent[]> {
    await delay(300);
    findOwned(itemId); // 404 / 403
    return [...(history.get(itemId) ?? [])].sort((a, b) => Date.parse(b.at) - Date.parse(a.at));
}