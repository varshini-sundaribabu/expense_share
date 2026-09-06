"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

export default function RegisterPage() {
  const [error, setError] = useState("");
  const [created, setCreated] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setCreated(false);
    setPending(true);
    const form = new FormData(event.currentTarget);
    const displayName = String(form.get("displayName") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    const phoneNumber = String(form.get("phoneNumber") ?? "");
    const address = String(form.get("address") ?? "");

    if (!displayName) {
      setError("Display name is required.");
      setPending(false);
      return;
    }
    if (displayName.length > 100) {
      setError("Display name must be 100 characters or fewer.");
      setPending(false);
      return;
    }
    if (!email) {
      setError("Email is required.");
      setPending(false);
      return;
    }
    if (!password) {
      setError("Password is required.");
      setPending(false);
      return;
    }

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName,
          email,
          password,
          phoneNumber,
          address,
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        setError(result.error ?? "Unable to create the account.");
        return;
      }
      setCreated(true);
      event.currentTarget.reset();
    } catch {
      setError("Unable to create the account right now.");
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="form-page">
      <p className="eyebrow">Expense Sharer</p>
      <h1>Create your account</h1>
      <p>Start keeping shared expenses organized.</p>
      <form onSubmit={handleSubmit} noValidate>
        <label htmlFor="displayName">Display name</label>
        <input id="displayName" name="displayName" autoComplete="name" aria-required="true" aria-invalid={Boolean(error)} />
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" autoComplete="email" aria-required="true" aria-invalid={Boolean(error)} />
        <label htmlFor="password">Password</label>
        <input id="password" name="password" type="password" autoComplete="new-password" aria-required="true" aria-invalid={Boolean(error)} />
        <label htmlFor="phoneNumber">Phone number</label>
        <input id="phoneNumber" name="phoneNumber" type="tel" autoComplete="tel" />
        <label htmlFor="address">Address</label>
        <input id="address" name="address" autoComplete="street-address" />
        <p className="hint">At least 8 characters, one lowercase letter, one number, and one of $, @, or _.</p>
        <button type="submit" disabled={pending}>{pending ? "Creating account..." : "Create account"}</button>
        {error ? <p role="alert">{error}</p> : null}
        {created ? (
          <p role="status">Account created. <Link href="/profile">View profile</Link></p>
        ) : null}
      </form>
      <p>Already registered? <Link href="/sign-in">Sign in</Link></p>
    </main>
  );
}
