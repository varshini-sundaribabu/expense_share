import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Expense Sharer",
  description: "Shared-expense tracking for groups.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
