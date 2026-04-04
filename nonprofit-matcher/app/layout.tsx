import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GrantMatch — AI-Powered Grant Matching for Nonprofits",
  description: "Find the best federal grant opportunities for your nonprofit using AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full antialiased">{children}</body>
    </html>
  );
}
