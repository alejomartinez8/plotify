import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import NavigationClient from "@/components/shared/NavigationClient";
import Header from "@/components/shared/Header";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Plotify",
  description:
    "A comprehensive management system for residential plot communities",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Header />
        <div className="min-h-screen bg-gray-50">{children}</div>
      </body>
    </html>
  );
}
