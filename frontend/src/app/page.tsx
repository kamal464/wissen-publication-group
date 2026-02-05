'use client';

import dynamic from 'next/dynamic';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { ClientOnly } from '@/components/ClientOnly';
import JournalSlider from '@/components/JournalSlider';
import MainContent from '@/components/MainContent';

// Disable SSR for components that might cause hydration issues
const DynamicJournalSlider = dynamic(() => Promise.resolve(JournalSlider), {
  ssr: false,
  loading: () => (
    <section className="journal-slider journal-slider--loading" aria-busy="true" aria-label="Loading journals">
      <div className="home-skeleton home-skeleton-hero w-full max-w-[100vw] min-h-[200px] sm:min-h-[280px] md:min-h-[360px]" />
    </section>
  ),
});

export default function Home() {
  return (
    <div suppressHydrationWarning>
      <Header />
      <main suppressHydrationWarning>
        <DynamicJournalSlider />
        <MainContent />
      </main>
      <Footer />
    </div>
  );
}
