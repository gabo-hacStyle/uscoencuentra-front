"use client";

import { useState, type SubmitEvent } from "react";
import { updatePhoneAction } from "@/actions/profile";
import { Alert } from "@/components/profile/Alert";
import Modal from "@/components/ui/BaseModal";
import { IconClose } from "@/components/ui/icons";
import { toNationalDigits, validateColombianPhone } from "@/lib/phone";

type EditProfileModalProps = {
  name: string;
  email: string;
  role: string; // already a display label ("Usuario" / "Administrador")
  numero: string | null;
  onClose: () => void;
  onSaved: (numero: string | null) => void;
};

const FOCUS =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-usco-wine";

export function EditProfileModal({ name, email, role, numero, onClose, onSaved }: EditProfileModalProps) {
  // Shows the NATIONAL number; "+57" is not typed (it is added when sending).
  const [value, setValue] = useState(numero ? toNationalDigits(numero) : "");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const validation = validateColombianPhone(value);
  const isUnchanged = validation.ok && validation.value === numero;

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSaving) return; // avoids duplicate submits
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
    // dismissible={false} while saving: Esc and backdrop click are ignored
    <Modal label="Editar perfil" onClose={onClose} dismissible={!isSaving} className="w-[min(32rem,92vw)]">
      <form
        onSubmit={handleSubmit}
        noValidate
        className="relative max-h-[90vh] space-y-5 overflow-y-auto p-6 sm:p-8"
      >
        <div>
          <h2 className="pr-8 text-xl font-bold text-usco-ink">Editar perfil</h2>
          <p className="mt-1 text-sm text-usco-muted">Solo puedes modificar tu número de contacto.</p>
        </div>

        <div>
          <dl className="space-y-3 rounded-2xl bg-usco-sand/50 p-4 text-sm">
            <div>
              <dt className="text-usco-muted">Nombre</dt>
              <dd className="wrap-break-word font-semibold text-usco-ink">{name}</dd>
            </div>
            <div>
              <dt className="text-usco-muted">Correo institucional</dt>
              <dd className="break-all font-semibold text-usco-ink">{email}</dd>
            </div>
            <div>
              <dt className="text-usco-muted">Rol</dt>
              <dd className="font-semibold text-usco-ink">{role}</dd>
            </div>
          </dl>
          <p className="mt-2 text-xs text-usco-muted">
            Estos datos provienen de tu cuenta institucional y no se pueden modificar aquí.
          </p>
        </div>

        {formError && <Alert variant="error">{formError}</Alert>}

        <div>
          <label
            htmlFor="numero"
            className="text-[0.65rem] font-bold uppercase tracking-wider text-usco-muted"
          >
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
            className="mt-2 w-full rounded-xl border border-usco-line bg-usco-cream px-4 py-3 text-usco-ink outline-none transition placeholder:text-usco-muted focus:border-usco-wine aria-invalid:border-usco-wine"
          />
          {fieldError ? (
            <p id="numero-error" className="mt-2 text-sm font-medium text-usco-wine">{fieldError}</p>
          ) : (
            <p id="numero-help" className="mt-2 text-sm text-usco-muted">
              Escribe 10 dígitos, sin +57. Ejemplo: 312 456 7890.
            </p>
          )}
        </div>

        <div className="flex flex-wrap justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className={`rounded-full border border-usco-line px-5 py-2.5 font-bold text-usco-ink transition hover:bg-usco-cream disabled:opacity-60 ${FOCUS}`}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSaving || isUnchanged}
            aria-busy={isSaving}
            className={`rounded-full bg-usco-wine px-5 py-2.5 font-bold text-white transition hover:bg-usco-wine-dark disabled:cursor-not-allowed disabled:opacity-50 ${FOCUS}`}
          >
            {isSaving ? "Guardando…" : "Guardar cambios"}
          </button>
        </div>

        {/* Last in the DOM on purpose: the dialog focuses the first focusable element,
            and it must be the phone input, not this button. */}
        <button
          type="button"
          onClick={onClose}
          disabled={isSaving}
          aria-label="Cerrar"
          className="absolute right-5 top-5 grid h-8 w-8 place-items-center rounded-full text-usco-ink transition hover:bg-usco-cream disabled:opacity-50"
        >
          <IconClose className="h-4 w-4" />
        </button>
      </form>
    </Modal>
  );
}