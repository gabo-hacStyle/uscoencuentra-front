import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import { requireSession } from "@/lib/session";

export default async function MyReportsPage() {
    await requireSession();

    return (
        <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 md:px-6">
                <p className="text-xs font-bold uppercase tracking-widest text-usco-wine">Mi cuenta</p>
                <h1 className="mt-2 text-3xl font-bold text-usco-ink">Mis reportes</h1>
                {/* PLACEHOLDER: active reports and history (recovery tasks) go here */}
                <p className="mt-4 text-usco-muted">Aquí verás los objetos que has reportado.</p>
            </main>
            <Footer />
        </div>
    );
}