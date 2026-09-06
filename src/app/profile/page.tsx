"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Profile = {
  displayName: string;
  email: string;
  phoneNumber: string | null;
  address: string | null;
  status: string;
};

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [pendingAction, setPendingAction] = useState<"deactivate" | "delete" | null>(null);

  useEffect(() => {
    fetch("/api/profile").then(async (response) => {
      if (!response.ok) {
        router.push("/sign-in");
        return;
      }
      const result = await response.json();
      setProfile(result.user);
    });
  }, [router]);

  if (!profile) return <main><p>Loading profile...</p></main>;

  async function saveProfile(formData: FormData) {
    setError("");
    setSaved(false);
    const response = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        displayName: formData.get("displayName"),
        email: formData.get("email"),
        phoneNumber: formData.get("phoneNumber"),
        address: formData.get("address"),
      }),
    });
    const result = await response.json();
    if (!response.ok) {
      setError(result.error ?? "Unable to update the profile right now.");
      return;
    }
    setProfile(result.user);
    setSaved(true);
  }

  async function signOut() {
    await fetch("/api/sign-out", { method: "POST" });
    router.push("/sign-in");
  }

  async function changeAccount(action: "deactivate" | "delete") {
    setError("");
    const response = await fetch("/api/profile", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    const result = await response.json();
    if (!response.ok) {
      setError(result.error ?? "Unable to change the account right now.");
      return;
    }
    if (action === "delete") {
      router.push("/sign-in");
      return;
    }
    setProfile(result.user);
    setPendingAction(null);
  }

  return (
    <main>
      <p className="eyebrow">Expense Sharer</p>
      <h1>Your profile</h1>
      <form action={saveProfile} noValidate>
        <label htmlFor="displayName">Display name</label>
        <input id="displayName" name="displayName" defaultValue={profile.displayName} />
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" defaultValue={profile.email} />
        <label htmlFor="phoneNumber">Phone number</label>
        <input id="phoneNumber" name="phoneNumber" type="tel" defaultValue={profile.phoneNumber ?? ""} />
        <label htmlFor="address">Address</label>
        <input id="address" name="address" defaultValue={profile.address ?? ""} />
        <button type="submit">Save profile</button>
        {error ? <p role="alert">{error}</p> : null}
        {saved ? <p role="status">Profile updated.</p> : null}
      </form>
      <p>Email: {profile.email}</p>
      <p>Status: {profile.status}</p>
      <button type="button" onClick={() => setPendingAction("deactivate")}>Deactivate account</button>
      <button type="button" onClick={() => setPendingAction("delete")}>Delete account</button>
      {pendingAction ? (
        <div role="dialog" aria-label="Confirm account action">
          <p>Are you sure you want to {pendingAction} your account?</p>
          <button type="button" onClick={() => changeAccount(pendingAction)}>Confirm</button>
          <button type="button" onClick={() => setPendingAction(null)}>Cancel</button>
        </div>
      ) : null}
      <button type="button" onClick={signOut}>Sign out</button>
      <Link href="/">Back to home</Link>
    </main>
  );
}
