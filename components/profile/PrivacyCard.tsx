"use client";

import { useState } from "react";
import { updateShareWhatsAppNumberAction } from "@/actions/profile";
import { Alert } from "@/components/profile/Alert";

type PrivacyCardProps = {
  // shareWhatsAppNumber guardado (GET /profile) del usuario autenticado.
  shareWhatsAppNumber: boolean;
  // true si el perfil no se pudo cargar: el valor real es desconocido y no se permite cambiarlo.
  disabled?: boolean;
};

export function PrivacyCard({ shareWhatsAppNumber, disabled = false }: PrivacyCardProps) {
  // Siempre el último valor CONFIRMADO por el servidor (PATCH /profile), no el último clic.
  const [approved, setApproved] = useState(shareWhatsAppNumber);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleChange(next: boolean) {
    if (isSaving) return; // evita solicitudes contradictorias
    setIsSaving(true);
    setError(null);
    try {
      const result = await updateShareWhatsAppNumberAction(next);
      if (result.ok) setApproved(result.shareWhatsAppNumber);
      else setError(result.error); // se mantiene el último valor confirmado
    } catch {
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
        <p>Permitir que otras personas contacten contigo por WhatsApp.</p>
      </div>

      <div className="mt-5 rounded-2xl border border-usco-line p-4">
        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={approved}
            disabled={disabled || isSaving}
            aria-busy={isSaving}
            aria-describedby="share-whatsapp-status"
            onChange={(event) => void handleChange(event.target.checked)}
            className="mt-1 h-4 w-4 accent-usco-wine disabled:cursor-not-allowed disabled:opacity-60"
          />
          <span className="block text-sm font-semibold text-usco-ink">Compartir mi número</span>
        </label>
        <p
          id="share-whatsapp-status"
          role="status"
          className="mt-3 rounded-xl bg-usco-sand/60 px-3 py-2 text-xs text-usco-muted"
        >
          {disabled ? (
            "No pudimos cargar tu preferencia. Recarga la página en unos minutos."
          ) : approved ? (
            <>
              <strong>Activado:</strong> el número podrá aparecer en el contacto privado de tus publicaciones.
            </>
          ) : (
            <>
              <strong>Desactivado:</strong> el número no aparecerá en el contacto privado de tus publicaciones.
            </>
          )}
        </p>
        {error && (
          <Alert variant="error" className="mt-3">
            {error}
          </Alert>
        )}
      </div>
    </section>
  );
}
