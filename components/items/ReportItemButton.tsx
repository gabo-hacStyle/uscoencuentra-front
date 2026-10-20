"use client";

import { useState } from "react";
import ReportItemModal from "@/components/items/ReportItemModal";
import { IconPlus } from "@/components/ui/icons";

const STYLES = {
    gold: "bg-usco-gold text-usco-ink hover:bg-usco-gold-dark",
    wine: "bg-usco-wine text-white hover:bg-usco-wine-dark",
};

interface ReportItemButtonProps {
    label?: string;
    variant?: keyof typeof STYLES;
}

export default function ReportItemButton({
    label = "Reportar un objeto",
    variant = "gold",
}: ReportItemButtonProps) {
    const [open, setOpen] = useState(false);

    return (
        <>
        <button
            type="button"
            onClick={() => setOpen(true)}
            className={`flex items-center gap-2 rounded-full px-6 py-3 font-bold shadow-sm transition ${STYLES[variant]}`}
        >
            <IconPlus className="h-4 w-4" />
            {label}
        </button>

        {/* Mounted only while open, so the dialog always starts fresh */}
        {open && <ReportItemModal onClose={() => setOpen(false)} />}
        </>
    );
}