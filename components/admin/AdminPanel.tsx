import type { ReactNode } from "react";
import type { AdminDataSourceMode, AdminSection } from "@/types/admin";
import { AdminMobileNav, AdminSidebar } from "./AdminNavigation";
import { SystemStatusIndicator } from "./SystemStatusIndicator";

/**
 * Admin panel shell: internal navigation + page header + the active section (children).
 * It renders NEITHER the global navbar NOR the footer: app/admin/page.tsx mounts the shared ones,
 * and this shell fills the <main> between them.
 *
 * Layout:
 * - Same width and side padding as the navbar and the footer (max-w-7xl, px-4 / md:px-6).
 * - lg and up: two columns (side card 15rem + content).
 * - below lg: one column, navigation card above the header.
 */

const SECTION_HEADER: Record<AdminSection, { title: string; subtitle: string }> = {
    summary: {
        title: "Resumen",
        subtitle: "Métricas y comportamiento de USCO Encuentra.",
    },
    reports: {
        title: "Reportes",
        subtitle: "Revisa y modera los reportes activos y en verificación.",
    },
};

type AdminPanelProps = {
    section: AdminSection;
    dataSourceMode: AdminDataSourceMode;
    children: ReactNode;
};

export function AdminPanel({ section, dataSourceMode, children }: AdminPanelProps) {
    const header = SECTION_HEADER[section];

    return (
        <div className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6 lg:grid lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-8 lg:py-8">
            <AdminSidebar activeSection={section} />

            <div className="min-w-0">
                <AdminMobileNav activeSection={section} />

                <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-usco-wine">Centro de gestión</p>
                        <h1 className="mt-1 text-3xl font-bold text-usco-ink sm:text-[2rem]">{header.title}</h1>
                        <p className="mt-1 text-sm text-usco-muted">{header.subtitle}</p>
                    </div>
                    <SystemStatusIndicator simulated={dataSourceMode === "mock"} />
                </header>

                {children}
            </div>
        </div>
    );
}
