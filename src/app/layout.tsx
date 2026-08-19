import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { BottomNav } from "@/components/layout/bottom-nav";

const site = process.env.NEXT_PUBLIC_SITE_URL || "https://dayly-nu.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(site),
  title: {
    default: "OMIGY — Know what matters. Understand why. Decide together.",
    template: "%s · OMIGY",
  },
  description:
    "OMIGY is an autonomous internet intelligence platform. Discover what is happening, understand why it matters, debate, and decide together.",
  applicationName: "OMIGY",
  keywords: ["OMIGY", "trends", "news intelligence", "public opinion", "India", "AI trends"],
  authors: [{ name: "OMIGY" }],
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: site,
    siteName: "OMIGY",
    title: "OMIGY — Know what matters",
    description: "The internet, understood for you.",
  },
  twitter: {
    card: "summary_large_image",
    title: "OMIGY — Know what matters",
    description: "The internet, understood for you.",
  },
  robots: { index: true, follow: true },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "OMIGY",
  },
  alternates: { canonical: site },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#07090f" },
    { media: "(prefers-color-scheme: light)", color: "#f6f8fc" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "OMIGY",
              url: site,
              description: "Autonomous internet intelligence platform",
              potentialAction: {
                "@type": "SearchAction",
                target: `${site}/search?q={search_term_string}`,
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
      </head>
      <body className="omigy-gradient min-h-dvh">
        <Header />
        <main className="mx-auto max-w-6xl px-4 pb-24 pt-4 md:pb-10">{children}</main>
        <BottomNav />
      </body>
    </html>
  );
}
