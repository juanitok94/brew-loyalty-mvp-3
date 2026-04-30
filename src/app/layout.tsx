import type { Metadata, Viewport } from "next";
import { Inknut_Antiqua, Instrument_Sans } from "next/font/google";
import { shopConfig } from "@/config/shop";
import "./globals.css";

const inknutAntiqua = Inknut_Antiqua({
  subsets: ["latin"],
  weight: "500",
  variable: "--font-display",
});

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: `${shopConfig.name} — Loyalty Card`,
  description: `Your digital loyalty card for ${shopConfig.name}, ${shopConfig.location}`,
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: shopConfig.name,
  },
  openGraph: {
    title: `${shopConfig.name} — Loyalty Card`,
    description: `Your digital loyalty card for ${shopConfig.name}, ${shopConfig.location}`,
    images: ["/dynamite-logo.png"],
  },
};

export const viewport: Viewport = {
  themeColor: shopConfig.colors.headerBg,
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inknutAntiqua.variable} ${instrumentSans.variable}`}
      style={{
        "--background": shopConfig.colors.background,
        "--foreground": shopConfig.colors.foreground,
        "--brown": shopConfig.colors.brandPrimary,
        "--brown-light": shopConfig.colors.brandLight,
        "--brown-dark": shopConfig.colors.brandDark,
        "--cream": shopConfig.colors.cream,
        "--stamp-empty": shopConfig.colors.stampEmpty,
        "--stamp-filled": shopConfig.colors.stampFilled,
      } as React.CSSProperties}
    >
      <head>
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className="min-h-screen" style={{ background: "var(--background)" }}>
        {children}
      </body>
    </html>
  );
}
