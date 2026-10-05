"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import Modal from "@/components/ui/BaseModal";
import { IconCamera, IconCheck, IconClose, IconPin } from "@/components/ui/icons";
import { CATEGORY_CONFIG } from "@/lib/item-categories";
import {
    ACCEPTED_IMAGE_TYPES,
    LIMITS,
    todayLocal,
    validateImage,
    validateReport,
    type ReportField,
    type ReportValues,
} from "@/lib/report-validation";
import { createItem } from "@/services/items.service";
import type { ItemCategory, ItemType } from "@/types/item";

const TYPE_OPTIONS: { value: ItemType; label: string; hint: string; dateLabel: string }[] = [
    { value: "lost", label: "Perdí un objeto", hint: "Ayúdame a encontrarlo", dateLabel: "Fecha aproximada" },
    { value: "found", label: "Encontré un objeto", hint: "Ayúdame a devolverlo", dateLabel: "Fecha del hallazgo" },
];

const INITIAL_VALUES: ReportValues = {
    type: "lost",
    title: "",
    category: "",
    description: "",
    location: "",
    date: "",
    accepted: false,
};

const labelClass = "text-[0.65rem] font-bold uppercase tracking-wider text-usco-muted";
const inputBase =
    "w-full rounded-xl border bg-usco-cream px-4 py-3 text-usco-ink outline-none transition placeholder:text-usco-muted focus:border-usco-wine";

type Status = "editing" | "submitting" | "success" | "error";

interface FieldProps {
    name: ReportField;
    label: string;
    error?: string;
    counter?: string;
    className?: string;
    children: ReactNode;
}

// Label + control + error message (and optional counter) with consistent spacing
function Field({ name, label, error, counter, className = "", children }: FieldProps) {
    return (
        <div className={className}>
        <label htmlFor={`report-${name}`} className={labelClass}>
            {label}
        </label>
        <div className="mt-2">{children}</div>
        {(error || counter) && (
            <div className="mt-1.5 flex justify-between gap-3 text-xs">
            <p id={`report-${name}-error`} className="font-medium text-usco-wine">
                {error}
            </p>
            {counter && <span className="ml-auto text-usco-muted">{counter}</span>}
            </div>
        )}
        </div>
    );
}

interface ReportItemModalProps {
    onClose: () => void;
}

