import { redirect } from "next/navigation";
import type { Session } from "next-auth";
import { auth } from "@/auth";
import { forbiddenPath } from "@/lib/roles";
import type { UserRole } from "@/types/auth";

/**
 * Guardia de cada página privada: exige sesión. Sin sesión → /login.
 */
export async function requireSession(): Promise<Session> {
  const session = await auth();
  if (!session?.user) redirect("/login");
  return session;
}

/**
 * Exige sesión y un rol concreto. Rol equivocado → /home?error=forbidden.
 * En esta rama no lo usa ninguna página: es para las páginas del panel de /admin.
 */
export async function requireRole(expected: UserRole): Promise<Session> {
  const session = await requireSession();
  if (!session?.user) redirect("/login");
  if (session.user.role !== expected) redirect(forbiddenPath());
  return session;
}