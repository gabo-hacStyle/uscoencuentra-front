import type { Metadata } from "next";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { AdminPanel } from "@/components/admin/AdminPanel";
import { AdminReportsSection } from "@/components/admin/AdminReportsSection";
import { AdminSummarySection } from "@/components/admin/AdminSummarySection";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import { requireAdmin } from "@/lib/admin-guard";
import { LOGIN_PATH, PLATFORM_HOME_PATH, parseAdminSection } from "@/lib/admin-catalogs";
import { DEFAULT_REPORT_FILTERS, DEFAULT_SUMMARY_FILTERS } from "@/lib/admin-filters";
import {
    getAdminAnalytics,
    getAdminDataSourceMode,
    getAdminFilterOptions,
    getAdminGlobalMetrics,
    getAdminReports,
} from "@/services/admin.service";

export const metadata: Metadata = {
    title: "Panel de administración · USCO Encuentra",
};

type AdminPageProps = {
    searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/**
 * /admin                  -> Resumen
 * /admin?section=reports  -> Reportes
 *
 * The root layout does not render the navbar or the footer: every page mounts the shared
 * components itself (see app/my-reports/page.tsx). This page does the same, once.
 * The first data is fetched here so the panel paints without a loading flash.
 */
export default async function AdminPage({ searchParams }: AdminPageProps) {
    const guard = await requireAdmin();
    if (!guard.ok) redirect(guard.error.code === "UNAUTHORIZED" ? LOGIN_PATH : PLATFORM_HOME_PATH);

    const section = parseAdminSection((await searchParams).section);
    const dataSourceMode = getAdminDataSourceMode();

    let content: ReactNode;
    if (section === "reports") {
        const [filterOptions, initialResult] = await Promise.all([
            getAdminFilterOptions(),
            getAdminReports(DEFAULT_REPORT_FILTERS),
        ]);
        content = (
            <AdminReportsSection
                initialFilters={DEFAULT_REPORT_FILTERS}
                initialResult={initialResult}
                filterOptions={filterOptions.ok ? filterOptions.data : null}
                dataSourceMode={dataSourceMode}
            />
        );
    } else {
        const [filterOptions, initialGlobalMetrics, initialAnalytics] = await Promise.all([
            getAdminFilterOptions(),
            getAdminGlobalMetrics(),
            getAdminAnalytics(DEFAULT_SUMMARY_FILTERS),
        ]);
        content = (
            <AdminSummarySection
                initialFilters={DEFAULT_SUMMARY_FILTERS}
                initialGlobalMetrics={initialGlobalMetrics}
                initialAnalytics={initialAnalytics}
                filterOptions={filterOptions.ok ? filterOptions.data : null}
            />
        );
    }

    return (
        <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">
                <AdminPanel section={section} dataSourceMode={dataSourceMode}>
                    {content}
                </AdminPanel>
            </main>
            <Footer />
        </div>
    );
}
