import { NextResponse } from "next/server";
import { createUser, passwordRule, validatePassword } from "@/lib/users";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const displayName = typeof body?.displayName === "string" ? body.displayName.trim() : "";
  const email = typeof body?.email === "string" ? body.email : "";
  const password = typeof body?.password === "string" ? body.password : "";
  const phoneNumber = typeof body?.phoneNumber === "string" ? body.phoneNumber : undefined;
  const address = typeof body?.address === "string" ? body.address : undefined;

  if (!displayName) {
    return NextResponse.json({ error: "Display name is required." }, { status: 400 });
  }
  if (!email.trim()) {
    return NextResponse.json({ error: "Email is required." }, { status: 400 });
  }
  if (!password) {
    return NextResponse.json({ error: "Password is required." }, { status: 400 });
  }
  if (!validatePassword(password)) {
    return NextResponse.json({ error: passwordRule }, { status: 400 });
  }

  try {
    const { user, sessionToken } = await createUser({ displayName, email, password, phoneNumber, address });
    const response = NextResponse.json({ user }, { status: 201 });
    response.cookies.set("expense_sharer_session", sessionToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return response;
  } catch (error: unknown) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "23505") {
      return NextResponse.json({ error: "An account with that email already exists." }, { status: 409 });
    }
    console.error(error);
    return NextResponse.json({ error: "Unable to create the account right now." }, { status: 500 });
  }
}
