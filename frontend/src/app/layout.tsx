import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Smart Shelf — Planogram Compliance",
  description: "Computer-vision demo: detect shelf products vs. planogram.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="th">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
