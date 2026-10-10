// Ejecuta el callback "authorized" de auth.ts antes de servir las rutas privadas.
export { auth as proxy } from "@/auth";

export const config = {
  matcher: ["/home/:path*", "/profile/:path*", "/my-reports/:path*", "/admin/:path*"],
};