import { ProfilePage } from "@/components/profile/ProfilePage";
import { requireRole } from "@/lib/session";

type AdminPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function AdminPage({ searchParams }: AdminPageProps) {
  await requireRole("ADMIN"); // un USER que entre aquí rebota a /user
  const { error } = await searchParams;
  return <ProfilePage showForbiddenNotice={error === "forbidden"} />;
}