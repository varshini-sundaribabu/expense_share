import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { deleteSession } from "@/lib/users";

export async function POST() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("expense_sharer_session")?.value;
  if (sessionToken) await deleteSession(sessionToken);
  const response = NextResponse.json({ success: true });
  response.cookies.delete("expense_sharer_session");
  return response;
}
