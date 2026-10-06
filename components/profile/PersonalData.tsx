"use client";

import { useState } from "react";
import { Alert } from "@/components/profile/Alert";
import { EditProfileModal } from "@/components/profile/EditProfileModal";
import { formatPhone } from "@/lib/item-format";

type PersonalDataProps = {
  name: string;
  email: string;
  role: string;
  numero: string | null;
  loadError: string | null;
};

const FOCUS =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-usco-wine";

export function PersonalData({ name, email, role, numero, loadError }: PersonalDataProps) {
  const [currentNumero, setCurrentNumero] = useState(numero);
  const [isEditing, setIsEditing] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  function openEditor() {
    setJustSaved(false);
    setIsEditing(true);
  }

  return (
    <div className="mt-8 border-t border-usco-line pt-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-usco-ink">Datos personales</h2>
        <button
          type="button"
          onClick={openEditor}
          disabled={Boolean(loadError)}
          className={`inline-flex items-center gap-2 rounded-full border border-usco-line px-4 py-2 text-sm font-semibold text-usco-ink transition hover:border-usco-wine hover:text-usco-wine disabled:cursor-not-allowed disabled:opacity-50 ${FOCUS}`}
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4 12.5-12.5z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Editar perfil
        </button>
      </div>

      {justSaved && (
        <Alert variant="success" className="mt-4">
          Número de contacto actualizado correctamente.
        </Alert>
      )}

      <dl className="mt-5">
        <dt className="text-sm text-usco-muted">Correo institucional</dt>
        <dd className="mt-1 break-all font-semibold text-usco-ink">{email}</dd>
      </dl>

      <div className="mt-5">
        {loadError ? (
          <Alert variant="error">{loadError}</Alert>
        ) : currentNumero ? (
          // Número REGISTRADO
          <div className="flex items-center gap-4 rounded-2xl border border-usco-line bg-white p-4">
            <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-usco-sand text-usco-wine">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <div>
              <p className="text-sm text-usco-muted">Número de contacto · Registrado</p>
              <p className="text-lg font-semibold text-usco-ink">{formatPhone(currentNumero)}</p>
            </div>
          </div>
        ) : (
          // Número NO registrado
          <div className="rounded-2xl border-2 border-dashed border-usco-wine/40 bg-usco-sand/50 p-4">
            <p className="font-semibold text-usco-ink">No hay número de contacto registrado</p>
            <p className="mt-1 text-sm text-usco-muted">
              Es opcional, pero sirve para que otros usuarios puedan comunicarse contigo cuando sea
              necesario.
            </p>
            <button
              type="button"
              onClick={openEditor}
              className={`mt-3 rounded text-sm font-semibold text-usco-wine underline underline-offset-4 ${FOCUS}`}
            >
              Registrar número
            </button>
          </div>
        )}
      </div>

      {isEditing && (
        <EditProfileModal
          name={name}
          email={email}
          role={role}
          numero={currentNumero}
          onClose={() => setIsEditing(false)}
          onSaved={(savedNumero) => {
            setCurrentNumero(savedNumero); // dato devuelto por el backend
            setIsEditing(false);
            setJustSaved(true);
          }}
        />
      )}
    </div>
  );
}