// Ejecuta el callback "authorized" de auth.ts antes de servir /dashboard.
export { auth as default } from "@/auth";

export const config = {
  matcher: ["/dashboard/:path*"],
};