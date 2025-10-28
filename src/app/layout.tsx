import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { inter } from "@/app/ui/fonts";
import "@/app/ui/global.css";
import Header from "@/components/shared/Header";
import Navigation from "@/components/shared/Navigation";
import { translations } from "@/lib/translations";
import { getSession, isAuthenticated } from "@/lib/auth";
import { SessionProvider } from "@/components/providers/SessionProvider";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: translations.app.title,
  description: translations.app.subtitle,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  const isAdmin = await isAuthenticated();

  return (
    <html lang="es">
      <body
        className={`${inter.className} antialiased`}
        suppressHydrationWarning
      >
        <SessionProvider session={session}>
          <Header />
          <Navigation isAuthenticated={isAdmin} />
          <main className="min-h-screen bg-gray-50">
            {children}
            <Analytics />
            <SpeedInsights />
          </main>
        </SessionProvider>
      </body>
    </html>
  );
}
