import type { ProfileResponse } from "@/types/profile";

// DATOS DUMMY (solo con MOCK_BACKEND=true): perfil inicial (GET /profile) de cada publicador de
// mocks/items.mock.ts, por correo. Los números son los que antes estaban fijos en contactsMock.
// Casos de la modal de contacto privado en /home:
// - carlos.r (Carnet estudiantil) y santiago.v (Tula): número + permiso -> whatsapp con número.
// - juan.g (Calculadora) y laura.pd (Gafas): número sin permiso -> whatsapp null.
// - ana.m (Audífonos): permiso sin número -> whatsapp null.
// Un correo que no esté aquí empieza sin número y con shareWhatsAppNumber en false.
export const profilesMock: Record<string, ProfileResponse> = {
    "ana.m@usco.edu.co": { numero: null, shareWhatsAppNumber: true },
    "carlos.r@usco.edu.co": { numero: "+573001234567", shareWhatsAppNumber: true },
    "laura.p@usco.edu.co": { numero: "+573157778899", shareWhatsAppNumber: false },
    "juan.g@usco.edu.co": { numero: "+573204445566", shareWhatsAppNumber: false },
    "maria.t@usco.edu.co": { numero: null, shareWhatsAppNumber: false },
    "santiago.v@usco.edu.co": { numero: "+573112223344", shareWhatsAppNumber: true },
    "laura.pd@usco.edu.co": { numero: "+573157778899", shareWhatsAppNumber: false },
    "diana.h@usco.edu.co": { numero: "+573101112233", shareWhatsAppNumber: false },
    "pedro.n@usco.edu.co": { numero: "+573144445566", shareWhatsAppNumber: false },
    "valeria.r@usco.edu.co": { numero: null, shareWhatsAppNumber: false },
};
