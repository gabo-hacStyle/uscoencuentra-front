/** Landing page after login (the catalog). Open to any signed-in user. */
export const HOME_PATH = "/home";

/** Profile page. Open to any signed-in user. */
export const PROFILE_PATH = "/profile";

/** The user's own reports and their history. Open to any signed-in user. */
export const MY_REPORTS_PATH = "/my-reports";

/** Admin dashboard. Only ADMIN can enter. */
export const ADMIN_PATH = "/admin";

/** Routes that require a session. Must match the matcher in proxy.ts. */
export const PROTECTED_ROUTES = [HOME_PATH, PROFILE_PATH, MY_REPORTS_PATH, ADMIN_PATH] as const;

/** Routes that also require the ADMIN role. */
export const ADMIN_ONLY_ROUTES = [ADMIN_PATH] as const;

export function isUnder(pathname: string, base: string): boolean {
  return pathname === base || pathname.startsWith(`${base}/`);
}

/** Where a signed-in user without permission is sent (the profile shows a notice). */
export function forbiddenPath(): string {
  return `${PROFILE_PATH}?error=forbidden`;
}

/**
 * Roles reconocidos por la app. El valor "ADMIN" concede permisos de administrador.
 */
export type UserRole = "USER" | "ADMIN";

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