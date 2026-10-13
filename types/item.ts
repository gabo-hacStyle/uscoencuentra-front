// "lost": published by the owner. "found": published by the person who found it.
export type ItemType = "lost" | "found";

// Categories shown in the catalog.
export type ItemCategory = "Tecnología" | "Documentos" | "Accesorios" | "Otros";

export interface Item {
    id: string;
    type: ItemType;
    title: string;
    description: string;
    category: ItemCategory; // typed, so a misspelled category fails at compile time
    location: string;
    imageUrl: string | null; // URL of the stored image, or null when the report has no photo
    publishedAt: string; // ISO 8601; the frontend formats it for display
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
    location: string;
    eventDate: string; // YYYY-MM-DD: when it was lost or found
    image: File | null; // optional; the backend stores it and returns the public URL
}