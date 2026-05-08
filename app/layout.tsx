import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";

const SITE_URL = "https://tools.midesofek.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "MideSofek-tools — Free, open-source tools for builders",
    template: "%s | MideSofek-tools",
  },
  description:
    "Free, open-source utility tools. No signup, no tracking, runs in your browser. Built by @midesofek.",
  keywords: [
    "free tools",
    "open source tools",
    "developer tools",
    "qr code generator",
  ],
  authors: [{ name: "Mide Sofek", url: "https://midesofek.com" }],
  creator: "Mide Sofek",
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    type: "website",
    siteName: "MideSofek-tools",
    url: SITE_URL,
    title: "MideSofek-tools — Free, open-source tools for builders",
    description:
      "Free, open-source utility tools. No signup, no tracking, runs in your browser.",
    images: [{ url: `${SITE_URL}/og/default.png`, width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    creator: "@midesofek",
    site: "@midesofek",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Nav />
        {children}
        <Footer />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
