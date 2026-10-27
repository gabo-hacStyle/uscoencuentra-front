"use client";

import { useState } from "react";
import ContactFlow from "@/components/items/ItemContactFlow";
import MyReportCard from "@/components/items/MyReportCard";
import ReportItemButton from "@/components/items/ReportItemButton";
import type { Item, ItemStatus } from "@/types/item";

type Tab = "active" | "history";

const SUMMARY: { status: ItemStatus; label: string }[] = [
    { status: "active", label: "Reportes activos" },
    { status: "in_verification", label: "En verificación" },
    { status: "recovered", label: "Entregados" },
];

const TABS: { value: Tab; label: string }[] = [
    { value: "active", label: "Reportes activos" },
    { value: "history", label: "Historial" },
];

interface MyReportsViewProps {
    items: Item[]; // all the reports of the user, newest first
}

export default function MyReportsView({ items }: MyReportsViewProps) {
    const [tab, setTab] = useState<Tab>("active");
    const [detailItem, setDetailItem] = useState<Item | null>(null);

    const counts: Record<ItemStatus, number> = {
        active: items.filter((item) => item.status === "active").length,
        in_verification: items.filter((item) => item.status === "in_verification").length,
        recovered: items.filter((item) => item.status === "recovered").length,
    };

    // "Reportes activos": still open (including those in verification). "Historial": delivered.
    const visible =
        tab === "active"
        ? items.filter((item) => item.status !== "recovered")
        : items.filter((item) => item.status === "recovered");

    const emptyTitle =
        items.length === 0
        ? "Aún no has publicado reportes"
        : tab === "active"
            ? "No tienes reportes activos"
            : "Aún no hay reportes entregados";
    const emptyHint =
        items.length === 0
        ? "Publica el primero con el botón «Nuevo reporte»."
        : tab === "active"
            ? "Tus reportes entregados están en el Historial."
            : "Cuando un reporte se entregue, aparecerá aquí.";

    return (
        <>
        <header className="flex flex-wrap items-end justify-between gap-4">
            <div>
            <p className="text-xs font-bold uppercase tracking-widest text-usco-wine">Tu actividad</p>
            <h1 className="mt-1 text-4xl font-bold text-usco-ink">Mis reportes</h1>
            <p className="mt-2 text-usco-muted">Administra tus objetos reportados y su estado.</p>
            </div>
            <ReportItemButton label="Nuevo reporte" variant="wine" />
        </header>

        <ul className="mt-8 grid gap-4 sm:grid-cols-3">
            {SUMMARY.map(({ status, label }) => (
            <li key={status} className="rounded-3xl border border-usco-line bg-white p-6">
                <span className="block text-sm text-usco-muted">{label}</span>
                <span className="mt-3 block text-4xl font-bold text-usco-ink">{counts[status]}</span>
            </li>
            ))}
        </ul>

        <div
            role="tablist"
            aria-label="Tus reportes"
            className="mt-8 flex w-fit gap-1 rounded-full border border-usco-line bg-white p-1"
        >
            {TABS.map(({ value, label }) => (
            <button
                key={value}
                type="button"
                role="tab"
                id={`tab-${value}`}
                aria-selected={tab === value}
                aria-controls="reports-panel"
                onClick={() => setTab(value)}
                className={`rounded-full px-5 py-2 text-sm font-bold transition ${
                tab === value
                    ? "bg-usco-wine text-white shadow-sm"
                    : "text-usco-muted hover:text-usco-ink"
                }`}
            >
                {label}
            </button>
            ))}
        </div>

        <div role="tabpanel" id="reports-panel" aria-labelledby={`tab-${tab}`} className="mt-4">
            {visible.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-usco-line bg-white px-6 py-14 text-center">
                <p className="text-lg font-bold text-usco-ink">{emptyTitle}</p>
                <p className="mt-1 text-usco-muted">{emptyHint}</p>
            </div>
            ) : (
            <ul className="grid gap-5 md:grid-cols-2">
                {visible.map((item) => (
                <li key={item.id}>
                {/* TODO(teammate): pass onManage here to open the "delivered / failed" modal */}
                <MyReportCard item={item} onView={setDetailItem} />
                </li>
                ))}
            </ul>
            )}
        </div>

        {detailItem && (
            <ContactFlow key={detailItem.id} item={detailItem} onClose={() => setDetailItem(null)} />
        )}
        </>
    );
}