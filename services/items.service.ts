import { contactsMock, itemsMock } from "@/mocks/items.mock";
import { CATEGORY_CONFIG } from "@/lib/item-categories";
import { DEFAULT_FILTERS, filterItems, type ItemFilters } from "@/lib/filter-items";
import type { CategorySummary, CreateItemInput, Item, PrivateContact } from "@/types/item";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// The backend returns only items that are still in play (not delivered)
const visibleItems = () => itemsMock.filter((item) => item.status !== "recovered");

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

// All the reports of the signed-in user, including the delivered ones, newest first.
// TODO: replace with fetch("/api/items/mine") sending the session access token.
export async function getMyItems(): Promise<Item[]> {
    return itemsMock
        .filter((item) => item.isOwner)
        .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));
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