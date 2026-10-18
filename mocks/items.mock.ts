import type { Item, PrivateContact } from "@/types/item";
import type { CategorySummary } from "@/types/item";

// Dates relative to now, so "Hoy" / "Ayer" always make sense in the demo
const daysAgo = (days: number) =>
    new Date(Date.now() - days * 86_400_000).toISOString();

export const itemsMock: Item[] = [
    {
        id: "1",
        type: "found",
        title: "Audífonos inalámbricos",
        description: "Audífonos inalámbricos blancos con su estuche de carga. Marca Apple",
        category: "Tecnología",
        location: "Biblioteca Central",
        imageUrl: "/mocks/airpods.jpg",
        publishedAt: daysAgo(0),
    },
    {
        id: "2",
        type: "lost",
        title: "Carnet estudiantil",
        description: "Carnet estudiantil perdido, posiblemente cerca de los salones de ingeniería.",
        category: "Documentos",
        location: "Bloque de Ingeniería",
        imageUrl: "/mocks/studentID.jpg",
        publishedAt: daysAgo(1),
    },
    {
        id: "3",
        type: "lost",
        title: "Maletín rosado",
        description: "Maletín rosado con bolsillo frontal con cierre, correas ajustables, accesorio de conejo y marca Addidas. Posiblemente de una chica",
        category: "Accesorios",
        location: "Cafetería La Venada",
        imageUrl: "/mocks/backpack.jpg",
        publishedAt: daysAgo(3),
    },
    {
        id: "4",
        type: "found",
        title: "Calculadora rosada con brillos",
        description: "Calculadora científica rosada, sin nombre visible, decorada con diamentes de colores.",
        category: "Tecnología",
        location: "Edificio de Ingeniería",
        imageUrl: "/mocks/calculator.jpg",
        publishedAt: daysAgo(5),
    },
    {
        id: "5",
        type: "found",
        title: "Llaves con llavero",
        description: "Juego de llaves con un llavero decorativo.",
        category: "Otros",
        location: "Plazoleta central",
        imageUrl: "/mocks/keychain.jpg",
        publishedAt: daysAgo(8),
    },
    {
        id: "6",
        type: "lost",
        title: "Tula de la universidad con uniforme de volleyball dentro",
        description: "Tula de la universidad, con uniforme de volleyball del equipo masculino.",
        category: "Accesorios",
        location: "Coliseo de deportes",
        imageUrl: null, // no photo, to test that case
        publishedAt: daysAgo(8),
    },
    {
        id: "7",
        type: "lost",
        title: "Gafas negras",
        description: "Gafas de marco negro, probablemente dejadas en un salón de clase.",
        category: "Accesorios",
        location: "Bloque de Humanidades",
        imageUrl: "/mocks/glasses.jpg",
        publishedAt: daysAgo(12),
    },
];

// One contact per item id. Item "5" has no WhatsApp, to test that case.
export const contactsMock: Record<string, PrivateContact> = {
    "1": { publishedBy: "A*** M******", whatsapp: "+573105554821", email: "ana.m@usco.edu.co" },
    "2": { publishedBy: "C***** R****", whatsapp: "+573001234567", email: "carlos.r@usco.edu.co" },
    "3": { publishedBy: "L**** P****", whatsapp: "+573157778899", email: "laura.p@usco.edu.co" },
    "4": { publishedBy: "J**** G*****", whatsapp: "+573204445566", email: "juan.g@usco.edu.co" },
    "5": { publishedBy: "M**** T*****", whatsapp: null, email: "maria.t@usco.edu.co" },
    "6": { publishedBy: "S****** V****", whatsapp: "+573112223344", email: "santiago.v@usco.edu.co" },
    "7": { publishedBy: "L**** P****", whatsapp: "+573157778899", email: "laura.pd@usco.edu.co" },
};

// Dummy counters, same shape the backend will return
export const categorySummariesMock: CategorySummary[] = [
    { category: "Tecnología", count: 18 },
    { category: "Documentos", count: 12 },
    { category: "Accesorios", count: 9 },
    { category: "Otros", count: 7 },
];

