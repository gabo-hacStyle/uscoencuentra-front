import type { FailureReason, HistoryEventType } from "@/types/item";

export const FAILURE_REASONS: { value: FailureReason; label: string; hint: string }[] = [
    { value: "not_the_item", label: "No era el objeto", hint: "Los detalles no coinciden." },
    { value: "no_response", label: "La persona no respondió", hint: "No hubo respuesta tras el contacto." },
    { value: "could_not_meet", label: "No se pudo coordinar la entrega", hint: "No lograron ponerse de acuerdo." },
    { value: "other", label: "Otro motivo", hint: "Cuéntanos qué pasó." },
];

export const FAILURE_REASON_LABELS = Object.fromEntries(
    FAILURE_REASONS.map((reason) => [reason.value, reason.label]),
) as Record<FailureReason, string>;

export const HISTORY_EVENT_LABELS: Record<HistoryEventType, string> = {
    contacted: "Alguien te contactó",
    failed: "Intento fallido",
    recovered: "Recuperado",
    expired: "Verificación vencida: volvió a activo",
};