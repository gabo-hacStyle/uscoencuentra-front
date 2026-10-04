"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { IconSearch } from "@/components/ui/icons";

// TODO: change if the catalog moves to another route
const CATALOG_PATH = "/dashboard";

interface NavbarSearchProps {
  heroSearchId?: string;
  className?: string;
}

export default function NavbarSearch({ heroSearchId, className = "" }: NavbarSearchProps) {
  const router = useRouter();
  const currentQuery = useSearchParams().get("q") ?? "";

  // Without a hero to watch, the search is visible from the start
  const [visible, setVisible] = useState(!heroSearchId);

  useEffect(() => {
    if (!heroSearchId) return;
    const hero = document.getElementById(heroSearchId);
    if (!hero) return;

    // Show the navbar search only when the hero search is out of view.
    // The negative top margin accounts for the sticky navbar covering the viewport top.
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { rootMargin: "-72px 0px 0px 0px" },
    );
    observer.observe(hero);
    return () => observer.disconnect();
  }, [heroSearchId]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = String(new FormData(event.currentTarget).get("q") ?? "").trim();
    // The query lives in the URL so every search box and the catalog share one source of truth
    router.push(query ? `${CATALOG_PATH}?q=${encodeURIComponent(query)}` : CATALOG_PATH);
  }

  return (
    <form
      role="search"
      onSubmit={handleSubmit}
      className={`${className} transition-[opacity,max-height] duration-300 ${
        visible
          ? "mt-1 max-h-14 opacity-100 md:mt-0"
          : // "invisible" also removes it from the tab order while hidden.
            // On mobile it collapses to zero height; on desktop it keeps its slot to avoid layout shifts.
            "invisible max-h-0 overflow-hidden opacity-0 md:max-h-14"
      }`}
    >
      <label className="flex items-center gap-3 rounded-full border border-usco-line bg-usco-sand/30 px-4 py-2.5 focus-within:border-usco-wine">
        <IconSearch className="h-5 w-5 shrink-0 text-usco-muted" />
        <input
          // key resets the field when the URL query changes (e.g. a search made from the hero)
          key={currentQuery}
          name="q"
          type="search"
          defaultValue={currentQuery}
          placeholder="Busca un objeto, categoría o ubicación…"
          className="w-full bg-transparent text-sm text-usco-ink outline-none placeholder:text-usco-muted"
        />
      </label>
    </form>
  );
}