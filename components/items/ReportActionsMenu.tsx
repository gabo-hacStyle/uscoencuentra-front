"use client";

import { useEffect, useRef, useState } from "react";
import { IconMore } from "@/components/ui/icons";

export interface MenuAction {
    label: string;
    onSelect: () => void;
}

interface ReportActionsMenuProps {
    label: string; // accessible name of the trigger button
    actions: MenuAction[];
}

export default function ReportActionsMenu({ label, actions }: ReportActionsMenuProps) {
    const [open, setOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Close the menu on outside click or Escape, only while it is open
    useEffect(() => {
        if (!open) return;

        const handlePointerDown = (event: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
            setOpen(false);
        }
        };
        const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === "Escape") setOpen(false);
        };

        document.addEventListener("mousedown", handlePointerDown);
        document.addEventListener("keydown", handleKeyDown);
        return () => {
        document.removeEventListener("mousedown", handlePointerDown);
        document.removeEventListener("keydown", handleKeyDown);
        };
    }, [open]);

    return (
        <div ref={containerRef} className="relative">
        <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-label={label}
            aria-haspopup="menu"
            aria-expanded={open}
            className="grid h-10 w-10 place-items-center rounded-full border border-usco-line text-usco-ink transition hover:bg-usco-cream"
        >
            <IconMore className="h-5 w-5" />
        </button>

        {open && (
            <div
            role="menu"
            className="absolute right-0 top-full z-20 mt-2 w-64 rounded-2xl border border-usco-line bg-white p-2 shadow-xl"
            >
            {actions.map((action) => (
                <button
                key={action.label}
                type="button"
                role="menuitem"
                onClick={() => {
                    setOpen(false);
                    action.onSelect();
                }}
                className="block w-full rounded-xl px-4 py-2.5 text-left text-sm font-medium text-usco-ink transition hover:bg-usco-cream"
                >
                {action.label}
                </button>
            ))}
            </div>
        )}
        </div>
    );
}