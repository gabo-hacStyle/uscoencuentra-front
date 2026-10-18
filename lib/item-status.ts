import type { ItemStatus } from "@/types/item";

// Label and colors of the status badge shown on cards and in the detail modal
export const STATUS_TEXTS: Record<ItemStatus, { label: string; className: string }> = {
    active: { label: "Activo", className: "border border-usco-line bg-white text-usco-ink" },
    in_verification: { label: "En verificación", className: "bg-usco-ink text-white" },
    recovered: { label: "Recuperado", className: "bg-usco-success text-white" },
};

/** Days an item stays "in_verification" before the backend puts it back to "active". */
export const VERIFICATION_DAYS = 7;