import type { Metadata } from "next";
import { Archivo } from "next/font/google";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { getSite } from "@/lib/api";
import "./globals.css";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  axes: ["wdth"],
});

export async function generateMetadata(): Promise<Metadata> {
  const { settings } = await getSite();
  return {
    title: {
      default: settings.meta_title,
      template: "%s | AssetYield",
    },
    description: settings.meta_description,
  };
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const site = await getSite();

  return (
    // Browser extensions (e.g. QuillBot) add attributes to <html> before hydration.
    <html lang="en" className={archivo.variable} suppressHydrationWarning>
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <SiteHeader pages={site.pages} />
        <main id="main" tabIndex={-1}>
          {children}
        </main>
        <SiteFooter site={site} />
      </body>
    </html>
  );
}
