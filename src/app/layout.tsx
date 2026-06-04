import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Source_Sans_3 } from "next/font/google";
import { Header } from "@/components/Header";
import "./globals.css";

const serif = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cormorant",
  weight: ["400", "500", "600", "700"],
});

const sans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-source",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Hijas del Rey — Guía de Estudio",
  description:
    "Guía de Estudio Nacional para la preparación en La Orden de las Hijas del Rey. Doce estudios con reflexión y preguntas.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Hijas del Rey",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#002d62",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${serif.variable} ${sans.variable}`}>
      <body className="min-h-screen antialiased overflow-x-hidden">
        <Header />
        <main className="min-h-0">{children}</main>
        <footer className="mt-16 border-t border-navy/10 bg-navy py-10 pb-[max(2.5rem,env(safe-area-inset-bottom))] text-center text-sm text-white/70 px-4">
          <p className="font-serif text-gold-light">MAGNANIMITER CRUCEM SUSTINE</p>
          <p className="mt-1 text-xs">La Orden de las Hijas del Rey® — Edición 2020</p>
        </footer>
      </body>
    </html>
  );
}
