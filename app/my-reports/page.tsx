import { redirect } from "next/navigation";
import { auth } from "@/auth";
import MyReportsView from "@/components/items/MyReportsView";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import { getMyItems } from "@/services/items.service";

export default async function MyReportsPage() {
    const session = await auth();
    if (!session?.user) redirect("/login");

const { active, history } = await getMyItems(); // TODO(backend): GET /items/mine

return (
    <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 md:px-6">
            <MyReportsView active={active} history={history} />
        </main>
        <Footer />
    </div>
);
}