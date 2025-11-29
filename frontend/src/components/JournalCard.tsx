import { memo } from 'react';
import Link from 'next/link';
import { Journal } from '@/types';

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
  const shortcode = journal.shortcode || '';
  const journalUrl = shortcode ? `/journals/${shortcode}` : '#';

  const getImageUrl = (imagePath: string | undefined) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    return `http://localhost:3001${imagePath}`;
  };

  // For list/grid view: use coverImage or flyerImage (not bannerImage - that's for detail page hero)
  // Priority: coverImage > flyerImage > placeholder
  const imageUrl = viewMode === 'grid' 
    ? (getImageUrl((journal as any).bannerImage) || getImageUrl(journal.coverImage) || getImageUrl((journal as any).flyerImage))
    : (getImageUrl(journal.coverImage) || getImageUrl((journal as any).flyerImage));

  return (
    <article
      className={`journal-card ${viewMode === 'grid' ? 'journal-card--grid' : 'journal-card--list'}`}
    >
      <Link href={journalUrl} className="journal-card__link">
        {/* Image Container - Side in list view (before title), Top in grid view */}
        <div className="journal-card__image-container">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={`${journal.title} ${viewMode === 'list' ? 'cover' : 'banner'}`}
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
            {subjectLabel && (
              <span
                className={`journal-card__category ${
                  subjectClass ? `journal-card__category--${subjectClass}` : ''
                }`.trim()}
              >
                {subjectLabel}
              </span>
            )}

            <h2 className="journal-card__title">
              {journal.title}
            </h2>

            <p className="journal-card__meta">
              {journal.publisher && <span>{journal.publisher}</span>}
              {journal.issn && (
                <>
                  {journal.publisher && ' • '}
                  <span>ISSN: {journal.issn}</span>
                </>
              )}
              {journal.accessType && (
                <>
                  {(journal.publisher || journal.issn) && ' • '}
                  <span>{journal.accessType}</span>
                </>
              )}
            </p>
          </header>

          {journal.description && (
            <p className="journal-card__description">{journal.description}</p>
          )}

          <footer className="journal-card__footer">
            <div className="journal-card__stats">
              {(journal.impactFactor || (journal as any).journalImpactFactor) && (
                <span title="Impact Factor">
                  <i className="pi pi-chart-line" aria-hidden="true" />
                  IF: {(journal as any).journalImpactFactor || journal.impactFactor}
                </span>
              )}
              {journal._count?.articles !== undefined && (
                <span title="Number of articles">
                  <i className="pi pi-file" aria-hidden="true" />
                  {journal._count.articles} article{journal._count.articles !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          </footer>
        </div>
      </Link>
    </article>
  );
});

export default JournalCard;
