import type { UserRole } from "@/types/auth";

/** Perfil de cada rol. También es el prefijo de URL exclusivo de ese rol. */
export const ROLE_HOME: Record<UserRole, string> = {
  USER: "/user",
  ADMIN: "/admin",
};

/** Rutas privadas. Debe coincidir con el matcher de proxy.ts. */
export const PROTECTED_ROUTES = ["/dashboard", "/user", "/admin"] as const;

export function isUnder(pathname: string, base: string): boolean {
  return pathname === base || pathname.startsWith(`${base}/`);
}

/** Destino cuando alguien intenta entrar a la zona del otro rol. */
export function forbiddenPath(role: UserRole): string {
  return `${ROLE_HOME[role]}?error=forbidden`;
}

/**
 * Convierte el rol crudo del backend en UserRole.
 * Mínimo privilegio: solo "ADMIN" (o "ROLE_ADMIN") da acceso de administrador.
 * TODO BACKEND: confirmar los valores exactos y qué hacer con uno desconocido.
 */
export function normalizeRole(raw: unknown): UserRole {
  if (typeof raw !== "string") return "USER";
  const clean = raw.trim().toUpperCase().replace(/^ROLE_/, "");
  if (clean === "ADMIN") return "ADMIN";
  if (clean !== "USER") console.warn(`[auth] Rol desconocido "${raw}": se trata como USER`);
  return "USER";
}