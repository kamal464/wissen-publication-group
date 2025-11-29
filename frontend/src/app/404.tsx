'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function NotFound() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Handle dynamic routes client-side
    if (pathname?.startsWith('/journals/')) {
      // This will be handled by the journal detail page via client-side routing
      return;
    }
    if (pathname?.startsWith('/articles/')) {
      // This will be handled by the article detail page via client-side routing
      return;
    }
  }, [pathname, router]);

  return (
    <>
      <Header />
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
          <p className="text-gray-600 mb-8">The page you're looking for doesn't exist.</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go Home
          </button>
        </div>
      </main>
      <Footer />
    </>
  );
}

