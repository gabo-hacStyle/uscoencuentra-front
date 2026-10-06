"use client";

import ItemImage from "@/components/items/ItemImage";
import Modal from "@/components/ui/BaseModal";
import { IconClose, IconHelp, IconLock, IconPin } from "@/components/ui/icons";
import { formatPublishedDate } from "@/lib/item-format";
import { ITEM_TEXTS } from "@/lib/item-texts";
import type { Item } from "@/types/item";

interface ItemDetailModalProps {
    item: Item;
    onClose: () => void;
    onContact: () => void;
}

const labelClassName =
    "text-[0.65rem] font-bold uppercase tracking-wider text-usco-muted";

export default function ItemDetailModal({ item, onClose, onContact }: ItemDetailModalProps) {
    const texts = ITEM_TEXTS[item.type];

    return (
        <Modal
        label={`Detalle de ${item.title}`}
        onClose={onClose}
        className="w-[min(56rem,92vw)]"
        >
        <div className="grid max-h-[90vh] overflow-y-auto md:grid-cols-2">
            <div className="relative h-56 md:h-auto md:min-h-128">
            <ItemImage
            src={item.imageUrl}
            alt={item.title}
            sizes="(min-width: 768px) 28rem, 92vw"
            />
            </div>

            <div className="relative flex flex-col gap-5 p-6 md:p-8">
            <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar"
                className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-usco-cream text-usco-ink transition hover:bg-usco-sand"
            >
                <IconClose className="h-4 w-4" />
            </button>

            <div className="flex flex-wrap items-center gap-3 pr-12">
                <span
                className={`rounded-full px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wider ${texts.badgeClassName}`}
                >
                {texts.badgeLabel}
                </span>
                <span className="text-sm text-usco-muted">
                Publicado {formatPublishedDate(item.publishedAt)}
                </span>
            </div>

            <h2 className="text-3xl font-bold text-usco-ink">{item.title}</h2>
            <p className="text-usco-muted">{item.description}</p>

            <dl className="grid grid-cols-2 gap-4 border-y border-usco-line py-5">
                <div>
                <dt className={labelClassName}>Categoría</dt>
                <dd className="mt-1 font-medium text-usco-ink">{item.category}</dd>
                </div>
                <div>
                <dt className={labelClassName}>Ubicación</dt>
                <dd className="mt-1 flex items-center gap-1.5 font-medium text-usco-ink">
                    <IconPin className="h-4 w-4 shrink-0 text-usco-wine" />
                    {item.location}
                </dd>
                </div>
            </dl>

            <div className="flex items-start gap-3 rounded-2xl bg-usco-sand p-4 text-sm text-usco-ink">
                <IconLock className="mt-0.5 h-5 w-5 shrink-0 text-usco-wine" />
                <p>
                La identidad y los datos de contacto solo se muestran al iniciar una
                coordinación privada.
                </p>
            </div>

            <button
                type="button"
                onClick={onContact}
                className="flex items-center justify-center gap-2 rounded-xl bg-usco-wine px-6 py-3 font-bold text-white transition hover:bg-usco-wine-dark"
            >
                <IconHelp className="h-4 w-4" />
                Contactar de forma privada
            </button>
            </div>
        </div>
        </Modal>
    );
}