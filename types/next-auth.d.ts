import type { DefaultSession } from "next-auth";

// Sin esto, TypeScript no sabe que session.user.role o token.accessToken existen.
declare module "next-auth" {
  interface Session {
    accessToken?: string; // el refreshToken NO se expone al navegador
    user: {
      role?: string;
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