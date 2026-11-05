"use client";

import type { Item } from "@/types/item";
import type { AdminReport } from "@/types/admin";
import ItemDetailModal from "@/components/items/ItemDetailModal";

/**
 * Thin adapter that opens the EXISTING report detail modal from the admin panel
 * (components/items/ItemDetailModal.tsx, also used by Inicio and Mis reportes through ItemContactFlow).
 *
 * The modal shows "Contactar de forma privada" only when `item.isOwner` is false, and it has no
 * prop to hide that action. Until a `showContactAction` prop is authorized for the shared modal,
 * the admin display copy sets `isOwner: true`: in the current modal that flag ONLY hides the
 * privacy notice and the contact button. If the modal ever adds owner-only actions behind
 * `isOwner`, replace this with the dedicated prop.
 */
export function toDetailItem(report: AdminReport): Item {
    const { publisherEmail, ...itemFields } = report;
    void publisherEmail; // not part of Item; the modal never needs it
    return { ...itemFields, isOwner: true };
}

type AdminReportModalProps = {
    report: AdminReport;
    onClose: () => void;
};

export function AdminReportModal({ report, onClose }: AdminReportModalProps) {
    // onContact is required by the modal's props but unreachable while the contact button is hidden
    return <ItemDetailModal item={toDetailItem(report)} onClose={onClose} onContact={onClose} />;
}
