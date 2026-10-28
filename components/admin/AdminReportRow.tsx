"use client";

import type { AdminReport, AdminReportStatus } from "@/types/admin";
import { ADMIN_STATUS_LABELS } from "@/lib/admin-catalogs";
import { EyeIcon, TrashIcon } from "./admin-icons";

const STATUS_CLASS: Record<AdminReportStatus, string> = {
    active: "bg-usco-sand text-[#7a4a00]",
    in_verification: "bg-usco-wine/10 text-usco-wine",
};

/** "Buscando" / "Verificando". The text itself tells them apart, so color is not the only difference. */
export function StatusBadge({ status }: { status: AdminReportStatus }) {
    return (
        <span
            className={`inline-flex h-7 shrink-0 items-center whitespace-nowrap rounded-full px-2.5 text-xs font-bold ${STATUS_CLASS[status]}`}
        >
            {ADMIN_STATUS_LABELS[status]}
        </span>
    );
}

type AdminReportRowProps = {
    report: AdminReport;
    onView: (report: AdminReport, trigger: HTMLButtonElement) => void;
    onDelete: (report: AdminReport) => void;
};

const BUTTON_BASE =
    "inline-flex h-11 min-w-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl border px-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 md:h-10";

/**
 * ONE status badge per report, rendered once in the DOM; the grid places it.
 * (The previous version rendered two badges and hid one with `hidden`, but the badge's own
 * `inline-flex` is emitted later in the CSS and won, so both were visible on phones.)
 * - Below md: [info | status] on the first row; the two buttons on a second full-width row,
 *   in two equal columns, so they never overflow the card.
 * - md and up: [info | status | actions] on a single row.
 * Place, category and dates are read in the detail modal.
 */
export function AdminReportRow({ report, onView, onDelete }: AdminReportRowProps) {
    return (
        <li className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-3 gap-y-3 px-4 py-4 sm:px-5 md:grid-cols-[minmax(0,1fr)_auto_auto] md:items-center md:gap-x-4">
            <div className="min-w-0">
                <p className="font-semibold text-usco-ink [overflow-wrap:anywhere]">{report.title}</p>
                {report.publisherEmail ? (
                    <p className="mt-0.5 text-sm text-usco-muted [overflow-wrap:anywhere]">{report.publisherEmail}</p>
                ) : (
                    <p className="mt-0.5 text-sm italic text-usco-muted">Correo no disponible</p>
                )}
            </div>

            <StatusBadge status={report.status} />

            <div className="col-span-2 grid grid-cols-2 gap-2 md:col-span-1 md:flex">
                <button
                    type="button"
                    onClick={(event) => onView(report, event.currentTarget)}
                    aria-label={`Ver reporte: ${report.title}`}
                    className={`${BUTTON_BASE} border-usco-line bg-white text-usco-ink hover:bg-usco-paper focus-visible:ring-usco-wine/40`}
                >
                    <EyeIcon className="size-4 shrink-0" />
                    Ver reporte
                </button>
                <button
                    type="button"
                    onClick={() => onDelete(report)}
                    aria-label={`Eliminar reporte: ${report.title}`}
                    className={`${BUTTON_BASE} border-red-200 bg-white text-red-700 hover:bg-red-50 focus-visible:ring-red-400`}
                >
                    <TrashIcon className="size-4 shrink-0" />
                    Eliminar
                </button>
            </div>
        </li>
    );
}
