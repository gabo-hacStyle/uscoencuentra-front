"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { FormEvent } from "react";
import { IconSearch, IconSparkles } from "@/components/ui/icons";

// Must match the heroSearchId prop given to <Navbar /> in the page
export const HERO_SEARCH_ID = "hero-search";

// TODO: change if the catalog moves to another route
const CATALOG_PATH = "/dashboard";

export default function HeroSection() {
  const router = useRouter();
  const currentQuery = useSearchParams().get("q") ?? "";

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = String(new FormData(event.currentTarget).get("q") ?? "").trim();
    // The query lives in the URL, so the navbar search and the catalog read the same value
    router.push(query ? `${CATALOG_PATH}?q=${encodeURIComponent(query)}` : CATALOG_PATH);
  }

  return (
    <section className="relative overflow-hidden rounded-[2rem] bg-usco-wine px-6 py-12 text-white shadow-[0_24px_60px_-20px_rgba(90,30,30,0.45)] sm:px-10 md:py-16 lg:px-14">
      {/* Decorative rings: purely visual, hidden from assistive tech and ignored by the pointer */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full border-[44px] border-white/10 md:h-96 md:w-96"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 right-24 hidden h-80 w-80 rounded-full border-[28px] border-white/10 md:block"
      />

      <div className="relative max-w-2xl">
        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/90">
          <IconSparkles className="h-4 w-4" />
          Comunidad que se ayuda
        </p>

        <h1 className="mt-5 text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
          Encuentra lo que perdiste.
          <span className="block text-usco-rose">Ayuda a alguien a encontrarlo.</span>
        </h1>

        <p className="mt-6 max-w-lg text-base text-white/80 sm:text-lg">
          El espacio de la comunidad universitaria para reportar, buscar y recuperar
          objetos perdidos de forma segura.
        </p>

        {/* The id is what the navbar observes to decide when to show its own search */}
        <form
          id={HERO_SEARCH_ID}
          role="search"
          onSubmit={handleSubmit}
          className="mt-8 flex items-center gap-2 rounded-2xl bg-usco-cream p-2 pl-4 shadow-lg"
        >
          <IconSearch className="h-5 w-5 shrink-0 text-usco-muted" />
          <input
            // key resets the field when the URL query changes (e.g. a search made from the navbar)
            key={currentQuery}
            name="q"
            type="search"
            defaultValue={currentQuery}
            placeholder="¿Qué estás buscando?"
            aria-label="Buscar objetos"
            className="min-w-0 flex-1 bg-transparent px-1 py-2 text-usco-ink outline-none placeholder:text-usco-muted"
          />
          <button
            type="submit"
            className="shrink-0 rounded-xl bg-usco-gold px-5 py-2.5 font-bold text-usco-ink transition hover:bg-usco-gold-dark"
          >
            Buscar
          </button>
        </form>
      </div>
    </section>
  );
}