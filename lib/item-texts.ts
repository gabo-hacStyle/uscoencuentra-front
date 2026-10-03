import type { ItemType } from "@/types/item";

interface ItemTexts {
    badgeLabel: string;
    badgeClassName: string; // Tailwind color classes for the badge
    contactTitle: string;
    contactDescription: string;
    actionLabel: string;
    emailSubject: (title: string) => string;
    contactMessage: (title: string) => string;
}

export const ITEM_TEXTS: Record<ItemType, ItemTexts> = {
    lost: {
        badgeLabel: "Perdido",
        badgeClassName: "bg-[#e5a52d] text-usco-ink",
        contactTitle: "¿Encontraste este objeto?",
        contactDescription:
        "Contacta a la persona que publicó este reporte para confirmar que es suyo y coordinar la devolución.",
        actionLabel: "Devolver objeto",
        emailSubject: (title) => `Encontré tu objeto perdido: ${title}`,
        contactMessage: (title) =>
        `Hola, vi tu publicación en USCO Encuentra y creo que encontré tu objeto perdido: ${title}.`,
    },
    found: {
        badgeLabel: "Encontrado",
        badgeClassName: "bg-[#3d7a55] text-white",
        contactTitle: "¿Reconoces este objeto?",
        contactDescription:
        "Contacta a la persona que publicó este reporte para confirmar si es tuyo y coordinar la entrega.",
        actionLabel: "Reclamar objeto",
        emailSubject: (title) => `Ese objeto es mío: ${title}`,
        contactMessage: (title) =>
        `Hola, vi tu publicación en USCO Encuentra y el objeto que encontraste (${title}) es mío.`,
    },
};