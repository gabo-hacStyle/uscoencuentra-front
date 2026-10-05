"use client";

import Image from "next/image";
import { useState } from "react";
import { IconImage } from "@/components/ui/icons";

interface ItemImageProps {
    src: string | null;
    alt: string;
    sizes: string;
    className?: string; // classes for the <Image> (e.g. hover effects)
}

// Fills its parent, which must be "relative" and have a size.
// Shows a placeholder when there is no image or when it fails to load.
export default function ItemImage({ src, alt, sizes, className = "" }: ItemImageProps) {
    const [failed, setFailed] = useState(false);

    if (!src || failed) {
        return (
        <div
            role="img"
            aria-label={`${alt} (sin foto)`}
            className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-usco-sand text-usco-muted"
        >
            <IconImage className="h-10 w-10" />
            <span className="text-xs font-medium">Sin foto</span>
        </div>
        );
    }

    return (
        <Image
        src={src}
        alt={alt}
        fill
        unoptimized={src.startsWith("data:")}
        sizes={sizes}
        onError={() => setFailed(true)}
        className={`object-cover ${className}`}
        />
    );
}