'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Article } from '@/types';
import { articleService } from '@/services/api';
import Breadcrumb, { BreadcrumbItem } from '@/components/Breadcrumb';
import RelatedArticles from '@/components/RelatedArticles';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function ArticleDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  
  const [article, setArticle] = useState<Article | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchArticleData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch article details
        const articleResponse = await articleService.getById(Number(id));
        setArticle(articleResponse.data as Article);

        // Fetch related articles
        const relatedResponse = await articleService.getRelated(Number(id), 5);
        setRelatedArticles(relatedResponse.data as Article[]);
      } catch (err: any) {
        console.error('Error fetching article:', err);
        setError(err.response?.data?.message || 'Failed to load article');
      } finally {
        setLoading(false);
      }
    };

    fetchArticleData();
  }, [id]);

  if (loading) {
    return (
      <>
        <Header />
        <main className="article-detail">
          <div className="container">
            <div className="article-detail__loading">Loading article...</div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (error || !article) {
    return (
      <>
        <Header />
        <main className="article-detail">
          <div className="container">
            <div className="article-detail__error">
              {error || 'Article not found'}
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Home', href: '/' },
    { label: 'Journals', href: '/journals' },
    { label: article.journal.title, href: `/journals/${article.journalId}` },
    { label: article.title },
  ];

  return (
    <>
      <Header />
      <main className="article-detail">
        <div className="container">
          <Breadcrumb items={breadcrumbItems} />

          <div className="article-detail__layout">
            <div className="article-detail__main">
            <article className="article">
              {/* Article Header */}
              <header className="article__header">
                <h1 className="article__title">{article.title}</h1>

                {/* Authors */}
                <div className="article__authors">
                  {article.authors.map((author, index) => (
                    <div key={author.id} className="article__author">
                      <span className="article__author-name">{author.name}</span>
                      {author.affiliation && (
                        <span className="article__author-affiliation">
                          {author.affiliation}
                        </span>
                      )}
                      {index < article.authors.length - 1 && ', '}
                    </div>
                  ))}
                </div>

                {/* Article Metadata */}
                <div className="article__metadata">
                  <div className="article__journal">
                    <span className="article__journal-label">Published in:</span>
                    <Link
                      href={`/journals/${article.journalId}`}
                      className="article__journal-link"
                    >
                      {article.journal.title}
                    </Link>
                    {article.journal.issn && (
                      <span className="article__journal-issn">
                        (ISSN: {article.journal.issn})
                      </span>
                    )}
                  </div>

                  {article.publishedAt && (
                    <time className="article__date" dateTime={article.publishedAt}>
                      Published:{' '}
                      {new Date(article.publishedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </time>
                  )}

                  <div className="article__status">
                    <span className={`article__status-badge article__status-badge--${article.status.toLowerCase()}`}>
                      {article.status}
                    </span>
                  </div>
                </div>
              </header>

              {/* Abstract Section */}
              <section className="article__section">
                <h2 className="article__section-title">Abstract</h2>
                <div className="article__abstract">
                  {article.abstract}
                </div>
              </section>

              {/* PDF Download Section */}
              {article.pdfUrl && (
                <section className="article__section article__download">
                  <h2 className="article__section-title">Download</h2>
                  <a
                    href={article.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="article__pdf-link"
                  >
                    <svg
                      className="article__pdf-icon"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M14 2v6h6M16 13H8M16 17H8M10 9H8"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    Download Full Article (PDF)
                  </a>
                </section>
              )}

              {/* Authors Details Section */}
              <section className="article__section">
                <h2 className="article__section-title">Author Information</h2>
                <div className="article__authors-details">
                  {article.authors.map((author) => (
                    <div key={author.id} className="article__author-detail">
                      <h3 className="article__author-detail-name">{author.name}</h3>
                      {author.affiliation && (
                        <p className="article__author-detail-affiliation">
                          {author.affiliation}
                        </p>
                      )}
                      <p className="article__author-detail-email">
                        <a href={`mailto:${author.email}`}>{author.email}</a>
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            </article>
            </div>

            {/* Sidebar with Related Articles */}
            <aside className="article-detail__sidebar">
              <RelatedArticles articles={relatedArticles} />
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
