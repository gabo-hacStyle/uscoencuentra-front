"use client";

import { useState } from "react";
import ItemDetailModal from "@/components/items/ItemDetailModal";
import PrivateContactModal from "@/components/items/PrivateContactModal";
import type { Item } from "@/types/item";

interface ContactFlowProps {
    item: Item;
    onClose: () => void;
}

export default function ContactFlow({ item, onClose }: ContactFlowProps) {
    const [step, setStep] = useState<"detail" | "contact">("detail");

    if (step === "contact") {
        return <PrivateContactModal item={item} onClose={onClose} />;
    }
    return (
        <ItemDetailModal
        item={item}
        onClose={onClose}
        onContact={() => setStep("contact")}
        />
    );
}