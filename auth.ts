import NextAuth from "next-auth";
import type { Account } from "next-auth";
import Google from "next-auth/providers/google";
// Utilidades de roles
import {
  PROTECTED_ROUTES,
  ROLE_HOME,
  forbiddenPath,
  isUnder,
  normalizeRole,
} from "@/lib/roles";
import {
  BackendAuthError,
  exchangeGoogleIdToken,
} from "@/services/auth.service";
import type { BackendAuthResponse } from "@/types/auth";

// Pasamos la respuesta del backend del callback signIn al callback jwt
// dentro del objeto "account" (es el mismo objeto en ambos callbacks).
type AccountWithBackend = Account & { backendAuth?: BackendAuthResponse };

export const { handlers, auth } = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" }, // sesión guardada en cookie cifrada (sin base de datos en el frontend)
  pages: { signIn: "/login", error: "/login" }, // nuestros errores se muestran en /login
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "select_account", // siempre deja elegir cuenta
          // hd: "usco.edu.co", // OPCIONAL: solo una pista visual para Google; NO valida nada.
        },
      },
    }),
  ],
  callbacks: {
    // Se ejecuta cuando Google ya autenticó. Aquí el BACKEND decide si la cuenta entra.
    async signIn({ account }) {
      if (account?.provider !== "google" || !account.id_token) {
        return "/login?error=MissingIdToken";
      }
      try {
        const backendAuth = await exchangeGoogleIdToken(account.id_token);
        (account as AccountWithBackend).backendAuth = backendAuth;
        return true;
      } catch (error) {
        if (error instanceof BackendAuthError) {
          console.error(`[auth] ${error.code}: ${error.message}`);
          return `/login?error=${error.code}`;
        }
        console.error("[auth] Error inesperado en signIn:", error);
        return "/login?error=BackendUnavailable";
      }
    },

    // Guarda los datos del backend en la cookie (solo en el primer login).
    async jwt({ token, account }) {
      const backendAuth = (account as AccountWithBackend | null)?.backendAuth;
      if (backendAuth) {
        token.accessToken = backendAuth.accessToken;
        token.refreshToken = backendAuth.refreshToken; // queda solo en la cookie cifrada
        token.role = backendAuth.user.role;
        token.name = backendAuth.user.name;
        token.email = backendAuth.user.email;
      }
      return token;
    },

    // Define qué ve el resto de la app cuando llama a auth() / useSession().
    async session({ session, token }) {
       session.accessToken =
        typeof token.accessToken === "string" ? token.accessToken : undefined;
      session.user.role = normalizeRole(token.role);
      return session;
    },

    // Lo usa proxy.ts: controla qué rol puede entar a cada ruta
    authorized({ auth: session, request: { nextUrl } }) {
      const path = nextUrl.pathname;
      if (!PROTECTED_ROUTES.some((base) => isUnder(path, base))) return true;
      if (!session?.user) return false; // sin sesión → /login

      // Cada rol solo entra a SU zona; si pide la del otro, lo mandamos a su inicio.
      const { role } = session.user;
      const otherRole = role === "ADMIN" ? "USER" : "ADMIN";
      if (isUnder(path, ROLE_HOME[otherRole])) {
        return Response.redirect(new URL(forbiddenPath(role), nextUrl));
      }
      return true;
    },
  },
});