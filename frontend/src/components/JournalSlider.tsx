'use client';

import { useState, useEffect } from 'react';
import { Carousel } from 'primereact/carousel';
import { adminAPI } from '@/lib/api';
import { getFileUrl } from '@/lib/apiConfig';
import Link from 'next/link';

interface Journal {
  id: number;
  title: string;
  coverImage?: string;
  bannerImage?: string;
  flyerImage?: string;
  shortcode?: string;
  description?: string;
}

export default function JournalSlider() {
  const [journals, setJournals] = useState<Journal[]>([]);
  const [loading, setLoading] = useState(true);

  // Generate SVG-based placeholder images (works offline, no external service needed)
  const generatePlaceholderImage = (title: string, index: number): string => {
    // Professional journal cover color schemes
    const colorSchemes = [
      { bg: '#1e40af', text: '#ffffff' }, // Deep blue
      { bg: '#1e3a8a', text: '#ffffff' }, // Navy blue
      { bg: '#1d4ed8', text: '#ffffff' }, // Royal blue
      { bg: '#2563eb', text: '#ffffff' }, // Bright blue
      { bg: '#1e40af', text: '#ffffff' }, // Indigo blue
    ];
    
    const scheme = colorSchemes[index % colorSchemes.length];
    
    // Clean title for display
    const shortTitle = title.length > 30 ? title.substring(0, 30) + '...' : title;
    
    // Create SVG data URI - works offline, no external service needed
    const escapedTitle = shortTitle
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
    
    const svg = `<svg width="1680" height="720" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="grad${index}" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:${scheme.bg};stop-opacity:1" /><stop offset="100%" style="stop-color:${scheme.bg}dd;stop-opacity:1" /></linearGradient></defs><rect width="1680" height="720" fill="url(#grad${index})"/><text x="50%" y="50%" font-family="Arial, sans-serif" font-size="48" font-weight="bold" fill="${scheme.text}" text-anchor="middle" dominant-baseline="middle">${escapedTitle}</text></svg>`;
    
    // Use encodeURIComponent for better compatibility
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  };

  useEffect(() => {
    loadJournals();
  }, []);

  const loadJournals = async () => {
    try {
      const response = await adminAPI.getJournals();
      const allJournals = (response.data as any[]) || [];
      
      // Always use static journals with guaranteed working placeholder images
      // This ensures images always load properly
      setJournals(getStaticJournals());
    } catch (error) {
      console.error('Error loading journals:', error);
      // Use static journals if API fails - these always have working placeholder URLs
      setJournals(getStaticJournals());
    } finally {
      setLoading(false);
    }
  };

  // Static journal data with SVG-based images
  const getStaticJournals = (): Journal[] => {
    return [
      { 
        id: 1, 
        title: 'Journal of Advanced Research', 
        coverImage: generatePlaceholderImage('Journal of Advanced Research', 0),
        description: 'Publishing cutting-edge research across multiple disciplines. A peer-reviewed, open-access journal committed to advancing knowledge.',
        shortcode: 'jar'
      },
      { 
        id: 2, 
        title: 'International Journal of Science', 
        coverImage: generatePlaceholderImage('International Journal of Science', 1),
        description: 'Advancing scientific knowledge through rigorous peer review. Connecting researchers worldwide with groundbreaking discoveries.',
        shortcode: 'ijs'
      },
      { 
        id: 3, 
        title: 'Journal of Medical Studies', 
        coverImage: generatePlaceholderImage('Journal of Medical Studies', 2),
        description: 'Leading medical research and clinical studies. Bridging the gap between research and clinical practice.',
        shortcode: 'jms'
      },
      { 
        id: 4, 
        title: 'Engineering Research Journal', 
        coverImage: generatePlaceholderImage('Engineering Research Journal', 3),
        description: 'Innovation in engineering and technology. Showcasing the latest advancements in engineering disciplines.',
        shortcode: 'erj'
      },
      { 
        id: 5, 
        title: 'Social Sciences Review', 
        coverImage: generatePlaceholderImage('Social Sciences Review', 4),
        description: 'Exploring human society and social relationships. Understanding the complexities of human behavior and social structures.',
        shortcode: 'ssr'
      },
    ];
  };

  // Get static journal image - uses working placeholder service URLs
  const getStaticJournalImage = (index: number): string => {
    const journalTitles = [
      'Journal of Advanced Research',
      'International Journal of Science',
      'Journal of Medical Studies',
      'Engineering Research Journal',
      'Social Sciences Review',
    ];
    const title = journalTitles[index] || `Journal ${index + 1}`;
    return generatePlaceholderImage(title, index);
  };

  const getImageUrl = (journal: Journal) => {
    // If it's already a full URL (placeholder or external), return as is
    if (journal.coverImage?.startsWith('http://') || journal.coverImage?.startsWith('https://')) {
      return journal.coverImage;
    }
    // If it's a static image path starting with /, use it directly
    if (journal.coverImage?.startsWith('/')) {
      return journal.coverImage;
    }
    // Otherwise, try to get file URL from API
    const imagePath = journal.bannerImage || journal.coverImage || journal.flyerImage;
    if (imagePath) {
      return getFileUrl(imagePath);
    }
    // Fallback: generate placeholder
    return generatePlaceholderImage(journal.title || 'Journal', 0);
  };

  const journalTemplate = (journal: Journal) => {
    const imageUrl = getImageUrl(journal);
    const journalUrl = journal.shortcode ? `/journals/${journal.shortcode}` : '#';

    return (
      <div className="journal-slide">
        <Link href={journalUrl} className="journal-slide__link">
          <div className="journal-slide__image-container">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={journal.title}
                className="journal-slide__image"
                loading="lazy"
                onError={(e) => {
                  // Fallback to placeholder if image fails to load
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const placeholder = target.nextElementSibling as HTMLElement;
                  if (placeholder) {
                    placeholder.style.display = 'flex';
                  }
                }}
              />
            ) : null}
            <div className="journal-slide__placeholder" style={{ display: imageUrl ? 'none' : 'flex' }}>
              <div className="journal-slide__placeholder-content">
                <i className="pi pi-book text-6xl text-white opacity-50 mb-3"></i>
                <p className="text-white text-lg font-semibold opacity-75">{journal.title}</p>
              </div>
            </div>
            <div className="journal-slide__overlay">
              <div className="journal-slide__content">
                <h2 className="journal-slide__title">{journal.title}</h2>
                {journal.description && (
                  <p className="journal-slide__description">
                    {journal.description.length > 150 
                      ? journal.description.substring(0, 150) + '...' 
                      : journal.description}
                  </p>
                )}
                <span className="journal-slide__cta">
                  Explore Journal
                  <i className="pi pi-arrow-right ml-2"></i>
                </span>
              </div>
            </div>
          </div>
        </Link>
      </div>
    );
  };

  if (loading) {
    return (
      <section className="journal-slider journal-slider--loading">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-96">
            <i className="pi pi-spin pi-spinner text-5xl text-blue-600"></i>
          </div>
        </div>
      </section>
    );
  }

  if (journals.length === 0) {
    return null;
  }

  return (
    <section className="journal-slider">
      <div className="container mx-auto px-4 py-6 md:py-8 lg:py-12">
        <div className="text-center mb-6 md:mb-8">
          <span className="journal-slider__eyebrow">FEATURED JOURNALS</span>
          <h1 className="journal-slider__heading">
            Discover Our Academic Publications
          </h1>
          <p className="journal-slider__subheading">
            Explore cutting-edge research across multiple disciplines
          </p>
        </div>
        
        <div className="journal-slider__carousel-wrapper">
          <Carousel
            value={journals}
            numVisible={1}
            numScroll={1}
            itemTemplate={journalTemplate}
            circular={true}
            autoplayInterval={4000}
            showIndicators={true}
            showNavigators={true}
            className="journal-slider__carousel"
            pt={{
              root: { className: 'custom-carousel' },
              content: { className: 'custom-carousel-content' },
              item: { className: 'custom-carousel-item' },
              indicators: { className: 'custom-carousel-indicators' },
              indicator: { className: 'custom-carousel-indicator' }
            }}
          />
        </div>
      </div>

      <style jsx>{`
        .journal-slider {
          background: linear-gradient(135deg, #2563eb 0%, #1e40af 50%, #1e3a8a 100%);
          position: relative;
          overflow: hidden;
        }

        .journal-slider::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(to bottom, rgba(30, 58, 138, 0.4) 0%, rgba(30, 64, 175, 0.2) 100%);
          z-index: 1;
        }

        .journal-slider > div {
          position: relative;
          z-index: 2;
        }

        .journal-slider__eyebrow {
          display: inline-block;
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.95);
          margin-bottom: 1rem;
          padding: 0.5rem 1.5rem;
          background: rgba(255, 255, 255, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 2rem;
          backdrop-filter: blur(10px);
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .journal-slider__heading {
          font-size: 2rem;
          font-weight: 700;
          color: #ffffff;
          margin-bottom: 0.75rem;
          line-height: 1.2;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .journal-slider__subheading {
          font-size: 1.125rem;
          color: rgba(255, 255, 255, 0.95);
          max-width: 600px;
          margin: 0 auto;
          font-weight: 400;
        }

        @media (min-width: 768px) {
          .journal-slider__heading {
            font-size: 2.5rem;
          }
          .journal-slider__subheading {
            font-size: 1.25rem;
          }
        }

        @media (min-width: 1024px) {
          .journal-slider__heading {
            font-size: 3rem;
          }
        }

        .journal-slider__carousel-wrapper {
          margin-top: 2rem;
          max-width: 1400px;
          margin-left: auto;
          margin-right: auto;
        }

        .journal-slide {
          padding: 0.5rem;
          width: 100%;
        }

        .journal-slide__link {
          display: block;
          text-decoration: none;
          color: inherit;
        }

        .journal-slide__image-container {
          position: relative;
          border-radius: 1rem;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1);
          aspect-ratio: 21 / 9;
          background: linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%);
          max-width: 100%;
          margin: 0 auto;
        }

        @media (min-width: 1024px) {
          .journal-slide__image-container {
            aspect-ratio: 21 / 8;
          }
        }

        .journal-slide__image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }

        .journal-slide__link:hover .journal-slide__image {
          transform: scale(1.05);
        }

        .journal-slide__placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #2563eb 0%, #1e40af 50%, #1e3a8a 100%);
          position: absolute;
          top: 0;
          left: 0;
        }

        .journal-slide__placeholder-content {
          text-align: center;
          padding: 2rem;
        }

        .journal-slide__overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(to top, rgba(0, 0, 0, 0.95) 0%, rgba(0, 0, 0, 0.85) 40%, rgba(0, 0, 0, 0.6) 70%, transparent 100%);
          padding: 2rem 1.5rem 1.5rem;
          transform: translateY(0);
          transition: transform 0.3s ease;
          backdrop-filter: blur(2px);
        }

        .journal-slide__link:hover .journal-slide__overlay {
          transform: translateY(-5px);
        }

        .journal-slide__content {
          max-width: 1000px;
          margin: 0 auto;
          padding: 0 1rem;
        }

        .journal-slide__title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #ffffff;
          margin-bottom: 0.75rem;
          line-height: 1.3;
          text-shadow: 0 2px 8px rgba(0, 0, 0, 0.8), 0 0 20px rgba(0, 0, 0, 0.5);
        }

        .journal-slide__description {
          font-size: 0.95rem;
          color: rgba(255, 255, 255, 0.95);
          margin-bottom: 1rem;
          line-height: 1.6;
          text-shadow: 0 1px 4px rgba(0, 0, 0, 0.8);
        }

        .journal-slide__cta {
          display: inline-flex;
          align-items: center;
          font-size: 0.95rem;
          font-weight: 600;
          color: #ffffff;
          padding: 0.75rem 1.5rem;
          background: rgba(255, 255, 255, 0.25);
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 0.5rem;
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .journal-slide__link:hover .journal-slide__cta {
          background: rgba(255, 255, 255, 0.35);
          border-color: rgba(255, 255, 255, 0.5);
          transform: translateX(5px);
          box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
        }

        @media (min-width: 768px) {
          .journal-slide__title {
            font-size: 2rem;
          }
          .journal-slide__description {
            font-size: 1rem;
          }
          .journal-slide__overlay {
            padding: 3rem 2rem 2rem;
          }
        }

        @media (min-width: 1024px) {
          .journal-slide__title {
            font-size: 2.5rem;
          }
          .journal-slide__description {
            font-size: 1.125rem;
          }
        }

        /* Custom Carousel Styles */
        :global(.custom-carousel) {
          padding: 0;
          width: 100%;
        }

        :global(.custom-carousel-content) {
          padding: 0;
          width: 100%;
        }

        :global(.custom-carousel-item) {
          padding: 0;
          width: 100%;
        }

        :global(.custom-carousel-indicators) {
          bottom: 1.5rem;
          gap: 0.5rem;
        }

        :global(.custom-carousel-indicator button) {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.4);
          border: 2px solid rgba(255, 255, 255, 0.6);
          transition: all 0.3s ease;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        :global(.custom-carousel-indicator button:hover) {
          background: rgba(255, 255, 255, 0.7);
          border-color: rgba(255, 255, 255, 0.9);
          transform: scale(1.2);
        }

        :global(.custom-carousel-indicator.p-highlight button) {
          background: #ffffff;
          border-color: #ffffff;
          width: 32px;
          border-radius: 6px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }

        :global(.custom-carousel-prev),
        :global(.custom-carousel-next) {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.25);
          backdrop-filter: blur(10px);
          border: 2px solid rgba(255, 255, 255, 0.4);
          color: #ffffff;
          transition: all 0.3s ease;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.15);
        }

        :global(.custom-carousel-prev:hover),
        :global(.custom-carousel-next:hover) {
          background: rgba(255, 255, 255, 0.35);
          border-color: rgba(255, 255, 255, 0.6);
          transform: scale(1.1);
          box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
        }

        :global(.custom-carousel-prev) {
          left: 1rem;
        }

        :global(.custom-carousel-next) {
          right: 1rem;
        }

        @media (max-width: 768px) {
          :global(.custom-carousel-prev),
          :global(.custom-carousel-next) {
            width: 40px;
            height: 40px;
          }

          :global(.custom-carousel-prev) {
            left: 0.5rem;
          }

          :global(.custom-carousel-next) {
            right: 0.5rem;
          }
        }
      `}</style>
    </section>
  );
}

