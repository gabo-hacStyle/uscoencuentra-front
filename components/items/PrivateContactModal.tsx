"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/ui/Modal";
import { IconClose } from "@/components/ui/icons";
import { contactPublisher } from "@/lib/contact";
import { formatPhone } from "@/lib/format";
import { ITEM_TEXTS } from "@/lib/item-texts";
import { getPrivateContact } from "@/services/items.service";
import type { Item, PrivateContact } from "@/types/item";

type ContactState =
    | { status: "loading" }
    | { status: "error" }
    | { status: "ready"; contact: PrivateContact };

interface PrivateContactModalProps {
    item: Item;
    onClose: () => void;
}

function InfoField({ label, value }: { label: string; value: string }) {
    return (
        <div>
        <dt className="text-[0.65rem] font-bold uppercase tracking-wider text-usco-muted">
            {label}
        </dt>
        <dd className="mt-1 wrap-break font-bold text-usco-ink">{value}</dd>
        </div>
    );
}

export default function PrivateContactModal({ item, onClose }: PrivateContactModalProps) {
    const texts = ITEM_TEXTS[item.type];
    const [state, setState] = useState<ContactState>({ status: "loading" });

    useEffect(() => {
        let cancelled = false;
        getPrivateContact(item.id)
        .then((contact) => {
            if (!cancelled) setState({ status: "ready", contact });
        })
        .catch(() => {
            if (!cancelled) setState({ status: "error" });
        });
        return () => {
        cancelled = true;
        };
    }, [item.id]);

    return (
        <Modal label={texts.contactTitle} onClose={onClose} className="w-[min(32rem,92vw)]">
        <div className="relative p-6 md:p-8">
            <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="absolute right-5 top-5 grid h-8 w-8 place-items-center rounded-full text-usco-ink transition hover:bg-usco-cream"
            >
            <IconClose className="h-4 w-4" />
            </button>

            <p className="text-xs font-bold uppercase tracking-widest text-usco-wine">
            Contacto privado
            </p>
            <h2 className="mt-2 pr-8 text-2xl font-bold text-usco-ink">
            {texts.contactTitle}
            </h2>
            <p className="mt-2 text-usco-muted">{texts.contactDescription}</p>

            <div className="mt-5 rounded-2xl bg-usco-sand p-5" aria-live="polite">
            {state.status === "loading" && (
                <p className="text-sm text-usco-muted">Cargando datos de contacto…</p>
            )}
            {state.status === "error" && (
                <p role="alert" className="text-sm font-medium text-usco-wine">
                No pudimos cargar los datos de contacto. Intenta de nuevo más tarde.
                </p>
            )}
            {state.status === "ready" && (
                <dl className="space-y-4">
                <InfoField label="Publicado por" value={state.contact.publishedBy} />
                {state.contact.whatsapp && (
                    <InfoField label="WhatsApp" value={formatPhone(state.contact.whatsapp)} />
                )}
                <InfoField label="Correo institucional" value={state.contact.email} />
                </dl>
            )}
            </div>

            <div className="mt-6 flex justify-end gap-3">
            <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-usco-line px-5 py-2.5 font-bold text-usco-ink transition hover:bg-usco-cream"
            >
                Cancelar
            </button>
            <button
                type="button"
                disabled={state.status !== "ready"}
                onClick={() => {
                if (state.status === "ready") contactPublisher(item, state.contact);
                }}
                className="rounded-full bg-usco-wine px-5 py-2.5 font-bold text-white transition hover:bg-usco-wine-dark disabled:cursor-not-allowed disabled:opacity-50"
            >
                {texts.actionLabel}
            </button>
            </div>
        </div>
        </Modal>
    );
}