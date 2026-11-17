"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import ContactFlow from "@/components/items/ItemContactFlow";
import ManageStatusModal from "@/components/items/ManageStatusModal";
import MyReportCard from "@/components/items/MyReportCard";
import ReportItemButton from "@/components/items/ReportItemButton";
import type { Item } from "@/types/item";

type Tab = "active" | "history";

const TABS: { value: Tab; label: string }[] = [
    { value: "active", label: "Reportes activos" },
    { value: "history", label: "Historial" },
];

interface MyReportsViewProps {
    active: Item[]; // open reports (status "active" or "in_verification"), newest first
    history: Item[]; // closed reports and reports with a failed verification; a report can also be in "active"
}

export default function MyReportsView({ active, history }: MyReportsViewProps) {
    const router = useRouter();
    const [tab, setTab] = useState<Tab>("active");
    const [detailItem, setDetailItem] = useState<Item | null>(null);
    const [managedItem, setManagedItem] = useState<Item | null>(null);

    // The lists come from the server (props); router.refresh() reloads them after a change
    const activeItems = active;
    const historyItems = history;

    const summary = [
        { label: "Reportes activos", count: activeItems.filter((item) => item.status === "active").length },
        { label: "En verificación", count: activeItems.filter((item) => item.status === "in_verification").length },
        { label: "En el historial", count: historyItems.length },
    ];

    const visible = tab === "active" ? activeItems : historyItems;
    const hasReports = activeItems.length + historyItems.length > 0;

    const emptyTitle = !hasReports
        ? "Aún no has publicado reportes"
        : tab === "active"
            ? "No tienes reportes activos"
            : "Aún no hay reportes en el historial";
    const emptyHint = !hasReports
        ? "Publica el primero con el botón «Nuevo reporte»."
        : tab === "active"
            ? "Tus reportes cerrados están en el Historial."
            : "Cuando cierres un reporte, aparecerá aquí.";

    // The backend already changed the state: reload the lists from the server
    function handleResolved() {
        router.refresh();
    }

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
                {summary.map(({ label, count }) => (
                    <li key={label} className="rounded-3xl border border-usco-line bg-white p-6">
                        <span className="block text-sm text-usco-muted">{label}</span>
                        <span className="mt-3 block text-4xl font-bold text-usco-ink">{count}</span>
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
                                {/* The history tab cannot be managed again, so no onManage there */}
                                <MyReportCard
                                    item={item}
                                    onView={setDetailItem}
                                    onManage={tab === "active" ? setManagedItem : undefined}
                                    isClosed={tab === "history"}
                                />
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {detailItem && (
                <ContactFlow key={detailItem.id} item={detailItem} onClose={() => setDetailItem(null)} />
            )}

            {managedItem && (
                <ManageStatusModal
                    key={managedItem.id}
                    item={managedItem}
                    onClose={() => setManagedItem(null)}
                    onResolved={handleResolved}
                />
            )}
        </>
    );
}