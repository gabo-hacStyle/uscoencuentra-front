// "lost": published by the owner. "found": published by the person who found it.
export type ItemType = "lost" | "found";

export interface Item {
    id: string;
    type: ItemType;
    title: string;
    description: string;
    category: string;
    location: string;
    imageUrl: string; // image URL or a data URI ("data:image/jpeg;base64,...")
    publishedAt: string; // ISO 8601; the frontend formats it for display
}

export interface PrivateContact {
    publishedBy: string;     // already masked by the backend, e.g. "A*** M******"
    whatsapp: string | null; // E.164 format, e.g. "+573105554821"
    email: string;
}