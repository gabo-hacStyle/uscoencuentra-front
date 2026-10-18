"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { markRecoveredAction, reportFailureAction } from "@/actions/items";
import Modal from "@/components/ui/BaseModal";
import { IconCheck, IconClose } from "@/components/ui/icons";
import { FAILURE_REASONS } from "@/lib/recovery-texts";
import {
    NOTE_MAX,
    validateFailure,
    validateRecoveredNote,
    type FailureErrors,
} from "@/lib/recovery-validation";
import type { Item } from "@/types/item";

export type ResolveMode = "recovered" | "failed";
type Status = "editing" | "submitting" | "success";

interface Copy {
    eyebrow: string;
    title: string;
    intro: (itemTitle: string) => string;
    submit: string;
    successTitle: string;
    success: string;
}

const COPY: Record<ResolveMode, Copy> = {
    recovered: {
        eyebrow: "Cerrar reporte",
        title: "Marcar como recuperado",
        intro: (title) =>
            `Se cerrará «${title}»: saldrá del catálogo y quedará en tu historial. Esta acción no se puede deshacer.`,
        submit: "Confirmar recuperación",
        successTitle: "¡Reporte cerrado!",
        success: "El objeto ya no aparece en el catálogo y quedó registrado en tu historial.",
    },
    failed: {
        eyebrow: "Registrar fallo",
        title: "No coincide",
        intro: (title) =>
            `«${title}» volverá a aparecer como activo en el catálogo y este intento quedará registrado como «Fallado».`,
        submit: "Registrar fallo",
        successTitle: "Fallo registrado",
        success: "El objeto volvió a estar activo. El intento quedó guardado en el historial.",
    },
};

const labelClass = "text-[0.65rem] font-bold uppercase tracking-wider text-usco-muted";

interface ResolveModalProps {
    item: Item;
    mode: ResolveMode;
    onClose: () => void;
}

