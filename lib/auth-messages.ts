const AUTH_ERROR_MESSAGES: Record<string, string> = {
  BackendRejected:
    "El sistema no autorizó esta cuenta. Ingresa con tu cuenta institucional.",
  BackendUnavailable:
    "No pudimos comunicarnos con el servidor de USCO Encuentra. Inténtalo de nuevo en unos minutos.",
  BackendMisconfigured:
    "No se pudo completar el inicio de sesión por un problema de configuración. Avisa al equipo de desarrollo.",
  InvalidBackendResponse:
    "El servidor respondió de forma inesperada. Avisa al equipo de desarrollo.",
  SessionExpired: "Tu sesión expiró. Inicia sesión de nuevo para continuar.",
  MissingIdToken:
    "Google no entregó la información de identidad esperada. Inténtalo de nuevo.",
  AccessDenied: "Acceso denegado. Inténtalo con otra cuenta.",
  Configuration:
    "Hay un problema de configuración de autenticación. Avisa al equipo de desarrollo.",
};

const DEFAULT_MESSAGE = "No se pudo iniciar sesión. Inténtalo de nuevo.";

export function getAuthErrorMessage(code?: string): string | null {
  if (!code) return null;
  return AUTH_ERROR_MESSAGES[code] ?? DEFAULT_MESSAGE;
}