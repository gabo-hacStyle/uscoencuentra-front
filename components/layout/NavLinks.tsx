"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { IconClose, IconMenu } from "@/components/ui/icons";

export interface NavLinkItem {
  href: string;
  label: string;
}

export default function NavLinks({ links }: { links: NavLinkItem[] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false); // mobile panel state

  // A link is active on its exact path or on any nested path below it
  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  const linkClass = (href: string) =>
    `rounded-full px-4 py-2 text-sm font-medium transition ${
      isActive(href)
        ? "bg-usco-wine/10 text-usco-wine"
        : "text-usco-muted hover:text-usco-ink"
    }`;

  return (
    <>
      {/* Desktop: inline links */}
      <nav aria-label="Principal" className="hidden items-center gap-1 md:flex">
        {links.map((link) => (
          <Link key={link.href} href={link.href} className={linkClass(link.href)}>
            {link.label}
          </Link>
        ))}
      </nav>

      {/* Mobile: hamburger button */}
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={open ? "Cerrar menú" : "Abrir menú"}
        aria-expanded={open}
        aria-controls="mobile-nav"
        className="grid h-10 w-10 place-items-center rounded-full border border-usco-line text-usco-ink transition hover:bg-usco-sand md:hidden"
      >
        {open ? <IconClose className="h-5 w-5" /> : <IconMenu className="h-5 w-5" />}
      </button>

      {/* Mobile: panel anchored to the sticky header (the nearest positioned ancestor) */}
      {open && (
        <nav
          id="mobile-nav"
          aria-label="Principal"
          className="absolute inset-x-0 top-full flex flex-col gap-1 border-b border-usco-line bg-usco-cream p-4 shadow-lg md:hidden"
        >
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={linkClass(link.href)}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </>
  );
}