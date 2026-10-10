import { redirect } from "next/navigation";

// "/" no tiene contenido propio todavía: manda a /login.
export default function HomePage() {
  redirect("/login");
}