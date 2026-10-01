export type TipoReporte = "perdido" | "encontrado";

export interface Objeto {
    id: string;
    tipo: TipoReporte;
    titulo: string;
    descripcion: string;
    categoria: string;
    ubicacion: string;
    imagenUrl: string;
    publicadoEn: string; // ISO 8601; el frontend lo formatea ("12 jun, 12:08 p. m.")
}

export interface ContactoPrivado {
    publicadoPor: string;        // ya enmascarado por el backend
    whatsapp: string | null;     // "+573105554821"
    correo: string;
}