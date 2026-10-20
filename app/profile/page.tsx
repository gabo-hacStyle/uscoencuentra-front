import { ProfilePage } from "@/components/profile/ProfilePage";
import { requireSession } from "@/lib/session";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";

export default async function ProfileRoute() {
    await requireSession();
    return (
        <>
            <Navbar />
            <ProfilePage />
            <Footer />
        </>
    );
}