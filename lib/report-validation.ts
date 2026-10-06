import { CATEGORY_CONFIG } from "@/lib/item-categories";
import type { ItemCategory, ItemType } from "@/types/item";

// Keep these in sync with the backend validation
export const LIMITS = {
    titleMin: 3,
    titleMax: 60,
    descriptionMin: 10,
    descriptionMax: 300,
    locationMin: 3,
    locationMax: 80,
    imageMaxBytes: 5 * 1024 * 1024, // 5 MB
} as const;

export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export interface ReportValues {
    type: ItemType;
    title: string;
    category: ItemCategory | ""; // "" = nothing selected yet
    description: string;
    location: string;
    date: string; // YYYY-MM-DD, as returned by <input type="date">
    accepted: boolean; // privacy checkbox
}

export type ReportField = keyof ReportValues;
export type ReportErrors = Partial<Record<ReportField, string>>;

// Today in the user's local time as YYYY-MM-DD ("en-CA" formats dates that way)
export function todayLocal(): string {
    return new Date().toLocaleDateString("en-CA");
}

function checkLength(value: string, label: string, min: number, max: number): string | undefined {
    const length = value.trim().length;
    if (length === 0) return `${label} es obligatorio.`;
    if (length < min) return `${label} debe tener al menos ${min} caracteres.`;
    if (length > max) return `${label} no puede superar ${max} caracteres.`;
    return undefined;
}

// Returns one message per invalid field. An empty object means the form is valid.
export function validateReport(values: ReportValues, today: string): ReportErrors {
    const errors: ReportErrors = {};

    const title = checkLength(values.title, "El nombre", LIMITS.titleMin, LIMITS.titleMax);
    if (title) errors.title = title;

    if (!CATEGORY_CONFIG.some((c) => c.category === values.category)) {
        errors.category = "Selecciona una categoría.";
    }

    const description = checkLength(
        values.description,
        "La descripción",
        LIMITS.descriptionMin,
        LIMITS.descriptionMax,
    );
    if (description) errors.description = description;

    const location = checkLength(values.location, "El lugar", LIMITS.locationMin, LIMITS.locationMax);
    if (location) errors.location = location;

    if (!/^\d{4}-\d{2}-\d{2}$/.test(values.date)) {
        errors.date = "Indica la fecha.";
    } else if (values.date > today) {
        errors.date = "La fecha no puede ser futura."; // ISO dates compare correctly as strings
    }

    if (!values.accepted) errors.accepted = "Debes aceptar para publicar el reporte.";

    return errors;
}

// Returns an error message, or null when the file is acceptable
export function validateImage(file: File): string | null {
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) return "Usa una imagen JPG, PNG o WebP.";
    if (file.size > LIMITS.imageMaxBytes) return "La imagen no puede superar 5 MB.";
    return null;
}