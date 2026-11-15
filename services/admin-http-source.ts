import "server-only";

import type {
    AdminAnalytics,
    AdminFilterOptions,
    AdminGlobalMetrics,
    AdminReport,
    ApiError,
    ApiErrorCode,
    ApiResult,
    HealthStatus,
    PaginatedResponse,
} from "@/types/admin";
import { isAdminReportStatus } from "@/lib/admin-catalogs";
import { buildReportsQuery, buildSummaryQuery } from "@/lib/admin-filters";
import { ADMIN_ERROR_MESSAGES, createApiError, type AdminDataSource } from "./admin-data-source";

/**
 * HTTP data source: calls the backend admin endpoints of the final contract (README.md,
 * "Módulo de administración"). admin.service.ts selects it whenever MOCK_BACKEND is off.
 * Every response is validated: a body that does not follow the contract becomes
 * INVALID_RESPONSE and the UI shows an error, never partial or invented data.
 */

/**
 * Contract paths WITHOUT the "/api" prefix: the shared client (lib/backend/config.ts) adds it,
 * so `/admin/filters` is requested as `{API_URL}/api/admin/filters`.
 */
export const ADMIN_API_PATHS = {
    health: "/health", // public: sent without Bearer
    filters: "/admin/filters",
    globalMetrics: "/admin/dashboard/global-metrics",
    analytics: "/admin/dashboard/analytics",
    reports: "/admin/reports",
    report: (id: string) => `/admin/reports/${encodeURIComponent(id)}`,
} as const;

export type AdminRequest = {
    method: "GET" | "DELETE";
    /** true: sends the session's backend token as Bearer. */
    authenticated: boolean;
};

/** Adds the base URL, the "/api" prefix and (when authenticated) the token. Implemented in admin.service.ts. */
export type AdminFetcher = (path: string, request: AdminRequest) => Promise<Response>;

const AUTHENTICATED_GET: AdminRequest = { method: "GET", authenticated: true };

const ERROR_CODES = Object.keys(ADMIN_ERROR_MESSAGES) as ApiErrorCode[];

function codeFromStatus(status: number): ApiErrorCode {
    if (status === 400 || status === 422) return "BAD_REQUEST";
    if (status === 401) return "UNAUTHORIZED";
    if (status === 403) return "FORBIDDEN";
    if (status === 404) return "NOT_FOUND";
    if (status === 409) return "CONFLICT";
    if (status === 503) return "SERVICE_UNAVAILABLE";
    return "SERVER_ERROR";
}

async function readJson(response: Response): Promise<unknown> {
    try {
        return await response.json();
    } catch {
        return undefined;
    }
}

/** Uses `error.code` from the body when it is a known code; otherwise the HTTP status. */
async function toHttpError(response: Response): Promise<ApiError> {
    const body = await readJson(response);
    const bodyCode = isRecord(body) && isRecord(body.error) ? body.error.code : undefined;
    const code =
        typeof bodyCode === "string" && (ERROR_CODES as string[]).includes(bodyCode)
            ? (bodyCode as ApiErrorCode)
            : codeFromStatus(response.status);
    return createApiError(code, response.status);
}

async function send(fetcher: AdminFetcher, path: string, request: AdminRequest): Promise<Response | ApiError> {
    try {
        return await fetcher(path, request);
    } catch (error) {
        // No answer at all: connection refused, DNS, timeout... (or a missing API_URL in production)
        console.error(`[admin] Sin respuesta del backend en ${routeOf(path)}:`, error instanceof Error ? error.message : error);
        return createApiError("NETWORK_ERROR");
    }
}

/** Path without the query string: `search` may contain an email typed by the admin. */
function routeOf(path: string): string {
    return path.split("?")[0];
}

/**
 * Server-side diagnostic for INVALID_RESPONSE: logs the SHAPE of the body (keys and types),
 * never its values (reports contain emails), so a contract mismatch is easy to spot.
 */
function describeShape(value: unknown): string {
    const typeOf = (entry: unknown) => (entry === null ? "null" : Array.isArray(entry) ? "array" : typeof entry);
    if (!isRecord(value) || Array.isArray(value)) return typeOf(value);
    const fields = Object.entries(value).map(([key, entry]) => `${key}:${typeOf(entry)}`);
    const firstItem = Array.isArray(value.items) ? value.items[0] : undefined;
    if (isRecord(firstItem)) fields.push(`items[0]={${describeShape(firstItem)}}`);
    return fields.join(", ");
}

function invalidResponse(path: string, body: unknown): ApiError {
    console.error(`[admin] Respuesta fuera de contrato en ${routeOf(path)}: ${describeShape(body)}`);
    return createApiError("INVALID_RESPONSE");
}

// ---------- Response validation ----------

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
}

function isCount(value: unknown): value is number {
    return typeof value === "number" && Number.isInteger(value) && value >= 0;
}

function isString(value: unknown): value is string {
    return typeof value === "string";
}

