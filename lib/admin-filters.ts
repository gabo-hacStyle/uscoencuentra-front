import type {
    AdminFilterOptions,
    AdminReportFilters,
    AdminSummaryFilters,
    FilterOption,
    ReportPeriod,
} from "@/types/admin";
import { isCatalogValue } from "@/lib/admin-catalogs";

/**
 * Filter definitions, period semantics (America/Bogota), validation and query serialization.
 * Pure functions: safe to use on the server and in client components.
 */

// ---------- Periods ----------

export const PERIOD_LABELS: Record<ReportPeriod, string> = {
    all: "Todo el tiempo",
    today: "Hoy",
    last_7_days: "Últimos 7 días",
    this_week: "Esta semana",
    last_week: "Semana pasada",
    last_30_days: "Últimos 30 días",
    this_month: "Este mes",
    last_month: "Mes pasado",
    last_6_months: "Últimos 6 meses",
    this_year: "Este año",
};

const REPORT_PERIODS = Object.keys(PERIOD_LABELS) as ReportPeriod[];

export const PERIOD_OPTIONS: ReadonlyArray<{ value: ReportPeriod; label: string }> = REPORT_PERIODS.map(
    (value) => ({ value, label: PERIOD_LABELS[value] }),
);

export function isReportPeriod(value: unknown): value is ReportPeriod {
    return typeof value === "string" && (REPORT_PERIODS as string[]).includes(value);
}

export const BOGOTA_TIME_ZONE = "America/Bogota";

/** Colombia uses UTC-05:00 all year (no daylight saving time). */
const BOGOTA_UTC_OFFSET_MS = -5 * 60 * 60 * 1000;

type BogotaCalendarDate = {
    year: number;
    /** 0-based month. */
    month: number;
    day: number;
    /** 0 = Sunday ... 6 = Saturday. */
    weekday: number;
};

function toBogotaCalendarDate(instant: Date): BogotaCalendarDate {
    const shifted = new Date(instant.getTime() + BOGOTA_UTC_OFFSET_MS);
    return {
        year: shifted.getUTCFullYear(),
        month: shifted.getUTCMonth(),
        day: shifted.getUTCDate(),
        weekday: shifted.getUTCDay(),
    };
}

/** 00:00 in Bogotá for a calendar date. Out-of-range day/month values roll over (Date.UTC semantics). */
function bogotaMidnight(year: number, month: number, day: number): Date {
    return new Date(Date.UTC(year, month, day) - BOGOTA_UTC_OFFSET_MS);
}

function daysInMonth(year: number, month: number): number {
    return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
}

/** Half-open interval [start, end). */
export type PeriodRange = { start: Date; end: Date };

/**
 * Period semantics (all boundaries at 00:00 America/Bogota, weeks start on Monday):
 * - today:          [today, tomorrow)
 * - last_7_days:    [today - 6 days, tomorrow)        -> 7 calendar days including today
 * - this_week:      [this Monday, next Monday)
 * - last_week:      [previous Monday, this Monday)
 * - last_30_days:   [today - 29 days, tomorrow)       -> 30 calendar days including today
 * - this_month:     [1st of this month, 1st of next month)
 * - last_month:     [1st of previous month, 1st of this month)
 * - last_6_months:  [same day 6 months ago, tomorrow) -> day clamped to the month length
 * - this_year:      [Jan 1st, Jan 1st of next year)
 * - all:            no time restriction (returns null)
 */
export function getPeriodRange(period: ReportPeriod, now: Date = new Date()): PeriodRange | null {
    if (period === "all") return null;

    const { year, month, day, weekday } = toBogotaCalendarDate(now);
    const startOfTomorrow = bogotaMidnight(year, month, day + 1);
    const daysSinceMonday = (weekday + 6) % 7;

    switch (period) {
        case "today":
            return { start: bogotaMidnight(year, month, day), end: startOfTomorrow };
        case "last_7_days":
            return { start: bogotaMidnight(year, month, day - 6), end: startOfTomorrow };
        case "this_week":
            return {
                start: bogotaMidnight(year, month, day - daysSinceMonday),
                end: bogotaMidnight(year, month, day - daysSinceMonday + 7),
            };
        case "last_week":
            return {
                start: bogotaMidnight(year, month, day - daysSinceMonday - 7),
                end: bogotaMidnight(year, month, day - daysSinceMonday),
            };
        case "last_30_days":
            return { start: bogotaMidnight(year, month, day - 29), end: startOfTomorrow };
        case "this_month":
            return { start: bogotaMidnight(year, month, 1), end: bogotaMidnight(year, month + 1, 1) };
        case "last_month":
            return { start: bogotaMidnight(year, month - 1, 1), end: bogotaMidnight(year, month, 1) };
        case "last_6_months": {
            const targetMonth = month - 6;
            const targetDay = Math.min(day, daysInMonth(year, targetMonth));
            return { start: bogotaMidnight(year, targetMonth, targetDay), end: startOfTomorrow };
        }
        case "this_year":
            return { start: bogotaMidnight(year, 0, 1), end: bogotaMidnight(year + 1, 0, 1) };
        default: {
            const exhaustive: never = period;
            return exhaustive;
        }
    }
}

