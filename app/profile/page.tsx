import { ProfilePage } from "@/components/profile/ProfilePage";
import { requireSession } from "@/lib/session";

export default async function ProfileRoute() {
    await requireSession();
    return <ProfilePage />;
}