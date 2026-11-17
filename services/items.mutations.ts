// Dummy write operations. They are NOT server-only on purpose: client components still import
// them. Block C (startVerification, resolveReport) replaces each one with a Server Action
// that calls the real backend.

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