export default function ReportItemModal({ onClose }: ReportItemModalProps) {
    const router = useRouter();
    const [values, setValues] = useState<ReportValues>(INITIAL_VALUES);
    const [touched, setTouched] = useState<Partial<Record<ReportField, boolean>>>({});
    const [photo, setPhoto] = useState<{ file: File; url: string } | null>(null);
    const [photoError, setPhotoError] = useState<string | null>(null);
    const [status, setStatus] = useState<Status>("editing");
    const [today] = useState(todayLocal); // max value of the date input
    const photoUrlRef = useRef<string | null>(null);

    const errors = validateReport(values, today);
    const isValid = Object.keys(errors).length === 0;
    const typeOption = TYPE_OPTIONS.find((option) => option.value === values.type) ?? TYPE_OPTIONS[0];

    // Release the preview blob URL when the modal unmounts
    useEffect(() => {
        return () => {
        if (photoUrlRef.current) URL.revokeObjectURL(photoUrlRef.current);
        };
    }, []);

    function set<K extends keyof ReportValues>(key: K, value: ReportValues[K]) {
        setValues((current) => ({ ...current, [key]: value }));
    }

    const touch = (field: ReportField) => setTouched((current) => ({ ...current, [field]: true }));

    // Errors appear only after the user has interacted with the field
    const shown = (field: ReportField) => (touched[field] ? errors[field] : undefined);

    const inputProps = (field: ReportField) => ({
        id: `report-${field}`,
        name: field,
        "aria-invalid": shown(field) ? true : undefined,
        "aria-describedby": shown(field) ? `report-${field}-error` : undefined,
        onBlur: () => touch(field),
        className: `${inputBase} ${shown(field) ? "border-usco-wine" : "border-usco-line"}`,
    });

    function replacePhoto(file: File | null) {
        if (photoUrlRef.current) URL.revokeObjectURL(photoUrlRef.current);
        const url = file ? URL.createObjectURL(file) : null;
        photoUrlRef.current = url;
        setPhoto(file && url ? { file, url } : null);
    }

    function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0] ?? null;
        event.target.value = ""; // lets the user pick the same file again
        if (!file) return;

        const error = validateImage(file);
        setPhotoError(error);
        if (!error) replacePhoto(file); // an invalid file keeps the previous photo
    }

    function resetForm() {
        setValues(INITIAL_VALUES);
        setTouched({});
        setPhotoError(null);
        replacePhoto(null);
        setStatus("editing");
    }

    // After publishing, refresh the server data so the catalog shows the new report
    function handleClose() {
        if (status === "success") router.refresh();
        onClose();
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!isValid || status === "submitting") return;

        setStatus("submitting");
        try {
        await createItem({
            type: values.type,
            title: values.title.trim(),
            category: values.category as ItemCategory, // validated above
            description: values.description.trim(),
            location: values.location.trim(),
            eventDate: values.date,
            image: photo?.file ?? null,
        });
        setStatus("success");
        } catch {
        setStatus("error"); // keeps the typed values so the user can retry
        }
    }

    return (
        <Modal label="Reportar un objeto" onClose={handleClose} className="w-[min(40rem,94vw)]">
        <div className="relative max-h-[90vh] overflow-y-auto p-6 md:p-8">
            <button
            type="button"
            onClick={handleClose}
            aria-label="Cerrar"
            className="absolute right-5 top-5 grid h-8 w-8 place-items-center rounded-full text-usco-ink transition hover:bg-usco-cream"
            >
            <IconClose className="h-4 w-4" />
            </button>

            {status === "success" ? (
            <div className="flex flex-col items-center py-6 text-center" aria-live="polite">
                <span className="grid h-16 w-16 place-items-center rounded-full bg-usco-wine/10 text-usco-wine">
                <IconCheck className="h-8 w-8" />
                </span>
                <h2 className="mt-5 text-2xl font-bold text-usco-ink">¡Reporte publicado!</h2>
                <p className="mt-2 max-w-sm text-usco-muted">
                {values.type === "lost"
                    ? "Tu reporte ya es visible para la comunidad. Te contactarán de forma privada si alguien encuentra tu objeto."
                    : "Gracias por ayudar. Si alguien reconoce el objeto, te contactará de forma privada."}
                </p>
                <div className="mt-8 flex flex-wrap justify-center gap-3">
                <button
                    type="button"
                    onClick={resetForm}
                    className="rounded-full border border-usco-line px-5 py-2.5 font-bold text-usco-ink transition hover:bg-usco-cream"
                >
                    Reportar otro objeto
                </button>
                <button
                    type="button"
                    onClick={handleClose}
                    className="rounded-full bg-usco-wine px-6 py-2.5 font-bold text-white transition hover:bg-usco-wine-dark"
                >
                    Listo
                </button>
                </div>
            </div>
            ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-6">
                <header>
                <p className="text-xs font-bold uppercase tracking-widest text-usco-wine">
                    Nueva publicación
                </p>
                <h2 className="mt-2 pr-8 text-3xl font-bold text-usco-ink">Reporta un objeto</h2>
                <p className="mt-2 text-usco-muted">
                    Ayuda a que vuelva a las manos correctas.
                </p>
                </header>

                {/* Lost / found selector: real radio inputs, so keyboard and screen readers work */}
                <fieldset>
                <legend className={labelClass}>¿Qué quieres reportar?</legend>
                <div className="mt-2 grid gap-3 sm:grid-cols-2">
                    {TYPE_OPTIONS.map((option) => (
                    <label
                        key={option.value}
                        className="cursor-pointer rounded-2xl border border-usco-line bg-white p-4 transition hover:border-usco-wine/40 has-checked:border-usco-wine has-checked:bg-usco-wine/5 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-usco-wine"
                    >
                        <input
                        type="radio"
                        name="type"
                        value={option.value}
                        checked={values.type === option.value}
                        onChange={() => set("type", option.value)}
                        className="sr-only"
                        />
                        <span className="block font-bold text-usco-ink">{option.label}</span>
                        <span className="mt-1 block text-xs text-usco-muted">{option.hint}</span>
                    </label>
                    ))}
                </div>
                </fieldset>

                <div className="grid gap-4 sm:grid-cols-2">
                <Field name="title" label="Nombre del objeto" error={shown("title")}>
                    <input
                    {...inputProps("title")}
                    type="text"
                    value={values.title}
                    maxLength={LIMITS.titleMax}
                    onChange={(e) => set("title", e.target.value)}
                    placeholder="Ej. Morral azul oscuro"
                    />
                </Field>

                <Field name="category" label="Categoría" error={shown("category")}>
                    <select
                    {...inputProps("category")}
                    value={values.category}
                    onChange={(e) => set("category", e.target.value as ItemCategory | "")}
                    >
                    <option value="" disabled>
                        Selecciona una categoría
                    </option>
                    {CATEGORY_CONFIG.map(({ category }) => (
                        <option key={category} value={category}>
                        {category}
                        </option>
                    ))}
                    </select>
                </Field>
                </div>

                <Field
                name="description"
                label="Descripción"
                error={shown("description")}
                counter={`${values.description.length}/${LIMITS.descriptionMax}`}
                >
                <textarea
                    {...inputProps("description")}
                    rows={4}
                    value={values.description}
                    maxLength={LIMITS.descriptionMax}
                    onChange={(e) => set("description", e.target.value)}
                    placeholder="Incluye características que ayuden a identificarlo..."
                    className={`${inputProps("description").className} resize-none`}
                />
                </Field>

                <div className="grid gap-4 sm:grid-cols-2">
                <Field name="location" label="Lugar" error={shown("location")}>
                    <div className="relative">
                    <IconPin className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-usco-muted" />
                    <input
                        {...inputProps("location")}
                        type="text"
                        value={values.location}
                        maxLength={LIMITS.locationMax}
                        onChange={(e) => set("location", e.target.value)}
                        placeholder="Ej. Biblioteca Central"
                        className={`${inputProps("location").className} pl-10`}
                    />
                    </div>
                </Field>

                <Field name="date" label={typeOption.dateLabel} error={shown("date")}>
                    <input
                    {...inputProps("date")}
                    type="date"
                    value={values.date}
                    max={today}
                    onChange={(e) => set("date", e.target.value)}
                    />
                </Field>
                </div>

                {/* Optional photo: the file is sent to the backend, which stores it and returns a URL */}
                <div>
                <input
                    id="report-photo"
                    type="file"
                    accept={ACCEPTED_IMAGE_TYPES.join(",")}
                    onChange={handlePhotoChange}
                    className="peer sr-only"
                />
                {photo ? (
                    <div className="flex items-center gap-4 rounded-2xl border border-usco-line p-3">
                    {/* eslint-disable-next-line @next/next/no-img-element -- blob: preview, next/image does not accept it */}
                    <img
                        src={photo.url}
                        alt="Vista previa de la fotografía"
                        className="h-20 w-20 shrink-0 rounded-xl object-cover"
                    />
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-usco-ink">{photo.file.name}</p>
                        <p className="text-xs text-usco-muted">
                        {(photo.file.size / (1024 * 1024)).toFixed(1)} MB
                        </p>
                    </div>
                    <label
                        htmlFor="report-photo"
                        className="cursor-pointer text-sm font-bold text-usco-wine hover:underline"
                    >
                        Cambiar
                    </label>
                    <button
                        type="button"
                        onClick={() => replacePhoto(null)}
                        aria-label="Quitar fotografía"
                        className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-usco-ink transition hover:bg-usco-cream"
                    >
                        <IconClose className="h-4 w-4" />
                    </button>
                    </div>
                ) : (
                    <label
                    htmlFor="report-photo"
                    className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-usco-line px-4 py-5 text-sm text-usco-muted transition hover:border-usco-wine/50 hover:bg-usco-cream peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-usco-wine"
                    >
                    <IconCamera className="h-5 w-5" />
                    <span className="font-medium text-usco-ink">Agregar fotografía</span>
                    <span className="text-xs">(opcional)</span>
                    </label>
                )}
                <p className="mt-1.5 text-xs text-usco-muted">
                    JPG, PNG o WebP, máximo 5 MB. Evita fotos donde se vean números de documento u
                    otros datos personales.
                </p>
                {photoError && (
                    <p role="alert" className="mt-1 text-xs font-medium text-usco-wine">
                    {photoError}
                    </p>
                )}
                </div>

                <div>
                <label className="flex items-start gap-3 text-sm text-usco-ink">
                    <input
                    id="report-accepted"
                    name="accepted"
                    type="checkbox"
                    checked={values.accepted}
                    onChange={(e) => set("accepted", e.target.checked)}
                    onBlur={() => touch("accepted")}
                    aria-invalid={shown("accepted") ? true : undefined}
                    aria-describedby={shown("accepted") ? "report-accepted-error" : undefined}
                    className="mt-0.5 h-4 w-4 shrink-0 accent-usco-wine"
                    />
                    <span>
                    Entiendo que no debo publicar datos personales ni información sensible en este
                    reporte (teléfonos, números de documento, direcciones).
                    </span>
                </label>
                <p className="mt-1.5 pl-7 text-xs text-usco-muted">
                    Tu contacto no se publica: solo se comparte de forma privada cuando alguien te
                    escribe desde el reporte.
                </p>
                {shown("accepted") && (
                    <p id="report-accepted-error" className="mt-1 pl-7 text-xs font-medium text-usco-wine">
                    {errors.accepted}
                    </p>
                )}
                </div>

                {status === "error" && (
                <p role="alert" className="rounded-xl bg-usco-wine/10 px-4 py-3 text-sm font-medium text-usco-wine">
                    No pudimos publicar tu reporte. Revisa tu conexión e intenta de nuevo.
                </p>
                )}

                <div>
                <button
                    type="submit"
                    disabled={!isValid || status === "submitting"}
                    className="w-full rounded-full bg-usco-wine px-6 py-3.5 font-bold text-white transition hover:bg-usco-wine-dark disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {status === "submitting" ? "Publicando…" : "Publicar reporte"}
                </button>
                {!isValid && (
                    <p className="mt-2 text-center text-xs text-usco-muted">
                    Completa los campos obligatorios para publicar.
                    </p>
                )}
                </div>
            </form>
            )}
        </div>
        </Modal>
    );
}