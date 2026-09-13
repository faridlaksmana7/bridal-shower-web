import type { Metadata } from "next";
import { Fraunces, Plus_Jakarta_Sans, Pinyon_Script, Alex_Brush } from "next/font/google";
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

const pinyon = Pinyon_Script({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-pinyon",
  display: "swap",
});

const alexBrush = Alex_Brush({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-alex",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Surprise Bridal Shower for Shaula Putri — Pinky Promise",
  description: "Please join us for a surprise bridal shower for Shaula Putri (Yudistira & Shaula) · Tuesday, 15 September 2026 at Krema de Bruge.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://pinky-promise-150926.jamess11.chatgpt.site"),
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "Surprise Bridal Shower for Shaula Putri",
    description: "Please join us for a surprise bridal shower for Shaula Putri · Tuesday, 15 September 2026 at Krema de Bruge",
    type: "website",
    locale: "en_US",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Surprise Bridal Shower for Shaula Putri, 15 September 2026" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Surprise Bridal Shower for Shaula Putri",
    description: "Please join us for a surprise bridal shower for Shaula Putri · Tuesday, 15 September 2026 at Krema de Bruge",
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
    <html lang="en">
      <body suppressHydrationWarning className={`${fraunces.variable} ${jakarta.variable} ${pinyon.variable} ${alexBrush.variable} antialiased`}>
        <div className="mobile-shell">
          {children}
        </div>
      </body>
    </html>
  );
}
