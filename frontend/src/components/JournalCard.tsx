import { memo } from 'react';
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
  return (
    <article
      className={`journal-card ${viewMode === 'grid' ? 'journal-card--grid' : ''}`}
    >
      <div className="journal-card__image-container">
        {journal.coverImage ? (
          <img
            src={journal.coverImage}
            alt={`${journal.title} cover`}
            className="journal-card__image"
            loading="lazy"
            width={140}
            height={140}
          />
        ) : (
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
            {journal.impactFactor && (
              <span title="Impact Factor">
                <i className="pi pi-chart-line" aria-hidden="true" />
                IF: {journal.impactFactor}
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
    </article>
  );
});

export default JournalCard;
