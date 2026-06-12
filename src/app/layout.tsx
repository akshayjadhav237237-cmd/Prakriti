import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { ThemeProvider } from "@/components/ThemeProvider";
import PageTransition from "@/components/PageTransition";

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
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Space+Grotesk:wght@400;500;600&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body
        className={`${inter.variable} ${plusJakarta.variable} antialiased bg-background text-foreground min-h-screen flex flex-col grain`}
      >
        <ThemeProvider>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-background px-4 py-2 rounded-xl z-50 font-bold outline-none ring-2 ring-primary"
          >
            Skip to content
          </a>
          <Navbar />
          <main id="main-content" className="flex-1 w-full flex flex-col" tabIndex={-1}>
            <PageTransition>
              {children}
            </PageTransition>
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
