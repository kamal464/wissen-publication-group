'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Article, Journal } from '@/types';
import { articleService, journalService } from '@/services/api';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { Paginator } from 'primereact/paginator';

type ArticlesResponse = {
  data: Article[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [journals, setJournals] = useState<Journal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJournal, setSelectedJournal] = useState<number | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('publishedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [recordsPerPage] = useState(10);

  // Fetch journals for filter
  useEffect(() => {
    const fetchJournals = async () => {
      try {
        const response = await journalService.getAll();
        setJournals(response.data as Journal[]);
      } catch (err) {
        console.error('Error fetching journals:', err);
      }
    };
    fetchJournals();
  }, []);

  const fetchArticles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params: any = {
        page: currentPage,
        limit: recordsPerPage,
        sortBy,
        sortOrder,
      };

      if (searchQuery) params.search = searchQuery;
      if (selectedJournal) params.journalId = selectedJournal;
      if (selectedStatus) params.status = selectedStatus;

      const response = await articleService.getAll(params);
      // Axios wraps the response in a 'data' property
      // Backend returns: { data: Article[], meta: {...} }
      // Axios makes it: response.data = { data: Article[], meta: {...} }
      const articlesData = response.data as ArticlesResponse;
      
      // Safely handle response data with defaults
      if (articlesData && articlesData.data && Array.isArray(articlesData.data)) {
        setArticles(articlesData.data);
        setTotalRecords(articlesData.meta?.total || 0);
      } else {
        // Handle unexpected response structure
        console.warn('Unexpected response structure:', articlesData);
        setArticles([]);
        setTotalRecords(0);
      }
    } catch (err: any) {
      console.error('Error fetching articles:', err);
      setError(err.response?.data?.message || 'Failed to load articles');
    } finally {
      setLoading(false);
    }
  }, [currentPage, recordsPerPage, searchQuery, selectedJournal, selectedStatus, sortBy, sortOrder]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchArticles();
  };

  const handleReset = () => {
    setSearchQuery('');
    setSelectedJournal(null);
    setSelectedStatus(null);
    setSortBy('publishedAt');
    setSortOrder('desc');
    setCurrentPage(1);
  };

  const onPageChange = (event: any) => {
    setCurrentPage(event.page + 1);
  };

  if (loading) {
    return (
      <>
        <Header />
        <main className="articles-page">
          <div className="container">
            <h1>Articles</h1>
            <p>Loading articles...</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <main className="articles-page">
          <div className="container">
            <h1>Articles</h1>
            <p className="error">{error}</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const statusOptions = [
    { label: 'All Status', value: null },
    { label: 'Published', value: 'PUBLISHED' },
    { label: 'Under Review', value: 'UNDER_REVIEW' },
    { label: 'Accepted', value: 'ACCEPTED' },
    { label: 'Pending', value: 'PENDING' },
  ];

  const sortOptions = [
    { label: 'Publication Date', value: 'publishedAt' },
    { label: 'Title', value: 'title' },
    { label: 'Submission Date', value: 'submittedAt' },
  ];

  const journalOptions = [
    { label: 'All Journals', value: null },
    ...journals.map(journal => ({ label: journal.title, value: journal.id }))
  ];

  return (
    <>
      <Header />
      <main className="articles-page">
        <div className="container">
          <div className="articles-page__header">
            <div>
              <h1>Published Articles</h1>
              <p className="subtitle">Browse our collection of peer-reviewed research articles</p>
            </div>
            <div className="articles-page__stats">
              <span className="articles-page__count">
                {totalRecords} {totalRecords === 1 ? 'Article' : 'Articles'} Found
              </span>
            </div>
          </div>

          {/* Search and Filter Section */}
          <div className="articles-page__filters">
            <div className="articles-page__search">
              <span className="p-input-icon-left" style={{ width: '100%' }}>
                <i className="pi pi-search" />
                <InputText
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by title, abstract, or author..."
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  style={{ width: '100%' }}
                />
              </span>
            </div>

            <div className="articles-page__filter-row">
              <Dropdown
                value={selectedJournal}
                options={journalOptions}
                onChange={(e) => setSelectedJournal(e.value)}
                placeholder="Filter by Journal"
                className="articles-page__filter"
              />

              <Dropdown
                value={selectedStatus}
                options={statusOptions}
                onChange={(e) => setSelectedStatus(e.value)}
                placeholder="Filter by Status"
                className="articles-page__filter"
              />

              <Dropdown
                value={sortBy}
                options={sortOptions}
                onChange={(e) => setSortBy(e.value)}
                placeholder="Sort By"
                className="articles-page__filter"
              />

              <Dropdown
                value={sortOrder}
                options={[
                  { label: '↓ Descending', value: 'desc' },
                  { label: '↑ Ascending', value: 'asc' },
                ]}
                onChange={(e) => setSortOrder(e.value)}
                className="articles-page__filter"
              />

              <Button
                label="Apply Filters"
                icon="pi pi-filter"
                onClick={handleSearch}
                className="p-button-primary"
              />

              <Button
                label="Reset"
                icon="pi pi-refresh"
                onClick={handleReset}
                className="p-button-outlined"
              />
            </div>
          </div>

          {/* Articles List */}
          {loading ? (
            <div className="articles-page__loading">
              <i className="pi pi-spin pi-spinner" style={{ fontSize: '2rem' }}></i>
              <p>Loading articles...</p>
            </div>
          ) : error ? (
            <div className="articles-page__error">
              <i className="pi pi-exclamation-triangle"></i>
              <p>{error}</p>
            </div>
          ) : articles.length === 0 ? (
            <div className="articles-page__empty">
              <i className="pi pi-inbox" style={{ fontSize: '3rem' }}></i>
              <h3>No Articles Found</h3>
              <p>Try adjusting your search or filters</p>
            </div>
          ) : (
            <>
              <div className="articles-list">
                {articles.map((article) => (
                  <article key={article.id} className="article-item">
                    <Link href={`/articles/${article.id}`} className="article-item__link">
                      <div className="article-item__header">
                        <h2 className="article-item__title">{article.title}</h2>
                        <span className={`article-item__status article-item__status--${article.status.toLowerCase()}`}>
                          {article.status.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="article-item__authors">
                        <i className="pi pi-users"></i>
                        {article.authors.map((author) => author.name).join(', ')}
                      </p>
                      <p className="article-item__abstract">
                        {article.abstract.substring(0, 250)}...
                      </p>
                      <div className="article-item__meta">
                        <span className="article-item__journal">
                          <i className="pi pi-book"></i>
                          {article.journal.title}
                        </span>
                        {article.publishedAt && (
                          <time className="article-item__date" dateTime={article.publishedAt}>
                            <i className="pi pi-calendar"></i>
                            {new Date(article.publishedAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </time>
                        )}
                      </div>
                    </Link>
                  </article>
                ))}
              </div>

              {/* Pagination */}
              <div className="articles-page__pagination">
                <Paginator
                  first={(currentPage - 1) * recordsPerPage}
                  rows={recordsPerPage}
                  totalRecords={totalRecords}
                  onPageChange={onPageChange}
                  template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport"
                  currentPageReportTemplate="Showing {first} to {last} of {totalRecords} articles"
                />
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
