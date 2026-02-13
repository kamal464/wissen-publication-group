'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Breadcrumb from '@/components/Breadcrumb';
import { adminAPI } from '@/lib/api';
import { Card } from 'primereact/card';

interface NewsItem {
  id: number;
  title: string;
  content: string;
  link?: string;
  isPinned?: boolean;
  publishedAt?: string;
  createdAt: string;
}

export default function AllNewsPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadNews = async () => {
      try {
        const response = await adminAPI.getLatestNews(100);
        const newsData = (response.data as NewsItem[]) || [];
        setNews(Array.isArray(newsData) ? newsData : []);
      } catch (error: any) {
        const isNetworkError =
          error.code === 'ERR_NETWORK' ||
          error.code === 'ECONNREFUSED' ||
          !error.response ||
          error.message === 'Network Error';
        if (!isNetworkError) console.error('Error loading news:', error);
        setNews([]);
      } finally {
        setLoading(false);
      }
    };
    loadNews();
  }, []);

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return '';
    }
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        <Breadcrumb
          items={[
            { label: 'Home', href: '/' },
            { label: 'All News', href: '/news' },
          ]}
        />
        <section className="latest-news-section py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <span className="text-sm font-semibold text-blue-600 uppercase tracking-wide">
                Latest Updates
              </span>
              <h1 className="text-4xl font-bold text-gray-800 mb-4 mt-2">
                All News & Announcements
              </h1>
              <p className="text-xl text-gray-600  text-center">
                Stay informed about the latest developments, publications, and opportunities in
                academic research.
              </p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center h-64">
                <i className="pi pi-spin pi-spinner text-4xl text-blue-600" />
              </div>
            ) : news.length === 0 ? (
              <div className="text-center py-16 text-gray-600">
                <i className="pi pi-inbox text-5xl mb-4 block text-gray-400" />
                <p className="text-lg">No news items at the moment. Check back later.</p>
                <Link href="/" className="text-blue-600 font-semibold hover:text-blue-700 mt-4 inline-block">
                  Back to Home
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {news.map((item) => (
                  <Card
                    key={item.id}
                    className="news-card h-full"
                  >
                    <div className="flex flex-col h-full">
                      <div className="flex items-start justify-between mb-3 flex-shrink-0">
                        <div className="flex items-center gap-2">
                          {item.isPinned && (
                            <i className="pi pi-thumbtack text-blue-600" title="Pinned" />
                          )}
                          <span className="text-xs font-semibold text-blue-600 uppercase">
                            {formatDate(item.publishedAt)}
                          </span>
                        </div>
                      </div>
                      <h2 className="text-xl font-bold text-gray-800 mb-3 flex-shrink-0">
                        {item.title}
                      </h2>
                      <div className="news-card__content text-gray-600 mb-4">
                        {item.content}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            <div className="text-center mt-8">
              <Link
                href="/"
                className="inline-flex items-center text-blue-600 font-semibold hover:text-blue-700 transition-colors"
              >
                <i className="pi pi-arrow-left mr-2" />
                Back to Home
              </Link>
            </div>
          </div>
        </section>
        <style jsx>{`
          .latest-news-section {
            overflow: visible !important;
          }
          .latest-news-section .container {
            overflow: visible !important;
          }
          .news-card {
            border-radius: 0.5rem;
            cursor: default;
            pointer-events: auto;
            overflow: visible !important;
            max-height: none !important;
          }
          .news-card :global(.p-card-body),
          .news-card :global(.p-card-content) {
            overflow: visible !important;
            text-overflow: clip !important;
            max-height: none !important;
          }
          .news-card__content {
            word-wrap: break-word;
            white-space: pre-wrap;
            overflow: visible !important;
            text-overflow: clip !important;
            display: block !important;
            -webkit-line-clamp: unset !important;
            line-clamp: unset !important;
            max-height: none !important;
          }
        `}</style>
      </main>
      <Footer />
    </>
  );
}
