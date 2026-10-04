export type PhoneValidation =
  | { ok: true; value: string } // 10 dígitos, sin espacios ni prefijo
  | { ok: false; error: string };

/**
 * Primera comprobación en el frontend: celular colombiano nacional (10 dígitos, empieza por 3,
 * sin +57). La validación definitiva es del backend.
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
  return { ok: true, value: compact };
}

/** "3124567890" → "312 456 7890" (solo para mostrar). */
export function formatPhone(numero: string): string {
  return numero.replace(/^(\d{3})(\d{3})(\d{4})$/, "$1 $2 $3");
}