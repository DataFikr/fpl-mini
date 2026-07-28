import type { Metadata } from "next";
import localFont from "next/font/local";
import { Plus_Jakarta_Sans, Inter, Bebas_Neue, Manrope, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import GoogleAnalyticsWrapper from "@/components/analytics/GoogleAnalyticsWrapper";
import CookieConsent from "@/components/analytics/CookieConsent";
import { WebsiteStructuredData, OrganizationStructuredData, WebApplicationStructuredData } from "@/components/seo/structured-data";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600"],
  display: "swap",
});

// Sportify design-system fonts (self-hosted via next/font — replaces the
// render-blocking Google Fonts @import that used to live in the CSS files).
const bebasNeue = Bebas_Neue({
  subsets: ["latin"],
  variable: "--font-bebas",
  weight: "400",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  weight: ["600", "700"],
  display: "swap",
});

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "FPL Ranker - Fantasy Premier League Mini-League Analytics",
  description: "Your ultimate Fantasy Premier League mini-league companion. Get personalized insights, track rank progression, and analyze squad performance. Reduce analysis time from 30+ minutes to under 5 minutes.",
  keywords: ["FPL", "Fantasy Premier League", "mini-league", "analytics", "tracker", "rank progression", "squad analysis"],
  authors: [{ name: "FPL Ranker" }],
  creator: "FPL Ranker",
  publisher: "FPL Ranker",
  metadataBase: new URL('https://fplranker.com'),
  icons: {
    icon: [
      { url: '/icon.png', sizes: 'any', type: 'image/png' },
    ],
    apple: '/icon.png',
    shortcut: '/icon.png',
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://fplranker.com",
    siteName: "FPL Ranker",
    title: "FPL Ranker - Fantasy Premier League Mini-League Analytics",
    description: "Track your FPL mini-league performance with detailed analytics and insights. Visual rank progression charts and squad analysis.",
    images: [
      {
        url: "/icon.png",
        width: 1200,
        height: 1200,
        alt: "FPL Ranker - Mini-League Analytics",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FPL Ranker - Fantasy Premier League Mini-League Analytics",
    description: "Track your FPL mini-league performance with detailed analytics and insights.",
    images: ["/icon.png"],
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '';

  return (
    <html
      lang="en"
      className={`${plusJakartaSans.variable} ${inter.variable} ${bebasNeue.variable} ${manrope.variable} ${jetbrainsMono.variable} ${geistSans.variable} ${geistMono.variable}`}
    >
      <head>
        <meta name="impact-site-verification" content="f38e1dd9-edfa-4790-a5fc-dc23d5b1527e" />
      </head>
      <body className="font-jakarta antialiased">
        <WebsiteStructuredData />
        <OrganizationStructuredData />
        <WebApplicationStructuredData />
        {gaId && <GoogleAnalyticsWrapper measurementId={gaId} />}
        {children}
        <CookieConsent />
      </body>
    </html>
  );
}
