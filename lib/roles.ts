import type { UserRole } from "@/types/auth";

export const HOME_PATH = "/home";
export const PROFILE_PATH = "/profile";
export const ADMIN_PATH = "/admin";

/** Rutas que requieren sesion, con cualquier rol.*/
const AUTHENTICATED_ROUTES = [PROFILE_PATH];
/** Rutas unicas de ADMIN.*/
const ADMIN_ROUTES = [ADMIN_PATH];

export type RouteAccess = "public" | "authenticated" | "admin";

export function isUnder(pathname: string, base: string): boolean {
  return pathname === base || pathname.startsWith(`${base}/`);
}

export function getRouteAccess(pathname: string): RouteAccess {
  if (ADMIN_ROUTES.some((base) => isUnder(pathname, base))) return "admin";
  if (AUTHENTICATED_ROUTES.some((base) => isUnder(pathname, base))) return "authenticated";
  return "public";
}

/** Destino cuando un usuario autenticado intenta entrar a la zona del otro rol. */
export function forbiddenPath(): string {
  return `${HOME_PATH}?error=forbidden`;
}

/** Etiquetas para mostrar los roles en la interfaz de profile. */
export const ROLE_LABEL: Record<UserRole, string> = {
  USER: "Usuario",
  ADMIN: "Administrador",
};

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