import type { DefaultSession } from "next-auth";
import type { UserRole } from "@/types/auth";

// Sin esto, TypeScript no sabe que session.user.role o token.accessToken existen.
declare module "next-auth" {
  interface Session {
    accessToken?: string; // el refreshToken NO se expone al navegador
    user: {
      role: UserRole;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    role?: string;
  }
}