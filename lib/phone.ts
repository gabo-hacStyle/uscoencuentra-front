const COUNTRY_CODE = "+57"

export type PhoneValidation =
  | { ok: true; value: string } // formato E.164 ejemplo "573124567890" se envía al backend
  | { ok: false; error: string };

/**
 * Valida lo que escribe el usuario y lo convierte a E.164.
 * Entrada: número NACIONAL de celular colombiano ("312 456 7890", "312-456-7890", "3124567890").
 * Salida: E.164 ("+573124567890"), formato definido por el contrato de PATCH /profile.
 * Es solo una primera comprobación: la validación definitiva es del backend.
 */
export function validateColombianPhone(input: string): PhoneValidation {
  const compact = input.replace(/[\s-]/g, "");
  if (compact === "") return { ok: false, error: "Ingresa tu número de celular." };
  if (compact.startsWith("+") || (compact.length === 12 && compact.startsWith("57"))) {
    return { ok: false, error: "Escribe el número sin el prefijo +57." };
  }
  if (!/^\d+$/.test(compact)) return { ok: false, error: "Usa solo dígitos, sin letras ni símbolos." };
  if (compact.length !== 10) return { ok: false, error: "El número debe tener 10 dígitos." };
  if (!compact.startsWith("3")) return { ok: false, error: "Un celular colombiano empieza por 3." };
  return { ok: true, value: `${COUNTRY_CODE}${compact}` };
}

/** "+573124567890" → "3124567890": para rellenar el campo del modal (el +57 no se escribe). */
export function toNationalDigits(e164: string): string {
  return e164.startsWith(COUNTRY_CODE) ? e164.slice(COUNTRY_CODE.length) : e164;
}

/** ¿Tiene forma de número E.164? ("+" + 2 a 15 dígitos, sin ceros iniciales). */
export function isE164(value: string): boolean {
  return /^\+[1-9]\d{1,14}$/.test(value);
}

/**
 * ¿Es un celular colombiano en E.164? "+57" + 10 dígitos que empiezan por 3.
 */
export function isColombianMobileE164(value: string): boolean {
  return /^\+573\d{9}$/.test(value);
}