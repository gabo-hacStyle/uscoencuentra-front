import type { Item, PrivateContact } from "@/types/item";

export const itemsMock: Item[] = [
    {
        id: "1",
        type: "lost",
        title: "Morral azul oscuro",
        description:
        "Morral azul oscuro con un llavero de planeta y un bolsillo frontal con cierre.",
        category: "Accesorios",
        location: "Cafetería central",
        imageUrl: "/mocks/backpack.jpg",
        publishedAt: "2026-06-12T12:08:00-05:00",
    },
    {
        id: "2",
        type: "found",
        title: "Calculadora científica",
        description: "Calculadora científica negra con el nombre borrado en la tapa.",
        category: "Electrónicos",
        location: "Edificio de Ingeniería",
        imageUrl: "/mocks/calculator.jpg",
        publishedAt: "2026-06-14T09:30:00-05:00",
    },
];

export const contactMock: PrivateContact = {
    publishedBy: "A*** M******",
    whatsapp: "+573105554821",
    email: "contacto.objeto@usco.edu.co",
};