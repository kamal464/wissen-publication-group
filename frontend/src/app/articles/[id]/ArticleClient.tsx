'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Article } from '@/types';
import { articleService } from '@/services/api';
import { adminAPI } from '@/lib/api';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { Editor } from 'primereact/editor';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dropdown } from 'primereact/dropdown';
import { TabView, TabPanel } from 'primereact/tabview';
import Breadcrumb, { BreadcrumbItem } from '@/components/Breadcrumb';
import RelatedArticles from '@/components/RelatedArticles';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import 'quill/dist/quill.snow.css';

interface ArticleEdit extends Omit<Article, 'authors' | 'abstract'> {
  articleType?: string;
  volumeNo?: string;
  issueNo?: string;
  issueMonth?: string;
  year?: string;
  specialIssue?: string;
  keywords?: string;
  firstPageNumber?: string;
  lastPageNumber?: string;
  correspondingAuthorDetails?: string;
  citeAs?: string;
  country?: string;
  receivedAt?: string;
  acceptedAt?: string;
  doi?: string;
  abstract?: string;
  heading1Title?: string;
  heading1Content?: string;
  heading2Title?: string;
  heading2Content?: string;
  heading3Title?: string;
  heading3Content?: string;
  heading4Title?: string;
  heading4Content?: string;
  heading5Title?: string;
  heading5Content?: string;
  authors?: Array<{ name: string; affiliation?: string; email?: string }>;
}

