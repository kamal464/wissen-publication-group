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
    <section className="journal-slider journal-slider--loading">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-96">
          <i className="pi pi-spin pi-spinner text-5xl text-blue-600"></i>
        </div>
      </div>
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
