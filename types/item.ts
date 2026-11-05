import type { ItemLocation } from "@/lib/item-locations";

// "lost": published by the owner. "found": published by the person who found it.
export type ItemType = "lost" | "found";

// Categories shown in the catalog and in the report form.
export type ItemCategory =
    | "Tecnología"
    | "Documentos"
    | "Accesorios"
    | "Llaves"
    | "Ropa"
    | "Otros";

// active: visible and open ("Buscando"). in_verification: someone contacted the publisher.
// The closed state only exists in the backend; the frontend receives it as the history list.
export type ItemStatus = "active" | "in_verification";

// What the backend returns for "Mis reportes"
export interface MyItems {
    active: Item[];
    history: Item[];
}

export interface Item {
    id: string;
    type: ItemType;
    title: string;
    description: string;
    category: ItemCategory; // typed, so a misspelled category fails at compile time
    location: ItemLocation; // one of the campus places (lib/item-locations.ts)
    locationDetail?: string | null; // optional free text, e.g. "salón 204, mesa junto a la ventana"
    imageUrl: string | null; // public URL of the stored image (never base64), or null when there is no photo
    eventDate: string; // YYYY-MM-DD: when it was lost or found
    publishedAt: string; // ISO 8601; the frontend formats it for display
    status: ItemStatus;
    isOwner: boolean; // computed by the backend from the token; the frontend cannot infer it
}

export interface PrivateContact {
    publishedBy: string;     // already masked by the backend, e.g. "A*** M******"
    whatsapp: string | null; // E.164 format, e.g. "+573105554821"
    email: string;
}

// Shape the backend will return for the category counters
export interface CategorySummary {
    category: ItemCategory;
    count: number; // number of publications in that category
}

// What the report form sends to the backend (multipart/form-data)
export interface CreateItemInput {
    type: ItemType;
    title: string;
    category: ItemCategory;
    description: string;
    location: ItemLocation; // one of the campus places (lib/item-locations.ts)
    locationDetail: string | null; // optional; null when the user leaves it empty
    eventDate: string; // YYYY-MM-DD: when it was lost or found
    image: File | null; // optional; the backend stores it and returns the public URL
}