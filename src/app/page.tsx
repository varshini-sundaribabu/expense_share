import Link from "next/link";

export default function HomePage() {
  return (
    <main>
      <h1>Expense Sharer</h1>
      <p>Shared-expense tracking for groups.</p>
      <p><Link href="/register">Create an account</Link></p>
      <p><Link href="/sign-in">Sign in</Link></p>
    </main>
  );
}
