import Link from "next/link";
import type { AdminSection } from "@/types/admin";
import { ADMIN_SECTIONS, PLATFORM_HOME_PATH, adminSectionHref } from "@/lib/admin-catalogs";
import { FileTextIcon, GridIcon, type IconProps } from "./admin-icons";

/**
 * Internal navigation of the admin panel (NOT the global navbar).
 * - AdminSidebar: desktop (lg and up), side card.
 * - AdminMobileNav: tablet and phone (below lg), one card under the global navbar.
 * Both are links (/admin and /admin?section=reports), so the browser back button works.
 */

const SECTION_ICONS: Record<AdminSection, (props: IconProps) => React.JSX.Element> = {
    summary: GridIcon,
    reports: FileTextIcon,
};

type NavigationProps = {
    activeSection: AdminSection;
};

export function AdminSidebar({ activeSection }: NavigationProps) {
    return (
        <aside className="hidden lg:block">
            {/* top-24 clears the sticky global navbar (about 4.3rem high) */}
            <div className="sticky top-24 rounded-3xl border border-usco-line bg-white p-4 shadow-sm">
                <div className="flex items-center gap-3 px-2 pb-5 pt-2">
                    <span
                        aria-hidden="true"
                        className="grid size-10 shrink-0 place-items-center rounded-xl bg-usco-wine text-base font-bold text-white"
                    >
                        U
                    </span>
                    <div className="min-w-0">
                        <p className="truncate font-bold text-usco-ink">USCO Admin</p>
                        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-usco-muted">
                            Centro de gestión
                        </p>
                    </div>
                </div>

                <nav aria-label="Secciones del panel de administración">
                    <ul className="space-y-1">
                        {ADMIN_SECTIONS.map((section) => {
                            const Icon = SECTION_ICONS[section.id];
                            const isActive = section.id === activeSection;
                            return (
                                <li key={section.id}>
                                    <Link
                                        href={adminSectionHref(section.id)}
                                        aria-current={isActive ? "page" : undefined}
                                        className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-usco-wine/40 ${
                                            isActive
                                                ? "bg-usco-wine text-white shadow-sm"
                                                : "text-usco-muted hover:bg-usco-paper hover:text-usco-ink"
                                        }`}
                                    >
                                        <Icon className="size-[1.1rem]" />
                                        {section.label}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                <Link
                    href={PLATFORM_HOME_PATH}
                    className="mt-6 flex h-10 items-center justify-center rounded-xl border border-usco-line text-sm font-semibold text-usco-muted transition-colors hover:border-usco-wine/30 hover:bg-usco-paper hover:text-usco-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-usco-wine/40"
                >
                    Volver a la plataforma
                </Link>
            </div>
        </aside>
    );
}

/**
 * Tablet and phone: ONE card that groups the two tabs and "Volver a la plataforma".
 * - Phone: tabs on the first row; the link is a full-width row separated by a top border.
 * - Tablet (sm to lg): tabs and link on the same row, separated by a vertical border.
 * No loose icon and no floating link.
 */
export function AdminMobileNav({ activeSection }: NavigationProps) {
    return (
        <div className="mb-6 flex flex-col overflow-hidden rounded-2xl border border-usco-line bg-white shadow-sm sm:flex-row sm:items-stretch lg:hidden">
            <nav aria-label="Secciones del panel de administración" className="min-w-0 flex-1 p-1">
                <ul className="grid grid-cols-2 gap-1">
                    {ADMIN_SECTIONS.map((section) => {
                        const Icon = SECTION_ICONS[section.id];
                        const isActive = section.id === activeSection;
                        return (
                            <li key={section.id}>
                                <Link
                                    href={adminSectionHref(section.id)}
                                    aria-current={isActive ? "page" : undefined}
                                    className={`flex h-11 items-center justify-center gap-2 rounded-xl px-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-usco-wine/40 ${
                                        isActive ? "bg-usco-wine text-white" : "text-usco-muted hover:bg-usco-paper hover:text-usco-ink"
                                    }`}
                                >
                                    <Icon className="size-4 shrink-0" />
                                    {section.label}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            <Link
                href={PLATFORM_HOME_PATH}
                className="flex h-11 shrink-0 items-center justify-center whitespace-nowrap border-t border-usco-line px-5 text-sm font-semibold text-usco-muted transition-colors hover:bg-usco-paper hover:text-usco-wine focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-usco-wine/40 sm:h-auto sm:border-l sm:border-t-0"
            >
                Volver a la plataforma
            </Link>
        </div>
    );
}
