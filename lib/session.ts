import { redirect } from "next/navigation";
import type { Session } from "next-auth";
import { auth } from "@/auth";
import { forbiddenPath } from "@/lib/roles";
import type { UserRole } from "@/types/auth";

/** Guard for private pages open to any role: requires a session. */
export async function requireSession(): Promise<Session> {
  const session = await auth();
  if (!session?.user) redirect("/login");
  return session;
}

/** Guard for role-restricted pages. Wrong role → profile with a notice. */
export async function requireRole(expected: UserRole): Promise<Session> {
  const session = await requireSession();
  if (session.user.role !== expected) redirect(forbiddenPath());
  return session;
}