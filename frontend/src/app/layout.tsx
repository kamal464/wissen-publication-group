import type { Metadata } from "next";
import { Inter } from "next/font/google";
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
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased min-h-screen`}>
        <InjectApiUrl />
        <ReduxProvider>
          {children}
        </ReduxProvider>
      </body>
    </html>
  );
}
