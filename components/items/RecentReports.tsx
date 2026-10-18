"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import ContactFlow from "@/components/items/ItemContactFlow";
import ItemCard from "@/components/items/ItemCard";
import { IconClose } from "@/components/ui/icons";
import {
    toSearchParams,
    type ItemFilters,
    type ItemSort,
    type ItemTypeFilter,
} from "@/lib/filter-items";
import type { Item } from "@/types/item";

const TYPE_OPTIONS: { value: ItemTypeFilter; label: string }[] = [
    { value: "all", label: "Todos los reportes" },
    { value: "lost", label: "Objetos perdidos" },
    { value: "found", label: "Objetos encontrados" },
];

const SORT_OPTIONS: { value: ItemSort; label: string }[] = [
    { value: "recent", label: "Más recientes" },
    { value: "oldest", label: "Más antiguos" },
];

interface RecentReportsProps {
    items: Item[]; // already filtered by the server (service / backend)
    filters: ItemFilters; // current filters, read from the URL by the page
}

export default function RecentReports({ items, filters }: RecentReportsProps) {
    const router = useRouter();
    const pathname = usePathname();
    const [isPending, startTransition] = useTransition();
    const [selectedItem, setSelectedItem] = useState<Item | null>(null);

    // Filters live in the URL: changing one re-runs the server component,
    // which asks the service (and later the backend) for the new list.
    function applyFilters(next: Partial<ItemFilters>) {
        const query = toSearchParams({ ...filters, ...next }).toString();
        startTransition(() => {
        router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
        });
    }

    // Active filters shown as removable chips (the section has no search box of its own)
    const chips = [
        filters.q && { label: `Búsqueda: ${filters.q}`, clear: { q: "" } },
        filters.category && { label: filters.category, clear: { category: null } },
    ].filter(Boolean) as { label: string; clear: Partial<ItemFilters> }[];

    const hasFilters = chips.length > 0 || filters.type !== "all";

    return (
        // scroll-mt leaves room for the sticky navbar when jumping to #catalogo
        <section id="catalogo" aria-labelledby="recent-title" className="scroll-mt-24">
        <p className="text-xs font-bold uppercase tracking-widest text-usco-wine">
            Actualizado en tiempo real
        </p>
        <h2 id="recent-title" className="mt-1 text-3xl font-bold text-usco-ink">
            Reportes recientes
        </h2>

        {/* Filter bar: segmented type control + sort */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <div
            role="group"
            aria-label="Filtrar por tipo de reporte"
            className="flex flex-wrap gap-1 rounded-full bg-usco-sand/60 p-1"
            >
            {TYPE_OPTIONS.map(({ value, label }) => (
                <button
                key={value}
                type="button"
                aria-pressed={filters.type === value}
                onClick={() => applyFilters({ type: value })}
                className={`rounded-full px-4 py-2 text-sm font-bold transition ${
                    filters.type === value
                    ? "bg-usco-wine text-white shadow-sm"
                    : "text-usco-ink hover:bg-white"
                }`}
                >
                {label}
                </button>
            ))}
            </div>

            <label className="flex items-center gap-2 text-sm text-usco-muted">
            <span className="sr-only sm:not-sr-only">Ordenar por</span>
            <select
                value={filters.sort}
                onChange={(event) => applyFilters({ sort: event.target.value as ItemSort })}
                className="rounded-full border border-usco-line bg-white px-4 py-2 font-medium text-usco-ink outline-none focus:border-usco-wine"
            >
                {SORT_OPTIONS.map(({ value, label }) => (
                <option key={value} value={value}>
                    {label}
                </option>
                ))}
            </select>
            </label>
        </div>

        {/* Result count + active filter chips */}
        <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-usco-muted" aria-live="polite">
            <p>
            <strong className="text-usco-ink">{items.length}</strong>{" "}
            {items.length === 1 ? "resultado encontrado" : "resultados encontrados"}
            </p>
            {chips.map(({ label, clear }) => (
            <button
                key={label}
                type="button"
                onClick={() => applyFilters(clear)}
                aria-label={`Quitar filtro: ${label}`}
                className="flex items-center gap-1.5 rounded-full bg-usco-wine/10 px-3 py-1 font-medium text-usco-wine transition hover:bg-usco-wine/20"
            >
                {label}
                <IconClose className="h-3 w-3" />
            </button>
            ))}
        </div>

        {/* aria-busy + reduced opacity while the server fetches the new list */}
        <div
            aria-busy={isPending}
            className={`mt-6 transition-opacity ${isPending ? "opacity-60" : "opacity-100"}`}
        >
            {items.length > 0 ? (
            <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((item) => (
                <li key={item.id}>
                    <ItemCard
                    item={item}
                    showType={filters.type === "all"}
                    onSelect={setSelectedItem}
                    />
                </li>
                ))}
            </ul>
            ) : (
            <div className="rounded-3xl border border-dashed border-usco-line bg-white px-6 py-14 text-center">
                <p className="text-lg font-bold text-usco-ink">No encontramos reportes</p>
                <p className="mt-1 text-usco-muted">
                Prueba con otra búsqueda o quita algún filtro.
                </p>
                {hasFilters && (
                <button
                    type="button"
                    onClick={() => startTransition(() => router.replace(pathname, { scroll: false }))}
                    className="mt-5 rounded-full bg-usco-wine px-5 py-2.5 font-bold text-white transition hover:bg-usco-wine-dark"
                >
                    Limpiar filtros
                </button>
                )}
            </div>
            )}
        </div>

        {selectedItem && (
            <ContactFlow
            key={selectedItem.id}
            item={selectedItem}
            onClose={() => setSelectedItem(null)}
            />
        )}
        </section>
    );
}