"use client";

import { useRef, useState } from "react";
import type {
    AdminAnalytics,
    AdminFilterOptions,
    AdminGlobalMetrics,
    AdminSummaryFilters,
    ApiError,
    ApiResult,
} from "@/types/admin";
import { fetchAdminAnalyticsAction, fetchAdminGlobalMetricsAction } from "@/actions/admin";
import { DEFAULT_SUMMARY_FILTERS, hasActiveSummaryFilters, isSameSummaryFilters } from "@/lib/admin-filters";
import { buildKpis, buildReunionRate, buildShareRows } from "@/lib/admin-metrics";
import { AdminFiltersBar } from "./AdminFiltersBar";
import { ErrorNotice } from "./AdminFeedback";
import { ChartsSkeleton, KpiGrid, KpiSkeleton, RankingCard, ReunionRateCard } from "./AdminSummaryCards";

type AdminSummarySectionProps = {
    initialFilters: AdminSummaryFilters;
    /** Fetched on the server for the first paint; retries go through Server Actions. */
    initialGlobalMetrics: ApiResult<AdminGlobalMetrics>;
    initialAnalytics: ApiResult<AdminAnalytics>;
    filterOptions: AdminFilterOptions | null;
};

const NETWORK_ERROR: ApiError = { code: "NETWORK_ERROR", message: "No fue posible conectar con el servidor." };

/**
 * Two independent zones, each with its own request, loading, error and empty states:
 * - KPI cards: GLOBAL totals. Loaded once; filters never reload, change or dim them.
 * - Analytics (categories, loss locations, reunion rate): reloaded for every filter combination.
 */
export function AdminSummarySection({
    initialFilters,
    initialGlobalMetrics,
    initialAnalytics,
    filterOptions,
}: AdminSummarySectionProps) {
    const [globalResult, setGlobalResult] = useState<ApiResult<AdminGlobalMetrics> | null>(initialGlobalMetrics);
    const [filters, setFilters] = useState<AdminSummaryFilters>(initialFilters);
    const [analyticsResult, setAnalyticsResult] = useState<ApiResult<AdminAnalytics> | null>(initialAnalytics);
    const [isLoading, setIsLoading] = useState(false);
    const latestRequestId = useRef(0);

    async function retryGlobalMetrics() {
        setGlobalResult(null);
        try {
            setGlobalResult(await fetchAdminGlobalMetricsAction());
        } catch {
            setGlobalResult({ ok: false, error: NETWORK_ERROR });
        }
    }

    async function loadAnalytics(nextFilters: AdminSummaryFilters) {
        const requestId = ++latestRequestId.current;
        setIsLoading(true);
        let nextResult: ApiResult<AdminAnalytics>;
        try {
            nextResult = await fetchAdminAnalyticsAction(nextFilters);
        } catch {
            nextResult = { ok: false, error: NETWORK_ERROR };
        }
        // Ignore responses from older requests (filters changed while waiting)
        if (requestId !== latestRequestId.current) return;
        setAnalyticsResult(nextResult);
        setIsLoading(false);
    }

    function applyFilters(nextFilters: AdminSummaryFilters) {
        if (isSameSummaryFilters(nextFilters, filters)) return;
        setFilters(nextFilters);
        void loadAnalytics(nextFilters);
    }

    function retryAnalytics() {
        // An error never keeps showing old analytics as if they belonged to the new filters
        setAnalyticsResult(null);
        void loadAnalytics(filters);
    }

    const analytics = analyticsResult?.ok ? analyticsResult.data : null;

    return (
        <div className="space-y-8">
            <section aria-labelledby="admin-kpi-heading" className="space-y-3">
                <h2 id="admin-kpi-heading" className="text-lg font-bold text-usco-ink">
                    Totales generales
                </h2>

                {globalResult === null ? <KpiSkeleton /> : null}
                {globalResult?.ok ? <KpiGrid kpis={buildKpis(globalResult.data)} /> : null}
                {globalResult !== null && !globalResult.ok ? (
                    <ErrorNotice
                        title="No se pudieron cargar los totales generales."
                        message="Revisa tu conexión e inténtalo de nuevo."
                        onRetry={() => void retryGlobalMetrics()}
                    />
                ) : null}
            </section>

            <section aria-labelledby="admin-analysis-heading" className="space-y-4">
                <h2 id="admin-analysis-heading" className="text-lg font-bold text-usco-ink">
                    Análisis por filtros
                </h2>

                <div className="space-y-1">
                    <AdminFiltersBar
                        idPrefix="admin-summary"
                        value={filters}
                        options={filterOptions}
                        onChange={applyFilters}
                        onClear={hasActiveSummaryFilters(filters) ? () => applyFilters(DEFAULT_SUMMARY_FILTERS) : undefined}
                    />
                    {/* Reserved line, so the cards below do not jump when the message appears */}
                    <p role="status" aria-live="polite" className="min-h-5 text-sm text-usco-muted">
                        {isLoading ? "Actualizando análisis…" : ""}
                    </p>
                </div>

                {analyticsResult === null ? (
                    <>
                        <p className="sr-only" role="status">
                            Cargando análisis…
                        </p>
                        <ChartsSkeleton />
                    </>
                ) : null}

                {analyticsResult !== null && !analyticsResult.ok ? (
                    <ErrorNotice
                        title="No se pudo cargar el análisis."
                        message="Revisa tu conexión e inténtalo de nuevo."
                        onRetry={retryAnalytics}
                    />
                ) : null}

                {analytics ? (
                    <div
                        aria-busy={isLoading}
                        className={`space-y-4 ${isLoading ? "opacity-60 transition-opacity" : "transition-opacity"}`}
                    >
                        <div className="grid gap-4 xl:grid-cols-2">
                            <RankingCard
                                titleId="admin-top-categories-title"
                                title="Categorías más reportadas"
                                subtitle="Participación sobre los reportes del ámbito filtrado"
                                tone="wine"
                                rows={buildShareRows(analytics.topCategories, analytics.scope.totalReports)}
                                emptyMessage="No hay reportes para los filtros seleccionados."
                            />
                            <RankingCard
                                titleId="admin-top-locations-title"
                                title="Lugares con más pérdidas"
                                subtitle="Participación sobre los reportes de objetos perdidos del ámbito"
                                tone="gold"
                                rows={buildShareRows(analytics.topLossLocations, analytics.scope.lostReports)}
                                emptyMessage="No hay reportes de objetos perdidos para los filtros seleccionados."
                            />
                        </div>
                        <ReunionRateCard
                            rate={buildReunionRate(analytics.scope)}
                            emptyMessage="No hay reportes de objetos perdidos para calcular la tasa con los filtros seleccionados."
                        />
                    </div>
                ) : null}
            </section>
        </div>
    );
}
