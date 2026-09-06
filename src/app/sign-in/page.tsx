"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function SignInPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setPending(true);
    const form = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/sign-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.get("email"), password: form.get("password") }),
      });
      const result = await response.json();
      if (!response.ok) {
        setError(result.error ?? "Unable to sign in.");
        return;
      }
      router.push("/profile");
    } catch {
      setError("Unable to sign in right now.");
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="form-page">
      <p className="eyebrow">Expense Sharer</p>
      <h1>Sign in</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" autoComplete="email" required />
        <label htmlFor="password">Password</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required />
        <button type="submit" disabled={pending}>{pending ? "Signing in..." : "Sign in"}</button>
        {error ? <p role="alert">{error}</p> : null}
      </form>
      <p>Need an account? <Link href="/register">Create one</Link></p>
    </main>
  );
}
