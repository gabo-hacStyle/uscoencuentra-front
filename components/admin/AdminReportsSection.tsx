"use client";

import { useEffect, useRef, useState } from "react";
import type {
    AdminDataSourceMode,
    AdminFilterOptions,
    AdminReport,
    AdminReportFilters,
    AdminSummaryFilters,
    ApiError,
    ApiResult,
    PaginatedResponse,
} from "@/types/admin";
import { deleteAdminReportAction, fetchAdminReportsAction } from "@/actions/admin";
import {
    ADMIN_SEARCH_MAX_LENGTH,
    DEFAULT_REPORT_FILTERS,
    hasActiveSummaryFilters,
    isSameReportFilters,
} from "@/lib/admin-filters";
import { formatCount, pluralize } from "@/lib/admin-metrics";
import { AdminFiltersBar } from "./AdminFiltersBar";
import { EmptyNotice, ErrorNotice } from "./AdminFeedback";
import { AdminReportModal } from "./AdminReportModal";
import { AdminReportRow } from "./AdminReportRow";
import { ConfirmDialog } from "./ConfirmDialog";
import { ChevronLeftIcon, ChevronRightIcon, SearchIcon } from "./admin-icons";

const SEARCH_DEBOUNCE_MS = 300;

type ReportsResult = ApiResult<PaginatedResponse<AdminReport>>;

type AdminReportsSectionProps = {
    initialFilters: AdminReportFilters;
    /** Fetched on the server for the first paint; later requests go through Server Actions. */
    initialResult: ReportsResult;
    filterOptions: AdminFilterOptions | null;
    /** "mock": deletions only change the simulated data, and the texts say so. */
    dataSourceMode: AdminDataSourceMode;
};

function deleteErrorMessage(error: ApiError): string {
    switch (error.code) {
        case "NOT_FOUND":
            return "El reporte ya no existe o fue eliminado previamente.";
        case "FORBIDDEN":
            return "No tienes permisos para eliminar este reporte.";
        case "UNAUTHORIZED":
            return "Tu sesión expiró. Inicia sesión de nuevo.";
        default:
            return "No se pudo eliminar el reporte. Inténtalo de nuevo.";
    }
}

const NETWORK_ERROR: ApiError = { code: "NETWORK_ERROR", message: "No fue posible conectar con el servidor." };

