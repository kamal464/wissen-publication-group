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
  
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased min-h-screen`}>
        {/* Inject API URL using Next.js Script with beforeInteractive - must be in body, not head */}
        {apiUrl && (
          <Script
            id="api-url-injector"
            strategy="beforeInteractive"
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
