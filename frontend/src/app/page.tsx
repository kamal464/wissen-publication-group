'use client';

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { ClientOnly } from '@/components/ClientOnly';
import JournalSlider from '@/components/JournalSlider';
import MainContent from '@/components/MainContent';

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <ClientOnly>
          <JournalSlider />
        </ClientOnly>
        <MainContent />
      </main>
      <Footer />
    </>
  );
}
