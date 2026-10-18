import { STATUS_TEXTS } from "@/lib/item-status";
import type { ItemStatus } from "@/types/item";

interface ItemStatusBadgeProps {
    status: ItemStatus;
    showActive?: boolean; // "Activo" is hidden unless asked for (e.g. in "Mis reportes")
    className?: string;
}

export default function ItemStatusBadge({ status, showActive = false, className = "" }: ItemStatusBadgeProps) {
    if (status === "active" && !showActive) return null;
    const { label, className: tone } = STATUS_TEXTS[status];

    return (
        <span
        className={`rounded-full px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wider ${tone} ${className}`}
        >
        {label}
        </span>
    );
}