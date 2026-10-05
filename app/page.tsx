import { redirect } from "next/navigation";

// "/" no tiene contenido propio todavía: manda a /login.
// Si hay sesión, /login redirige según el rol a /user o /admin.
export default function HomePage() {
  redirect("/login");
}