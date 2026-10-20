import type { ItemStatus } from "@/types/item";

// Label and colors of the status badge
export const STATUS_TEXTS: Record<ItemStatus, { label: string; className: string }> = {
    active: { label: "Buscando", className: "bg-usco-wine/10 text-usco-wine" },
    in_verification: { label: "En verificación", className: "bg-usco-ink text-white" },
    recovered: { label: "Entregado", className: "bg-usco-success/10 text-usco-success" },
};

/** Days an item stays "in_verification" before the backend puts it back to "active". */
export const VERIFICATION_DAYS = 7;