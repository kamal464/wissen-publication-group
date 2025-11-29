import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import "../styles/globals.scss";
import "primereact/resources/themes/lara-light-blue/theme.css";
import "primereact/resources/primereact.css";
import "primeicons/primeicons.css";
import { ReduxProvider } from "@/store/Provider";
import { InjectApiUrl } from "@/components/InjectApiUrl";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Wissen Publication Group - Scientific Journals & Research",
  description: "Wissen Publication Group - A leading platform for peer-reviewed scientific journals across multiple disciplines. Access cutting-edge research and scholarly articles.",
  keywords: "scientific journals, academic publishing, research papers, peer review, scholarly articles",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  // Server-side: Read env var (available at runtime in Cloud Run, or from .env.local in dev)
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
  
  // Also add as meta tag for client-side fallback reading
  const hasApiUrl = !!apiUrl;
  
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Meta tag for API URL - can be read by client-side code as fallback */}
        {apiUrl && (
          <meta name="api-base-url" content={apiUrl} />
        )}
      </head>
      <body className={`${inter.variable} antialiased min-h-screen`} suppressHydrationWarning>
        {/* Inject API URL using Next.js Script - use afterInteractive to avoid hydration issues */}
        {apiUrl && (
          <Script
            id="api-url-injector"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `window.__API_BASE_URL__ = ${JSON.stringify(apiUrl)};`,
            }}
          />
        )}
        <InjectApiUrl />
        <ReduxProvider>
          {children}
        </ReduxProvider>
      </body>
    </html>
  );
}
