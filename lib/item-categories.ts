import type { ComponentType } from "react";
import { IconBox, IconCube, IconDocument, IconLaptop } from "@/components/ui/icons";
import type { ItemCategory } from "@/types/item";

// Display order and icon of each category card.
// The backend only sends category + count, so the visual part lives here.
export const CATEGORY_CONFIG: {
    category: ItemCategory;
    icon: ComponentType<{ className?: string }>;
}[] = [
    { category: "Tecnología", icon: IconLaptop },
    { category: "Documentos", icon: IconDocument },
    { category: "Accesorios", icon: IconBox },
    { category: "Otros", icon: IconCube },
];

export function formatPublicationCount(count: number): string {
    return `${count} ${count === 1 ? "publicación" : "publicaciones"}`;
}