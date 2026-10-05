import { CATEGORY_CONFIG } from "@/lib/item-categories";
import type { Item, ItemCategory } from "@/types/item";

export type ItemTypeFilter = "all" | "lost" | "found";
export type ItemSort = "recent" | "oldest";

export interface ItemFilters {
    type: ItemTypeFilter;
    category: ItemCategory | null;
    q: string;
    sort: ItemSort;
}

export const DEFAULT_FILTERS: ItemFilters = {
    type: "all",
    category: null,
    q: "",
    sort: "recent",
};

type RawParams = Record<string, string | string[] | undefined>;

const firstValue = (value: string | string[] | undefined) =>
    Array.isArray(value) ? value[0] : value;

// Turns the raw URL params into a validated filters object.
// Unknown or invalid values fall back to the defaults.
export function parseFilters(raw: RawParams): ItemFilters {
    const type = firstValue(raw.type);
    const category = firstValue(raw.category);
    const sort = firstValue(raw.sort);

    return {
        type: type === "lost" || type === "found" ? type : "all",
        category: CATEGORY_CONFIG.some((c) => c.category === category)
        ? (category as ItemCategory)
        : null,
        q: (firstValue(raw.q) ?? "").trim(),
        sort: sort === "oldest" ? "oldest" : "recent",
    };
}

// Builds the query string, omitting default values to keep URLs clean.
// The backend contract will use these same parameter names: GET /api/items?type=&category=&q=&sort=
export function toSearchParams(filters: ItemFilters): URLSearchParams {
    const params = new URLSearchParams();
    if (filters.type !== "all") params.set("type", filters.type);
    if (filters.category) params.set("category", filters.category);
    if (filters.q) params.set("q", filters.q);
    if (filters.sort !== "recent") params.set("sort", filters.sort);
    return params;
}

// Lowercase + strip accents so "camara" matches "Cámara"
const normalize = (text: string) =>
    text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

// In-memory filtering used while there is no backend
export function filterItems(items: Item[], filters: ItemFilters): Item[] {
    const query = normalize(filters.q);

    return items
        .filter((item) => filters.type === "all" || item.type === filters.type)
        .filter((item) => !filters.category || item.category === filters.category)
        .filter(
        (item) =>
            !query ||
            normalize(`${item.title} ${item.category} ${item.location}`).includes(query),
        )
        .sort((a, b) => {
        const diff = Date.parse(b.publishedAt) - Date.parse(a.publishedAt);
        return filters.sort === "recent" ? diff : -diff;
        });
}