import type { Metadata } from "next";
import { Cinzel, Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cinzel",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Aetheris Solutions — Agenti AI su misura per il tuo business",
  description:
    "Progettiamo agenti AI personalizzati che automatizzano processi, ottimizzano operations e portano risultati misurabili al tuo business.",
  metadataBase: new URL("https://aetheris.solutions"),
  openGraph: {
    title: "Aetheris Solutions — Agenti AI su misura",
    description:
      "Agenti AI personalizzati che ottimizzano il tuo business e portano risultati.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="it"
      className={`${cinzel.variable} ${cormorant.variable} ${inter.variable}`}
    >
      <body className="grain vignette">{children}</body>
    </html>
  );
}
