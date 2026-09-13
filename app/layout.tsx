import type { Metadata } from "next";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Pinky Promise — Bridal Shower",
  description: "A little pink, a lot of love, one forever promise.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:5173"),
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "Pinky Promise — Bridal Shower",
    description: "A little pink, a lot of love · 15 September 2026",
    type: "website",
    locale: "id_ID",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Pinky Promise — A Bridal Shower, 15 September 2026" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pinky Promise — Bridal Shower",
    description: "A little pink, a lot of love · 15 September 2026",
    images: ["/og.png"],
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`${fraunces.variable} ${jakarta.variable} antialiased`}>{children}</body>
    </html>
  );
}
