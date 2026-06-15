import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { ThemeProvider } from "@/components/ThemeProvider";
import PageTransition from "@/components/PageTransition";
import OnboardingGuard from "@/components/OnboardingGuard";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500"],
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Prakriti - Western Ghats Carbon Budgeting Platform",
  description: "Track your carbon footprint, explore the Western Ghats virtual forest ecosystem, and budget your carbon like a pro.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" style={{ background: '#080808' }} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://api.fontshare.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://videos.pexels.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://api.fontshare.com" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://videos.pexels.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;700;800&family=Fraunces:ital,opsz,wght@1,9..144,300;1,9..144,400&family=Space+Grotesk:wght@300;400;500&family=Space+Mono:wght@400;700&display=swap"
          rel="stylesheet"
        />
        <link href="https://api.fontshare.com/v2/css?f[]=clash-display@600,700&display=swap" rel="stylesheet" />
      </head>
      <body
        className={`${inter.variable} ${plusJakarta.variable} antialiased bg-background text-foreground min-h-screen flex flex-col`}
      >
        <ThemeProvider defaultTheme="dark">
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-background px-4 py-2 rounded-xl z-50 font-bold outline-none ring-2 ring-primary"
          >
            Skip to content
          </a>
          <Navbar />
          <main id="main-content" className="flex-1 w-full flex flex-col" tabIndex={-1}>
            <OnboardingGuard>
              <PageTransition>
                {children}
              </PageTransition>
            </OnboardingGuard>
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
