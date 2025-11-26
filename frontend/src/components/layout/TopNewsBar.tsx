"use client";

import Link from 'next/link';

const newsItems = [
  {
    id: 1,
    text: 'Call for Papers: Latest Research in Environmental & Earth Sciences',
    href: '/journals/environmental-earth-sciences'
  },
  {
    id: 2,
    text: 'New Cultural Anthology Release: Voices Across Continents',
    href: '/books/cultural-anthology'
  },
  {
    id: 3,
    text: 'Upcoming Webinar: Global Perspectives in Bilingual Publishing',
    href: '/events/global-perspectives-webinar'
  }
];

export default function TopNewsBar() {
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
                  href={item.href}
                  className="top-bar__ticker-item"
                >
                  {item.text}
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
