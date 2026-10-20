
"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { IconUser } from "@/components/ui/icons";
import { PROFILE_PATH } from "@/lib/roles";

export default function UserMenu({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close the menu when clicking outside or pressing Escape.
  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
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
        aria-label="User menu"
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

          {/* Render the sign-out action provided by the parent component. */}
          {children}
        </div>
      )}
    </div>
  );
}
