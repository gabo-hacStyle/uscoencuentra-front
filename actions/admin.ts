"use server";

import type {
    AdminAnalytics,
    AdminFilterOptions,
    AdminGlobalMetrics,
    AdminReport,
    ApiResult,
    DeleteAdminReportResponse,
    HealthStatus,
    PaginatedResponse,
} from "@/types/admin";
import { requireAdmin } from "@/lib/admin-guard";
import { parseReportFilters, parseSummaryFilters } from "@/lib/admin-filters";
import {
    deleteAdminReport,
    getAdminAnalytics,
    getAdminFilterOptions,
    getAdminGlobalMetrics,
    getAdminReports,
    getHealthStatus,
} from "@/services/admin.service";

/**
 * Server Actions used by the admin client components (same pattern as actions/profile.ts):
 * verify the session and role, validate the input, call the service. Inputs are untrusted
 * because a Server Action is reachable through a direct POST. Backend tokens never reach the browser.
 */

const INVALID_INPUT = {
    ok: false as const,
    error: { code: "BAD_REQUEST" as const, message: "Los filtros enviados no son válidos.", status: 400 },
};

const REPORT_ID_PATTERN = /^[A-Za-z0-9_-]{1,64}$/;

export async function fetchAdminHealthAction(): Promise<ApiResult<HealthStatus>> {
    const guard = await requireAdmin();
    if (!guard.ok) return guard;
    return getHealthStatus();
}

export async function fetchAdminFilterOptionsAction(): Promise<ApiResult<AdminFilterOptions>> {
    const guard = await requireAdmin();
    if (!guard.ok) return guard;
    return getAdminFilterOptions();
}

export async function fetchAdminGlobalMetricsAction(): Promise<ApiResult<AdminGlobalMetrics>> {
    const guard = await requireAdmin();
    if (!guard.ok) return guard;
    return getAdminGlobalMetrics();
}

export async function fetchAdminAnalyticsAction(input: unknown): Promise<ApiResult<AdminAnalytics>> {
    const guard = await requireAdmin();
    if (!guard.ok) return guard;

    // Only the places and categories the catalog currently offers are accepted
    const catalog = await getAdminFilterOptions();
    if (!catalog.ok) return catalog;
    const filters = parseSummaryFilters(input, catalog.data);
    if (filters === null) return INVALID_INPUT;
    return getAdminAnalytics(filters);
}

export async function fetchAdminReportsAction(input: unknown): Promise<ApiResult<PaginatedResponse<AdminReport>>> {
    const guard = await requireAdmin();
    if (!guard.ok) return guard;

    const catalog = await getAdminFilterOptions();
    if (!catalog.ok) return catalog;
    const filters = parseReportFilters(input, catalog.data);
    if (filters === null) return INVALID_INPUT;
    return getAdminReports(filters);
}

export async function deleteAdminReportAction(id: unknown): Promise<ApiResult<DeleteAdminReportResponse>> {
    const guard = await requireAdmin();
    if (!guard.ok) return guard;

    if (typeof id !== "string" || !REPORT_ID_PATTERN.test(id)) {
        return {
            ok: false,
            error: { code: "BAD_REQUEST", message: "El identificador del reporte no es válido.", status: 400 },
        };
    }
    return deleteAdminReport(id);
}