export default function ResolveModal({ item, mode, onClose }: ResolveModalProps) {
    const router = useRouter();
    const copy = COPY[mode];
    const [reason, setReason] = useState("");
    const [note, setNote] = useState("");
    const [touched, setTouched] = useState(false);
    const [status, setStatus] = useState<Status>("editing");
    const [serverError, setServerError] = useState<string | null>(null);

    const errors: FailureErrors =
        mode === "failed"
        ? validateFailure(reason, note)
        : { note: validateRecoveredNote(note) ?? undefined };
    const isValid = !errors.reason && !errors.note;
    const noteRequired = mode === "failed" && reason === "other";

    // After a success (or a server rejection) the list is stale: reload it
    function handleClose() {
        if (status === "success" || serverError) router.refresh();
        onClose();
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setTouched(true);
        if (!isValid || status === "submitting") return;

        setStatus("submitting");
        setServerError(null);
        try {
        const result =
            mode === "recovered"
            ? await markRecoveredAction(item.id, note)
            : await reportFailureAction(item.id, reason, note);
        if (result.ok) {
            setStatus("success");
        } else {
            setServerError(result.error);
            setStatus("editing");
        }
        } catch {
        setServerError("No pudimos completar la acción. Inténtalo de nuevo en unos minutos.");
        setStatus("editing");
        }
    }

    return (
        <Modal
        label={copy.title}
        onClose={handleClose}
        dismissible={status !== "submitting"}
        className="w-[min(34rem,92vw)]"
        >
        <div className="relative max-h-[90vh] overflow-y-auto p-6 md:p-8">
            {status === "success" ? (
            <div className="flex flex-col items-center py-4 text-center" aria-live="polite">
                <span className="grid h-16 w-16 place-items-center rounded-full bg-usco-wine/10 text-usco-wine">
                <IconCheck className="h-8 w-8" />
                </span>
                <h2 className="mt-5 text-2xl font-bold text-usco-ink">{copy.successTitle}</h2>
                <p className="mt-2 max-w-sm text-usco-muted">{copy.success}</p>
                <button
                type="button"
                onClick={handleClose}
                className="mt-8 rounded-full bg-usco-wine px-6 py-2.5 font-bold text-white transition hover:bg-usco-wine-dark"
                >
                Listo
                </button>
            </div>
            ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-5">
                <header>
                <p className="text-xs font-bold uppercase tracking-widest text-usco-wine">
                    {copy.eyebrow}
                </p>
                <h2 className="mt-2 pr-8 text-2xl font-bold text-usco-ink">{copy.title}</h2>
                <p className="mt-2 text-usco-muted">{copy.intro(item.title)}</p>
                </header>

                {mode === "failed" && (
                <fieldset>
                    <legend className={labelClass}>Motivo (obligatorio)</legend>
                    <div className="mt-2 space-y-2">
                    {FAILURE_REASONS.map((option) => (
                        <label
                        key={option.value}
                        className="block cursor-pointer rounded-2xl border border-usco-line bg-white p-3 transition hover:border-usco-wine/40 has-checked:border-usco-wine has-checked:bg-usco-wine/5 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-usco-wine"
                        >
                        <input
                            type="radio"
                            name="reason"
                            value={option.value}
                            checked={reason === option.value}
                            onChange={() => setReason(option.value)}
                            className="sr-only"
                        />
                        <span className="block text-sm font-bold text-usco-ink">{option.label}</span>
                        <span className="block text-xs text-usco-muted">{option.hint}</span>
                        </label>
                    ))}
                    </div>
                </fieldset>
                )}

                <div>
                <label htmlFor="resolve-note" className={labelClass}>
                    {noteRequired ? "Cuéntanos qué pasó" : "Nota (opcional)"}
                </label>
                <textarea
                    id="resolve-note"
                    rows={3}
                    value={note}
                    maxLength={NOTE_MAX}
                    onChange={(event) => setNote(event.target.value)}
                    onBlur={() => setTouched(true)}
                    aria-invalid={touched && errors.note ? true : undefined}
                    aria-describedby={touched && errors.note ? "resolve-note-error" : undefined}
                    className={`mt-2 w-full resize-none rounded-xl border bg-usco-cream px-4 py-3 text-usco-ink outline-none transition placeholder:text-usco-muted focus:border-usco-wine ${
                    touched && errors.note ? "border-usco-wine" : "border-usco-line"
                    }`}
                />
                <div className="mt-1.5 flex justify-between gap-3 text-xs">
                    <p id="resolve-note-error" className="font-medium text-usco-wine">
                    {touched ? errors.note : null}
                    </p>
                    <span className="ml-auto text-usco-muted">
                    {note.length}/{NOTE_MAX}
                    </span>
                </div>
                </div>

                {serverError && (
                <p role="alert" className="rounded-xl bg-usco-wine/10 px-4 py-3 text-sm font-medium text-usco-wine">
                    {serverError}
                </p>
                )}

                <div className="flex flex-wrap justify-end gap-3">
                <button
                    type="button"
                    onClick={handleClose}
                    disabled={status === "submitting"}
                    className="rounded-full border border-usco-line px-5 py-2.5 font-bold text-usco-ink transition hover:bg-usco-cream disabled:opacity-60"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={!isValid || status === "submitting"}
                    className="rounded-full bg-usco-wine px-5 py-2.5 font-bold text-white transition hover:bg-usco-wine-dark disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {status === "submitting" ? "Guardando…" : copy.submit}
                </button>
                </div>
            </form>
            )}

            {/* Last in the DOM so the first focusable element is the form, not this button */}
            {status !== "success" && (
            <button
                type="button"
                onClick={handleClose}
                disabled={status === "submitting"}
                aria-label="Cerrar"
                className="absolute right-5 top-5 grid h-8 w-8 place-items-center rounded-full text-usco-ink transition hover:bg-usco-cream disabled:opacity-50"
            >
                <IconClose className="h-4 w-4" />
            </button>
            )}
        </div>
        </Modal>
    );
}