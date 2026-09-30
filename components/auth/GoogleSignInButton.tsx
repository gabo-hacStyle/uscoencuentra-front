"use client"; // usa useEffect, useState y signIn(), que solo funcionan en el navegador

import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";

const LOADING_TIMEOUT_MS = 5000; //tiempo máximo mostrando "Conectando con Google"

type GoogleSignInButtonProps = {
  callbackUrl?: string;
};

export function GoogleSignInButton({ callbackUrl = "/dashboard" }: GoogleSignInButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  // Tope de 5 s: si el usuario no avanza, el botón vuelve a la normalidad.
  useEffect(() => {
    if (!isLoading) return;
    const timer = setTimeout(() => setIsLoading(false), LOADING_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [isLoading]);

  // (con isLoading = true). "persisted" indica que viene de esa caché: se resetea.
  useEffect(() => {
    function handlePageShow(event: PageTransitionEvent) {
      if (event.persisted) setIsLoading(false);
    }
    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, []);

  async function handleClick() {
    setIsLoading(true);
    try {
      // Navega a Google. Si todo sale bien, la página se abandona.
      await signIn("google", { callbackUrl });
    } catch {
      setIsLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isLoading}
      aria-busy={isLoading}
      className="inline-flex items-center justify-center gap-3 rounded-2xl bg-usco-wine px-5 py-3 text-center text-sm font-semibold text-white transition sm:px-6 sm:py-4 sm:text-base hover:bg-usco-wine-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-usco-wine disabled:cursor-not-allowed disabled:opacity-70"
    >
      {isLoading ? (
        <>
          <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
            <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
          </svg>
          Conectando con Google…
        </>
      ) : (
          "Ingresar con Google institucional"
      )}
    </button>
  );
}