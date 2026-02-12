'use client';

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import JournalSlider from '@/components/JournalSlider';
import MainContent from '@/components/MainContent';

export default function Home() {
  return (
    <div suppressHydrationWarning>
      <Header />
      <main suppressHydrationWarning>
        <JournalSlider />
        <MainContent />
      </main>
      <Footer />
    </div>
  );
}
