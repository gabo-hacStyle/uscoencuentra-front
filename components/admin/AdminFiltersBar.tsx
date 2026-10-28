"use client";

import type { AdminFilterOptions, AdminSummaryFilters, FilterOption } from "@/types/admin";
import { PERIOD_OPTIONS, isReportPeriod } from "@/lib/admin-filters";
import { CalendarIcon, ChevronDownIcon, MapPinIcon, TagIcon, type IconProps } from "./admin-icons";

/**
 * Period / location / category selectors shared by Summary and Reports.
 * Native <select> elements: keyboard, screen reader and touch friendly on every device.
 *
 * Layout: stacked on phones, 2 columns from sm (also at lg, where the side card leaves ~700 px),
 * and one row (3 equal selects + clear button) from xl.
 */

type FilterSelectProps = {
    id: string;
    label: string;
    Icon: (props: IconProps) => React.JSX.Element;
    value: string;
    isActive: boolean;
    options: ReadonlyArray<FilterOption>;
    onChange: (value: string) => void;
    disabled?: boolean;
};

function FilterSelect({ id, label, Icon, value, isActive, options, onChange, disabled }: FilterSelectProps) {
    return (
        <div className="relative min-w-0">
            <label htmlFor={id} className="sr-only">
                {label}
            </label>
            <Icon className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-usco-wine" />
            <select
                id={id}
                value={value}
                disabled={disabled}
                onChange={(event) => onChange(event.target.value)}
                className={`h-11 w-full cursor-pointer appearance-none truncate rounded-full border bg-white pl-10 pr-10 text-sm font-medium text-usco-ink shadow-sm transition-colors hover:border-usco-wine/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-usco-wine/40 disabled:cursor-not-allowed disabled:opacity-60 ${
                    isActive ? "border-usco-wine/50 bg-usco-wine/5" : "border-usco-line"
                }`}
            >
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            <ChevronDownIcon className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-usco-muted" />
        </div>
    );
}

const ALL_VALUE = "";
const ALL_LOCATIONS: FilterOption = { value: ALL_VALUE, label: "Todos los lugares" };
const ALL_CATEGORIES: FilterOption = { value: ALL_VALUE, label: "Todas las categorías" };

type AdminFiltersBarProps = {
    /** Prefix for element ids, unique per section. */
    idPrefix: string;
    value: AdminSummaryFilters;
    /** Catalog from the service (GET /admin/filters). null when it could not be loaded. */
    options: AdminFilterOptions | null;
    onChange: (next: AdminSummaryFilters) => void;
    /** When provided, a "Limpiar filtros" button is shown. */
    onClear?: () => void;
    disabled?: boolean;
};

export function AdminFiltersBar({ idPrefix, value, options, onChange, onClear, disabled }: AdminFiltersBarProps) {
    const catalogUnavailable = options === null;

    return (
        <div className="space-y-2">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-[repeat(3,minmax(0,1fr))_auto]">
                <FilterSelect
                    id={`${idPrefix}-period`}
                    label="Periodo de publicación"
                    Icon={CalendarIcon}
                    value={value.period}
                    isActive={value.period !== "all"}
                    options={PERIOD_OPTIONS}
                    disabled={disabled}
                    onChange={(next) => {
                        if (isReportPeriod(next)) onChange({ ...value, period: next });
                    }}
                />
                <FilterSelect
                    id={`${idPrefix}-location`}
                    label="Lugar"
                    Icon={MapPinIcon}
                    value={value.location ?? ALL_VALUE}
                    isActive={value.location !== null}
                    options={[ALL_LOCATIONS, ...(options?.locations ?? [])]}
                    disabled={disabled || catalogUnavailable}
                    onChange={(next) => onChange({ ...value, location: next === ALL_VALUE ? null : next })}
                />
                <FilterSelect
                    id={`${idPrefix}-category`}
                    label="Categoría"
                    Icon={TagIcon}
                    value={value.category ?? ALL_VALUE}
                    isActive={value.category !== null}
                    options={[ALL_CATEGORIES, ...(options?.categories ?? [])]}
                    disabled={disabled || catalogUnavailable}
                    onChange={(next) => onChange({ ...value, category: next === ALL_VALUE ? null : next })}
                />
                {onClear ? (
                    <button
                        type="button"
                        onClick={onClear}
                        disabled={disabled}
                        className="h-11 whitespace-nowrap rounded-full px-4 text-sm font-semibold text-usco-wine transition-colors hover:bg-usco-wine/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-usco-wine/40 disabled:opacity-60 sm:justify-self-start"
                    >
                        Limpiar filtros
                    </button>
                ) : null}
            </div>
            {catalogUnavailable ? (
                <p role="alert" className="text-sm text-red-800">
                    No se pudieron cargar los lugares y categorías. Recarga la página para intentarlo de nuevo.
                </p>
            ) : null}
        </div>
    );
}
