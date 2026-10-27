import { contactsMock, itemsMock } from "@/mocks/items.mock";
import { CATEGORY_CONFIG } from "@/lib/item-categories";
import { DEFAULT_FILTERS, filterItems, type ItemFilters } from "@/lib/filter-items";
import type { CategorySummary, CreateItemInput, Item, MyItems, PrivateContact } from "@/types/item";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// The backend returns only items that are still in play (not delivered)
const visibleItems = () => itemsMock.filter((item) => !item.closed);

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

// All the reports of the signed-in user, newest first, split by the backend into
// open reports and history.
// TODO: replace with fetch("/api/items/mine") sending the session access token.
export async function getMyItems(): Promise<MyItems> {
    const mine = itemsMock
        .filter((item) => item.isOwner)
        .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));
    return { active: mine.filter((i) => !i.closed), history: mine.filter((i) => i.closed) };
}

// resolved = true: report goes to the history. resolved = false: in_verification -> active.
// TODO(backend): PATCH /api/items/${itemId}/resolution with { resolved }
export async function resolveReport(itemId: string, resolved: boolean): Promise<void> {
    void itemId; // dummy: unused until the real request exists
    void resolved;
    await delay(600);
}

// Called when someone presses "Reclamar objeto" / "Devolver objeto" in the private contact modal.
// TODO(backend): POST /api/items/${itemId}/verification; the backend sets the status to in_verification
// (and puts it back to active after VERIFICATION_DAYS if nobody resolves it).
export async function startVerification(itemId: string): Promise<void> {
    void itemId; // dummy: unused until the real request exists
    await delay(400);
}

// Publishes a new report. Dummy: simulates the network and returns the created item.
// It is NOT persisted, so it will not appear in the lists until the backend exists.
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
        locationDetail: input.locationDetail,
        imageUrl: null, // the real backend uploads the file and returns its URL
        eventDate: input.eventDate,
        publishedAt: new Date().toISOString(),
        status: "active",
        isOwner: true,
    };
}