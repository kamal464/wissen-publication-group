"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { adminAPI } from '@/lib/api';

interface NewsItem {
  id: number;
  title: string;
  link?: string;
}

export default function TopNewsBar() {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNews();
  }, []);

  const loadNews = async () => {
    try {
      const response = await adminAPI.getLatestNews(5);
      const news = (response.data || []).slice(0, 5);
      setNewsItems(news);
    } catch (error: any) {
      console.error('Error loading news:', error);
      // Silently fail - don't show error to users if news endpoint doesn't exist yet
      // This allows the page to load even if backend hasn't been updated
      setNewsItems([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading || newsItems.length === 0) {
    return null; // Don't show bar if no news
  }

  return (
    <div className="top-bar" role="banner">
      <div className="top-bar__container">
        <div className="top-bar__news" aria-live="polite">
          <span className="top-bar__badge">LATEST NEWS</span>
          <div className="top-bar__ticker">
            <div className="top-bar__ticker-track">
              {[...newsItems, ...newsItems].map((item, index) => (
                <Link
                  key={`${item.id}-${index}`}
                  href={item.link || '#'}
                  className="top-bar__ticker-item"
                >
                  {item.title}
                </Link>
              ))}
            </div>
          </div>
        </div>
        <div className="top-bar__actions">
          <div className="top-bar__language">
            <button type="button" className="top-bar__language-btn" suppressHydrationWarning>
              ENG
            </button>
            <span className="top-bar__divider">|</span>
            <button type="button" className="top-bar__language-btn" suppressHydrationWarning>
              中文
            </button>
          </div>
          <div className="top-bar__social" aria-label="Social media links">
            <Link href="https://www.facebook.com" aria-label="Facebook" target="_blank" rel="noreferrer">
              <i className="pi pi-facebook" />
            </Link>
            <Link href="https://x.com" aria-label="X" target="_blank" rel="noreferrer">
              <i className="pi pi-twitter" />
            </Link>
            <Link href="https://www.linkedin.com" aria-label="LinkedIn" target="_blank" rel="noreferrer">
              <i className="pi pi-linkedin" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
