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
import { backendFetch } from "@/lib/backend/client";
import { isMockBackendEnabled } from "@/lib/backend/config";
import { getBackendAccessToken } from "@/lib/backend/session";
import { createApiError, type AdminDataSource } from "./admin-data-source";
import { createHttpAdminDataSource, type AdminFetcher } from "./admin-http-source";
import { mockAdminDataSource } from "./admin-mock-source";

/**
 * Admin data access. SERVER-SIDE ONLY ("server-only"): imported by app/admin/page.tsx and
 * actions/admin.ts, never by client components. Components never build URLs or call fetch.
 *
 * Data source selection (read on every call), governed by the team-wide MOCK_BACKEND switch:
 * - MOCK_BACKEND=true (development only) -> mock data inside the Next server.
 * - otherwise (always in production)      -> the backend /api/admin/* and /api/health endpoints.
 */
export function getAdminDataSourceMode(): AdminDataSourceMode {
    return isMockBackendEnabled() ? "mock" : "http";
}

/**
 * Shared transport (lib/backend/client.ts): API_URL + "/api", Accept, no cache, timeout.
 * Protected routes carry the backend token read on the server (lib/backend/session.ts).
 */
const adminFetcher: AdminFetcher = async (path, { method, authenticated }) => {
    if (!authenticated) return backendFetch(path, { method });

    const accessToken = await getBackendAccessToken();
    // Without a valid backend token the request would be rejected anyway: answer as the backend would (401)
    if (!accessToken) return new Response(null, { status: 401 });
    return backendFetch(path, { method, accessToken });
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
