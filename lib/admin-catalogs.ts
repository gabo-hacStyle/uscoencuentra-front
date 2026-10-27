import type { AdminFilterOptions, AdminReportStatus, AdminSection, FilterOption } from "@/types/admin";
import { CATEGORY_CONFIG } from "@/lib/item-categories";
import { ITEM_LOCATIONS } from "@/lib/item-locations";

/**
 * Admin panel routes, sections, status labels and filter catalog helpers.
 *
 * The selectable places and categories are NOT defined here: in production they come from the
 * backend (GET /admin/filters). The mock source answers with the project's own catalogs
 * (lib/item-locations.ts and lib/item-categories.ts), the same values `Item.location` and
 * `Item.category` accept.
 */

// ---------- Routes ----------

/** Matches the navbar "Dashboard" link (ADMIN_PATH in lib/roles.ts). */
export const ADMIN_BASE_PATH = "/admin";
export const PLATFORM_HOME_PATH = "/home";
export const LOGIN_PATH = "/login";

export const ADMIN_SECTIONS: ReadonlyArray<{ id: AdminSection; label: string }> = [
    { id: "summary", label: "Resumen" },
    { id: "reports", label: "Reportes" },
];

export function adminSectionHref(section: AdminSection): string {
    return section === "summary" ? ADMIN_BASE_PATH : `${ADMIN_BASE_PATH}?section=${section}`;
}

export function parseAdminSection(value: string | string[] | undefined): AdminSection {
    const raw = Array.isArray(value) ? value[0] : value;
    return raw === "reports" ? "reports" : "summary";
}

// ---------- Filter catalogs ----------

/** The project's own catalogs, as filter options (value and label are the stored value). */
export function projectFilterOptions(): AdminFilterOptions {
    return {
        locations: ITEM_LOCATIONS.map((location) => ({ value: location, label: location })),
        categories: CATEGORY_CONFIG.map(({ category }) => ({ value: category, label: category })),
    };
}

export function isCatalogValue(options: ReadonlyArray<FilterOption>, value: string): boolean {
    return options.some((option) => option.value === value);
}

// ---------- Report statuses ----------

/** Labels for the only two statuses the admin list shows. */
export const ADMIN_STATUS_LABELS: Record<AdminReportStatus, string> = {
    active: "Buscando",
    in_verification: "Verificando",
};

const ADMIN_REPORT_STATUSES: ReadonlyArray<string> = ["active", "in_verification"];

export function isAdminReportStatus(value: unknown): value is AdminReportStatus {
    return typeof value === "string" && ADMIN_REPORT_STATUSES.includes(value);
}
