"use client";

import { useEffect, useState } from "react";
import { getItemHistoryAction } from "@/actions/items";
import Modal from "@/components/ui/BaseModal";
import { IconClose } from "@/components/ui/icons";
import { formatPublishedDate } from "@/lib/item-format";
import { FAILURE_REASON_LABELS, HISTORY_EVENT_LABELS } from "@/lib/recovery-texts";
import type { HistoryEvent, Item } from "@/types/item";

type HistoryState =
    | { status: "loading" }
    | { status: "error"; message: string }
    | { status: "ready"; events: HistoryEvent[] };

interface HistoryModalProps {
    item: Item;
    onClose: () => void;
}

export default function HistoryModal({ item, onClose }: HistoryModalProps) {
    const [state, setState] = useState<HistoryState>({ status: "loading" });

    // The history is asked for when the modal opens, not with the list
    useEffect(() => {
        let cancelled = false;
        getItemHistoryAction(item.id)
        .then((result) => {
            if (cancelled) return;
            setState(
            result.ok
                ? { status: "ready", events: result.events }
                : { status: "error", message: result.error },
            );
        })
        .catch(() => {
            if (!cancelled) {
            setState({ status: "error", message: "No pudimos cargar el historial. Inténtalo de nuevo." });
            }
        });
        return () => {
        cancelled = true;
        };
    }, [item.id]);

    return (
        <Modal label={`Historial de ${item.title}`} onClose={onClose} className="w-[min(32rem,92vw)]">
        <div className="relative max-h-[90vh] overflow-y-auto p-6 md:p-8">
            <p className="text-xs font-bold uppercase tracking-widest text-usco-wine">Historial</p>
            <h2 className="mt-2 pr-8 text-2xl font-bold text-usco-ink">{item.title}</h2>

            <div className="mt-5" aria-live="polite">
            {state.status === "loading" && (
                <p className="text-sm text-usco-muted">Cargando historial…</p>
            )}
            {state.status === "error" && (
                <p role="alert" className="text-sm font-medium text-usco-wine">{state.message}</p>
            )}
            {state.status === "ready" && state.events.length === 0 && (
                <p className="text-sm text-usco-muted">Aún no hay actividad en este reporte.</p>
            )}
            {state.status === "ready" && state.events.length > 0 && (
                <ol className="space-y-5 border-l border-usco-line pl-5">
                {state.events.map((event) => (
                    <li key={event.id} className="relative">
                    <span
                        aria-hidden="true"
                        className="absolute -left-[1.6rem] top-1.5 h-2.5 w-2.5 rounded-full bg-usco-wine"
                    />
                    <p className="font-bold text-usco-ink">{HISTORY_EVENT_LABELS[event.type]}</p>
                    <p className="text-xs text-usco-muted">{formatPublishedDate(event.at)}</p>
                    {event.reason && (
                        <p className="mt-1 text-sm text-usco-ink">{FAILURE_REASON_LABELS[event.reason]}</p>
                    )}
                    {event.note && <p className="mt-1 text-sm text-usco-muted">{event.note}</p>}
                    </li>
                ))}
                </ol>
            )}
            </div>

            <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="absolute right-5 top-5 grid h-8 w-8 place-items-center rounded-full text-usco-ink transition hover:bg-usco-cream"
            >
            <IconClose className="h-4 w-4" />
            </button>
        </div>
        </Modal>
    );
}