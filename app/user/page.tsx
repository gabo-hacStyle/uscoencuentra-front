import { ProfilePage } from "@/components/profile/ProfilePage";
import { requireRole } from "@/lib/session";

type UserPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function UserPage({ searchParams }: UserPageProps) {
  await requireRole("USER"); // un ADMIN que entre aquí rebota a /admin
  const { error } = await searchParams;
  return <ProfilePage showForbiddenNotice={error === "forbidden"} />;
}