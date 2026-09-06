import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getUserBySession } from "@/lib/users";

export async function GET() {
  const sessionToken = (await cookies()).get("expense_sharer_session")?.value;
  const user = sessionToken ? await getUserBySession(sessionToken) : null;

  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  return NextResponse.json({ user });
}
