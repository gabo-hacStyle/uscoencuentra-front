"use client";

import { useState } from "react";
import BaseModal from "@/components/ui/BaseModal";
import { resolveReport } from "@/services/items.service";
import type { Item, ItemType } from "@/types/item";

// The modal is only shown to the publisher, so the question depends on the report type:
// "lost" -> the owner asks if it was recovered; "found" -> the finder asks if it was delivered.
const QUESTIONS: Record<ItemType, string> = {
    lost: "¿El objeto fue exitosamente recuperado?",
    found: "¿El objeto fue exitosamente entregado?",
};

interface ManageStatusModalProps {
    item: Item;
    onClose: () => void;
    // resolved = true: the report goes to the history. resolved = false: it keeps searching.
    onResolved: (item: Item, resolved: boolean) => void;
}

type Step = "question" | "closed";

export default function ManageStatusModal({ item, onClose, onResolved }: ManageStatusModalProps) {
    const [step, setStep] = useState<Step>("question");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [hasError, setHasError] = useState(false);

    async function answer(resolved: boolean) {
        setIsSubmitting(true);
        setHasError(false);
        try {
            await resolveReport(item.id, resolved);
            onResolved(item, resolved);
            if (resolved) {
                setStep("closed"); // confirmation message before closing
            } else {
                onClose();
            }
        } catch {
            setHasError(true);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <BaseModal
            label={step === "closed" ? "Reporte cerrado" : "Actualizar reporte"}
            onClose={onClose}
            dismissible={!isSubmitting} // blocks Esc and backdrop click while saving
            className="w-full max-w-md"
        >
            <div className="p-7">
                {step === "closed" ? (
                    <>
                        <p className="text-xs font-bold uppercase tracking-widest text-usco-wine">Reporte cerrado</p>
                        <h2 className="mt-3 text-2xl font-bold text-usco-ink">Tu reporte pasó al historial</h2>
                        <p className="mt-3 text-usco-muted">
                            Ya no aparece entre tus reportes activos ni es visible para los demás usuarios.
                            Puedes consultarlo en la pestaña «Historial».
                        </p>
                        <div className="mt-8 flex justify-end">
                            <button
                                type="button"
                                onClick={onClose}
                                className="rounded-full bg-usco-wine px-6 py-3 text-sm font-bold text-white transition hover:bg-usco-wine-dark"
                            >
                                Entendido
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <p className="text-xs font-bold uppercase tracking-widest text-usco-wine">Actualizar reporte</p>
                        <h2 className="mt-3 text-2xl font-bold text-usco-ink">{QUESTIONS[item.type]}</h2>
                        <p className="mt-3 text-usco-muted">
                            Si confirmas, el reporte pasará al historial y dejará de aparecer entre los activos.
                        </p>

                        {hasError && (
                            <p role="alert" className="mt-4 text-sm font-bold text-usco-wine">
                                No pudimos actualizar el reporte. Inténtalo de nuevo.
                            </p>
                        )}

                        <div className="mt-8 flex justify-end gap-3">
                            <button
                                type="button"
                                disabled={isSubmitting}
                                onClick={() => answer(false)}
                                className="rounded-full border border-usco-line bg-white px-6 py-3 text-sm font-bold text-usco-ink transition hover:bg-usco-cream disabled:opacity-50"
                            >
                                No
                            </button>
                            <button
                                type="button"
                                disabled={isSubmitting}
                                onClick={() => answer(true)}
                                className="rounded-full bg-usco-wine px-6 py-3 text-sm font-bold text-white transition hover:bg-usco-wine-dark disabled:opacity-50"
                            >
                                Sí
                            </button>
                        </div>
                    </>
                )}
            </div>
        </BaseModal>
    );
}