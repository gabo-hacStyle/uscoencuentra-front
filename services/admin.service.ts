import "server-only";

import type {
    AdminAnalytics,
    AdminDataSourceMode,
    AdminFilterOptions,
    AdminGlobalMetrics,
    AdminReport,
    AdminReportFilters,
    AdminSummaryFilters,
    ApiResult,
    DeleteAdminReportResponse,
    HealthStatus,
    PaginatedResponse,
} from "@/types/admin";
import { auth } from "@/auth";
import { API_URL, isMockBackendEnabled } from "@/services/auth.service";
import { createApiError, type AdminDataSource } from "./admin-data-source";
import { createHttpAdminDataSource, type AdminFetcher } from "./admin-http-source";
import { mockAdminDataSource } from "./admin-mock-source";

/**
 * Admin data access. SERVER-SIDE ONLY ("server-only"): imported by app/admin/page.tsx and
 * actions/admin.ts, never by client components. Components never build URLs or call fetch.
 *
 * Data source selection (read on every call):
 * - MOCK_BACKEND=true      -> mock (there is no real backend token to send).
 * - ADMIN_DATA_SOURCE=http -> HTTP endpoints of docs/admin-api-contract.md.
 * - anything else          -> mock (default while the admin endpoints do not exist).
 */
export function getAdminDataSourceMode(): AdminDataSourceMode {
    if (isMockBackendEnabled()) return "mock";
    return process.env.ADMIN_DATA_SOURCE === "http" ? "http" : "mock";
}

const BACKEND_TIMEOUT_MS = 10_000;

/** Same conventions as profile.service.ts: API_URL, Bearer token from the session, no cache, timeout. */
const adminFetcher: AdminFetcher = async (path, init) => {
    const session = await auth();
    // Without a backend token the request would be rejected anyway: answer as the backend would (401)
    if (!session?.accessToken) return new Response(null, { status: 401 });

    return fetch(`${API_URL}${path}`, {
        ...init,
        headers: { Accept: "application/json", Authorization: `Bearer ${session.accessToken}` },
        cache: "no-store",
        signal: AbortSignal.timeout(BACKEND_TIMEOUT_MS),
    });
};

const httpAdminDataSource = createHttpAdminDataSource(adminFetcher);

function activeDataSource(): AdminDataSource {
    return getAdminDataSourceMode() === "http" ? httpAdminDataSource : mockAdminDataSource;
}

/** A data source bug must not crash the page: it becomes a SERVER_ERROR result. */
async function safely<T>(call: (source: AdminDataSource) => Promise<ApiResult<T>>): Promise<ApiResult<T>> {
    try {
        return await call(activeDataSource());
    } catch (error) {
        console.error("[admin] Unexpected data source error:", error);
        return { ok: false, error: createApiError("SERVER_ERROR") };
    }
}

export function getHealthStatus(): Promise<ApiResult<HealthStatus>> {
    return safely((source) => source.getHealthStatus());
}

export function getAdminFilterOptions(): Promise<ApiResult<AdminFilterOptions>> {
    return safely((source) => source.getFilterOptions());
}

export function getAdminGlobalMetrics(): Promise<ApiResult<AdminGlobalMetrics>> {
    return safely((source) => source.getGlobalMetrics());
}

export function getAdminAnalytics(filters: AdminSummaryFilters): Promise<ApiResult<AdminAnalytics>> {
    return safely((source) => source.getAnalytics(filters));
}

export function getAdminReports(filters: AdminReportFilters): Promise<ApiResult<PaginatedResponse<AdminReport>>> {
    return safely((source) => source.getReports(filters));
}

export function deleteAdminReport(id: string): Promise<ApiResult<DeleteAdminReportResponse>> {
    return safely((source) => source.deleteReport(id));
}
