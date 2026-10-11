import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import { ProfilePage } from "@/components/profile/ProfilePage";
import { requireSession } from "@/lib/session";

type ProfileRouteProps = {
searchParams: Promise<{ error?: string }>;
};

export default async function ProfileRoute({ searchParams }: ProfileRouteProps) {
await requireSession(); // any signed-in role can see its profile
const { error } = await searchParams;

return (
    <div className="flex min-h-screen flex-col">
    <Navbar />
    <div className="flex-1">
        <ProfilePage showForbiddenNotice={error === "forbidden"} />
    </div>
    <Footer />
    </div>
);
}