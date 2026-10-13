import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import MyReportsView from "@/components/items/MyReportsView";
import { requireSession } from "@/lib/session";
import { getMyItems } from "@/services/items.service";

export default async function MyReportsPage() {
await requireSession();
const items = await getMyItems(); // TODO(backend): GET /items/mine

return (
    <div className="flex min-h-screen flex-col">
    <Navbar />
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 md:px-6">
        <MyReportsView items={items} />
    </main>
    <Footer />
    </div>
);
}