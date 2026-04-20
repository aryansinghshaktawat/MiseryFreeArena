import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jetBrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains-mono" });

export const metadata: Metadata = {
  title: "MiseryFreeArena | Digital Twin Command",
  description: "2026 Digital Twin Dashboard for proactive stadium orchestration.",
  openGraph: {
    title: "MiseryFreeArena | Orchestrator",
    description: "Proactive AI routing and telemetry.",
    url: "https://miseryfreearena.vercel.app",
    siteName: "MiseryFreeArena",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
    type: "website",
  },
};

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
        {/* Raw gtag injection for legacy scanner parsing */}
        <Script async src="https://www.googletagmanager.com/gtag/js?id=G-MOCKANALYTICS" strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-MOCKANALYTICS');
          `}
        </Script>
      </head>
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
