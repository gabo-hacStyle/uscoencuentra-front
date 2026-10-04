"use client";

import { useEffect, useRef, useState, type SubmitEvent } from "react";
import { updatePhoneAction } from "@/actions/profile";
import { Alert } from "@/components/profile/Alert";
import { formatPhone, validateColombianPhone } from "@/lib/phone";

type EditProfileModalProps = {
  name: string;
  email: string;
  role: string;
  numero: string | null;
  onClose: () => void;
  onSaved: (numero: string | null) => void;
};

const FOCUS =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-usco-wine";

export function EditProfileModal({ name, email, role, numero, onClose, onSaved }: EditProfileModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [value, setValue] = useState(numero ? formatPhone(numero) : "");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Abre el diálogo como modal (fondo bloqueado, foco atrapado, Esc disponible).
  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  const validation = validateColombianPhone(value);
  const isUnchanged = validation.ok && validation.value === numero;

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSaving) return; // evita envíos repetidos
    setFormError(null);

    if (!validation.ok) {
      setFieldError(validation.error);
      return;
    }
    setFieldError(null);

    setIsSaving(true);
    try {
      const result = await updatePhoneAction(validation.value);
      if (result.ok) {
        onSaved(result.numero);
      } else if (result.field === "numero") {
        setFieldError(result.error);
      } else {
        setFormError(result.error);
      }
    } catch {
      setFormError("No pudimos guardar tus cambios. Inténtalo de nuevo en unos minutos.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="edit-profile-title"
      onCancel={(event) => {
        event.preventDefault(); // Esc: cerramos nosotros, salvo que se esté guardando
        if (!isSaving) onClose();
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-lg rounded-3xl border border-usco-line bg-white p-0 text-usco-ink shadow-2xl backdrop:bg-black/40"
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-5 p-6 sm:p-8">
        <div>
          <h2 id="edit-profile-title" className="text-xl font-bold">Editar perfil</h2>
          <p className="mt-1 text-sm text-usco-muted">Solo puedes modificar tu número de contacto.</p>
        </div>

        <div>
          <dl className="space-y-3 rounded-2xl bg-usco-sand/50 p-4 text-sm">
            <div>
              <dt className="text-usco-muted">Nombre</dt>
              <dd className="wrap-break-word font-semibold">{name}</dd>
            </div>
            <div>
              <dt className="text-usco-muted">Correo institucional</dt>
              <dd className="break-all font-semibold">{email}</dd>
            </div>
            <div>
              <dt className="text-usco-muted">Rol</dt>
              <dd className="font-semibold">{role}</dd>
            </div>
          </dl>
          <p className="mt-2 text-xs text-usco-muted">
            Estos datos provienen de tu cuenta institucional y no se pueden modificar aquí.
          </p>
        </div>

        {formError && <Alert variant="error">{formError}</Alert>}

        <div>
          <label htmlFor="numero" className="block text-sm font-semibold">
            Número de celular
          </label>
          <input
            id="numero"
            name="numero"
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            maxLength={14}
            autoFocus
            placeholder="312 456 7890"
            value={value}
            onChange={(event) => {
              setValue(event.target.value);
              setFieldError(null);
            }}
            aria-invalid={fieldError ? true : undefined}
            aria-describedby={fieldError ? "numero-error" : "numero-help"}
            className="mt-2 w-full rounded-2xl border border-usco-line bg-white px-4 py-3 outline-none transition focus:border-usco-wine focus-visible:ring-2 focus-visible:ring-usco-wine/30 aria-invalid:border-red-400"
          />
          {fieldError ? (
            <p id="numero-error" className="mt-2 text-sm text-red-700">{fieldError}</p>
          ) : (
            <p id="numero-help" className="mt-2 text-sm text-usco-muted">
              10 dígitos, sin el prefijo +57. Ejemplo: 312 456 7890.
            </p>
          )}
        </div>

        <div className="flex flex-wrap justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className={`rounded-2xl border border-usco-line px-5 py-3 text-sm font-semibold transition hover:bg-usco-sand/60 disabled:opacity-60 ${FOCUS}`}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSaving || isUnchanged}
            aria-busy={isSaving}
            className={`rounded-2xl bg-usco-wine px-5 py-3 text-sm font-semibold text-white transition hover:bg-usco-wine-dark disabled:cursor-not-allowed disabled:opacity-60 ${FOCUS}`}
          >
            {isSaving ? "Guardando…" : "Guardar cambios"}
          </button>
        </div>
      </form>
    </dialog>
  );
}