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

// Only real URLs are valid: a local path ("/mocks/x.jpg") or an absolute http(s) URL.
// null, "", "null" and data URIs (base64) are treated as "no image".
function isUrlSrc(src: string | null): src is string {
    if (!src) return false;
    if (src.startsWith("//")) return false; // protocol-relative URLs are not accepted
    if (src.startsWith("/")) return true;
    try {
        const { protocol } = new URL(src);
        return protocol === "http:" || protocol === "https:";
    } catch {
        return false;
    }
}

// Fills its parent, which must be "relative" and have a size.
// Shows a placeholder when there is no image or when it fails to load.
export default function ItemImage({ src, alt, sizes, className = "" }: ItemImageProps) {
    const [failed, setFailed] = useState(false);

    if (!isUrlSrc(src) || failed) {
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
        sizes={sizes}
        onError={() => setFailed(true)}
        className={`object-cover ${className}`}
        />
    );
}