// "lost": published by the owner. "found": published by the person who found it.
export type ItemType = "lost" | "found";

// Categories shown in the catalog.
export type ItemCategory = "Tecnología" | "Documentos" | "Accesorios" | "Otros";
export type FailureReason = "not_the_item" | "no_response" | "could_not_meet" | "other";

// State of an item (not to be confused with history events, which are records of what happened).
// active: visible and open. in_verification: someone contacted the publisher, who must check.
// recovered: case closed (hidden from the public catalog).
export type ItemStatus = "active" | "in_verification" | "recovered";

// Things that happen to an item after it is published. The backend stores them;
// the frontend only shows them (the "Historial" tab in /my-reports).
export type HistoryEventType = "contacted" | "failed" | "recovered" | "expired";

export interface Item {
    id: string;
    type: ItemType;
    title: string;
    description: string;
    category: ItemCategory; // typed, so a misspelled category fails at compile time
    location: string;
    imageUrl: string | null; // public URL of the stored image (never base64), or null when there is no photo
    eventDate: string; // YYYY-MM-DD: when it was lost or found
    publishedAt: string; // ISO 8601; the frontend formats it for display
    status: ItemStatus;
    failedAttempts: number; // how many recoveries failed for this item (the history has the details)
    recoveredAt: string | null; // ISO 8601; set only when status is "recovered"
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
    location: string;
    eventDate: string; // YYYY-MM-DD: when it was lost or found
    image: File | null; // optional; the backend stores it and returns the public URL
}

export interface HistoryEvent {
    id: string;
    type: HistoryEventType;
    at: string; // ISO 8601
    reason: FailureReason | null; // only for "failed"
    note: string | null; // optional comment
}

// What a server action returns to the UI
export type ActionResult = { ok: true } | { ok: false; error: string };

export type HistoryResult =
    | { ok: true; events: HistoryEvent[] }
    | { ok: false; error: string };