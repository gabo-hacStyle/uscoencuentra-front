"use client";

import Image from "next/image";
import { useState } from "react";
import ContactFlow from "@/components/items/ContactFlow";
import { ITEM_TEXTS } from "@/lib/item-texts";
import type { Item } from "@/types/item";

export default function ItemsDemo({ items }: { items: Item[] }) {
    const [selectedItem, setSelectedItem] = useState<Item | null>(null);

    return (
        <>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
            <li key={item.id}>
                <button
                type="button"
                onClick={() => setSelectedItem(item)}
                className="w-full overflow-hidden rounded-2xl border border-usco-line bg-white text-left transition hover:shadow-md"
                >
                <div className="relative h-40">
                    <Image
                    src={item.imageUrl}
                    alt={item.title}
                    fill
                    unoptimized={item.imageUrl.startsWith("data:")}
                    sizes="(min-width: 1024px) 20rem, (min-width: 640px) 50vw, 100vw"
                    className="object-cover"
                    />
                </div>
                <div className="space-y-2 p-4">
                    <span
                    className={`inline-block rounded-full px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wider ${ITEM_TEXTS[item.type].badgeClassName}`}
                    >
                    {ITEM_TEXTS[item.type].badgeLabel}
                    </span>
                    <h3 className="font-bold text-usco-ink">{item.title}</h3>
                    <p className="text-sm text-usco-muted">{item.location}</p>
                </div>
                </button>
            </li>
            ))}
        </ul>

        {selectedItem && (
            <ContactFlow
            key={selectedItem.id}
            item={selectedItem}
            onClose={() => setSelectedItem(null)}
            />
        )}
        </>
    );
}