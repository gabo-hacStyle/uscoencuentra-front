import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import { requireRole } from "@/lib/session";

export default async function AdminPage() {
  await requireRole("ADMIN"); // anyone else goes to /profile with a notice

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 md:px-6">
        <p className="text-xs font-bold uppercase tracking-widest text-usco-wine">
          Administración
        </p>
        <h1 className="mt-2 text-3xl font-bold text-usco-ink">Dashboard</h1>
        {/* PLACEHOLDER: the admin dashboard will be built in its own task */}
        <p className="mt-4 text-usco-muted">El panel de administración estará disponible pronto.</p>
      </main>
      <Footer />
    </div>
  );
}