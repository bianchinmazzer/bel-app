import type { Metadata } from "next";
import { Inter, Playfair_Display, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import SiteChrome from "./components/SiteChrome";

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
    "27 años distribuyendo productos de peluquería, estética y hogar en Argentina. Más de 600 clientes confían en nosotros. Venta mayorista y minorista.",
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
    title: "Bel Distribuciones | 27 años distribuyendo en Argentina",
    description:
      "Distribución mayorista de productos de peluquería, estética y hogar. Más de 600 clientes nos eligen.",
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
      "27 años distribuyendo productos de peluquería y hogar. Más de 600 clientes.",
    images: ["/bel-logo.png"],
  },
  robots: {
    index: true,
    follow: true,
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
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Bel Distribuciones",
              url: "https://www.beldistribuciones.com.ar",
              logo: "https://www.beldistribuciones.com.ar/bel-logo.png",
              description:
                "Distribución mayorista de productos de peluquería, estética y hogar en Argentina. 27 años de trayectoria y más de 600 clientes.",
              foundingDate: "1998",
              address: {
                "@type": "PostalAddress",
                addressCountry: "AR",
                addressRegion: "Buenos Aires",
                addressLocality: "Bahía Blanca",
              },
              contactPoint: {
                "@type": "ContactPoint",
                contactType: "customer service",
                availableLanguage: "Spanish",
              },
            }),
          }}
        />
      </head>
      <body
        className={`${inter.variable} ${playfair.variable} ${jetbrains.variable} font-sans antialiased bg-neutral-50 text-neutral-800`}
      >
        <SiteChrome>{children}</SiteChrome>
        <Analytics />
      </body>
    </html>
  );
}
