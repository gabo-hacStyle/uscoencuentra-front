// Campus places a report can point to. The backend must accept exactly these values.
export const ITEM_LOCATIONS = [
    "Cafetería",
    "Café y Letras",
    "Bloque Central",
    "Artes",
    "Economía",
    "Ingeniería",
    "Ileusco",
    "Laboratorios",
    "Ágoras",
    "Bienestar",
    "Restaurante",
    "Biblioteca",
] as const;

export type ItemLocation = (typeof ITEM_LOCATIONS)[number];