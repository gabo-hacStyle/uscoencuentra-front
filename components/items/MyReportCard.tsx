import ItemImage from "@/components/items/ItemImage";
import ItemStatusBadge from "@/components/items/ItemStatusBadge";
import { IconCheckCircle, IconEye } from "@/components/ui/icons";
import { ITEM_TEXTS } from "@/lib/item-texts";
import type { Item } from "@/types/item";

interface MyReportCardProps {
    item: Item;
    isClosed?: boolean; // history card: the status badge is hidden because the report is completed
    onView: (item: Item) => void;
    onManage?: (item: Item) => void;
}

export default function MyReportCard({ item, isClosed = false, onView, onManage }: MyReportCardProps) {
    const texts = ITEM_TEXTS[item.type];
    // Closed reports live in the history and have no state left to manage
    const canManage = Boolean(onManage);

    return (
        <article className="rounded-3xl border border-usco-line bg-white p-4">
        <div className="relative aspect-video overflow-hidden rounded-2xl bg-usco-sand">
            <ItemImage
            src={item.imageUrl}
            alt={item.title}
            sizes="(min-width: 768px) 40vw, 90vw"
            />
        </div>

        <h3 className="mt-4 text-lg font-bold text-usco-ink">{item.title}</h3>
        <p className="mt-1 text-sm text-usco-muted">
            {item.category} · {item.location}
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-2">
            <span
            className={`rounded-full px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wider ${texts.badgeClassName}`}
            >
            {texts.badgeLabel}
            </span>
            {!isClosed && <ItemStatusBadge status={item.status} showActive />}
        </div>

        <div className="mt-4 flex gap-3 border-t border-usco-line pt-4">
            <button
            type="button"
            onClick={() => onView(item)}
            aria-label={`Ver detalles de ${item.title}`}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-usco-line bg-white px-4 py-3 text-sm font-bold text-usco-ink transition hover:bg-usco-cream"
            >
            <IconEye className="h-4 w-4" />
            Ver detalles
            </button>

            {canManage && (
            <button
                type="button"
                onClick={() => onManage?.(item)}
                aria-label={`Gestionar estado de ${item.title}`}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-usco-wine px-4 py-3 text-sm font-bold text-white transition hover:bg-usco-wine-dark disabled:cursor-not-allowed disabled:opacity-50"
            >
                <IconCheckCircle className="h-4 w-4" />
                Gestionar estado
            </button>
            )}
        </div>
        </article>
    );
}