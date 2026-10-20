import ItemImage from "@/components/items/ItemImage";
import ItemStatusBadge from "@/components/items/ItemStatusBadge";
import { IconEye } from "@/components/ui/icons";
import { ITEM_TEXTS } from "@/lib/item-texts";
import type { Item } from "@/types/item";

interface MyReportCardProps {
    item: Item;
    onView: (item: Item) => void; // the eye button: opens the item detail
    onSelect?: (item: Item) => void; // the whole card: reserved for the delivered/failed modal
}

export default function MyReportCard({ item, onView, onSelect }: MyReportCardProps) {
    const texts = ITEM_TEXTS[item.type];

    return (
        <article className="relative rounded-3xl border border-usco-line bg-white p-4 transition hover:shadow-md">
        <div className="flex gap-3">
            <div className="relative aspect-video flex-1 overflow-hidden rounded-2xl bg-usco-sand">
            <ItemImage
                src={item.imageUrl}
                alt={item.title}
                sizes="(min-width: 768px) 40vw, 90vw"
            />
            </div>
            <button
            type="button"
            onClick={() => onView(item)}
            aria-label={`Ver detalle de ${item.title}`}
            className="relative z-10 grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-usco-line text-usco-ink transition hover:bg-usco-cream"
            >
            <IconEye className="h-4 w-4" />
            </button>
        </div>

        <h3 className="mt-4 text-lg font-bold text-usco-ink">{item.title}</h3>

        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-usco-muted">
            <span
            className={`rounded-full px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wider ${texts.badgeClassName}`}
            >
            {texts.badgeLabel}
            </span>
            <span>
            {item.category} · {item.location}
            </span>
        </div>

        <ItemStatusBadge status={item.status} showActive className="mt-3 inline-block" />

        {/* Stretched button: last in the DOM so it sits above the image; only exists when wired */}
        {onSelect && (
            <button
            type="button"
            onClick={() => onSelect(item)}
            aria-label={`Gestionar ${item.title}`}
            className="absolute inset-0 rounded-3xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-usco-wine"
            />
        )}
        </article>
    );
}