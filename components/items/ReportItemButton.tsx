"use client";

import { useState } from "react";
import ReportItemModal from "@/components/items/ReportItemModal";
import { IconPlus } from "@/components/ui/icons";

export default function ReportItemButton() {
    const [open, setOpen] = useState(false);

    return (
        <>
        <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex items-center gap-2 rounded-full bg-usco-gold px-6 py-3 font-bold text-usco-ink shadow-sm transition hover:bg-usco-gold-dark"
        >
            <IconPlus className="h-4 w-4" />
            Reportar un objeto
        </button>

        {/* Mounted only while open, so the dialog always starts fresh */}
        {open && <ReportItemModal onClose={() => setOpen(false)} />}
        </>
    );
}