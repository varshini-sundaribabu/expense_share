import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { deleteUser, getUserBySession, hasUnsettledObligations, setUnsettledObligations, setUserStatus, updateUser } from "@/lib/users";

export async function GET() {
  const sessionToken = (await cookies()).get("expense_sharer_session")?.value;
  const user = sessionToken ? await getUserBySession(sessionToken) : null;

  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  return NextResponse.json({ user });
}

export async function PATCH(request: Request) {
  const sessionToken = (await cookies()).get("expense_sharer_session")?.value;
  const currentUser = sessionToken ? await getUserBySession(sessionToken) : null;
  if (!currentUser) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  const body = await request.json().catch(() => null);
  const displayName = typeof body?.displayName === "string" ? body.displayName.trim() : "";
  const email = typeof body?.email === "string" ? body.email : "";
  if (!displayName) return NextResponse.json({ error: "Display name is required." }, { status: 400 });
  if (!email.trim() || !email.includes("@")) return NextResponse.json({ error: "A valid email is required." }, { status: 400 });

  try {
    if (typeof body?.unsettledObligations === "boolean") {
      await setUnsettledObligations(currentUser.id, body.unsettledObligations);
    }
    const user = await updateUser(currentUser.id, {
      displayName,
      email,
      phoneNumber: typeof body?.phoneNumber === "string" ? body.phoneNumber : undefined,
      address: typeof body?.address === "string" ? body.address : undefined,
    });
    return NextResponse.json({ user });
  } catch (error: unknown) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "23505") {
      return NextResponse.json({ error: "An account with that email already exists." }, { status: 409 });
    }
    return NextResponse.json({ error: "Unable to update the profile right now." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const sessionToken = (await cookies()).get("expense_sharer_session")?.value;
  const currentUser = sessionToken ? await getUserBySession(sessionToken) : null;
  if (!currentUser) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  if (body?.action === "deactivate") {
    const user = await setUserStatus(currentUser.id, "deactivated");
    return NextResponse.json({ user });
  }

  if (await hasUnsettledObligations(currentUser.id)) {
    return NextResponse.json({ error: "Settle outstanding obligations before deleting your account." }, { status: 409 });
  }

  await deleteUser(currentUser.id);
  const response = NextResponse.json({ success: true });
  response.cookies.delete("expense_sharer_session");
  return response;
}
