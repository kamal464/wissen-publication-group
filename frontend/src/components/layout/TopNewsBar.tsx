"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { adminAPI } from '@/lib/api';

interface NewsItem {
  id: number;
  title: string;
  content?: string;
  link?: string;
  isPinned?: boolean;
}

export default function TopNewsBar() {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    loadNews();
  }, []);

  const loadNews = async () => {
    try {
      const response = await adminAPI.getLatestNews(10); // Get more to ensure we have pinned items
      const newsData = (response.data as NewsItem[]) || [];
      // Filter to show only pinned news items
      const pinnedNews = Array.isArray(newsData) 
        ? newsData.filter(item => item.isPinned === true).slice(0, 5)
        : [];
      setNewsItems(pinnedNews);
    } catch (error: any) {
      // Only log non-network errors (backend offline is expected in development)
      const isNetworkError = error.code === 'ERR_NETWORK' || 
                            error.code === 'ECONNREFUSED' || 
                            !error.response ||
                            error.message === 'Network Error';
      
      if (!isNetworkError) {
        console.error('Error loading news:', error);
      }
      // Silently fail - don't show error to users if news endpoint doesn't exist yet
      // This allows the page to load even if backend hasn't been updated
      setNewsItems([]);
    } finally {
      setLoading(false);
    }
  };

  // Don't render until mounted to prevent hydration mismatch
  if (!mounted || loading || newsItems.length === 0) {
    return null; // Don't show bar if no news or not mounted
  }

  return (
    <div className="top-bar" role="banner" suppressHydrationWarning>
      <div className="top-bar__container">
        <div className="top-bar__news" aria-live="polite">
          <span className="top-bar__badge" suppressHydrationWarning>LATEST NEWS</span>
          <div className="top-bar__ticker">
            <div className="top-bar__ticker-track">
              {[...newsItems, ...newsItems].map((item, index) => {
                const rawContent = (item.content || '').replace(/<[^>]*>/g, '').trim();
                const contentSnippet = rawContent.length > 80 ? rawContent.slice(0, 80) + '…' : rawContent;
                const displayText = contentSnippet ? `${item.title} — ${contentSnippet}` : item.title;
                return (
                  <Link
                    key={`${item.id}-${index}`}
                    href={item.link || '#'}
                    className="top-bar__ticker-item"
                    suppressHydrationWarning
                  >
                    <span suppressHydrationWarning>{displayText}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
        <div className="top-bar__actions">
          {/* <div className="top-bar__language">
            <button type="button" className="top-bar__language-btn" suppressHydrationWarning>
              ENG
            </button>
            <span className="top-bar__divider" suppressHydrationWarning>|</span>
            <button type="button" className="top-bar__language-btn" suppressHydrationWarning>
              中文
            </button>
          </div> */}
          <div className="top-bar__social" aria-label="Social media links">
            <a href="https://www.facebook.com" aria-label="Facebook" target="_blank" rel="noopener noreferrer">
              <i className="pi pi-facebook" />
            </a>
            <a href="https://x.com/wissen93634" aria-label="X (Twitter)" target="_blank" rel="noopener noreferrer">
              <i className="pi pi-twitter" />
            </a>
            <a href="https://www.linkedin.com/in/wissen-publication-group-9432b33aa/" aria-label="LinkedIn" target="_blank" rel="noopener noreferrer">
              <i className="pi pi-linkedin" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
