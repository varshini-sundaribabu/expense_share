import { NextResponse } from "next/server";
import { authenticateUser, getUserStatusByEmail } from "@/lib/users";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email : "";
  const password = typeof body?.password === "string" ? body.password : "";
  const status = await getUserStatusByEmail(email);
  if (status === "deactivated") {
    return NextResponse.json({ error: "This account is deactivated." }, { status: 403 });
  }
  const authenticated = await authenticateUser(email, password);

  if (!authenticated) {
    return NextResponse.json({ error: "Email or password is incorrect." }, { status: 401 });
  }

  const response = NextResponse.json({ user: authenticated.user });
  response.cookies.set("expense_sharer_session", authenticated.sessionToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return response;
}
