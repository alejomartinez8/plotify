import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/shared/Header";
import { translations } from "@/lib/translations";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: translations.app.title,
  description: translations.app.description,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <Header />
        <div className="min-h-screen bg-gray-50">{children}</div>
      </body>
    </html>
  );
}
