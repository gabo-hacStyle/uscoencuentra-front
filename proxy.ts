// Ejecuta el callback "authorized" de auth.ts antes de servir las rutas privadas.
export { auth as proxy } from "@/auth";

// El matcher debe ser un literal fijo; repite las rutas de PROTECTED_ROUTES (lib/roles.ts).
export const config = {
  matcher: ["/user/:path*", "/admin/:path*"],
};