function isNullableString(value: unknown): value is string | null {
    return value === null || typeof value === "string";
}

function isRankedList(value: unknown): boolean {
    return Array.isArray(value) && value.every((entry) => isRecord(entry) && isString(entry.name) && isCount(entry.count));
}

function isOptionList(value: unknown): boolean {
    return (
        Array.isArray(value) &&
        value.every((entry) => isRecord(entry) && isString(entry.value) && entry.value !== "" && isString(entry.label))
    );
}

function isHealthStatus(value: unknown): value is HealthStatus {
    return (
        isRecord(value) &&
        (value.status === "operational" || value.status === "degraded" || value.status === "unavailable") &&
        isString(value.checkedAt)
    );
}

function isFilterOptions(value: unknown): value is AdminFilterOptions {
    return isRecord(value) && isOptionList(value.locations) && isOptionList(value.categories);
}

function isGlobalMetrics(value: unknown): value is AdminGlobalMetrics {
    return (
        isRecord(value) &&
        isCount(value.totalReports) &&
        isCount(value.lostReports) &&
        isCount(value.foundReports) &&
        isCount(value.successfulReunions)
    );
}

function isAnalytics(value: unknown): value is AdminAnalytics {
    if (!isRecord(value) || !isRecord(value.scope)) return false;
    const { scope } = value;
    return (
        isCount(scope.totalReports) &&
        isCount(scope.lostReports) &&
        isCount(scope.successfulReunions) &&
        isRankedList(value.topCategories) &&
        isRankedList(value.topLossLocations)
    );
}

function isAdminReport(value: unknown): value is AdminReport {
    return (
        isRecord(value) &&
        isString(value.id) &&
        (value.type === "lost" || value.type === "found") &&
        isString(value.title) &&
        isString(value.description) &&
        isString(value.category) &&
        isString(value.location) &&
        (value.locationDetail === undefined || isNullableString(value.locationDetail)) &&
        isNullableString(value.imageUrl) &&
        isString(value.eventDate) &&
        isString(value.publishedAt) &&
        isAdminReportStatus(value.status) &&
        isNullableString(value.publisherEmail)
    );
}

function isPaginatedReports(value: unknown): value is PaginatedResponse<AdminReport> {
    return (
        isRecord(value) &&
        Array.isArray(value.items) &&
        value.items.every(isAdminReport) &&
        isCount(value.page) &&
        isCount(value.pageSize) &&
        isCount(value.totalItems) &&
        isCount(value.totalPages)
    );
}

// ---------- Requests ----------

async function getJson<T>(
    fetcher: AdminFetcher,
    path: string,
    isValid: (value: unknown) => value is T,
): Promise<ApiResult<T>> {
    const response = await send(fetcher, path, AUTHENTICATED_GET);
    if (!(response instanceof Response)) return { ok: false, error: response };
    if (!response.ok) return { ok: false, error: await toHttpError(response) };
    const body = await readJson(response);
    return isValid(body) ? { ok: true, data: body } : { ok: false, error: invalidResponse(path, body) };
}

function withQuery(path: string, query: string): string {
    return query ? `${path}?${query}` : path;
}

export function createHttpAdminDataSource(fetcher: AdminFetcher): AdminDataSource {
    return {
        async getHealthStatus() {
            // Public endpoint: no Bearer token is sent
            const response = await send(fetcher, ADMIN_API_PATHS.health, { method: "GET", authenticated: false });
            if (!(response instanceof Response)) return { ok: false, error: response };
            // 503 with a valid body is a legitimate "unavailable" answer, not a query error
            const body = await readJson(response);
            if (isHealthStatus(body)) return { ok: true, data: body };
            return {
                ok: false,
                error: response.ok
                    ? invalidResponse(ADMIN_API_PATHS.health, body)
                    : createApiError(codeFromStatus(response.status), response.status),
            };
        },

        getFilterOptions() {
            return getJson(fetcher, ADMIN_API_PATHS.filters, isFilterOptions);
        },

        getGlobalMetrics() {
            return getJson(fetcher, ADMIN_API_PATHS.globalMetrics, isGlobalMetrics);
        },

        getAnalytics(filters) {
            return getJson(fetcher, withQuery(ADMIN_API_PATHS.analytics, buildSummaryQuery(filters)), isAnalytics);
        },

        getReports(filters) {
            return getJson(fetcher, withQuery(ADMIN_API_PATHS.reports, buildReportsQuery(filters)), isPaginatedReports);
        },

        async deleteReport(id) {
            const response = await send(fetcher, ADMIN_API_PATHS.report(id), { method: "DELETE", authenticated: true });
            if (!(response instanceof Response)) return { ok: false, error: response };
            if (!response.ok) return { ok: false, error: await toHttpError(response) };
            // Contract: 200 { id, deleted: true } (logical deletion). A 204 without body is also accepted.
            return { ok: true, data: { id, deleted: true } };
        },
    };
}
