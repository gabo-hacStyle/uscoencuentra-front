import Link from "next/link";
import { auth } from "@/auth";
import { Suspense } from "react";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { SignOutButton } from "@/components/auth/SignOutButton";
import NavLinks from "@/components/layout/NavLinks";
import NavbarSearch from "@/components/layout/NavbarSearch";
import UserMenu from "@/components/layout/UserMenu";

// the catalog, so the admin panel needs its own path.
const NAV_LINKS = [
  { href: "/dashboard", label: "Inicio", adminOnly: false },
  { href: "/mis-reportes", label: "Mis reportes", adminOnly: false },
  { href: "/admin/dashboard", label: "Dashboard", adminOnly: true },
];

interface NavbarProps {
  /**
   * Id of the hero search form. When provided, the navbar search stays hidden
   * while that element is on screen and appears once it scrolls away.
   * When omitted, the navbar search is always visible.
   */
  heroSearchId?: string;
}

export default async function Navbar({ heroSearchId }: NavbarProps) {
  const session = await auth();
  if (!session?.user) return null; // Never render the navbar for anonymous visitors

  // Role-based filtering. Hiding the link is not security: the route itself
  // must also be protected (proxy.ts or the page).
  const isAdmin = session.user.role === "ADMIN";
  const links = NAV_LINKS.filter((link) => !link.adminOnly || isAdmin).map(
    ({ href, label }) => ({ href, label }),
  );

  return (
    <header className="sticky top-0 z-40 border-b border-usco-line bg-usco-cream/90 backdrop-blur">
      {/* On mobile the search wraps to its own row; on md+ everything sits in one row */}
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-3 px-4 py-3 md:flex-nowrap md:gap-x-6 md:px-6">
        <Link href="/dashboard" aria-label="Ir al inicio" className="shrink-0">
          <BrandLogo />
        </Link>
        
        <Suspense fallback={null}>
            <NavbarSearch
                heroSearchId={heroSearchId}
                className="order-last w-full md:order-none md:max-w-xl md:flex-1"
            />
        </Suspense>

        <div className="ml-auto flex items-center gap-2">
          <NavLinks links={links} />
          {/* SignOutButton is passed as children so it can stay a server-side component */}
          <UserMenu>
            <SignOutButton />
          </UserMenu>
        </div>
      </div>
    </header>
  );
}