/** True when an ISO instant (e.g. `publishedAt`) falls inside the period. Invalid dates never match. */
export function isWithinPeriod(isoInstant: string, period: ReportPeriod, now: Date = new Date()): boolean {
    const range = getPeriodRange(period, now);
    if (range === null) return true;
    const time = Date.parse(isoInstant);
    if (Number.isNaN(time)) return false;
    return time >= range.start.getTime() && time < range.end.getTime();
}

// ---------- Defaults and limits ----------

export const ADMIN_REPORTS_PAGE_SIZE = 20;
export const ADMIN_REPORTS_MAX_PAGE_SIZE = 50;
export const ADMIN_SEARCH_MAX_LENGTH = 100;

export const DEFAULT_SUMMARY_FILTERS: AdminSummaryFilters = {
    period: "all",
    location: null,
    category: null,
};

export const DEFAULT_REPORT_FILTERS: AdminReportFilters = {
    ...DEFAULT_SUMMARY_FILTERS,
    search: "",
    page: 1,
    pageSize: ADMIN_REPORTS_PAGE_SIZE,
};

export function hasActiveSummaryFilters(filters: AdminSummaryFilters): boolean {
    return filters.period !== "all" || filters.location !== null || filters.category !== null;
}

export function isSameSummaryFilters(a: AdminSummaryFilters, b: AdminSummaryFilters): boolean {
    return a.period === b.period && a.location === b.location && a.category === b.category;
}

export function isSameReportFilters(a: AdminReportFilters, b: AdminReportFilters): boolean {
    return (
        isSameSummaryFilters(a, b) && a.search === b.search && a.page === b.page && a.pageSize === b.pageSize
    );
}

// ---------- Search ----------

/** Lowercase, trimmed and without diacritics: "Audífonos" and "AUDIFONOS" both become "audifonos". */
export function normalizeSearchText(value: string): string {
    return value.normalize("NFD").replace(/[̀-ͯ]/g, "").toLocaleLowerCase("es").trim();
}

// ---------- Validation (Server Action inputs are untrusted) ----------

function readNullableCatalogValue(
    value: unknown,
    options: ReadonlyArray<FilterOption>,
): { valid: true; value: string | null } | { valid: false } {
    if (value === null || value === undefined || value === "") return { valid: true, value: null };
    if (typeof value === "string" && isCatalogValue(options, value)) return { valid: true, value };
    return { valid: false };
}

function readPositiveInteger(value: unknown, fallback: number, max?: number): number | null {
    if (value === undefined) return fallback;
    if (typeof value !== "number" || !Number.isInteger(value) || value < 1) return null;
    if (max !== undefined && value > max) return null;
    return value;
}

/**
 * Returns sanitized filters, or null when any value is not allowed.
 * `catalog` is the current filter catalog (GET /admin/filters), so only offered values pass.
 */
export function parseSummaryFilters(input: unknown, catalog: AdminFilterOptions): AdminSummaryFilters | null {
    if (typeof input !== "object" || input === null) return null;
    const record = input as Record<string, unknown>;

    const period = record.period ?? "all";
    if (!isReportPeriod(period)) return null;

    const location = readNullableCatalogValue(record.location, catalog.locations);
    const category = readNullableCatalogValue(record.category, catalog.categories);
    if (!location.valid || !category.valid) return null;

    return { period, location: location.value, category: category.value };
}

export function parseReportFilters(input: unknown, catalog: AdminFilterOptions): AdminReportFilters | null {
    const base = parseSummaryFilters(input, catalog);
    if (base === null) return null;
    const record = input as Record<string, unknown>;

    const rawSearch = record.search ?? "";
    if (typeof rawSearch !== "string") return null;
    const search = rawSearch.trim();
    if (search.length > ADMIN_SEARCH_MAX_LENGTH) return null;

    const page = readPositiveInteger(record.page, 1);
    const pageSize = readPositiveInteger(record.pageSize, ADMIN_REPORTS_PAGE_SIZE, ADMIN_REPORTS_MAX_PAGE_SIZE);
    if (page === null || pageSize === null) return null;

    return { ...base, search, page, pageSize };
}

// ---------- Query strings (contract convention) ----------

/** Omitted parameter = "all". Values are the catalog values, URL-encoded by URLSearchParams. */
export function buildSummaryQuery(filters: AdminSummaryFilters): string {
    const params = new URLSearchParams();
    if (filters.period !== "all") params.set("period", filters.period);
    if (filters.location) params.set("location", filters.location);
    if (filters.category) params.set("category", filters.category);
    return params.toString();
}

export function buildReportsQuery(filters: AdminReportFilters): string {
    const params = new URLSearchParams(buildSummaryQuery(filters));
    const search = filters.search.trim();
    if (search) params.set("search", search);
    params.set("page", String(filters.page));
    params.set("pageSize", String(filters.pageSize));
    return params.toString();
}
