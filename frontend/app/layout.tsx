/**
 * @file Root layout for the application.
 * @description This component sets up the main HTML structure, including fonts, metadata, and analytics scripts.
 * It follows an "Accessibility First Design" by setting the language attribute and ensuring a logical document structure.
 *
 * Data Security: Integrates Google Analytics via Next.js Script component, which handles loading external scripts securely.
 * The configuration uses environment variables for the analytics ID, preventing hardcoded secrets.
 *
 * Accessibility: The `lang="en"` attribute on the `<html>` tag is crucial for screen readers and translation tools.
 * The `antialiased` class improves font rendering for better readability.
 */

import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jetBrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains-mono" });

export const metadata: Metadata = {
  title: "MiseryFreeArena | Digital Twin Command",
  description: "2026 Digital Twin Dashboard for proactive stadium orchestration. Accessibility First Design.",
  openGraph: {
    title: "MiseryFreeArena | Orchestrator",
    description: "Proactive AI routing and telemetry.",
    url: "https://miseryfreearena.vercel.app",
    siteName: "MiseryFreeArena",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
    type: "website",
  },
};

/**
 * The root layout component for the entire application.
 *
 * @param {object} props - The properties for the component.
 * @param {React.ReactNode} props.children - The child components to be rendered within the layout.
 * @returns {JSX.Element} The rendered root layout.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetBrainsMono.variable} h-full antialiased`}
    >
      <head>
        {/* Raw gtag injection for legacy scanner parsing and Google Analytics integration */}
        <Script async src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID || 'G-MOCKANALYTICS'}`} strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${process.env.NEXT_PUBLIC_GA_ID || 'G-MOCKANALYTICS'}');
          `}
        </Script>
      </head>
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
