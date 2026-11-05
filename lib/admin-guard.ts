import { auth } from "@/auth";
import type { ApiError } from "@/types/admin";
import type { UserRole } from "@/types/auth";

/**
 * Single authorization check for the admin page and the admin Server Actions.
 *
 * The role comes from `session.user.role`, already normalized to "USER" | "ADMIN" by
 * normalizeRole() (lib/roles.ts) in auth.ts. lib/session.ts#requireRole() is not reused because
 * it redirects; Server Actions must return an error result instead.
 *
 * proxy.ts already blocks /admin for non-admin sessions; the backend must still validate the
 * role on every admin endpoint. This check avoids rendering the panel or running actions anyway.
 */
export const ADMIN_ROLE: UserRole = "ADMIN";

export type AdminGuardResult = { ok: true } | { ok: false; error: ApiError };

export async function requireAdmin(): Promise<AdminGuardResult> {
    const session = await auth();

    if (!session?.user) {
        return {
            ok: false,
            error: { code: "UNAUTHORIZED", message: "Tu sesión expiró. Inicia sesión de nuevo.", status: 401 },
        };
    }

    if (session.user.role !== ADMIN_ROLE) {
        return {
            ok: false,
            error: { code: "FORBIDDEN", message: "No tienes permisos para realizar esta acción.", status: 403 },
        };
    }

    return { ok: true };
}
