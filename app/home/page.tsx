
import { Suspense } from "react";
import { redirect } from "next/navigation";

import ExploreSection from "@/components/items/ExploreSection";
import HeroSection, {
HERO_SEARCH_ID,
} from "@/components/items/HeroSection";
import RecentReports from "@/components/items/RecentReports";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";

import { parseFilters } from "@/lib/filter-items";
import { auth } from "@/auth";
import {
getCategorySummaries,
getItems,
} from "@/services/items.service";

interface HomePageProps {
searchParams: Promise<
    Record<string, string | string[] | undefined>
>;
}

export default async function HomePage({
searchParams,
}: HomePageProps) {
// Check whether the user has an active session.
// Unauthenticated users must sign in before accessing the home page.
const session = await auth();

if (!session?.user) {
    redirect("/login");
}

// Read and normalize the filters received through the URL.
const filters = parseFilters(await searchParams);

// Fetch category summaries and filtered items in parallel.
const [categories, items] = await Promise.all([
    getCategorySummaries(),
    getItems(filters),
]);

return (
    <div className="flex min-h-screen flex-col">
    {/* Display the main navigation and connect it to the hero search. */}
    <Navbar heroSearchId={HERO_SEARCH_ID} />

    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 md:px-6">
        {/* Show the main heading and object search form. */}
        <Suspense fallback={null}>
        <HeroSection />
        </Suspense>

        {/* Display the available object categories. */}
        <div className="mt-10">
        <ExploreSection categories={categories} />
        </div>

        {/* Display recent reports and apply the selected filters. */}
        <div className="mt-12">
        <RecentReports items={items} filters={filters} />
        </div>
    </main>

    {/* Display the shared footer. */}
    <Footer />
    </div>
);
}
