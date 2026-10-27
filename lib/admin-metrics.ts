import type { AdminGlobalMetrics, AdminScopeMetrics, RankedCount } from "@/types/admin";

/**
 * Derived values for the Summary section. All percentages are computed here from raw counts,
 * so the UI never shows hard-coded percentages or phrases.
 *
 * Formulas (also documented in docs/admin-api-contract.md):
 * KPI cards (global metrics, never filtered):
 * - lostReportsPercent        = global.lostReports / global.totalReports * 100
 * - foundReportsPercent       = global.foundReports / global.totalReports * 100
 * - successfulReunionsPercent = global.successfulReunions / global.totalReports * 100
 * Analytics (scope = period + location + category):
 * - categorySharePercent      = categoryCount / scope.totalReports * 100
 * - locationSharePercent      = locationLostReports / scope.lostReports * 100
 * - reunionRatePercent        = scope.successfulReunions / scope.lostReports * 100 (empty state when 0 lost)
 */

const percentFormatter = new Intl.NumberFormat("es-CO", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
});

const countFormatter = new Intl.NumberFormat("es-CO", { maximumFractionDigits: 0 });

/** Percentage of `part` over `whole`. Returns 0 for zero, negative or non-finite inputs (no NaN/Infinity). */
export function safePercent(part: number, whole: number): number {
    if (!Number.isFinite(part) || !Number.isFinite(whole) || whole <= 0 || part <= 0) return 0;
    return (part / whole) * 100;
}

/** Bar widths must stay within 0–100 even if the data is inconsistent. */
export function clampPercent(value: number): number {
    return Math.min(100, Math.max(0, value));
}

/** "57,8 %" (Spanish decimal comma, non-breaking space before the sign). */
export function formatPercent(value: number): string {
    return `${percentFormatter.format(value)} %`;
}

export function formatCount(value: number): string {
    return countFormatter.format(value);
}

export function pluralize(count: number, singular: string, plural: string): string {
    return count === 1 ? singular : plural;
}

// ---------- KPI cards ----------

export type KpiViewModel = {
    id: "total" | "lost" | "found" | "reunions";
    label: string;
    value: string;
    /** null for "Reportes totales" (100 % would be redundant). */
    caption: string | null;
};

/** Always receives the GLOBAL metrics: the KPI cards ignore the filters. */
export function buildKpis(metrics: AdminGlobalMetrics): KpiViewModel[] {
    const shareOfReports = (part: number) =>
        `${formatPercent(safePercent(part, metrics.totalReports))} de los reportes`;

    return [
        { id: "total", label: "Reportes totales", value: formatCount(metrics.totalReports), caption: null },
        {
            id: "lost",
            label: "Objetos perdidos",
            value: formatCount(metrics.lostReports),
            caption: shareOfReports(metrics.lostReports),
        },
        {
            id: "found",
            label: "Objetos encontrados",
            value: formatCount(metrics.foundReports),
            caption: shareOfReports(metrics.foundReports),
        },
        {
            id: "reunions",
            label: "Reencuentros exitosos",
            value: formatCount(metrics.successfulReunions),
            caption: shareOfReports(metrics.successfulReunions),
        },
    ];
}

// ---------- Ranking cards ----------

export type ShareRowViewModel = {
    /** "01", "02", "03". */
    rank: string;
    name: string;
    count: number;
    countLabel: string;
    percent: number;
    percentLabel: string;
    /** 0–100, proportional to the share over the denominator (not normalized to the top item). */
    barWidth: number;
};

/**
 * Sorts by count desc (ties: alphabetical), keeps the top `limit` and computes each share over
 * `denominator`. Shares are NOT normalized among the visible rows, so they may not add up to 100 %.
 */
export function buildShareRows(
    entries: ReadonlyArray<RankedCount>,
    denominator: number,
    limit = 3,
): ShareRowViewModel[] {
    return [...entries]
        .filter((entry) => entry.count > 0)
        .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "es"))
        .slice(0, limit)
        .map((entry, index) => {
            const percent = safePercent(entry.count, denominator);
            return {
                rank: String(index + 1).padStart(2, "0"),
                name: entry.name,
                count: entry.count,
                countLabel: `${formatCount(entry.count)} ${pluralize(entry.count, "reporte", "reportes")}`,
                percent,
                percentLabel: formatPercent(percent),
                barWidth: clampPercent(percent),
            };
        });
}

// ---------- Reunion rate ----------

export type ReunionRateViewModel = {
    percent: number;
    percentLabel: string;
    barWidth: number;
    /** e.g. "38 reencuentros exitosos de 74 reportes de objetos perdidos". */
    description: string;
};

/**
 * Returns null when the scope has no lost reports: there is nothing to divide by, so the card shows
 * an empty state instead of a misleading "0,0 %". The label keeps the real value even above 100 %
 * (possible only if the backend counts reunions without a lost report); the bar is clamped.
 */
export function buildReunionRate({ successfulReunions, lostReports }: AdminScopeMetrics): ReunionRateViewModel | null {
    if (!Number.isFinite(lostReports) || lostReports <= 0) return null;
    const percent = safePercent(successfulReunions, lostReports);
    const reunionsText = `${formatCount(successfulReunions)} ${pluralize(
        successfulReunions,
        "reencuentro exitoso",
        "reencuentros exitosos",
    )}`;
    const lostText = `${formatCount(lostReports)} ${pluralize(lostReports, "reporte", "reportes")} de objetos perdidos`;

    return {
        percent,
        percentLabel: formatPercent(percent),
        barWidth: clampPercent(percent),
        description: `${reunionsText} de ${lostText}`,
    };
}
