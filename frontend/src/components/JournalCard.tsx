import { memo, useState } from 'react';
import Link from 'next/link';
import { Journal } from '@/types';
import { getFileUrl } from '@/lib/apiConfig';

interface JournalCardProps {
  journal: Journal;
  viewMode: 'list' | 'grid';
  subjectLabel: string;
  subjectClass: string;
}

const JournalCard = memo(function JournalCard({
  journal,
  viewMode,
  subjectLabel,
  subjectClass,
}: JournalCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const shortcode = journal.shortcode || '';
  const journalUrl = shortcode ? `/journals/${shortcode}` : '#';

  const getImageUrl = (imagePath: string | undefined) => {
    if (!imagePath) return null;
    return getFileUrl(imagePath);
  };

  // For list/grid view: use coverImage or flyerImage (not bannerImage - that's for detail page hero)
  // Priority: coverImage > flyerImage > placeholder
  const imageUrl = viewMode === 'grid' 
    ? (getImageUrl(journal.bannerImage) || getImageUrl(journal.coverImage) || getImageUrl(journal.flyerImage))
    : (getImageUrl(journal.coverImage) || getImageUrl(journal.flyerImage));

  const hasContent = !!(journal.homePageContent || journal.aimsScope || journal.guidelines);

  // Determine initial active tab based on available content
  const getInitialTab = (): 'home' | 'aims' | 'guidelines' => {
    if (journal.homePageContent) return 'home';
    if (journal.aimsScope) return 'aims';
    if (journal.guidelines) return 'guidelines';
    return 'home';
  };

  const [activeTab, setActiveTab] = useState<'home' | 'aims' | 'guidelines'>(getInitialTab());

  const handleExpandClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsExpanded(!isExpanded);
    // Reset to initial tab when expanding
    if (!isExpanded) {
      setActiveTab(getInitialTab());
    }
  };

  return (
    <article
      className={`journal-card ${viewMode === 'grid' ? 'journal-card--grid' : 'journal-card--list'}`}
    >
      <div className="journal-card__wrapper">
        {/* Image Container - Left side in grid view */}
        <div className="journal-card__image-container">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={`${journal.title} cover`}
              className="journal-card__image"
              loading="lazy"
              onError={(e) => {
                // Fallback to placeholder on error
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const placeholder = target.parentElement?.querySelector('.journal-card__image--placeholder');
                if (placeholder) {
                  (placeholder as HTMLElement).style.display = 'flex';
                }
              }}
            />
          ) : null}
          {!imageUrl && (
            <div
              className={`journal-card__image journal-card__image--placeholder ${
                subjectClass ? `journal-card__image--${subjectClass}` : ''
              }`.trim()}
              aria-hidden="true"
            >
              {journal.title?.charAt(0).toUpperCase() ?? 'J'}
            </div>
          )}
        </div>

        <div className="journal-card__content">
          <header className="journal-card__header">
            <h2 className="journal-card__title">
              {journal.title}
            </h2>
            
            {journal.content && (
              <div className="journal-card__description" style={{ marginTop: '0.5rem', marginBottom: '0.75rem' }}>
                {journal.content}
              </div>
            )}
            
            <div className="journal-card__info">
              {(journal as any).doi && (
                <div className="journal-card__info-item">
                  <span className="journal-card__info-label">DOI:</span>
                  <span className="journal-card__info-value">{(journal as any).doi}</span>
                </div>
              )}
              {((journal as any).email || (journal as any).contactEmail || (journal as any).editorEmail) && (
                <div className="journal-card__info-item">
                  <span className="journal-card__info-label">Email:</span>
                  <span className="journal-card__info-value">
                    <i className="pi pi-envelope journal-card__info-icon"></i>
                    {(journal as any).email || (journal as any).contactEmail || (journal as any).editorEmail}
                  </span>
                </div>
              )}
            </div>
          </header>

          <footer className="journal-card__footer">
            <div className="journal-card__actions">
              <Link 
                href={`/submit-manuscript${shortcode ? `?journal=${shortcode}` : ''}`}
                className="journal-card__action-btn journal-card__action-btn--submit"
                onClick={(e) => e.stopPropagation()}
              >
                <i className="pi pi-pencil"></i>
                <span>Submit Manuscript</span>
              </Link>
              <Link 
                href={journalUrl}
                className="journal-card__action-btn journal-card__action-btn--read"
                onClick={(e) => e.stopPropagation()}
              >
                <i className="pi pi-external-link"></i>
                <span>Read More...</span>
              </Link>
            </div>
          </footer>
        </div>
      </div>

      {/* Expandable Content Section */}
      {isExpanded && hasContent && (
        <div className="journal-card__expanded-content" onClick={(e) => e.stopPropagation()}>
          {/* Tabs */}
          <div className="journal-card__tabs">
            {journal.homePageContent && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setActiveTab('home');
                }}
                className={`journal-card__tab ${activeTab === 'home' ? 'journal-card__tab--active' : ''}`}
              >
                <i className="pi pi-home"></i>
                <span>Homepage</span>
              </button>
            )}
            {journal.aimsScope && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setActiveTab('aims');
                }}
                className={`journal-card__tab ${activeTab === 'aims' ? 'journal-card__tab--active' : ''}`}
              >
                <i className="pi pi-compass"></i>
                <span>Aims & Scope</span>
              </button>
            )}
            {journal.guidelines && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setActiveTab('guidelines');
                }}
                className={`journal-card__tab ${activeTab === 'guidelines' ? 'journal-card__tab--active' : ''}`}
              >
                <i className="pi pi-info-circle"></i>
                <span>Guidelines</span>
              </button>
            )}
          </div>

          {/* Tab Content */}
          <div className="journal-card__tab-content">
            {activeTab === 'home' && journal.homePageContent && (
              <div 
                className="journal-card__content-text"
                dangerouslySetInnerHTML={{ __html: journal.homePageContent }}
              />
            )}
            {activeTab === 'aims' && journal.aimsScope && (
              <div 
                className="journal-card__content-text"
                dangerouslySetInnerHTML={{ __html: journal.aimsScope }}
              />
            )}
            {activeTab === 'guidelines' && journal.guidelines && (
              <div 
                className="journal-card__content-text"
                dangerouslySetInnerHTML={{ __html: journal.guidelines }}
              />
            )}
          </div>

          {/* View Full Journal Link */}
          <div className="journal-card__view-full">
            <Link 
              href={journalUrl}
              className="journal-card__view-full-link"
              onClick={(e) => e.stopPropagation()}
            >
              <i className="pi pi-external-link"></i>
              <span>View Full Journal Page</span>
            </Link>
          </div>
        </div>
      )}
    </article>
  );
});

export default JournalCard;
