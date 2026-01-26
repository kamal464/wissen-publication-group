'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { searchAPI } from '@/lib/api';

interface SearchResult {
  articles: any[];
  journals: any[];
  total: number;
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q') || '';
  
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setSearchResults(null);
      return;
    }

    const performSearch = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await searchAPI.globalSearch(query.trim());
        setSearchResults(response.data);
      } catch (err: any) {
        console.error('Search error:', err);
        setError(err.message || 'Failed to perform search. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    performSearch();
  }, [query]);

  if (!query || query.trim().length < 2) {
    return (
      <div className="search-page">
        <div className="search-page__container">
          <div className="search-page__empty">
            <i className="pi pi-search" />
            <h1>Search</h1>
            <p>Enter a search term to find journals, articles, and authors.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="search-page">
      <div className="search-page__container">
        <div className="search-page__header">
          <h1>Search Results</h1>
          <p className="search-page__query">
            Results for: <strong>&quot;{query}&quot;</strong>
          </p>
        </div>

        {isLoading && (
          <div className="search-page__loading">
            <i className="pi pi-spin pi-spinner" />
            <span>Searching...</span>
          </div>
        )}

        {error && (
          <div className="search-page__error">
            <i className="pi pi-exclamation-triangle" />
            <p>{error}</p>
          </div>
        )}

        {!isLoading && !error && searchResults && (
          <>
            {searchResults.total === 0 ? (
              <div className="search-page__no-results">
                <i className="pi pi-info-circle" />
                <h2>No results found</h2>
                <p>We couldn&apos;t find any journals or articles matching &quot;{query}&quot;.</p>
                <p>Try different keywords or check your spelling.</p>
              </div>
            ) : (
              <>
                {/* Journals Section */}
                {searchResults.journals.length > 0 && (
                  <section className="search-page__section">
                    <div className="search-page__section-header">
                      <i className="pi pi-book" />
                      <h2>
                        Journals <span className="search-page__count">({searchResults.journals.length})</span>
                      </h2>
                    </div>
                    <div className="search-page__results-grid">
                      {searchResults.journals.map((journal) => (
                        <Link
                          key={journal.id}
                          href={`/journals/${journal.shortcode || journal.id}`}
                          className="search-page__result-card search-page__result-card--journal"
                        >
                          <div className="search-page__result-card-content">
                            <h3 className="search-page__result-title">{journal.title}</h3>
                            {journal.description && (
                              <p className="search-page__result-description">
                                {journal.description.length > 200
                                  ? `${journal.description.substring(0, 200)}...`
                                  : journal.description}
                              </p>
                            )}
                            <div className="search-page__result-meta">
                              {journal.issn && (
                                <span className="search-page__result-meta-item">
                                  <i className="pi pi-tag" />
                                  ISSN: {journal.issn}
                                </span>
                              )}
                              {journal.publisher && (
                                <span className="search-page__result-meta-item">
                                  <i className="pi pi-building" />
                                  {journal.publisher}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="search-page__result-card-arrow">
                            <i className="pi pi-arrow-right" />
                          </div>
                        </Link>
                      ))}
                    </div>
                  </section>
                )}

                {/* Articles Section */}
                {searchResults.articles.length > 0 && (
                  <section className="search-page__section">
                    <div className="search-page__section-header">
                      <i className="pi pi-file" />
                      <h2>
                        Articles <span className="search-page__count">({searchResults.articles.length})</span>
                      </h2>
                    </div>
                    <div className="search-page__results-list">
                      {searchResults.articles.map((article) => (
                        <Link
                          key={article.id}
                          href={`/articles/${article.id}`}
                          className="search-page__result-card search-page__result-card--article"
                        >
                          <div className="search-page__result-card-content">
                            <h3 className="search-page__result-title">{article.title}</h3>
                            {article.abstract && (
                              <p className="search-page__result-description">
                                {article.abstract.length > 250
                                  ? `${article.abstract.substring(0, 250)}...`
                                  : article.abstract}
                              </p>
                            )}
                            <div className="search-page__result-meta">
                              {article.journal && (
                                <span className="search-page__result-meta-item">
                                  <i className="pi pi-book" />
                                  {article.journal.title}
                                </span>
                              )}
                              {article.authors && article.authors.length > 0 && (
                                <span className="search-page__result-meta-item">
                                  <i className="pi pi-users" />
                                  {article.authors.map((a: any) => a.name).join(', ')}
                                </span>
                              )}
                              {article.publishedAt && (
                                <span className="search-page__result-meta-item">
                                  <i className="pi pi-calendar" />
                                  {new Date(article.publishedAt).getFullYear()}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="search-page__result-card-arrow">
                            <i className="pi pi-arrow-right" />
                          </div>
                        </Link>
                      ))}
                    </div>
                  </section>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