export default function ArticleDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params?.id as string;
  const isAdmin = searchParams?.get('admin') === 'true';
  const toast = useRef<Toast>(null);
  
  const [article, setArticle] = useState<Article | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<ArticleEdit | null>(null);
  const [saving, setSaving] = useState(false);

  // Dropdown options for edit dialog (only used when admin)
  const monthOptions = [
    { label: 'Select Month', value: '' },
    { label: 'January', value: 'January' },
    { label: 'February', value: 'February' },
    { label: 'March', value: 'March' },
    { label: 'April', value: 'April' },
    { label: 'May', value: 'May' },
    { label: 'June', value: 'June' },
    { label: 'July', value: 'July' },
    { label: 'August', value: 'August' },
    { label: 'September', value: 'September' },
    { label: 'October', value: 'October' },
    { label: 'November', value: 'November' },
    { label: 'December', value: 'December' }
  ];

  const yearOptions = Array.from({ length: 20 }, (_, i) => {
    const year = new Date().getFullYear() - i;
    return { label: year.toString(), value: year.toString() };
  });
  yearOptions.unshift({ label: 'Select Year', value: '' });

  const volumeOptions = Array.from({ length: 50 }, (_, i) => ({
    label: `Volume ${i + 1}`,
    value: (i + 1).toString()
  }));
  volumeOptions.unshift({ label: 'Select Volume', value: '' });

  const issueOptions = Array.from({ length: 12 }, (_, i) => ({
    label: `Issue ${i + 1}`,
    value: (i + 1).toString()
  }));
  issueOptions.unshift({ label: 'Select Issue', value: '' });

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    } catch {
      return dateString;
    }
  };

  const handleEdit = async () => {
    if (!article) return;
    try {
      const fullArticle = await adminAPI.getArticle(article.id);
      setSelectedArticle(fullArticle.data as ArticleEdit);
      setShowEditDialog(true);
    } catch (error: any) {
      console.error('Error loading article:', error);
      toast.current?.show({ 
        severity: 'error', 
        summary: 'Error', 
        detail: 'Failed to load article details' 
      });
    }
  };

  const handleSave = async () => {
    if (!selectedArticle || !article?.journalId) {
      toast.current?.show({ 
        severity: 'error', 
        summary: 'Error', 
        detail: 'Missing required data' 
      });
      return;
    }

    // Validate required fields
    if (!selectedArticle.title || !selectedArticle.title.trim()) {
      toast.current?.show({ severity: 'error', summary: 'Validation Error', detail: 'Article title is required' });
      return;
    }

    const volumeNo = String(selectedArticle.volumeNo || '').trim();
    if (!volumeNo) {
      toast.current?.show({ severity: 'error', summary: 'Validation Error', detail: 'Volume number is required' });
      return;
    }

    const issueNo = String(selectedArticle.issueNo || '').trim();
    if (!issueNo) {
      toast.current?.show({ severity: 'error', summary: 'Validation Error', detail: 'Issue number is required' });
      return;
    }

    const issueMonth = String(selectedArticle.issueMonth || '').trim();
    if (!issueMonth) {
      toast.current?.show({ severity: 'error', summary: 'Validation Error', detail: 'Issue month is required' });
      return;
    }

    const year = String(selectedArticle.year || '').trim();
    if (!year) {
      toast.current?.show({ severity: 'error', summary: 'Validation Error', detail: 'Year is required' });
      return;
    }

    if (!selectedArticle.authors || selectedArticle.authors.length === 0) {
      toast.current?.show({ severity: 'error', summary: 'Validation Error', detail: 'At least one author is required' });
      return;
    }

    try {
      setSaving(true);
      
      const formattedAuthors = selectedArticle.authors.map(author => ({
        name: author.name || '',
        email: author.email || '',
        affiliation: author.affiliation || ''
      }));

      const getPlainText = (html?: string) => {
        if (!html) return '';
        const tmp = document.createElement('DIV');
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || '';
      };

      const articleData = {
        title: selectedArticle.title,
        abstract: getPlainText(selectedArticle.abstract) || selectedArticle.title,
        authors: formattedAuthors,
        journalId: article.journalId,
        status: selectedArticle.status || 'PUBLISHED',
        pdfUrl: selectedArticle.pdfUrl,
        articleType: selectedArticle.articleType,
        keywords: getPlainText(selectedArticle.keywords),
        doi: selectedArticle.doi,
        volumeNo: selectedArticle.volumeNo ? String(selectedArticle.volumeNo).trim() : '',
        issueNo: selectedArticle.issueNo ? String(selectedArticle.issueNo).trim() : '',
        issueMonth: selectedArticle.issueMonth ? String(selectedArticle.issueMonth).trim() : '',
        year: selectedArticle.year ? String(selectedArticle.year).trim() : '',
        specialIssue: selectedArticle.specialIssue,
        firstPageNumber: selectedArticle.firstPageNumber,
        lastPageNumber: selectedArticle.lastPageNumber,
        correspondingAuthorDetails: getPlainText(selectedArticle.correspondingAuthorDetails),
        citeAs: getPlainText(selectedArticle.citeAs),
        country: selectedArticle.country,
        receivedAt: selectedArticle.receivedAt ? new Date(selectedArticle.receivedAt).toISOString() : undefined,
        acceptedAt: selectedArticle.acceptedAt ? new Date(selectedArticle.acceptedAt).toISOString() : undefined,
        publishedAt: selectedArticle.publishedAt ? new Date(selectedArticle.publishedAt).toISOString() : undefined,
        heading1Title: selectedArticle.heading1Title,
        heading1Content: selectedArticle.heading1Content,
        heading2Title: selectedArticle.heading2Title,
        heading2Content: selectedArticle.heading2Content,
        heading3Title: selectedArticle.heading3Title,
        heading3Content: selectedArticle.heading3Content,
        heading4Title: selectedArticle.heading4Title,
        heading4Content: selectedArticle.heading4Content,
        heading5Title: selectedArticle.heading5Title,
        heading5Content: selectedArticle.heading5Content,
      };

      await adminAPI.updateArticle(selectedArticle.id, articleData);
      toast.current?.show({ severity: 'success', summary: 'Success', detail: 'Article updated successfully' });
      setShowEditDialog(false);
      setSelectedArticle(null);
      
      // Reload article data
      const articleResponse = await articleService.getById(Number(id));
      setArticle(articleResponse.data as Article);
    } catch (error: any) {
      console.error('Error saving article:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to save article';
      toast.current?.show({ severity: 'error', summary: 'Error', detail: errorMessage });
    } finally {
      setSaving(false);
    }
  };

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
              <h1>Article Not Found</h1>
              <p>{error || 'The article you are looking for does not exist.'}</p>
              <Link href="/articles" className="btn btn--primary">
                Back to Articles
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Home', href: '/' },
    { label: 'Articles', href: '/articles' },
    { label: article.title, href: `/articles/${article.id}` },
  ];

  return (
    <>
      <Header />
      {isAdmin && <Toast ref={toast} />}
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

                  <div className="article__status" style={isAdmin ? { display: 'flex', alignItems: 'center', gap: '12px' } : {}}>
                    <span className={`article__status-badge article__status-badge--${article.status.toLowerCase()}`}>
                      {article.status}
                    </span>
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={handleEdit}
                        className="px-3 py-1.5 text-sm bg-yellow-50 text-yellow-700 border border-yellow-200 rounded hover:bg-yellow-100 transition-colors flex items-center gap-1"
                        title="Edit Article"
                      >
                        <i className="pi pi-pencil text-xs"></i>
                        <span>Edit</span>
                      </button>
                    )}
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

      {/* Edit Article Dialog - Only shown when accessed from admin */}
      {isAdmin && (
        <Dialog
          header="Edit Article"
          visible={showEditDialog}
          style={{ width: '90vw', maxWidth: '900px' }}
          contentStyle={{ maxHeight: 'calc(90vh - 120px)', overflow: 'auto' }}
          onHide={() => {
            setShowEditDialog(false);
            setSelectedArticle(null);
          }}
          footer={
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowEditDialog(false);
                  setSelectedArticle(null);
                }}
                disabled={saving}
                style={{
                  backgroundColor: '#f1f5f9',
                  color: '#475569',
                  border: '1px solid #cbd5e1',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  fontWeight: '500',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  opacity: saving ? 0.6 : 1
                }}
              >
                <i className="pi pi-times"></i>
                <span>Cancel</span>
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                style={{
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  fontWeight: '500',
                  cursor: saving ? 'wait' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  minWidth: '120px'
                }}
              >
                {saving ? <i className="pi pi-spin pi-spinner"></i> : <i className="pi pi-check"></i>}
                <span>{saving ? 'Saving...' : 'Submit'}</span>
              </button>
            </div>
          }
        >
          {selectedArticle && (
            <div className="flex flex-col gap-4 py-4">
              <TabView>
                <TabPanel header="Publication Details">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex flex-col">
                        <label className="block mb-2 text-sm font-medium text-gray-700">Volume No *</label>
                        <Dropdown
                          value={selectedArticle.volumeNo}
                          options={volumeOptions}
                          onChange={(e) => setSelectedArticle({ ...selectedArticle, volumeNo: e.value })}
                          className="w-full"
                          placeholder="Select Volume"
                        />
                      </div>
                      <div className="flex flex-col">
                        <label className="block mb-2 text-sm font-medium text-gray-700">Issue No *</label>
                        <Dropdown
                          value={selectedArticle.issueNo}
                          options={issueOptions}
                          onChange={(e) => setSelectedArticle({ ...selectedArticle, issueNo: e.value })}
                          className="w-full"
                          placeholder="Select Issue"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex flex-col">
                        <label className="block mb-2 text-sm font-medium text-gray-700">Issue Month *</label>
                        <Dropdown
                          value={selectedArticle.issueMonth}
                          options={monthOptions}
                          onChange={(e) => setSelectedArticle({ ...selectedArticle, issueMonth: e.value })}
                          className="w-full"
                          placeholder="Select Month"
                        />
                      </div>
                      <div className="flex flex-col">
                        <label className="block mb-2 text-sm font-medium text-gray-700">Year *</label>
                        <Dropdown
                          value={selectedArticle.year}
                          options={yearOptions}
                          onChange={(e) => setSelectedArticle({ ...selectedArticle, year: e.value })}
                          className="w-full"
                          placeholder="Select Year"
                        />
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <label className="block mb-2 text-sm font-medium text-gray-700">Article Type</label>
                      <InputText
                        value={selectedArticle.articleType || ''}
                        onChange={(e) => setSelectedArticle({ ...selectedArticle, articleType: e.target.value })}
                        className="w-full"
                        placeholder="Enter article type"
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="block mb-2 text-sm font-medium text-gray-700">Special Issue / Conference Proceedings title</label>
                      <InputText
                        value={selectedArticle.specialIssue || ''}
                        onChange={(e) => setSelectedArticle({ ...selectedArticle, specialIssue: e.target.value })}
                        className="w-full"
                        placeholder="Enter special issue or conference title"
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="block mb-2 text-sm font-medium text-gray-700">Article Title *</label>
                      <InputText
                        value={selectedArticle.title}
                        onChange={(e) => setSelectedArticle({ ...selectedArticle, title: e.target.value })}
                        className="w-full"
                        placeholder="Enter article title"
                      />
                    </div>
                  </div>
                </TabPanel>

                <TabPanel header="Authors">
                  <div className="space-y-4">
                    <div className="flex flex-col">
                      <label className="block mb-2 text-sm font-medium text-gray-700">Enter Author Names *</label>
                      <Editor
                        value={selectedArticle.authors ? selectedArticle.authors.map(a => a.name).join(', ') : ''}
                        onTextChange={(e) => {
                          const authorNames = e.htmlValue?.replace(/<[^>]*>/g, '').split(',').map(name => name.trim()).filter(Boolean) || [];
                          setSelectedArticle({
                            ...selectedArticle,
                            authors: authorNames.map(name => ({ 
                              name, 
                              email: '', 
                              affiliation: '' 
                            }))
                          });
                        }}
                        style={{ height: '200px' }}
                        placeholder="Enter author names..."
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="block mb-2 text-sm font-medium text-gray-700">Enter Author Affiliations *</label>
                      <Editor
                        value={selectedArticle.authors ? selectedArticle.authors.map(a => a.affiliation || '').join(', ') : ''}
                        onTextChange={(e) => {
                          const affiliations = e.htmlValue?.replace(/<[^>]*>/g, '').split(',').map(aff => aff.trim()) || [];
                          setSelectedArticle({
                            ...selectedArticle,
                            authors: selectedArticle.authors?.map((a, i) => ({ 
                              ...a, 
                              affiliation: affiliations[i] || '' 
                            })) || []
                          });
                        }}
                        style={{ height: '200px' }}
                        placeholder="Enter author affiliations..."
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="block mb-2 text-sm font-medium text-gray-700">Enter Author Emails</label>
                      <InputTextarea
                        value={selectedArticle.authors ? selectedArticle.authors.map(a => a.email || '').join(', ') : ''}
                        onChange={(e) => {
                          const emails = e.target.value.split(',').map(email => email.trim()).filter(Boolean);
                          setSelectedArticle({
                            ...selectedArticle,
                            authors: selectedArticle.authors?.map((a, i) => ({ 
                              ...a, 
                              email: emails[i] || '' 
                            })) || []
                          });
                        }}
                        rows={3}
                        className="w-full"
                        placeholder="Enter author emails separated by commas"
                      />
                    </div>
                  </div>
                </TabPanel>

                <TabPanel header="Content">
                  <div className="space-y-4">
                    <div className="flex flex-col">
                      <label className="block mb-2 text-sm font-medium text-gray-700">Keywords *</label>
                      <Editor
                        value={selectedArticle.keywords || ''}
                        onTextChange={(e) => setSelectedArticle({ ...selectedArticle, keywords: e.htmlValue || '' })}
                        style={{ height: '150px' }}
                        placeholder="Separate keywords with commas"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex flex-col">
                        <label className="block mb-2 text-sm font-medium text-gray-700">First Page Number *</label>
                        <InputText
                          value={selectedArticle.firstPageNumber || ''}
                          onChange={(e) => setSelectedArticle({ ...selectedArticle, firstPageNumber: e.target.value })}
                          className="w-full"
                          placeholder="Enter first page number"
                        />
                      </div>
                      <div className="flex flex-col">
                        <label className="block mb-2 text-sm font-medium text-gray-700">Last Page Number *</label>
                        <InputText
                          value={selectedArticle.lastPageNumber || ''}
                          onChange={(e) => setSelectedArticle({ ...selectedArticle, lastPageNumber: e.target.value })}
                          className="w-full"
                          placeholder="Enter last page number"
                        />
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <label className="block mb-2 text-sm font-medium text-gray-700">DOI Number</label>
                      <InputText
                        value={selectedArticle.doi || ''}
                        onChange={(e) => setSelectedArticle({ ...selectedArticle, doi: e.target.value })}
                        className="w-full"
                        placeholder="Enter DOI number"
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="block mb-2 text-sm font-medium text-gray-700">Abstract</label>
                      <Editor
                        value={selectedArticle.abstract || ''}
                        onTextChange={(e) => setSelectedArticle({ ...selectedArticle, abstract: e.htmlValue || '' })}
                        style={{ height: '250px' }}
                        placeholder="Enter abstract..."
                      />
                    </div>
                  </div>
                </TabPanel>

                <TabPanel header="Additional Details">
                  <div className="space-y-4">
                    <div className="flex flex-col">
                      <label className="block mb-2 text-sm font-medium text-gray-700">Enter Corresponding Author Details *</label>
                      <Editor
                        value={selectedArticle.correspondingAuthorDetails || ''}
                        onTextChange={(e) => setSelectedArticle({ ...selectedArticle, correspondingAuthorDetails: e.htmlValue || '' })}
                        style={{ height: '200px' }}
                        placeholder="Enter corresponding author details..."
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="block mb-2 text-sm font-medium text-gray-700">Cite this article as *</label>
                      <Editor
                        value={selectedArticle.citeAs || ''}
                        onTextChange={(e) => setSelectedArticle({ ...selectedArticle, citeAs: e.htmlValue || '' })}
                        style={{ height: '200px' }}
                        placeholder="Enter citation format..."
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="block mb-2 text-sm font-medium text-gray-700">Country</label>
                      <InputText
                        value={selectedArticle.country || ''}
                        onChange={(e) => setSelectedArticle({ ...selectedArticle, country: e.target.value })}
                        className="w-full"
                        placeholder="Enter country"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="flex flex-col">
                        <label className="block mb-2 text-sm font-medium text-gray-700">Received on Date</label>
                        <InputText
                          type="date"
                          value={selectedArticle.receivedAt ? formatDate(selectedArticle.receivedAt) : ''}
                          onChange={(e) => setSelectedArticle({ ...selectedArticle, receivedAt: e.target.value })}
                          className="w-full"
                        />
                      </div>
                      <div className="flex flex-col">
                        <label className="block mb-2 text-sm font-medium text-gray-700">Accepted on Date</label>
                        <InputText
                          type="date"
                          value={selectedArticle.acceptedAt ? formatDate(selectedArticle.acceptedAt) : ''}
                          onChange={(e) => setSelectedArticle({ ...selectedArticle, acceptedAt: e.target.value })}
                          className="w-full"
                        />
                      </div>
                      <div className="flex flex-col">
                        <label className="block mb-2 text-sm font-medium text-gray-700">Published on Date</label>
                        <InputText
                          type="date"
                          value={selectedArticle.publishedAt ? formatDate(selectedArticle.publishedAt) : ''}
                          onChange={(e) => setSelectedArticle({ ...selectedArticle, publishedAt: e.target.value })}
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>
                </TabPanel>

                {selectedArticle.id !== 0 && (
                  <TabPanel header="Article Content">
                    <div className="space-y-6">
                      {[1, 2, 3, 4, 5].map((num) => (
                        <div key={num} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex flex-col mb-4">
                            <label className="block mb-2 text-sm font-medium text-gray-700">Heading {num} Title</label>
                            <InputText
                              value={selectedArticle[`heading${num}Title` as keyof ArticleEdit] as string || ''}
                              onChange={(e) => setSelectedArticle({ ...selectedArticle, [`heading${num}Title`]: e.target.value } as any)}
                              className="w-full"
                              placeholder={`Enter heading ${num} title`}
                            />
                          </div>
                          <div className="flex flex-col">
                            <label className="block mb-2 text-sm font-medium text-gray-700">Heading {num} Content</label>
                            <Editor
                              value={selectedArticle[`heading${num}Content` as keyof ArticleEdit] as string || ''}
                              onTextChange={(e) => setSelectedArticle({ ...selectedArticle, [`heading${num}Content`]: e.htmlValue || '' } as any)}
                              style={{ height: '200px' }}
                              placeholder={`Enter heading ${num} content...`}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabPanel>
                )}
              </TabView>
            </div>
          )}
        </Dialog>
      )}
    </>
  );
}

