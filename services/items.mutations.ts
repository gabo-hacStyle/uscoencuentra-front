import type { CreateItemInput, Item } from "@/types/item";

// Dummy write operations. They are NOT server-only on purpose: client components still import
// them. Block B (createItem) and Block C (startVerification, resolveReport) replace each one
// with a Server Action that calls the real backend.

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

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
// TODO: replace with a Server Action calling POST /api/items (multipart/form-data, text only).
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
        imageUrl: null, // the real backend returns null for now (S3 pending)
        eventDate: input.eventDate,
        publishedAt: new Date().toISOString(),
        status: "active",
        isOwner: true,
    };
}