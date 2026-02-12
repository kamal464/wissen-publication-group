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

const MOBILE_BREAKPOINT = 768;
const MOBILE_SLIDER_HEIGHT = 180;

export default function JournalSlider() {
  const [journals, setJournals] = useState<Journal[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.innerWidth <= MOBILE_BREAKPOINT
  );
  const [mobileIndex, setMobileIndex] = useState(0);

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
    const check = () => setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    if (!isMobile || journals.length <= 1) return;
    const t = setInterval(() => setMobileIndex((i) => (i + 1) % journals.length), 4000);
    return () => clearInterval(t);
  }, [isMobile, journals.length]);

  useEffect(() => {
    if (journals.length === 0 || isMobile) return;

    const isMobileView = window.innerWidth <= 768;

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

    // Run after paint (rAF) then multiple times so PrimeReact has rendered (fixes mobile disappear)
    const rafId = requestAnimationFrame(() => {
      updateSliderWidth();
    });
    const t1 = setTimeout(updateSliderWidth, 150);
    const t2 = setTimeout(updateSliderWidth, 400);
    const t3 = setTimeout(updateSliderWidth, 800);
    const t4 = isMobileView ? setTimeout(updateSliderWidth, 1600) : null;
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
      cancelAnimationFrame(rafId);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      if (t4) clearTimeout(t4);
      window.removeEventListener('resize', updateSliderWidth);
      window.removeEventListener('wheel', wheelHandler);
      clearInterval(zoomCheck);
    };
  }, [journals, isMobile]);

  const loadJournals = async () => {
    // Set static data immediately so slider shows on first paint (avoids flash/gone on mobile)
    const staticList = getStaticJournals();
    setJournals(staticList);
    setLoading(false);
    try {
      await adminAPI.getJournals();
      // Optionally use API response here; for now keep static slider images
    } catch (error: any) {
      const isNetworkError = error.code === 'ERR_NETWORK' ||
                            error.code === 'ECONNREFUSED' ||
                            !error.response ||
                            error.message === 'Network Error';
      if (!isNetworkError) {
        console.error('Error loading journals:', error);
      }
    }
  };

  const getStaticJournals = (): Journal[] => {
    return [
      { id: 1, title: 'Slide 1', coverImage: '/images/sliders/slider 1.jpg.jpeg', description: '', shortcode: '' },
      { id: 4, title: 'Slide 4', coverImage: '/images/sliders/slider 4.jpg.jpeg', description: '', shortcode: '' },
      { id: 2, title: 'Slide 2', coverImage: '/images/sliders/slider 2.jpg.jpeg', description: '', shortcode: '' },
      { id: 3, title: 'Slide 3', coverImage: '/images/sliders/slider 3.jpg.jpeg', description: '', shortcode: '' },
    ];
  };

  const getImageUrl = (journal: Journal) => {
    const imagePath = journal.flyerImage || journal.coverImage;

    if (!imagePath) {
      return null;
    }

    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }

    if (imagePath.startsWith('/')) {
      const pathParts = imagePath.split('/').filter(part => part.length > 0);
      const encodedParts = pathParts.map(part => encodeURIComponent(part));
      const encodedPath = '/' + encodedParts.join('/');
      return encodedPath;
    }

    return getFileUrl(imagePath);
  };

  const ImageWithRetry = ({ src, alt, journal }: { src: string; alt: string; journal: Journal }) => {
    const [imageSrc, setImageSrc] = useState(src);
    const [retryCount, setRetryCount] = useState(0);
    const [hasError, setHasError] = useState(false);
    const maxRetries = 3;

    const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
      const target = e.target as HTMLImageElement;
      const imgError = e.nativeEvent as any;

      const isContentLengthError = imgError?.message?.includes('ERR_CONTENT_LENGTH_MISMATCH') ||
                                   imgError?.message?.includes('Failed to load resource');

      if (retryCount < maxRetries) {
        const baseSrc = src.split('?')[0];
        const retryDelay = isContentLengthError
          ? (retryCount + 1) * 2000
          : (retryCount + 1) * 1000;

        setTimeout(() => {
          const cacheBuster = retryCount === 0
            ? `?_retry=${retryCount + 1}&_t=${Date.now()}`
            : retryCount === 1
            ? `?nocache=${Date.now()}&_retry=${retryCount + 1}`
            : `?v=${Date.now()}&_r=${retryCount + 1}`;

          setImageSrc(`${baseSrc}${cacheBuster}`);
          setRetryCount(prev => prev + 1);
        }, retryDelay);
      } else {
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
            {imageUrl && (
              <ImageWithRetry src={imageUrl} alt={journal.title} journal={journal} />
            )}
          </div>
        </Link>
      </div>
    );
  };

  if (loading) {
    return (
      <section className="journal-slider journal-slider--loading" aria-busy="true" aria-label="Loading journals">
        <div className="home-skeleton home-skeleton-hero w-full max-w-[100vw] min-h-[200px] sm:min-h-[280px] md:min-h-[360px]" />
      </section>
    );
  }

  if (journals.length === 0) return null;

  if (isMobile) {
    return (
      <section className="journal-slider journal-slider--mobile" aria-label="Slideshow">
        <div className="journal-slider__mobile-viewport" style={{ height: MOBILE_SLIDER_HEIGHT }}>
          <div
            className="journal-slider__mobile-track"
            style={{ transform: `translate3d(-${mobileIndex * 100}%, 0, 0)` }}
          >
            {journals.map((journal) => {
              const imageUrl = getImageUrl(journal);
              const journalUrl = journal.shortcode ? `/journals/${journal.shortcode}` : '#';
              return (
                <div key={journal.id} className="journal-slider__mobile-slide">
                  <Link href={journalUrl} className="journal-slider__mobile-slide-link">
                    <div className="journal-slider__mobile-slide-inner">
                      {imageUrl && (
                        <ImageWithRetry src={imageUrl} alt={journal.title} journal={journal} />
                      )}
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
          <div className="journal-slider__mobile-dots" role="tablist" aria-label="Slide indicators">
            {journals.map((_, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={i === mobileIndex}
                aria-label={`Go to slide ${i + 1}`}
                className={`journal-slider__mobile-dot ${i === mobileIndex ? 'journal-slider__mobile-dot--active' : ''}`}
                onClick={() => setMobileIndex(i)}
              />
            ))}
          </div>
        </div>
        <style jsx>{`
          .journal-slider--mobile {
            width: 100vw;
            max-width: 100vw;
            margin-left: calc(50% - 50vw);
            margin-right: calc(50% - 50vw);
            overflow: hidden;
            background: #f3f4f6;
            box-sizing: border-box;
          }
          .journal-slider__mobile-viewport {
            position: relative;
            width: 100%;
            overflow: hidden;
          }
          .journal-slider__mobile-track {
            display: flex;
            width: 100%;
            height: 100%;
            transition: transform 0.35s ease-out;
          }
          .journal-slider__mobile-slide {
            flex: 0 0 100%;
            width: 100%;
            min-width: 100%;
            height: 100%;
          }
          .journal-slider__mobile-slide-link {
            display: block;
            width: 100%;
            height: 100%;
            text-decoration: none;
          }
          .journal-slider__mobile-slide-inner {
            width: 100%;
            height: 100%;
            min-height: 180px;
            position: relative;
            background: #f3f4f6;
          }
          .journal-slider__mobile-slide-inner :global(.journal-slide__image),
          .journal-slider__mobile-slide-inner :global(img) {
            width: 100%;
            height: 100%;
            object-fit: contain;
            object-position: center;
            display: block;
          }
          .journal-slider__mobile-slide-inner :global(.journal-slide__placeholder) {
            position: absolute;
            inset: 0;
          }
          .journal-slider__mobile-dots {
            position: absolute;
            bottom: 8px;
            left: 0;
            right: 0;
            display: flex;
            justify-content: center;
            gap: 8px;
            z-index: 5;
          }
          .journal-slider__mobile-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            border: none;
            padding: 0;
            background: rgba(255,255,255,0.5);
            cursor: pointer;
            transition: background 0.2s;
          }
          .journal-slider__mobile-dot:hover {
            background: rgba(255,255,255,0.8);
          }
          .journal-slider__mobile-dot--active {
            background: #2563eb;
            width: 24px;
            border-radius: 4px;
          }
        `}</style>
      </section>
    );
  }

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
          width: 100% !important;
          max-width: 100% !important;
          height: 100%;
          object-fit: contain;
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

        :global(.p-carousel),
        :global(.custom-carousel) {
          position: relative !important;
        }

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
          .journal-slider__carousel-wrapper,
          :global(.p-carousel),
          :global(.p-carousel .p-carousel-content),
          :global(.p-carousel-items-container) {
            min-height: 140px !important;
          }
          .journal-slide__image-container {
            min-height: 140px !important;
          }
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
