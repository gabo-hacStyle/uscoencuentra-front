"use client";

import { useState } from "react";
import { updateShareContactAction } from "@/actions/profile";
import { Alert } from "@/components/profile/Alert";

type PrivacyCardProps = {
  initialShareContact: boolean;
  hasNumber: boolean; // the option only makes sense when a phone number is registered
};

export function PrivacyCard({ initialShareContact, hasNumber }: PrivacyCardProps) {
  const [shareContact, setShareContact] = useState(initialShareContact);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleChange(next: boolean) {
    if (isSaving) return;
    setError(null);
    setShareContact(next); // optimistic: reverted below if the server rejects it
    setIsSaving(true);
    try {
      const result = await updateShareContactAction(next);
      if (result.ok) {
        setShareContact(result.shareContact);
      } else {
        setShareContact(!next);
        setError(result.error);
      }
    } catch {
      setShareContact(!next);
      setError("No pudimos guardar tu preferencia. Inténtalo de nuevo en unos minutos.");
    } finally {
      setIsSaving(false);
    }
  }

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
          Tu correo institucional solo se muestra a quien abre uno de tus reportes y pide
          contactarte de forma privada. No aparece en las tarjetas ni en el detalle público.
        </p>
      </div>

      {error && <Alert variant="error" className="mt-4">{error}</Alert>}

      <div className="mt-5 rounded-2xl border border-usco-line p-4">
        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={shareContact}
            disabled={!hasNumber || isSaving}
            onChange={(event) => handleChange(event.target.checked)}
            className="mt-1 h-4 w-4 accent-usco-wine disabled:cursor-not-allowed"
          />
          <span>
            <span className="block text-sm font-semibold text-usco-ink">
              Compartir también mi teléfono por WhatsApp
            </span>
            <span className="block text-xs text-usco-muted">
              Si lo activas, quien te contacte desde un reporte verá tu número además de tu
              correo. Si no, solo verá tu correo.
            </span>
          </span>
        </label>
        {!hasNumber && (
          <p className="mt-3 rounded-xl bg-usco-sand/60 px-3 py-2 text-xs text-usco-muted">
            Registra tu número en «Datos personales» para activar esta opción.
          </p>
        )}
      </div>
    </section>
  );
}