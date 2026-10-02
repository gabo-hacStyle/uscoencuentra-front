import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { LoginCard } from "@/components/auth/LoginCard";
import { getAuthErrorMessage } from "@/lib/auth-messages";

type LoginPageProps = {
  // En Next 15/16, searchParams es una Promise.
  searchParams: Promise<{ error?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await auth();
  if (session?.user) redirect("/dashboard"); // ya logueado: no mostrar login

  const { error } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <LoginCard errorMessage={getAuthErrorMessage(error)} />
    </main>
  );
}