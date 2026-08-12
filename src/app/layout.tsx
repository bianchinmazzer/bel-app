import type { Metadata } from "next";
import { Inter, Playfair_Display, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import SiteChrome from "./components/SiteChrome";
import SchemaOrg from "./components/SchemaOrg";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

export const metadata: Metadata = {
  title: "Bel Distribuciones | Distribución mayorista de peluquería y hogar",
  description:
    "Más de 30 años distribuyendo productos de peluquería, estética y hogar en Argentina. Distribuidores oficiales de Alfaparf, Exel, Schwarzkopf, Yellow y Sir Fausto. Venta mayorista y minorista.",
  keywords: [
    "distribución",
    "mayorista",
    "peluquería",
    "estética",
    "hogar",
    "Bahía Blanca",
    "Argentina",
    "Bel Distribuciones",
  ],
  authors: [{ name: "Bel Distribuciones" }],
  creator: "Bel Distribuciones",
  metadataBase: new URL("https://www.beldistribuciones.com.ar"),
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: "/bel-logo.png",
  },
  openGraph: {
    type: "website",
    locale: "es_AR",
    url: "https://www.beldistribuciones.com.ar",
    siteName: "Bel Distribuciones",
    title: "Bel Distribuciones | Más de 30 años distribuyendo en Argentina",
    description:
      "Distribución mayorista de productos de peluquería, estética y hogar. Distribuidores oficiales de Alfaparf, Exel, Schwarzkopf, Yellow y Sir Fausto.",
    images: [
      {
        url: "/bel-logo.png",
        width: 500,
        height: 500,
        alt: "Bel Distribuciones — Distribución mayorista",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Bel Distribuciones | Distribución mayorista",
    description:
      "Más de 30 años distribuyendo productos de peluquería y hogar. Empresa familiar.",
    images: ["/bel-logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  // Código de verificación de Google Search Console (propiedad de prefijo de URL).
  verification: {
    google: "LT5B-B_YLovGtpVb-vJcyVIj87iTGrY81DQZQAxKvBw",
  },
  other: {
    "theme-color": "#B8A078",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${inter.variable} ${playfair.variable} ${jetbrains.variable} font-sans antialiased bg-neutral-50 text-neutral-800`}
      >
        <SchemaOrg />
        <SiteChrome>{children}</SiteChrome>
        <Analytics />
      </body>
    </html>
  );
}
