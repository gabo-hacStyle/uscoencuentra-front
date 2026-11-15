import NextAuth from "next-auth";
import type { Account } from "next-auth";
import Google from "next-auth/providers/google";
// Utilidades de roles
import {
  forbiddenPath,
  getRouteAccess,
  normalizeRole
} from "@/lib/roles";
import {
  BACKEND_SESSION_MAX_AGE_SECONDS,
  computeBackendTokenExpiresAt,
  readUsableBackendAccessToken,
} from "@/lib/backend/token";
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
  session: {
    strategy: "jwt", // sesión guardada en cookie cifrada (sin base de datos en el frontend)
    maxAge: BACKEND_SESSION_MAX_AGE_SECONDS, // acuerdo de sesión del backend: 30 días
  },
  pages: { signIn: "/login", error: "/login" }, // nuestros errores se muestran en /login
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "select_account", // siempre deja elegir cuenta
          // Solo una pista visual para Google (sugiere cuentas institucionales); NO valida nada.
          // Quien exige el dominio usco.edu.co y el claim hd es el backend.
          hd: "usco.edu.co",
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

    // Guarda los datos del backend en la cookie cifrada y controla su vigencia.
    async jwt({ token, account }) {
      const backendAuth = (account as AccountWithBackend | null)?.backendAuth;
      if (backendAuth) {
        // Primer login. El refreshToken NO se guarda: el contrato no permite usarlo.
        token.accessToken = backendAuth.accessToken;
        token.backendTokenExpiresAt = computeBackendTokenExpiresAt(backendAuth.accessToken);
        token.role = backendAuth.user.role;
        token.name = backendAuth.user.name;
        token.email = backendAuth.user.email;
        return token;
      }
      // Accesos siguientes: si el token del backend venció (no hay refresh), se cierra la sesión.
      // Devolver null hace que Auth.js borre la cookie y que auth() devuelva null.
      return readUsableBackendAccessToken(token) ? token : null;
    },

    // Define qué ve el resto de la app cuando llama a auth() / useSession().
    async session({ session, token }) {
      // @deprecated TEMPORAL: se sigue exponiendo para actions/contact.ts. El código nuevo debe usar
      // getBackendAccessToken() (lib/backend/session.ts), que lo lee del JWT solo en el servidor.
      session.accessToken =
        typeof token.accessToken === "string" ? token.accessToken : undefined;
      session.user.role = normalizeRole(token.role);
      return session;
    },

    authorized({ auth: session, request: { nextUrl } }) {
      const access = getRouteAccess(nextUrl.pathname);
      if (access === "public") return true;
      if (!session?.user) return false; // sin sesión → /login
      if (access === "admin" && session.user.role !== "ADMIN") {
        return Response.redirect(new URL(forbiddenPath(), nextUrl));
      }
      return true;
    },
  },
});
