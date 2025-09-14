import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

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
  title: "FPL League Hub - Fantasy Premier League Mini-League Analytics",
  description: "Your ultimate Fantasy Premier League mini-league companion. Get personalized insights, track rank progression, and analyze squad performance. Reduce analysis time from 30+ minutes to under 5 minutes.",
  keywords: ["FPL", "Fantasy Premier League", "mini-league", "analytics", "tracker", "rank progression", "squad analysis"],
  authors: [{ name: "FPL League Hub" }],
  creator: "FPL League Hub",
  publisher: "FPL League Hub",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://fpl-league-hub.vercel.app",
    siteName: "FPL League Hub",
    title: "FPL League Hub - Fantasy Premier League Mini-League Analytics",
    description: "Track your FPL mini-league performance with detailed analytics and insights. Visual rank progression charts and squad analysis.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "FPL League Hub - Mini-League Analytics",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FPL League Hub - Fantasy Premier League Mini-League Analytics",
    description: "Track your FPL mini-league performance with detailed analytics and insights.",
    images: ["/og-image.png"],
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
  verification: {
    google: "your-google-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
