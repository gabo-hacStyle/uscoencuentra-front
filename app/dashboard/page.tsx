import { Suspense } from "react";
import { redirect } from "next/navigation";
import ExploreSection from "@/components/items/ExploreSection";
import HeroSection, { HERO_SEARCH_ID } from "@/components/items/HeroSection";
import RecentReports from "@/components/items/RecentReports";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import { parseFilters } from "@/lib/filter-items";
import { auth } from "@/auth";
import { getCategorySummaries, getItems } from "@/services/items.service";

interface DashboardPageProps {
  // In Next.js 16 searchParams is a Promise
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  // Second barrier: proxy.ts already protects this route, the page also verifies
  const session = await auth(); 
  if (!session?.user) redirect("/login");

  // The URL is the single source of truth for the filters (q, type, category, sort)
  const filters = parseFilters(await searchParams);

  // Both requests run in parallel. Later they will hit the real backend.
  const [categories, items] = await Promise.all([
    getCategorySummaries(),
    getItems(filters),
  ]);

  return (
    // min-h-screen + flex-1 on <main> pushes the footer to the bottom on short pages
    <div className="flex min-h-screen flex-col">
      {/* The navbar search stays hidden while the hero search is visible */}
      <Navbar heroSearchId={HERO_SEARCH_ID} />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 md:px-6">
        {/* Suspense is required because HeroSection reads the URL query on the client */}
        <Suspense fallback={null}>
          <HeroSection />
        </Suspense>

        <div className="mt-10">
          <ExploreSection categories={categories} />
        </div>

        <div className="mt-12">
          <RecentReports items={items} filters={filters} />
        </div>
      </main>

      <Footer />
    </div>
  );
}