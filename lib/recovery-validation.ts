import { FAILURE_REASONS } from "@/lib/recovery-texts";

// Keep in sync with the backend validation
export const NOTE_MAX = 200;
export const OTHER_NOTE_MIN = 5;

export interface FailureErrors {
    reason?: string;
    note?: string;
}

// Returns one message per invalid field. An empty object means the input is valid.
export function validateFailure(reason: string, note: string): FailureErrors {
    const errors: FailureErrors = {};
    if (!FAILURE_REASONS.some((option) => option.value === reason)) {
        errors.reason = "Selecciona un motivo.";
    }
    const length = note.trim().length;
    if (length > NOTE_MAX) {
        errors.note = `No puede superar ${NOTE_MAX} caracteres.`;
    } else if (reason === "other" && length < OTHER_NOTE_MIN) {
        errors.note = `Cuéntanos qué pasó (mínimo ${OTHER_NOTE_MIN} caracteres).`;
    }
    return errors;
}

export function validateRecoveredNote(note: string): string | null {
    return note.trim().length > NOTE_MAX ? `No puede superar ${NOTE_MAX} caracteres.` : null;
}