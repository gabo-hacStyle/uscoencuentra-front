import type { KpiViewModel, ReunionRateViewModel, ShareRowViewModel } from "@/lib/admin-metrics";
import { BarChartIcon } from "./admin-icons";

/** Presentational cards of the Summary section. They only render view models from lib/admin-metrics.ts. */

const CARD = "rounded-3xl border border-usco-line bg-white shadow-sm";

// ---------- KPI cards ----------

/**
 * Equal-height cards: 1 column below 400 px, 2 from 400 px, 4 in one row from xl.
 * Each card is its own <dl> so every label/value pair stays valid HTML.
 */
export function KpiGrid({ kpis }: { kpis: KpiViewModel[] }) {
    return (
        <div className="grid grid-cols-1 gap-3 min-[25rem]:grid-cols-2 sm:gap-4 xl:grid-cols-4">
            {kpis.map((kpi) => (
                <dl key={kpi.id} className={`${CARD} flex min-h-[7.5rem] min-w-0 flex-col p-4 sm:min-h-[8.5rem] sm:p-5`}>
                    <dt className="text-sm text-usco-muted">{kpi.label}</dt>
                    <dd className="mt-2 text-3xl font-bold tabular-nums text-usco-ink sm:mt-3 sm:text-4xl">{kpi.value}</dd>
                    {kpi.caption ? (
                        <dd className="mt-auto pt-2 text-sm font-semibold text-usco-wine">{kpi.caption}</dd>
                    ) : null}
                </dl>
            ))}
        </div>
    );
}

// ---------- Card header ----------

function CardHeader({ title, subtitle, titleId }: { title: string; subtitle: string; titleId: string }) {
    return (
        <div className="flex items-start gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-usco-wine/10 text-usco-wine">
                <BarChartIcon className="size-5" />
            </span>
            <div className="min-w-0">
                <h3 id={titleId} className="text-lg font-bold leading-tight text-usco-ink">
                    {title}
                </h3>
                <p className="mt-0.5 text-sm text-usco-muted">{subtitle}</p>
            </div>
        </div>
    );
}

// ---------- Ranking cards (categories / loss locations) ----------

type RankingCardProps = {
    titleId: string;
    title: string;
    subtitle: string;
    rows: ShareRowViewModel[];
    tone: "wine" | "gold";
    emptyMessage: string;
};

export function RankingCard({ titleId, title, subtitle, rows, tone, emptyMessage }: RankingCardProps) {
    const barClass = tone === "wine" ? "bg-usco-wine" : "bg-usco-gold";

    return (
        <section aria-labelledby={titleId} className={`${CARD} flex flex-col p-5 sm:p-6`}>
            <CardHeader titleId={titleId} title={title} subtitle={subtitle} />

            {rows.length === 0 ? (
                <p className="mt-6 rounded-2xl bg-usco-paper px-4 py-6 text-center text-sm text-usco-muted">{emptyMessage}</p>
            ) : (
                <ol className="mt-6 space-y-5">
                    {rows.map((row) => (
                        <li key={row.name}>
                            <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 text-sm">
                                <span className="flex min-w-0 items-baseline gap-2">
                                    <span className="font-bold tabular-nums text-usco-wine">{row.rank}</span>
                                    <span className="truncate font-semibold text-usco-ink">{row.name}</span>
                                </span>
                                <span className="shrink-0 tabular-nums">
                                    <span className="text-usco-muted">{row.countLabel}</span>
                                    <span aria-hidden="true" className="text-usco-muted">
                                        {" · "}
                                    </span>
                                    <span className="sr-only">, </span>
                                    <span className="font-bold text-usco-ink">{row.percentLabel}</span>
                                </span>
                            </div>
                            <div aria-hidden="true" className="mt-2 h-2.5 overflow-hidden rounded-full bg-usco-paper">
                                <div
                                    className={`h-full rounded-full ${barClass} transition-[width] duration-500 motion-reduce:transition-none`}
                                    style={{ width: `${row.barWidth}%` }}
                                />
                            </div>
                        </li>
                    ))}
                </ol>
            )}
        </section>
    );
}

// ---------- Reunion rate ----------

/** `rate` is null when the scope has no lost reports: empty state instead of a misleading 0,0 %. */
export function ReunionRateCard({ rate, emptyMessage }: { rate: ReunionRateViewModel | null; emptyMessage: string }) {
    const titleId = "admin-reunion-rate-title";
    const header = (
        <CardHeader
            titleId={titleId}
            title="Tasa de reencuentro"
            subtitle="Reencuentros exitosos confirmados frente a los reportes de objetos perdidos"
        />
    );

    if (rate === null) {
        return (
            <section aria-labelledby={titleId} className={`${CARD} p-5 sm:p-6`}>
                {header}
                <p className="mt-6 rounded-2xl bg-usco-paper px-4 py-6 text-center text-sm text-usco-muted">{emptyMessage}</p>
            </section>
        );
    }

    return (
        <section aria-labelledby={titleId} className={`${CARD} p-5 sm:p-6`}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                {header}
                <p className="text-3xl font-bold tabular-nums text-usco-wine sm:text-right">{rate.percentLabel}</p>
            </div>

            <div
                role="meter"
                aria-labelledby={titleId}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(rate.barWidth * 10) / 10}
                aria-valuetext={rate.percentLabel}
                className="mt-5 h-3 overflow-hidden rounded-full bg-usco-paper"
            >
                <div
                    className="h-full rounded-full bg-usco-wine transition-[width] duration-500 motion-reduce:transition-none"
                    style={{ width: `${rate.barWidth}%` }}
                />
            </div>

            <p className="mt-3 text-sm font-medium text-usco-ink">{rate.description}</p>
        </section>
    );
}

// ---------- Loading skeleton ----------

function SkeletonBlock({ className }: { className: string }) {
    return <div className={`rounded-xl bg-usco-paper motion-safe:animate-pulse ${className}`} />;
}

export function KpiSkeleton() {
    return (
        <div aria-hidden="true" className="grid grid-cols-1 gap-3 min-[25rem]:grid-cols-2 sm:gap-4 xl:grid-cols-4">
            {Array.from({ length: 4 }, (_, index) => (
                <div key={index} className={`${CARD} flex min-h-[7.5rem] flex-col gap-3 p-4 sm:min-h-[8.5rem] sm:p-5`}>
                    <SkeletonBlock className="h-4 w-28" />
                    <SkeletonBlock className="h-9 w-16" />
                    <SkeletonBlock className="mt-auto h-4 w-32" />
                </div>
            ))}
        </div>
    );
}

export function ChartsSkeleton() {
    return (
        <div aria-hidden="true" className="space-y-4">
            <div className="grid gap-4 xl:grid-cols-2">
                {Array.from({ length: 2 }, (_, index) => (
                    <div key={index} className={`${CARD} space-y-5 p-6`}>
                        <SkeletonBlock className="h-10 w-2/3" />
                        <SkeletonBlock className="h-3 w-full" />
                        <SkeletonBlock className="h-3 w-5/6" />
                        <SkeletonBlock className="h-3 w-2/3" />
                    </div>
                ))}
            </div>
            <div className={`${CARD} space-y-4 p-6`}>
                <SkeletonBlock className="h-10 w-1/2" />
                <SkeletonBlock className="h-3 w-full" />
            </div>
        </div>
    );
}
