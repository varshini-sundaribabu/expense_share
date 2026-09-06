import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getUserBySession } from "@/lib/users";

export default async function ProfilePage() {
  const sessionToken = (await cookies()).get("expense_sharer_session")?.value;
  const user = sessionToken ? await getUserBySession(sessionToken) : null;

  if (!user) {
    redirect("/sign-in");
  }

  return (
    <main>
      <p className="eyebrow">Expense Sharer</p>
      <h1>Your profile</h1>
      <dl>
        <dt>Display name</dt>
        <dd>{user.displayName}</dd>
        <dt>Email</dt>
        <dd>{user.email}</dd>
        <dt>Status</dt>
        <dd>{user.status}</dd>
      </dl>
      <Link href="/">Back to home</Link>
    </main>
  );
}
