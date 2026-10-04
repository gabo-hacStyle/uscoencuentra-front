"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { IconUser } from "@/components/ui/icons";

// TODO: confirm the profile route
const PROFILE_PATH = "/perfil";

export default function UserMenu({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close the menu on outside click or Escape, only while it is open
  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label="Menú de usuario"
        aria-haspopup="menu"
        aria-expanded={open}
        className="grid h-10 w-10 place-items-center rounded-full border border-usco-line bg-usco-sand text-usco-wine transition hover:bg-usco-sand/70"
      >
        <IconUser className="h-5 w-5" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-2 w-52 rounded-2xl border border-usco-line bg-white p-2 shadow-xl"
        >
          <Link
            href={PROFILE_PATH}
            role="menuitem"
            onClick={() => setOpen(false)}
            className="block rounded-xl px-4 py-2.5 text-sm font-medium text-usco-ink transition hover:bg-usco-cream"
          >
            Mi perfil
          </Link>
          <div className="my-1 border-t border-usco-line" />
          {/* Sign-out action, rendered by the server component and passed in as children */}
          {children}
        </div>
      )}
    </div>
  );
}