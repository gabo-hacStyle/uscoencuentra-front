import { ITEM_TEXTS } from "@/lib/item-texts";
import type { Item, PrivateContact } from "@/types/item";

export function isMobileDevice(): boolean {
    if (typeof navigator === "undefined") return false;
    return /Android|iPhone|iPad|iPod|Mobi/i.test(navigator.userAgent);
}

export function buildWhatsAppUrl(phone: string, message: string): string {
    const digits = phone.replace(/\D/g, ""); // "+57 310..." -> "57310..."
    return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export function buildGmailUrl(email: string, subject: string, body: string): string {
    return (
        "https://mail.google.com/mail/?view=cm&fs=1" +
        `&to=${encodeURIComponent(email)}` +
        `&su=${encodeURIComponent(subject)}` +
        `&body=${encodeURIComponent(body)}`
    );
}

export function contactPublisher(item: Item, contact: PrivateContact): void {
    const texts = ITEM_TEXTS[item.type];
    const message = texts.contactMessage(item.title);
    const { whatsapp } = contact;

    if (isMobileDevice() && whatsapp) {
        window.open(buildWhatsAppUrl(whatsapp, message), "_blank", "noopener,noreferrer");
        return;
    }
    window.open(
        buildGmailUrl(contact.email, texts.emailSubject(item.title), message),
        "_blank",
        "noopener,noreferrer",
    );
}