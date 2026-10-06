"use client";

import { useState } from "react";

export function PrivacyCard() {
  // SOLO VISUAL: no existe endpoint ni campo en el contrato para guardar esta preferencia.
  // TODO BACKEND: definir dónde se guarda (p. ej. un campo en /profile) y conectarla.
  const [approved, setApproved] = useState(false);

  return (
    <section
      aria-labelledby="privacy-title"
      className="rounded-3xl border border-usco-line bg-white p-6 shadow-sm sm:p-8"
    >
      <h2 id="privacy-title" className="text-xl font-bold text-usco-ink">
        Privacidad y seguridad
      </h2>

      <div className="mt-4 flex gap-3 text-sm text-usco-muted">
        <svg className="mt-0.5 h-5 w-5 shrink-0 text-usco-wine" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M12 3l8 3v6c0 4.5-3.2 8-8 9-4.8-1-8-4.5-8-9V6l8-3z" strokeLinejoin="round" />
          <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <p>
          Tu correo se usa únicamente para validar tu acceso institucional. Nunca será visible en
          tus publicaciones ni conversaciones.
        </p>
      </div>

      <div className="mt-5 rounded-2xl border border-usco-line p-4">
        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={approved}
            onChange={(event) => setApproved(event.target.checked)}
            className="mt-1 h-4 w-4 accent-usco-wine"
          />
          <span>
            <span className="block text-sm font-semibold text-usco-ink">
              Permitir compartir mi teléfono u otro medio de contacto
            </span>
            <span className="block text-xs text-usco-muted">
              Solo se mostrará cuando confirmes una coincidencia y aceptes el contacto.
            </span>
          </span>
        </label>
        <p className="mt-3 rounded-xl bg-usco-sand/60 px-3 py-2 text-xs text-usco-muted">
          <strong>Vista previa:</strong> esta preferencia todavía no se guarda (pendiente de backend).
        </p>
      </div>
    </section>
  );
}