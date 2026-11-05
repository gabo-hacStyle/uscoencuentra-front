import "server-only";

import type {
    AdminAnalytics,
    AdminReport,
    AdminSummaryFilters,
    RankedCount,
} from "@/types/admin";
import { contactsMock, itemsMock } from "@/mocks/items.mock";
import {
    ADMIN_ANALYTICS_REPORTS_MOCK,
    ADMIN_CONFIRMED_REUNIONS_MOCK,
    HEALTH_MOCK_SERVICES,
    MOCK_HEALTH_SCENARIO,
    type MockAnalyticsReport,
} from "@/mocks/admin-dashboard.mock";
import { isAdminReportStatus, projectFilterOptions } from "@/lib/admin-catalogs";
import { isWithinPeriod, normalizeSearchText } from "@/lib/admin-filters";
import { createApiError, type AdminDataSource } from "./admin-data-source";

/**
 * MOCK data source: used while the admin endpoints do not exist (see admin.service.ts).
 *
 * It simulates the backend inside the Next server, applying the rules of
 * docs/admin-api-contract.md to fictitious data. It never calls the network and never claims
 * to: the panel shows a "modo demostración" notice whenever this source is active.
 */

const MOCK_LATENCY_MS = 350;
const TOP_LIMIT = 3;

function simulateLatency(): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, MOCK_LATENCY_MS));
}

// Simulated deletions live in the Next server memory (lost when `npm run dev` restarts), like the
// dummy phone numbers of profile.service.ts. The shared mocks are never mutated.
const globalForMock = globalThis as unknown as { __uscoAdminDeletedReportIds?: Set<string> };
const deletedReportIds = (globalForMock.__uscoAdminDeletedReportIds ??= new Set<string>());

// ---------- Moderation list (from mocks/items.mock.ts) ----------

type MockItem = (typeof itemsMock)[number];

/**
 * Item -> AdminReport. Returns null for reports outside the moderation list: closed ones
 * (`closed` simulates the backend's history) and the ones deleted in this simulation.
 * The email comes from contactsMock; WhatsApp and the masked name are not copied.
 */
function toAdminReport(item: MockItem): AdminReport | null {
    if (item.closed || deletedReportIds.has(item.id) || !isAdminReportStatus(item.status)) return null;
    const { isOwner, closed, ...fields } = item;
    void isOwner; // per-viewer flag, not part of the admin model
    void closed;
    return { ...fields, status: item.status, publisherEmail: contactsMock[item.id]?.email ?? null };
}

function matchesSearch(report: AdminReport, normalizedTerm: string): boolean {
    if (!normalizedTerm) return true;
    if (normalizeSearchText(report.title).includes(normalizedTerm)) return true;
    return report.publisherEmail !== null && normalizeSearchText(report.publisherEmail).includes(normalizedTerm);
}

// ---------- Analytics (from mocks/admin-dashboard.mock.ts) ----------

function isInScope(report: MockAnalyticsReport, filters: AdminSummaryFilters, now: Date): boolean {
    return (
        isWithinPeriod(report.publishedAt, filters.period, now) &&
        (filters.location === null || report.location === filters.location) &&
        (filters.category === null || report.category === filters.category)
    );
}

/** Count desc, ties in alphabetical order, zero counts omitted, top 3. */
function rank(names: ReadonlyArray<string>): RankedCount[] {
    const counts = new Map<string, number>();
    for (const name of names) counts.set(name, (counts.get(name) ?? 0) + 1);
    return [...counts]
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "es"))
        .slice(0, TOP_LIMIT);
}

function aggregateAnalytics(filters: AdminSummaryFilters, now: Date): AdminAnalytics {
    const scoped = ADMIN_ANALYTICS_REPORTS_MOCK.filter((report) => isInScope(report, filters, now));
    const lost = scoped.filter((report) => report.type === "lost");
    const lostIds = new Set(lost.map((report) => report.id));
    // A reunion belongs to the scope when its lost report does (period, place and category of that report)
    const successfulReunions = ADMIN_CONFIRMED_REUNIONS_MOCK.filter((reunion) => lostIds.has(reunion.lostReportId)).length;

    return {
        scope: { totalReports: scoped.length, lostReports: lost.length, successfulReunions },
        topCategories: rank(scoped.map((report) => report.category)),
        topLossLocations: rank(lost.map((report) => report.location)),
    };
}

export const mockAdminDataSource: AdminDataSource = {
    async getHealthStatus() {
        await simulateLatency();
        if (MOCK_HEALTH_SCENARIO === "request_error") {
            return { ok: false, error: createApiError("SERVICE_UNAVAILABLE", 503) };
        }
        return {
            ok: true,
            data: {
                status: MOCK_HEALTH_SCENARIO,
                checkedAt: new Date().toISOString(),
                services: HEALTH_MOCK_SERVICES[MOCK_HEALTH_SCENARIO].map((service) => ({ ...service })),
            },
        };
    },

    async getFilterOptions() {
        // No simulated latency: the Server Actions read the catalog before every query
        return { ok: true, data: projectFilterOptions() };
    },

    async getGlobalMetrics() {
        await simulateLatency();
        const lostReports = ADMIN_ANALYTICS_REPORTS_MOCK.filter((report) => report.type === "lost").length;
        return {
            ok: true,
            data: {
                totalReports: ADMIN_ANALYTICS_REPORTS_MOCK.length,
                lostReports,
                foundReports: ADMIN_ANALYTICS_REPORTS_MOCK.length - lostReports,
                successfulReunions: ADMIN_CONFIRMED_REUNIONS_MOCK.length,
            },
        };
    },

    async getAnalytics(filters) {
        await simulateLatency();
        return { ok: true, data: aggregateAnalytics(filters, new Date()) };
    },

    async getReports(filters) {
        await simulateLatency();
        const now = new Date();
        const term = normalizeSearchText(filters.search);

        const matches = itemsMock
            .map(toAdminReport)
            .filter((report): report is AdminReport => report !== null)
            .filter((report) => isWithinPeriod(report.publishedAt, filters.period, now))
            .filter((report) => filters.location === null || report.location === filters.location)
            .filter((report) => filters.category === null || report.category === filters.category)
            .filter((report) => matchesSearch(report, term))
            .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));

        const totalItems = matches.length;
        const totalPages = Math.max(1, Math.ceil(totalItems / filters.pageSize));
        const start = (filters.page - 1) * filters.pageSize;

        return {
            ok: true,
            data: {
                items: matches.slice(start, start + filters.pageSize),
                page: filters.page,
                pageSize: filters.pageSize,
                totalItems,
                totalPages,
            },
        };
    },

    async deleteReport(id) {
        await simulateLatency();
        const item = itemsMock.find((candidate) => candidate.id === id);
        if (!item || toAdminReport(item) === null) return { ok: false, error: createApiError("NOT_FOUND", 404) };
        // Only the simulated state changes: the report disappears from this mock list until the server restarts
        deletedReportIds.add(id);
        return { ok: true, data: { id, deleted: true } };
    },
};
