import { redirect } from "next/navigation";
import type { Session } from "next-auth";
import { auth } from "@/auth";
import { forbiddenPath } from "@/lib/roles";
import type { UserRole } from "@/types/auth";

/**
 * Guardia de cada página privada: exige sesión y el rol correcto.
 * Sin sesión → /login. Rol equivocado → su propio perfil con aviso.
 */
export async function requireRole(expected: UserRole): Promise<Session> {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== expected) redirect(forbiddenPath(session.user.role));
  return session;
}