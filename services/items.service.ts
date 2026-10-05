import { contactsMock, itemsMock } from "@/mocks/items.mock";
import { CATEGORY_CONFIG } from "@/lib/item-categories";
import { DEFAULT_FILTERS, filterItems, type ItemFilters } from "@/lib/filter-items";
import type { CategorySummary, Item, PrivateContact } from "@/types/item";

export async function getPrivateContact(itemId: string): Promise<PrivateContact> {
    // TODO(backend): replace with fetch(`/api/items/${itemId}/contact`)
    await new Promise((resolve) => setTimeout(resolve, 400)); // simulates network delay

    const contact = contactsMock[itemId];
    if (!contact) {
        throw new Error("Item not found"); // simulates the backend 404
    }
    return contact;
}

// Returns how many publications each category has.
// Dummy: counted from the mock items. The backend will return the same shape.
// TODO: replace with fetch("/api/items/categories") once the backend is ready.
export async function getCategorySummaries(): Promise<CategorySummary[]> {
    return CATEGORY_CONFIG.map(({ category }) => ({
        category,
        count: itemsMock.filter((item) => item.category === category).length,
    }));
}

// Returns the published items matching the filters.
// TODO: replace with fetch(`/api/items?${toSearchParams(filters)}`) once the backend is ready.
export async function getItems(filters: ItemFilters = DEFAULT_FILTERS): Promise<Item[]> {
    return filterItems(itemsMock, filters);
}