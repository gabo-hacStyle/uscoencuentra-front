import type { DefaultSession } from "next-auth";
import type { UserRole } from "@/types/auth";

// Sin esto, TypeScript no sabe que session.user.role o token.accessToken existen.
declare module "next-auth" {
  interface Session {
    /**
     * @deprecated Usar `getBackendAccessToken()` de "@/lib/backend/session" (solo servidor).
     * Se mantiene temporalmente para módulos que aún no migran (actions/contact.ts); dejará de
     * publicarse porque `/api/auth/session` lo expone al navegador.
     */
    accessToken?: string;
    user: {
      role: UserRole;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    /** Vencimiento del accessToken del backend (epoch en segundos). Ver lib/backend/token.ts. */
    backendTokenExpiresAt?: number;
    role?: string;
  }
}
