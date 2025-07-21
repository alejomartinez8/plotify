import type { Metadata } from "next";
import { inter } from "@/app/ui/fonts";
import "@/app/ui/global.css";
import Header from "@/components/shared/Header";
import Navigation from "@/components/shared/Navigation";
import { translations } from "@/lib/translations";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: translations.app.title,
  description: translations.app.subtitle,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={`${inter.className} antialiased`}>
        <Header />
        <Navigation />
        <div className="min-h-screen bg-gray-50">{children}</div>
      </body>
    </html>
  );
}
