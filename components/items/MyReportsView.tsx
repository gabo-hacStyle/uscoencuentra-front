"use client";

import { useState } from "react";
import HistoryModal from "@/components/items/HistoryModal";
import ContactFlow from "@/components/items/ItemContactFlow";
import ItemImage from "@/components/items/ItemImage";
import ItemStatusBadge from "@/components/items/ItemStatusBadge";
import ReportActionsMenu, { type MenuAction } from "@/components/items/ReportActionsMenu";
import ReportItemButton from "@/components/items/ReportItemButton";
import ResolveModal, { type ResolveMode } from "@/components/items/ResolveModal";
import { formatPublishedDate } from "@/lib/item-format";
import { ITEM_TEXTS } from "@/lib/item-texts";
import type { Item, ItemStatus } from "@/types/item";

type Tab = "open" | "history";

const SUMMARY: { status: ItemStatus; label: string }[] = [
    { status: "active", label: "Reportes activos" },
    { status: "in_verification", label: "En verificación" },
    { status: "recovered", label: "Recuperados" },
];

const failedLabel = (count: number) =>
    `${count} ${count === 1 ? "intento fallido" : "intentos fallidos"}`;

interface MyReportsViewProps {
    items: Item[]; // all the reports of the user, newest first
}

export default function MyReportsView({ items }: MyReportsViewProps) {
    const [tab, setTab] = useState<Tab>("open");
    const [detailItem, setDetailItem] = useState<Item | null>(null);
    const [historyItem, setHistoryItem] = useState<Item | null>(null);
    const [resolve, setResolve] = useState<{ item: Item; mode: ResolveMode } | null>(null);

    const counts: Record<ItemStatus, number> = {
        active: items.filter((item) => item.status === "active").length,
        in_verification: items.filter((item) => item.status === "in_verification").length,
        recovered: items.filter((item) => item.status === "recovered").length,
    };

    // "Abiertos": still in play. "Historial": closed cases, the last one closed first.
    const openItems = items.filter((item) => item.status !== "recovered");
    const historyItems = items
        .filter((item) => item.status === "recovered")
        .sort(
        (a, b) =>
            Date.parse(b.recoveredAt ?? b.publishedAt) - Date.parse(a.recoveredAt ?? a.publishedAt),
        );

    const tabs: { value: Tab; label: string; count: number }[] = [
        { value: "open", label: "Abiertos", count: openItems.length },
        { value: "history", label: "Historial", count: historyItems.length },
    ];
    const visible = tab === "open" ? openItems : historyItems;

    const emptyTitle =
        items.length === 0
        ? "Aún no has publicado reportes"
        : tab === "open"
            ? "No tienes reportes abiertos"
            : "Aún no hay reportes cerrados";
    const emptyHint =
        items.length === 0
        ? "Publica el primero con el botón «Nuevo reporte»."
        : tab === "open"
            ? "Tus reportes cerrados están en la pestaña Historial."
            : "Cuando marques un reporte como recuperado, aparecerá aquí.";

    return (
        <>
        <header className="flex flex-wrap items-end justify-between gap-4">
            <div>
            <p className="text-xs font-bold uppercase tracking-widest text-usco-wine">Tu actividad</p>
            <h1 className="mt-1 text-4xl font-bold text-usco-ink">Mis reportes</h1>
            <p className="mt-2 text-usco-muted">
                Administra los objetos que has publicado en la plataforma.
            </p>
            </div>
            <ReportItemButton label="Nuevo reporte" />
        </header>

        {/* Counters only: the tabs below are what changes the list */}
        <ul className="mt-8 grid gap-4 sm:grid-cols-3">
            {SUMMARY.map(({ status, label }) => (
            <li key={status} className="rounded-3xl border border-usco-line bg-white p-6">
                <span className="block text-sm text-usco-muted">{label}</span>
                <span
                className={`mt-3 block text-4xl font-bold ${
                    status === "recovered" ? "text-usco-wine" : "text-usco-ink"
                }`}
                >
                {counts[status]}
                </span>
            </li>
            ))}
        </ul>

        <div
            role="tablist"
            aria-label="Tus reportes"
            className="mt-8 flex w-fit gap-1 rounded-full bg-usco-sand/60 p-1"
        >
            {tabs.map(({ value, label, count }) => (
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
                    : "text-usco-ink hover:bg-white"
                }`}
            >
                {label} ({count})
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
            // No overflow-hidden here: it would clip the dropdown menus of the rows
            <ul className="divide-y divide-usco-line rounded-3xl border border-usco-line bg-white">
                {visible.map((item) => {
                const texts = ITEM_TEXTS[item.type];
                const actions: MenuAction[] = [
                    { label: "Ver detalle", onSelect: () => setDetailItem(item) },
                    { label: "Ver historial", onSelect: () => setHistoryItem(item) },
                ];
                if (item.status !== "recovered") {
                    actions.push({
                    label: "Marcar como recuperado",
                    onSelect: () => setResolve({ item, mode: "recovered" }),
                    });
                }
                if (item.status === "in_verification") {
                    actions.push({
                    label: "No coincide (registrar fallo)",
                    onSelect: () => setResolve({ item, mode: "failed" }),
                    });
                }

                return (
                    <li key={item.id} className="flex items-center gap-4 p-4 sm:p-6">
                    <button
                        type="button"
                        onClick={() => setDetailItem(item)}
                        className="flex min-w-0 flex-1 items-center gap-4 text-left"
                    >
                        <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-usco-sand sm:h-20 sm:w-20">
                        <ItemImage src={item.imageUrl} alt={item.title} sizes="80px" compact />
                        </span>
                        <span className="min-w-0">
                        <span className="flex flex-wrap items-center gap-2">
                            <span className="text-lg font-bold text-usco-ink">{item.title}</span>
                            <span
                            className={`rounded-full px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wider ${texts.badgeClassName}`}
                            >
                            {texts.badgeLabel}
                            </span>
                        </span>
                        <span className="mt-1 block text-sm text-usco-muted">
                            {item.status === "recovered" && item.recoveredAt
                            ? `Recuperado ${formatPublishedDate(item.recoveredAt)}`
                            : `Publicado ${formatPublishedDate(item.publishedAt)}`}
                            {" · "}
                            {item.location}
                        </span>
                        {item.failedAttempts > 0 && (
                            <span className="mt-1 block text-xs font-medium text-usco-wine">
                            {failedLabel(item.failedAttempts)}
                            </span>
                        )}
                        </span>
                    </button>

                    <div className="flex shrink-0 flex-col items-end gap-2 sm:flex-row sm:items-center sm:gap-3">
                        <ItemStatusBadge status={item.status} showActive />
                        <ReportActionsMenu label={`Acciones de ${item.title}`} actions={actions} />
                    </div>
                    </li>
                );
                })}
            </ul>
            )}
        </div>

        {detailItem && (
            <ContactFlow key={detailItem.id} item={detailItem} onClose={() => setDetailItem(null)} />
        )}
        {historyItem && (
            <HistoryModal key={historyItem.id} item={historyItem} onClose={() => setHistoryItem(null)} />
        )}
        {resolve && (
            <ResolveModal
            key={`${resolve.item.id}-${resolve.mode}`}
            item={resolve.item}
            mode={resolve.mode}
            onClose={() => setResolve(null)}
            />
        )}
        </>
    );
}