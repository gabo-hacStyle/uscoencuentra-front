import type { Item } from "@/types/item";

/**
 * Admin panel contract types.
 *
 * The frontend defines these shapes; the backend adapts its responses to them.
 * docs/admin-api-contract.md documents the HTTP contract that mirrors this file.
 */

/** Internal sections of the admin panel. URL: /admin (summary) and /admin?section=reports. */
export type AdminSection = "summary" | "reports";

/**
 * Where the admin data comes from.
 * - "mock": simulated data inside the Next server (the admin endpoints do not exist yet).
 * - "http": the backend endpoints of docs/admin-api-contract.md.
 */
export type AdminDataSourceMode = "mock" | "http";

/** Time windows applied to `publishedAt`, evaluated in America/Bogota. */
export type ReportPeriod =
    | "all"
    | "today"
    | "last_7_days"
    | "this_week"
    | "last_week"
    | "last_30_days"
    | "this_month"
    | "last_month"
    | "last_6_months"
    | "this_year";

/** Filters of the Summary analytics. `null` means "all". */
export type AdminSummaryFilters = {
    period: ReportPeriod;
    location: string | null;
    category: string | null;
};

/** Reports list filters: same filters + text search + pagination. */
export type AdminReportFilters = AdminSummaryFilters & {
    /** Matches the item title and the publisher email (partial, case- and accent-insensitive). */
    search: string;
    /** 1-based page number. */
    page: number;
    pageSize: number;
};

// ---------- Filter catalogs ----------

export type FilterOption = {
    /** Value sent to the API and compared with `Item.location` / `Item.category`. */
    value: string;
    /** Text shown in the selector. */
    label: string;
};

/** Selectable places and categories. Provided by the backend (GET /admin/filters). */
export type AdminFilterOptions = {
    locations: FilterOption[];
    categories: FilterOption[];
};

// ---------- System health ----------

export type HealthState = "operational" | "degraded" | "unavailable";

export type HealthServiceCheck = {
    name: string;
    status: HealthState;
};

export type HealthStatus = {
    status: HealthState;
    /** ISO 8601 instant of the check. */
    checkedAt: string;
    /** Optional per-service breakdown. The UI only needs `status`. */
    services?: HealthServiceCheck[];
};

// ---------- Dashboard ----------

/**
 * GLOBAL totals for the four KPI cards (GET /admin/dashboard/global-metrics).
 * They never depend on period, location or category.
 */
export type AdminGlobalMetrics = {
    /** Every published report (lost + found). */
    totalReports: number;
    lostReports: number;
    foundReports: number;
    /** Reunions confirmed by the backend. Independent aggregate: never derived from report statuses. */
    successfulReunions: number;
};

/** Counts inside the filtered scope (period + location + category). Denominators of the analytics. */
export type AdminScopeMetrics = {
    totalReports: number;
    lostReports: number;
    /** Confirmed reunions anchored to a report of the scope. */
    successfulReunions: number;
};

export type RankedCount = {
    name: string;
    count: number;
};

/** Filtered analytics (GET /admin/dashboard/analytics). */
export type AdminAnalytics = {
    scope: AdminScopeMetrics;
    /** Up to 3 categories, count desc, over ALL reports of the scope. */
    topCategories: RankedCount[];
    /** Up to 3 locations, count desc, over LOST reports of the scope only. */
    topLossLocations: RankedCount[];
};

// ---------- Admin reports list ----------

/** The only statuses the moderation list contains. Closed/history reports never appear. */
export type AdminReportStatus = "active" | "in_verification";

/**
 * A report as listed in the admin panel.
 *
 * It reuses the shared `Item` model (same field names) and only:
 * - drops `isOwner` (a per-viewer flag, not an admin concept),
 * - narrows `status` to the two statuses this list can contain,
 * - adds `publisherEmail`, the email of the person who published the report.
 */
export type AdminReport = Omit<Item, "isOwner" | "status"> & {
    status: AdminReportStatus;
    publisherEmail: string | null;
};

export type PaginatedResponse<T> = {
    items: T[];
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
};

export type DeleteAdminReportResponse = {
    id: string;
    deleted: true;
};

// ---------- Errors ----------

export type ApiErrorCode =
    | "BAD_REQUEST"
    | "UNAUTHORIZED"
    | "FORBIDDEN"
    | "NOT_FOUND"
    | "CONFLICT"
    | "SERVER_ERROR"
    | "SERVICE_UNAVAILABLE"
    | "NETWORK_ERROR"
    | "INVALID_RESPONSE";

export type ApiError = {
    code: ApiErrorCode;
    /** User-facing message in Spanish. */
    message: string;
    /** HTTP status, when the error came from an HTTP response. */
    status?: number;
};

/** Services and Server Actions return results instead of throwing, so the UI can show proper errors. */
export type ApiResult<T> = { ok: true; data: T } | { ok: false; error: ApiError };