export function AdminReportsSection({
    initialFilters,
    initialResult,
    filterOptions,
    dataSourceMode,
}: AdminReportsSectionProps) {
    const isMock = dataSourceMode === "mock";
    const [searchInput, setSearchInput] = useState(initialFilters.search);
    const [filters, setFilters] = useState<AdminReportFilters>(initialFilters);
    const [result, setResult] = useState<ReportsResult | null>(initialResult);
    const [isLoading, setIsLoading] = useState(false);

    /**
     * Ids confirmed as deleted by the service. They are hidden right away, before the list is
     * reloaded, so the row never flashes back while the new page is on its way.
     */
    const [removedIds, setRemovedIds] = useState<ReadonlySet<string>>(() => new Set());

    const [detailReport, setDetailReport] = useState<AdminReport | null>(null);
    const [reportToDelete, setReportToDelete] = useState<AdminReport | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);
    const [announcement, setAnnouncement] = useState("");
    const [focusListToken, setFocusListToken] = useState(0);

    const latestRequestId = useRef(0);
    const searchTimer = useRef<number | undefined>(undefined);
    const detailTrigger = useRef<HTMLButtonElement | null>(null);
    const listRef = useRef<HTMLDivElement>(null);

    // Clear a pending search timer on unmount.
    useEffect(() => () => window.clearTimeout(searchTimer.current), []);

    // After a successful deletion the row (and the button that had focus) is gone: move focus to the list.
    useEffect(() => {
        if (focusListToken > 0) listRef.current?.focus();
    }, [focusListToken]);

    async function load(nextFilters: AdminReportFilters) {
        const requestId = ++latestRequestId.current;
        setIsLoading(true);
        let nextResult: ReportsResult;
        try {
            nextResult = await fetchAdminReportsAction(nextFilters);
        } catch {
            nextResult = { ok: false, error: NETWORK_ERROR };
        }
        if (requestId !== latestRequestId.current) return;
        setResult(nextResult);
        setIsLoading(false);
    }

    function applyFilters(nextFilters: AdminReportFilters) {
        window.clearTimeout(searchTimer.current);
        if (isSameReportFilters(nextFilters, filters)) return;
        setFilters(nextFilters);
        void load(nextFilters);
    }

    function handleSearchChange(value: string) {
        setSearchInput(value);
        window.clearTimeout(searchTimer.current);
        const nextFilters = { ...filters, search: value.trim(), page: 1 };
        searchTimer.current = window.setTimeout(() => applyFilters(nextFilters), SEARCH_DEBOUNCE_MS);
    }

    function handleFiltersChange(next: AdminSummaryFilters) {
        // Includes any search text still waiting for the debounce
        applyFilters({ ...filters, ...next, search: searchInput.trim(), page: 1 });
    }

    function clearAll() {
        setSearchInput("");
        applyFilters({ ...DEFAULT_REPORT_FILTERS, pageSize: filters.pageSize });
    }

    function goToPage(page: number) {
        applyFilters({ ...filters, search: searchInput.trim(), page });
    }

    function retry() {
        setResult(null);
        void load(filters);
    }

    function openDetail(report: AdminReport, trigger: HTMLButtonElement) {
        detailTrigger.current = trigger;
        setDetailReport(report);
    }

    function closeDetail() {
        setDetailReport(null);
        // Return focus to the "Ver reporte" button that opened the modal
        const trigger = detailTrigger.current;
        window.requestAnimationFrame(() => trigger?.focus());
    }

    function requestDelete(report: AdminReport) {
        setDeleteError(null);
        setReportToDelete(report);
    }

    function cancelDelete() {
        setReportToDelete(null);
        setDeleteError(null);
    }

    async function confirmDelete() {
        const report = reportToDelete;
        if (!report) return;
        setIsDeleting(true);
        setDeleteError(null);

        let outcome: ApiResult<unknown>;
        try {
            outcome = await deleteAdminReportAction(report.id);
        } catch {
            outcome = { ok: false, error: NETWORK_ERROR };
        }

        setIsDeleting(false);
        if (!outcome.ok) {
            // The row stays in the list and the dialog stays open with the error
            setDeleteError(deleteErrorMessage(outcome.error));
            return;
        }

        setRemovedIds((previous) => new Set(previous).add(report.id));
        setReportToDelete(null);
        setAnnouncement(
            isMock
                ? `Se eliminó el reporte «${report.title}» de los datos simulados.`
                : `Se eliminó el reporte «${report.title}».`,
        );
        setFocusListToken((token) => token + 1);

        // Reload the list so totals and pagination come from the service, not from local guesses.
        // If the deleted row was the last one of the page, go back one page.
        const remainingOnPage = result?.ok
            ? result.data.items.filter((item) => item.id !== report.id && !removedIds.has(item.id)).length
            : 0;
        const nextFilters: AdminReportFilters = {
            ...filters,
            page: remainingOnPage === 0 && filters.page > 1 ? filters.page - 1 : filters.page,
        };
        setFilters(nextFilters);
        void load(nextFilters);
    }

    const page = result?.ok ? result.data : null;
    const visibleReports = page ? page.items.filter((report) => !removedIds.has(report.id)) : [];
    const removedOnPage = page ? page.items.length - visibleReports.length : 0;
    const totalVisible = page ? Math.max(0, page.totalItems - removedOnPage) : 0;
    const isFiltered = hasActiveSummaryFilters(filters) || filters.search !== "";
    const hasError = result !== null && !result.ok;

    return (
        <section aria-labelledby="admin-reports-heading">
            <h2 id="admin-reports-heading" className="sr-only">
                Lista de reportes
            </h2>

            <div className="overflow-hidden rounded-3xl border border-usco-line bg-white shadow-sm">
                {/* Toolbar: search + filters */}
                <div className="space-y-3 border-b border-usco-line p-4 sm:p-5">
                    <div className="relative">
                        <label htmlFor="admin-reports-search" className="sr-only">
                            Buscar reportes por nombre del objeto o correo
                        </label>
                        <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-usco-muted" />
                        <input
                            id="admin-reports-search"
                            type="search"
                            value={searchInput}
                            maxLength={ADMIN_SEARCH_MAX_LENGTH}
                            onChange={(event) => handleSearchChange(event.target.value)}
                            placeholder="Buscar por objeto o correo…"
                            autoComplete="off"
                            className="h-11 w-full rounded-2xl border border-usco-line bg-usco-paper pl-10 pr-4 text-sm text-usco-ink placeholder:text-usco-muted focus-visible:border-usco-wine/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-usco-wine/30"
                        />
                    </div>

                    <AdminFiltersBar
                        idPrefix="admin-reports"
                        value={filters}
                        options={filterOptions}
                        onChange={handleFiltersChange}
                        onClear={isFiltered || searchInput !== "" ? clearAll : undefined}
                    />

                    <p role="status" aria-live="polite" className="min-h-5 text-sm text-usco-muted">
                        {isLoading
                            ? "Cargando reportes…"
                            : page
                              ? `${formatCount(totalVisible)} ${pluralize(totalVisible, "reporte", "reportes")}`
                              : ""}
                    </p>
                </div>

                {/* Results */}
                <div
                    ref={listRef}
                    tabIndex={-1}
                    aria-label="Resultados de reportes"
                    aria-busy={isLoading}
                    className={`focus-visible:outline-none ${isLoading ? "opacity-60 transition-opacity" : "transition-opacity"}`}
                >
                    {result === null ? <ReportsSkeleton /> : null}

                    {hasError ? (
                        <div className="p-4 sm:p-5">
                            <ErrorNotice
                                title="No se pudieron cargar los reportes."
                                message="Revisa tu conexión e inténtalo de nuevo."
                                onRetry={retry}
                            />
                        </div>
                    ) : null}

                    {page && visibleReports.length === 0 ? (
                        <EmptyNotice
                            message={
                                isFiltered
                                    ? "No hay reportes que coincidan con la búsqueda y los filtros seleccionados."
                                    : "No hay reportes activos ni en verificación."
                            }
                            action={
                                isFiltered ? (
                                    <button
                                        type="button"
                                        onClick={clearAll}
                                        className="h-10 rounded-xl border border-usco-line px-4 text-sm font-semibold text-usco-wine transition-colors hover:bg-usco-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-usco-wine/40"
                                    >
                                        Limpiar búsqueda y filtros
                                    </button>
                                ) : null
                            }
                        />
                    ) : null}

                    {page && visibleReports.length > 0 ? (
                        <ul className="divide-y divide-usco-line">
                            {visibleReports.map((report) => (
                                <AdminReportRow
                                    key={report.id}
                                    report={report}
                                    onView={openDetail}
                                    onDelete={requestDelete}
                                />
                            ))}
                        </ul>
                    ) : null}

                    {page && page.totalPages > 1 ? (
                        <nav
                            aria-label="Paginación de reportes"
                            className="flex items-center justify-between gap-2 border-t border-usco-line px-4 py-3 sm:gap-3 sm:px-5"
                        >
                            {/* Below 400 px the buttons keep only the arrow (with an accessible name) so the row never overflows */}
                            <button
                                type="button"
                                onClick={() => goToPage(page.page - 1)}
                                disabled={page.page <= 1 || isLoading}
                                aria-label="Página anterior"
                                className="inline-flex h-11 shrink-0 items-center gap-1 rounded-xl border border-usco-line px-3 text-sm font-semibold text-usco-ink transition-colors hover:bg-usco-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-usco-wine/40 disabled:cursor-not-allowed disabled:opacity-50 md:h-10"
                            >
                                <ChevronLeftIcon className="size-4" />
                                <span className="hidden min-[25rem]:inline">Anterior</span>
                            </button>
                            <p className="min-w-0 text-center text-sm text-usco-muted">
                                Página {page.page} de {page.totalPages}
                            </p>
                            <button
                                type="button"
                                onClick={() => goToPage(page.page + 1)}
                                disabled={page.page >= page.totalPages || isLoading}
                                aria-label="Página siguiente"
                                className="inline-flex h-11 shrink-0 items-center gap-1 rounded-xl border border-usco-line px-3 text-sm font-semibold text-usco-ink transition-colors hover:bg-usco-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-usco-wine/40 disabled:cursor-not-allowed disabled:opacity-50 md:h-10"
                            >
                                <span className="hidden min-[25rem]:inline">Siguiente</span>
                                <ChevronRightIcon className="size-4" />
                            </button>
                        </nav>
                    ) : null}
                </div>
            </div>

            {/* Deletion result for screen readers */}
            <p role="status" aria-live="polite" className="sr-only">
                {announcement}
            </p>

            {detailReport ? <AdminReportModal report={detailReport} onClose={closeDetail} /> : null}

            <ConfirmDialog
                open={reportToDelete !== null}
                title="¿Eliminar este reporte?"
                description={
                    reportToDelete
                        ? `Se eliminará el reporte ${reportToDelete.title}${
                              reportToDelete.publisherEmail ? `, publicado por ${reportToDelete.publisherEmail}` : ""
                          }.`
                        : ""
                }
                confirmLabel="Eliminar reporte"
                pendingLabel="Eliminando…"
                isPending={isDeleting}
                errorMessage={deleteError}
                onConfirm={() => void confirmDelete()}
                onCancel={cancelDelete}
            />
        </section>
    );
}

function ReportsSkeleton() {
    return (
        <div aria-hidden="true" className="divide-y divide-usco-line">
            {Array.from({ length: 4 }, (_, index) => (
                <div key={index} className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                    <div className="space-y-2">
                        <div className="h-4 w-48 rounded-lg bg-usco-paper motion-safe:animate-pulse" />
                        <div className="h-3 w-36 rounded-lg bg-usco-paper motion-safe:animate-pulse" />
                    </div>
                    <div className="h-10 w-64 max-w-full rounded-xl bg-usco-paper motion-safe:animate-pulse" />
                </div>
            ))}
        </div>
    );
}
