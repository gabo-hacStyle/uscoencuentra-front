// Ejecuta el callback "authorized" de auth.ts antes de servir /dashboard.
export { auth as proxy } from "@/auth";

export const config = {
  matcher: ["/dashboard/:path*"],
};