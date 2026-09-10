import type { Metadata, Viewport } from "next";
import { Dancing_Script, Inter, JetBrains_Mono, Playfair_Display } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { cn } from "@/lib/utils";
import { SITE } from "@/lib/site";
import { Providers } from "@/components/providers/providers";
import Navbar from "@/components/shared/navbar";
import Footer from "@/components/shared/footer";
import ScrollProgress from "@/components/shared/scroll-progress";
import VinylPlayer from "@/components/shared/vinyl-player";
import BackToTop from "@/components/shared/back-to-top";
import "@/app/globals.css";

const display = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "600", "700"],
});

const body = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600"],
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500"],
});

const script = Dancing_Script({
  subsets: ["latin"],
  variable: "--font-script",
  weight: ["500", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} | ${SITE.author} — ${SITE.tagline}`,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
  keywords: [
    SITE.author,
    SITE.name,
    "photographer",
    "Tempe",
    "Arizona",
    "portrait photography",
    "street photography",
    "client galleries",
    "graduation photography",
  ],
  openGraph: {
    type: "website",
    siteName: SITE.name,
    title: `${SITE.name} | ${SITE.author} — ${SITE.tagline}`,
    description: SITE.description,
    images: ["/og.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.name} | ${SITE.author}`,
    description: SITE.description,
    images: ["/og.jpg"],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0F1210" },
    { media: "(prefers-color-scheme: light)", color: "#F6F1E7" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={cn(display.variable, body.variable, mono.variable, script.variable)}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem("lumencode-theme")||"dark";document.documentElement.classList.toggle("dark",t==="dark")}catch(e){}`,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: SITE.name,
              url: SITE.url,
              description: SITE.description,
              author: {
                "@type": "Person",
                name: SITE.author,
                url: SITE.url,
              },
            }),
          }}
        />
      </head>
      <body>
        <Providers>
          <div className="noise-overlay" />
          <ScrollProgress />
          <Navbar />
          <main>{children}</main>
          <Footer />
          <VinylPlayer />
          <BackToTop />
          <Analytics />
          <SpeedInsights />
        </Providers>
      </body>
    </html>
  );
}