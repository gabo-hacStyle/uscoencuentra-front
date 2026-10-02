import { redirect } from "next/navigation";

// "/" no tiene contenido propio todavía: manda a /login (que a su vez manda a /dashboard si hay sesión).
export default function HomePage() {
  redirect("/login");
}