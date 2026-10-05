import Link from "next/link";
import ReportItemButton from "@/components/items/ReportItemButton";
import { IconChevronRight } from "@/components/ui/icons";
import { CATEGORY_CONFIG, formatPublicationCount } from "@/lib/item-categories";
import type { CategorySummary } from "@/types/item";

// TODO: change if the catalog moves to another route
const CATALOG_PATH = "/dashboard";

interface ExploreSectionProps {
    categories: CategorySummary[]; // counters coming from the service
}

export default function ExploreSection({ categories }: ExploreSectionProps) {
    // Missing categories fall back to 0 so the four cards always render
    const countByCategory = new Map(categories.map((c) => [c.category, c.count]));

    return (
        <section aria-labelledby="explore-title">
        <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
            <p className="text-xs font-bold uppercase tracking-widest text-usco-wine">
                Explora el campus
            </p>
            <h2 id="explore-title" className="mt-1 text-3xl font-bold text-usco-ink">
                ¿Qué estás buscando?
            </h2>
            </div>
            <ReportItemButton />
        </div>

        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {CATEGORY_CONFIG.map(({ category, icon: Icon }) => (
            <li key={category}>
                {/* The category goes in the URL, like "q"; the catalog will read it later */}
                <Link
                href={`${CATALOG_PATH}?category=${encodeURIComponent(category)}#catalogo`}
                className="flex items-center gap-4 rounded-2xl border border-usco-line bg-white p-4 transition hover:border-usco-wine/40 hover:shadow-md"
                >
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-usco-wine/10 text-usco-wine">
                    <Icon className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1">
                    <span className="block font-bold text-usco-ink">{category}</span>
                    <span className="block text-xs text-usco-muted">
                    {formatPublicationCount(countByCategory.get(category) ?? 0)}
                    </span>
                </span>
                <IconChevronRight className="h-4 w-4 shrink-0 text-usco-muted" />
                </Link>
            </li>
            ))}
        </ul>
        </section>
    );
}