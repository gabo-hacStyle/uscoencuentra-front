import { contactMock, itemsMock } from "@/mocks/items.mock";
import type { PrivateContact } from "@/types/item";

export async function getPrivateContact(itemId: string): Promise<PrivateContact> {
  // TODO(backend): replace with fetch(`/api/items/${itemId}/contact`)
    await new Promise((resolve) => setTimeout(resolve, 400)); // simulates network delay

    const exists = itemsMock.some((item) => item.id === itemId);
    if (!exists) {
        throw new Error("Item not found"); // simulates the backend 404
    }

    return contactMock;
}