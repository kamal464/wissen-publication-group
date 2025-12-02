'use client';

import { useState, useEffect } from 'react';
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
}

export default function JournalCovers() {
  const [journals, setJournals] = useState<Journal[]>([]);
  const [loading, setLoading] = useState(true);

  // Generate SVG-based placeholder images (works offline, no external service needed)
  const generatePlaceholderImage = (title: string, index: number): string => {
    const colorSchemes = [
      { bg: '#2563eb', text: '#ffffff' },
      { bg: '#1e40af', text: '#ffffff' },
      { bg: '#1d4ed8', text: '#ffffff' },
      { bg: '#3b82f6', text: '#ffffff' },
      { bg: '#1e3a8a', text: '#ffffff' },
      { bg: '#1e3a8a', text: '#ffffff' },
    ];
    
    const scheme = colorSchemes[index % colorSchemes.length];
    const shortTitle = title.length > 20 ? title.substring(0, 20) + '...' : title;
    
    // Create SVG data URI - works offline, no external service needed
    const escapedTitle = shortTitle
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
    
    const svg = `<svg width="400" height="600" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="grad${index}" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:${scheme.bg};stop-opacity:1" /><stop offset="100%" style="stop-color:${scheme.bg}dd;stop-opacity:1" /></linearGradient></defs><rect width="400" height="600" fill="url(#grad${index})"/><text x="50%" y="50%" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="${scheme.text}" text-anchor="middle" dominant-baseline="middle">${escapedTitle}</text></svg>`;
    
    // Use encodeURIComponent for better compatibility
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  };

  // Static journal data with placeholder images
  const getStaticJournals = (): Journal[] => {
    return [
      { 
        id: 1, 
        title: 'Journal of Diabetes & Metabolic Disorders',
        coverImage: generatePlaceholderImage('Journal of Diabetes & Metabolic Disorders', 0),
        shortcode: 'jdmd'
      },
      { 
        id: 2, 
        title: 'Journal of Brain & Neuroscience Research',
        coverImage: generatePlaceholderImage('Journal of Brain & Neuroscience Research', 1),
        shortcode: 'jbnr'
      },
      { 
        id: 3, 
        title: 'Journal of Psychiatry, Depression & Anxiety',
        coverImage: generatePlaceholderImage('Journal of Psychiatry, Depression & Anxiety', 2),
        shortcode: 'jpda'
      },
      { 
        id: 4, 
        title: 'Journal of Modern Chemical Sciences',
        coverImage: generatePlaceholderImage('Journal of Modern Chemical Sciences', 3),
        shortcode: 'jmcs'
      },
      { 
        id: 5, 
        title: 'Journal of Vaccines Research & Vaccination',
        coverImage: generatePlaceholderImage('Journal of Vaccines Research & Vaccination', 4),
        shortcode: 'jvrv'
      },
      { 
        id: 6, 
        title: 'Journal of Dairy Research & Technology',
        coverImage: generatePlaceholderImage('Journal of Dairy Research & Technology', 5),
        shortcode: 'jdrt'
      },
    ];
  };

  useEffect(() => {
    loadJournals();
  }, []);

  const loadJournals = async () => {
    try {
      const response = await adminAPI.getJournals();
      const allJournals = (response.data as any[]) || [];
      
      // Take first 6 journals and ensure they have images
      const journalsWithImages = allJournals.slice(0, 6).map((j: any, index: number) => {
        const existingImage = j.coverImage || j.bannerImage || j.flyerImage;
        const coverImage = (existingImage && (existingImage.startsWith('http://') || existingImage.startsWith('https://'))) 
          ? existingImage 
          : generatePlaceholderImage(j.title || `Journal ${index + 1}`, index);
        
        return {
          ...j,
          coverImage: coverImage
        };
      });
      
      // Ensure we have at least 6 journals
      if (journalsWithImages.length < 6) {
        const staticJournals = getStaticJournals();
        const needed = 6 - journalsWithImages.length;
        journalsWithImages.push(...staticJournals.slice(0, needed));
      }
      
      setJournals(journalsWithImages.slice(0, 6));
    } catch (error) {
      console.error('Error loading journals:', error);
      // Use static journals if API fails
      setJournals(getStaticJournals());
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (journal: Journal) => {
    // If it's already a full URL (placeholder or external), return as is
    if (journal.coverImage?.startsWith('http://') || journal.coverImage?.startsWith('https://')) {
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

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center h-64">
            <i className="pi pi-spin pi-spinner text-4xl text-blue-600"></i>
          </div>
        </div>
      </section>
    );
  }

  if (journals.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div className="mb-4 md:mb-0">
            <p className="text-lg text-gray-700 font-medium">
              1500+ articles indexed in various sites and also cited by various authors around the world.
            </p>
          </div>
          <Link 
            href="/journals"
            className="inline-flex items-center text-blue-600 font-semibold hover:text-blue-700 transition-colors"
          >
            View All Journals
            <i className="pi pi-arrow-right ml-2"></i>
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
          {journals.map((journal) => {
            const imageUrl = getImageUrl(journal);
            const journalUrl = journal.shortcode ? `/journals/${journal.shortcode}` : '#';

            return (
              <Link
                key={journal.id}
                href={journalUrl}
                className="group journal-cover-card"
              >
                <div className="journal-cover-card__container">
                  <div className="journal-cover-card__image-wrapper">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={journal.title}
                        className="journal-cover-card__image"
                        loading="lazy"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = generatePlaceholderImage(journal.title, journal.id);
                        }}
                      />
                    ) : (
                      <div className="journal-cover-card__placeholder">
                        <i className="pi pi-book text-4xl text-gray-400"></i>
                      </div>
                    )}
                    <div className="journal-cover-card__title-bar">
                      <div className="journal-cover-card__title-text">
                        {journal.title}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        .journal-cover-card {
          text-decoration: none;
          color: inherit;
          display: block;
        }

        .journal-cover-card__container {
          position: relative;
          width: 100%;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .journal-cover-card:hover .journal-cover-card__container {
          transform: translateY(-8px);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
        }

        .journal-cover-card__image-wrapper {
          position: relative;
          width: 100%;
          aspect-ratio: 2 / 3;
          border-radius: 0.5rem;
          overflow: hidden;
          background: linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .journal-cover-card__image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        .journal-cover-card:hover .journal-cover-card__image {
          transform: scale(1.05);
        }

        .journal-cover-card__placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
        }

        .journal-cover-card__title-bar {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(to top, rgba(0, 0, 0, 0.95) 0%, rgba(0, 0, 0, 0.85) 100%);
          padding: 0.75rem 0.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .journal-cover-card__title-text {
          font-size: 0.7rem;
          font-weight: 600;
          color: #ffffff;
          line-height: 1.2;
          text-align: center;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        @media (min-width: 768px) {
          .journal-cover-card__title-text {
            font-size: 0.75rem;
          }

          .journal-cover-card__title-bar {
            padding: 0.875rem 0.625rem;
          }
        }

        @media (min-width: 1024px) {
          .journal-cover-card__title-text {
            font-size: 0.8rem;
          }

          .journal-cover-card__logo-text {
            font-size: 0.7rem;
          }

          .journal-cover-card__title-bar {
            padding: 1rem 0.75rem;
          }
        }
      `}</style>
    </section>
  );
}

