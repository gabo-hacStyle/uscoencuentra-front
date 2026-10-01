import { contactoMock, objetosMock } from "@/mocks/objetos.mock";
import type { ContactoPrivado } from "@/types/objeto";

export async function obtenerContacto(idObjeto: string): Promise<ContactoPrivado> {
    // TODO(backend): reemplazar por fetch(`/api/objetos/${idObjeto}/contacto`)
    await new Promise((r) => setTimeout(r, 400)); // simula la espera de red

    const existe = objetosMock.some((objeto) => objeto.id === idObjeto);
    if (!existe) {
        throw new Error("Objeto no encontrado"); // simula el 404 del backend
    }

    return contactoMock;
}