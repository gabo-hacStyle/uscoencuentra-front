import type { ContactoPrivado, Objeto } from "@/types/objeto";

export const objetosMock: Objeto[] = [
    {
        id: "1",
        tipo: "perdido",
        titulo: "Morral azul oscuro",
        descripcion:
        "Morral azul oscuro con un llavero de planeta y un bolsillo frontal con cierre.",
        categoria: "Accesorios",
        ubicacion: "Cafetería Central",
        imagenUrl: "/mocks/morral.jpg",
        publicadoEn: "2026-06-12T12:08:00-05:00",
    },
    {
        id: "2",
        tipo: "encontrado",
        titulo: "Calculadora científica",
        descripcion: "Calculadora científica negra con el nombre borrado en la tapa.",
        categoria: "Electrónicos",
        ubicacion: "Edificio de Ingeniería",
        imagenUrl: "/mocks/calculadora.jpg",
        publicadoEn: "2026-06-14T09:30:00-05:00",
    },
];

export const contactoMock: ContactoPrivado = {
    publicadoPor: "A*** M******",
    whatsapp: "+573105554821",
    correo: "contacto.objeto@usco.edu.co",
};