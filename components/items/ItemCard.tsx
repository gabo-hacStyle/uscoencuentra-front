import ItemImage from "@/components/items/ItemImage";
import { IconPin } from "@/components/ui/icons";
import { formatRelativeDate } from "@/lib/item-format";
import { ITEM_TEXTS } from "@/lib/item-texts";
import type { Item } from "@/types/item";

interface ItemCardProps {
    item: Item;
    showType: boolean; // false when the lost/found filter is active (the badge would be redundant)
    onSelect: (item: Item) => void;
}

export default function ItemCard({ item, showType, onSelect }: ItemCardProps) {
    const texts = ITEM_TEXTS[item.type];

    return (
        <button
        type="button"
        onClick={() => onSelect(item)}
        className="group flex w-full flex-col overflow-hidden rounded-3xl border border-usco-line bg-white text-left transition hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-usco-wine"
        >
        <div className="relative aspect-4/3 w-full overflow-hidden bg-usco-sand">
            <ItemImage
            src={item.imageUrl}
            alt={item.title}
            sizes="(min-width: 1024px) 24rem, (min-width: 640px) 50vw, 100vw"
            className="transition duration-300 group-hover:scale-105"
            />
            {showType && (
            <span
                className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wider ${texts.badgeClassName}`}
            >
                {texts.badgeLabel}
            </span>
            )}
        </div>

        <div className="flex flex-1 flex-col gap-1 p-4">
            <h3 className="line-clamp-1 text-lg font-bold text-usco-ink">{item.title}</h3>
            <p className="text-sm text-usco-muted">{item.category}</p>

            {/* mt-auto keeps location and date aligned at the bottom across cards */}
            <div className="mt-auto flex items-center justify-between gap-3 pt-3 text-xs text-usco-muted">
            <span className="flex min-w-0 items-center gap-1.5">
                <IconPin className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{item.location}</span>
            </span>
            <time dateTime={item.publishedAt} className="shrink-0">
                {formatRelativeDate(item.publishedAt)}
            </time>
            </div>
        </div>
        </button>
    );
}