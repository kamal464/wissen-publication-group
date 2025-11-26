'use client';

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/HeroSection';
import MainContent from '@/components/MainContent';

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <MainContent />
      </main>
      <Footer />
    </>
  );
}
