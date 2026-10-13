import type { Item, PrivateContact } from "@/types/item";
import type { CategorySummary } from "@/types/item";

// Dates relative to now, so "Hoy" / "Ayer" always make sense in the demo
const daysAgo = (days: number) =>
    new Date(Date.now() - days * 86_400_000).toISOString();

// Same idea as a date-only string (YYYY-MM-DD) in Bogotá time, for eventDate
const dateAgo = (days: number) =>
    new Intl.DateTimeFormat("en-CA", { timeZone: "America/Bogota" }).format(
        new Date(Date.now() - days * 86_400_000),
    );

// isOwner is SIMULATED here: the real backend computes it from the token.
// Items 3, 5, 6 and 8 behave as "yours"; items 4 and 6 start in verification.
export const itemsMock: Item[] = [
    {
        id: "1",
        type: "found",
        title: "Audífonos inalámbricos",
        description: "Audífonos inalámbricos blancos con su estuche de carga. Marca Apple",
        category: "Tecnología",
        location: "Biblioteca Central",
        imageUrl: "/mocks/airpods.jpg",
        eventDate: dateAgo(0),
        publishedAt: daysAgo(0),
        status: "active",
        failedAttempts: 0,
        recoveredAt: null,
        isOwner: false,
    },
    {
        id: "2",
        type: "lost",
        title: "Carnet estudiantil",
        description: "Carnet estudiantil perdido, posiblemente cerca de los salones de ingeniería.",
        category: "Documentos",
        location: "Bloque de Ingeniería",
        imageUrl: "/mocks/studentID.jpg",
        eventDate: dateAgo(2),
        publishedAt: daysAgo(1),
        status: "active",
        failedAttempts: 0,
        recoveredAt: null,
        isOwner: false,
    },
    {
        id: "3",
        type: "lost",
        title: "Maletín rosado",
        description: "Maletín rosado con bolsillo frontal con cierre, correas ajustables, accesorio de conejo y marca Addidas. Posiblemente de una chica",
        category: "Accesorios",
        location: "Cafetería La Venada",
        imageUrl: "/mocks/backpack.jpg",
        eventDate: dateAgo(4),
        publishedAt: daysAgo(3),
        status: "active",
        failedAttempts: 1,
        recoveredAt: null,
        isOwner: true,
    },
    {
        id: "4",
        type: "found",
        title: "Calculadora rosada con brillos",
        description: "Calculadora científica rosada, sin nombre visible, decorada con diamentes de colores.",
        category: "Tecnología",
        location: "Edificio de Ingeniería",
        imageUrl: "/mocks/calculator.jpg",
        eventDate: dateAgo(6),
        publishedAt: daysAgo(5),
        status: "in_verification",
        failedAttempts: 0,
        recoveredAt: null,
        isOwner: false,
    },
    {
        id: "5",
        type: "found",
        title: "Llaves con llavero",
        description: "Juego de llaves con un llavero decorativo.",
        category: "Otros",
        location: "Plazoleta central",
        imageUrl: "/mocks/keychain.jpg",
        eventDate: dateAgo(9),
        publishedAt: daysAgo(8),
        status: "active",
        failedAttempts: 0,
        recoveredAt: null,
        isOwner: true,
    },
    {
        id: "6",
        type: "lost",
        title: "Tula de la universidad con uniforme de volleyball dentro",
        description: "Tula de la universidad, con uniforme de volleyball del equipo masculino.",
        category: "Accesorios",
        location: "Coliseo de deportes",
        imageUrl: null, // no photo, to test that case
        eventDate: dateAgo(10),
        publishedAt: daysAgo(8),
        status: "in_verification",
        failedAttempts: 1,
        recoveredAt: null,
        isOwner: true,
    },
    {
        id: "7",
        type: "lost",
        title: "Gafas negras",
        description: "Gafas de marco negro, probablemente dejadas en un salón de clase.",
        category: "Accesorios",
        location: "Bloque de Humanidades",
        imageUrl: "/mocks/glasses.jpg",
        eventDate: dateAgo(14),
        publishedAt: daysAgo(12),
        status: "active",
        failedAttempts: 0,
        recoveredAt: null,
        isOwner: false,
    },
    {
        id: "8",
        type: "found",
        title: "Cargador de portátil",
        description: "Cargador de portátil negro con cable, encontrado conectado en una mesa.",
        category: "Tecnología",
        location: "Sala de cómputo",
        imageUrl: null, // no photo, to test that case
        eventDate: dateAgo(8),
        publishedAt: daysAgo(7),
        status: "recovered",
        failedAttempts: 0,
        recoveredAt: daysAgo(5),
        isOwner: true,
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
    "8": { publishedBy: "D***** H****", whatsapp: "+573101112233", email: "diana.h@usco.edu.co" },
};

// Dummy counters, same shape the backend will return
export const categorySummariesMock: CategorySummary[] = [
    { category: "Tecnología", count: 18 },
    { category: "Documentos", count: 12 },
    { category: "Accesorios", count: 9 },
    { category: "Otros", count: 7 },
];

