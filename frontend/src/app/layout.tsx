import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "../styles/globals.scss";
import "primereact/resources/themes/lara-light-blue/theme.css";
import "primereact/resources/primereact.css";
import "primeicons/primeicons.css";
import { ReduxProvider } from "@/store/Provider";
import { InjectApiUrl } from "@/components/InjectApiUrl";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ErrorFallback } from "@/components/ErrorFallback";

// Configure Inter font with all weights for flexibility
const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-inter",
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
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Meta tag for API URL - provides fallback for client-side injection */}
        {apiUrl && (
          <meta name="api-base-url" content={apiUrl} />
        )}
        {/* Prevent FOUC (Flash of Unstyled Content) */}
        <style dangerouslySetInnerHTML={{
          __html: `
            html { visibility: hidden; }
            html.hydrated { visibility: visible; }
          `
        }} />
      </head>
      <body className={`${inter.variable} antialiased min-h-screen`} suppressHydrationWarning>
        {/* Inject API URL - client-side only, no rendering */}
        <InjectApiUrl />
        <ErrorBoundary fallback={<ErrorFallback />}>
          <ReduxProvider>
            {children}
          </ReduxProvider>
        </ErrorBoundary>
        {/* Mark as hydrated after client-side JS loads */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof document !== 'undefined') {
                document.documentElement.classList.add('hydrated');
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
