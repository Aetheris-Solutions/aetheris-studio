import type { Metadata } from "next";
import { Instrument_Serif, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title:
    "Aetheris Solutions — Agenti AI custom che lavorano per il tuo business",
  description:
    "Progettiamo, addestriamo e integriamo agenti AI su misura per PMI italiane. Framework AETHER, prodotti operativi in 14 giorni, ROI misurabile.",
  metadataBase: new URL("https://aetheris.solutions"),
  openGraph: {
    title: "Aetheris Solutions — Agenti AI custom",
    description:
      "Agenti AI su misura per PMI italiane. Framework AETHER, deploy in 14 giorni, ROI misurabile.",
    type: "website",
    locale: "it_IT",
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
      className={`${instrumentSerif.variable} ${inter.variable} ${jetbrains.variable}`}
    >
      <body className="grain vignette antialiased">{children}</body>
    </html>
  );
}
