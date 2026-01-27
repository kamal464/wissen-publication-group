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

  // Generate SVG-based placeholder images
  const generatePlaceholderImage = (title: string, index: number): string => {
    const colorSchemes = [
      { bg: '#1e40af', text: '#ffffff' },
      { bg: '#1e3a8a', text: '#ffffff' },
      { bg: '#1d4ed8', text: '#ffffff' },
      { bg: '#2563eb', text: '#ffffff' },
      { bg: '#1e40af', text: '#ffffff' },
    ];
    
    const scheme = colorSchemes[index % colorSchemes.length];
    const shortTitle = title.length > 30 ? title.substring(0, 30) + '...' : title;
    
    const escapedTitle = shortTitle
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
    
    const svg = `<svg width="1680" height="500" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad${index}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${scheme.bg};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${scheme.bg}dd;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="1680" height="500" fill="url(#grad${index})"/>
      <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="48" font-weight="bold" fill="${scheme.text}" text-anchor="middle" dominant-baseline="middle">${escapedTitle}</text>
    </svg>`;
    
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  };

  useEffect(() => {
    loadJournals();
  }, []);

  useEffect(() => {
    if (journals.length === 0) return;

    const updateSliderWidth = () => {
      const viewportWidth = window.innerWidth;
      const calculatedHeight = Math.min((viewportWidth * 430) / 1520, 430);
      
      const elements = {
        slider: document.querySelector('.journal-slider') as HTMLElement,
        carouselWrapper: document.querySelector('.journal-slider__carousel-wrapper') as HTMLElement,
        slides: document.querySelectorAll('.journal-slide') as NodeListOf<HTMLElement>,
        slideLinks: document.querySelectorAll('.journal-slide__link') as NodeListOf<HTMLElement>,
        containers: document.querySelectorAll('.journal-slide__image-container') as NodeListOf<HTMLElement>,
        images: document.querySelectorAll('.journal-slide__image') as NodeListOf<HTMLElement>,
        carouselItems: document.querySelectorAll('.p-carousel-item') as NodeListOf<HTMLElement>,
        carouselContent: document.querySelectorAll('.p-carousel-content') as NodeListOf<HTMLElement>,
      };

      if (elements.slider) {
        elements.slider.style.setProperty('width', `${viewportWidth}px`, 'important');
        elements.slider.style.setProperty('margin-left', `calc(50% - ${viewportWidth / 2}px)`, 'important');
        elements.slider.style.setProperty('margin-right', `calc(50% - ${viewportWidth / 2}px)`, 'important');
      }

      if (elements.carouselWrapper) {
        elements.carouselWrapper.style.setProperty('width', `${viewportWidth}px`, 'important');
      }

      elements.slides.forEach((el) => {
        el.style.setProperty('width', `${viewportWidth}px`, 'important');
      });

      elements.slideLinks.forEach((el) => {
        el.style.setProperty('width', `${viewportWidth}px`, 'important');
      });

      elements.containers.forEach((el) => {
        el.style.setProperty('width', `${viewportWidth}px`, 'important');
        el.style.setProperty('height', `${calculatedHeight}px`, 'important');
      });

      elements.images.forEach((el) => {
        el.style.setProperty('width', `${viewportWidth}px`, 'important');
      });

      elements.carouselItems.forEach((el) => {
        el.style.setProperty('width', `${viewportWidth}px`, 'important');
      });

      elements.carouselContent.forEach((el) => {
        el.style.setProperty('width', `${viewportWidth}px`, 'important');
      });
    };

    setTimeout(updateSliderWidth, 100);
    window.addEventListener('resize', updateSliderWidth);

    let lastWidth = window.innerWidth;
    const zoomCheck = setInterval(() => {
      const currentWidth = window.innerWidth;
      if (Math.abs(currentWidth - lastWidth) > 1) {
        updateSliderWidth();
        lastWidth = currentWidth;
      }
    }, 100);

    const wheelHandler = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        setTimeout(updateSliderWidth, 50);
      }
    };
    window.addEventListener('wheel', wheelHandler, { passive: true });

    return () => {
      window.removeEventListener('resize', updateSliderWidth);
      window.removeEventListener('wheel', wheelHandler);
      clearInterval(zoomCheck);
    };
  }, [journals]);

  const loadJournals = async () => {
    try {
      const response = await adminAPI.getJournals();
      setJournals(getStaticJournals());
    } catch (error: any) {
      const isNetworkError = error.code === 'ERR_NETWORK' || 
                            error.code === 'ECONNREFUSED' || 
                            !error.response ||
                            error.message === 'Network Error';
      
      if (!isNetworkError) {
        console.error('Error loading journals:', error);
      }
      setJournals(getStaticJournals());
    } finally {
      setLoading(false);
    }
  };

  const getStaticJournals = (): Journal[] => {
    return [
      { id: 1, title: 'Slide 1', coverImage: '/images/sliders/slider 1.jpg.jpeg', description: '', shortcode: '' },
      { id: 2, title: 'Slide 2', coverImage: '/images/sliders/slider 2.jpg.jpeg', description: '', shortcode: '' },
      { id: 3, title: 'Slide 3', coverImage: '/images/sliders/slider 3.jpg.jpeg', description: '', shortcode: '' },
      { id: 4, title: 'Slide 4', coverImage: '/images/sliders/slider 4.jpg.jpeg', description: '', shortcode: '' },
    ];
  };

  const getImageUrl = (journal: Journal) => {
    if (journal.coverImage?.startsWith('http://') || journal.coverImage?.startsWith('https://')) {
      return journal.coverImage;
    }
    if (journal.coverImage?.startsWith('/')) {
      // For paths starting with /, encode each path segment separately
      // This preserves / characters while encoding spaces and special chars
      const pathParts = journal.coverImage.split('/').filter(part => part.length > 0);
      const encodedParts = pathParts.map(part => encodeURIComponent(part));
      const encodedPath = '/' + encodedParts.join('/');
      return encodedPath;
    }
    const imagePath = journal.bannerImage || journal.coverImage || journal.flyerImage;
    if (imagePath) {
      return getFileUrl(imagePath);
    }
    return generatePlaceholderImage(journal.title || 'Journal', 0);
  };

  const ImageWithRetry = ({ src, alt, journal }: { src: string; alt: string; journal: Journal }) => {
    const [imageSrc, setImageSrc] = useState(src);
    const [retryCount, setRetryCount] = useState(0);
    const [hasError, setHasError] = useState(false);
    const maxRetries = 3; // Increased retries for ERR_CONTENT_LENGTH_MISMATCH

    const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
      const target = e.target as HTMLImageElement;
      const imgError = e.nativeEvent as any;
      
      // Check if it's a Content-Length mismatch error
      const isContentLengthError = imgError?.message?.includes('ERR_CONTENT_LENGTH_MISMATCH') ||
                                   imgError?.message?.includes('Failed to load resource');
      
      if (retryCount < maxRetries) {
        // Retry with cache busting - use base src without previous retry params
        const baseSrc = src.split('?')[0]; // Remove any existing query params
        // For Content-Length errors, wait longer and try different strategies
        const retryDelay = isContentLengthError 
          ? (retryCount + 1) * 2000  // 2s, 4s, 6s delays for Content-Length errors
          : (retryCount + 1) * 1000; // 1s, 2s, 3s delays for other errors
        
        setTimeout(() => {
          // Try different cache-busting strategies
          const cacheBuster = retryCount === 0 
            ? `?_retry=${retryCount + 1}&_t=${Date.now()}`
            : retryCount === 1
            ? `?nocache=${Date.now()}&_retry=${retryCount + 1}`
            : `?v=${Date.now()}&_r=${retryCount + 1}`;
          
          setImageSrc(`${baseSrc}${cacheBuster}`);
          setRetryCount(prev => prev + 1);
        }, retryDelay);
      } else {
        // Max retries reached, show placeholder
        setHasError(true);
        target.style.display = 'none';
        const placeholder = target.nextElementSibling as HTMLElement;
        if (placeholder) placeholder.style.display = 'flex';
      }
    };

    const handleLoad = () => {
      setHasError(false);
    };

    if (hasError) {
      return (
        <div className="journal-slide__placeholder">
          <div className="journal-slide__placeholder-content">
            <i className="pi pi-image text-6xl text-gray-400 mb-4"></i>
            <p className="text-gray-600">{journal.title}</p>
          </div>
        </div>
      );
    }

    return (
      <>
        <img
          src={imageSrc}
          alt={alt}
          className="journal-slide__image"
          loading="eager"
          onError={handleError}
          onLoad={handleLoad}
          crossOrigin="anonymous"
        />
        <div className="journal-slide__placeholder" style={{ display: 'none' }}>
          <div className="journal-slide__placeholder-content">
            <i className="pi pi-image text-6xl text-gray-400 mb-4"></i>
            <p className="text-gray-600">{journal.title}</p>
          </div>
        </div>
      </>
    );
  };

  const journalTemplate = (journal: Journal) => {
    const imageUrl = getImageUrl(journal);
    const journalUrl = journal.shortcode ? `/journals/${journal.shortcode}` : '#';

    return (
      <div className="journal-slide">
        <Link href={journalUrl} className="journal-slide__link">
          <div className="journal-slide__image-container">
            {imageUrl ? (
              <ImageWithRetry src={imageUrl} alt={journal.title} journal={journal} />
            ) : (
              <div className="journal-slide__placeholder">
                <div className="journal-slide__placeholder-content">
                  <i className="pi pi-image text-6xl text-gray-400 mb-4"></i>
                  <p className="text-gray-600">{journal.title}</p>
                </div>
              </div>
            )}
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

  if (journals.length === 0) return null;

  return (
    <section className="journal-slider">
      <div className="journal-slider__carousel-wrapper">
        <Carousel
          value={journals}
          numVisible={1}
          numScroll={1}
          itemTemplate={journalTemplate}
          circular={true}
          autoplayInterval={4000}
          showIndicators={false}
          showNavigators={false}
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

      <style jsx>{`
        .journal-slider {
          background: transparent;
          position: relative;
          overflow: hidden;
          width: 100vw !important;
          max-width: 100vw !important;
          padding: 0 !important;
          margin: 0 !important;
          margin-left: calc(50% - 50vw) !important;
          margin-right: calc(50% - 50vw) !important;
          box-sizing: border-box !important;
        }

        .journal-slider__carousel-wrapper {
          width: 100vw !important;
          max-width: 100vw !important;
          margin: 0 !important;
          padding: 0 !important;
          overflow: hidden;
          box-sizing: border-box !important;
          position: relative;
        }

        .journal-slide {
          padding: 0 !important;
          width: 100vw !important;
          max-width: 100vw !important;
          margin: 0 !important;
          box-sizing: border-box !important;
          flex-shrink: 0 !important;
        }

        .journal-slide__link {
          display: block;
          text-decoration: none;
          color: inherit;
          width: 100vw !important;
          max-width: 100vw !important;
          margin: 0 !important;
          padding: 0 !important;
          box-sizing: border-box !important;
        }

        .journal-slide__image-container {
          position: relative;
          overflow: visible;
          width: 100vw !important;
          max-width: 100vw !important;
          height: calc(100vw * 430 / 1520);
          max-height: 430px;
          background: #f3f4f6;
          margin: 0 !important;
          padding: 0 !important;
          box-sizing: border-box !important;
        }

        .journal-slide__image {
          width: 100vw !important;
          max-width: 100vw !important;
          height: 100%;
          object-fit: cover;
          object-position: center;
          transition: transform 0.5s ease;
          display: block !important;
          visibility: visible !important;
          opacity: 1 !important;
          margin: 0 !important;
          padding: 0 !important;
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
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          position: absolute;
          top: 0;
          left: 0;
        }

        .journal-slide__placeholder-content {
          text-align: center;
          padding: 2rem;
        }

        /* Carousel Styles */
        :global(.custom-carousel),
        :global(.p-carousel) {
          padding: 0 !important;
          margin: 0 !important;
          width: 100vw !important;
          max-width: 100vw !important;
          box-sizing: border-box !important;
          overflow: visible !important;
        }

        :global(.custom-carousel-content),
        :global(.p-carousel .p-carousel-content),
        :global(.p-carousel-container),
        :global(.p-carousel-items-container) {
          padding: 0 !important;
          margin: 0 !important;
          width: 100vw !important;
          max-width: 100vw !important;
          box-sizing: border-box !important;
        }

        :global(.custom-carousel-item),
        :global(.p-carousel-item) {
          padding: 0 !important;
          margin: 0 !important;
          width: 100vw !important;
          max-width: 100vw !important;
          box-sizing: border-box !important;
          flex-shrink: 0 !important;
          visibility: visible !important;
          opacity: 1 !important;
        }

        /* Position indicators at the bottom of the image container */
        :global(.custom-carousel-indicators),
        :global(.p-carousel-indicators) {
          position: absolute !important;
          bottom: 0 !important;
          left: 50% !important;
          transform: translateX(-50%) !important;
          gap: 0.5rem !important;
          margin: 0 !important;
          padding: 0.75rem 0 !important;
          z-index: 20 !important;
          width: 100% !important;
          display: flex !important;
          justify-content: center !important;
          align-items: center !important;
        }
        
        /* Ensure carousel container is positioned relative for absolute positioning */
        :global(.p-carousel),
        :global(.custom-carousel) {
          position: relative !important;
        }
        
        /* Remove any default PrimeReact padding/margin from carousel that creates gap */
        :global(.p-carousel .p-carousel-content),
        :global(.p-carousel-container),
        :global(.p-carousel-items-container) {
          padding-bottom: 0 !important;
          margin-bottom: 0 !important;
          position: relative !important;
        }

        :global(.custom-carousel-indicator button) {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: rgba(37, 99, 235, 0.4);
          border: 2px solid rgba(37, 99, 235, 0.6);
          transition: all 0.3s ease;
        }

        :global(.custom-carousel-indicator button:hover) {
          background: rgba(37, 99, 235, 0.7);
          transform: scale(1.2);
        }

        :global(.custom-carousel-indicator.p-highlight button) {
          background: #2563eb;
          width: 32px;
          border-radius: 6px;
        }

        :global(.p-carousel-prev),
        :global(.p-carousel-next),
        :global(.custom-carousel-prev),
        :global(.custom-carousel-next) {
          width: 48px !important;
          height: 48px !important;
          border-radius: 50% !important;
          background: rgba(37, 99, 235, 0.8) !important;
          border: 2px solid rgba(37, 99, 235, 0.9) !important;
          color: #ffffff !important;
          transition: all 0.3s ease !important;
          position: absolute !important;
          top: 50% !important;
          transform: translateY(-50%) !important;
          z-index: 10 !important;
        }

        :global(.p-carousel-prev:hover),
        :global(.p-carousel-next:hover),
        :global(.custom-carousel-prev:hover),
        :global(.custom-carousel-next:hover) {
          background: rgba(37, 99, 235, 1) !important;
          transform: translateY(-50%) scale(1.1) !important;
        }

        :global(.p-carousel-prev),
        :global(.custom-carousel-prev) {
          left: 1rem !important;
          right: auto !important;
        }

        :global(.p-carousel-next),
        :global(.custom-carousel-next) {
          right: 1rem !important;
          left: auto !important;
        }

        @media (max-width: 768px) {
          :global(.p-carousel-prev),
          :global(.p-carousel-next),
          :global(.custom-carousel-prev),
          :global(.custom-carousel-next) {
            width: 40px !important;
            height: 40px !important;
          }

          :global(.p-carousel-prev),
          :global(.custom-carousel-prev) {
            left: 0.5rem !important;
          }

          :global(.p-carousel-next),
          :global(.custom-carousel-next) {
            right: 0.5rem !important;
          }

          :global(.custom-carousel-indicators),
          :global(.p-carousel-indicators) {
            bottom: 0 !important;
            padding: 0.5rem 0 !important;
          }
          
          :global(.p-carousel .p-carousel-content),
          :global(.p-carousel-container),
          :global(.p-carousel-items-container) {
            padding-bottom: 0 !important;
            margin-bottom: 0 !important;
            position: relative !important;
          }
        }

        /* Container breakout */
        :global(main .journal-slider),
        :global(.container .journal-slider),
        :global([class*="container"] .journal-slider),
        :global([class*="mx-auto"] .journal-slider) {
          width: 100vw !important;
          max-width: 100vw !important;
          margin-left: calc(50% - 50vw) !important;
          margin-right: calc(50% - 50vw) !important;
          padding: 0 !important;
        }

        :global(main) {
          overflow-x: hidden !important;
        }
      `}</style>
    </section>
  );
}