'use client';

import { useState, useEffect, useRef } from 'react';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { Editor } from 'primereact/editor';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dropdown } from 'primereact/dropdown';
import { TabView, TabPanel } from 'primereact/tabview';
import { adminAPI } from '@/lib/api';
import { loadJournalData } from '@/lib/journalAdminUtils';
import 'quill/dist/quill.snow.css';

interface Article {
  id: number;
  title: string;
  publishedAt?: string;
  volumeNo?: string;
  issueNo?: string;
  issueMonth?: string;
  year?: string;
  abstract?: string;
  status?: string;
  articleType?: string;
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
  pdfUrl?: string;
  authors?: Array<{ name: string; affiliation?: string; email?: string }>;
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
}

interface ArchiveIssue {
  volume: string;
  issue: string;
  year: number;
  articleCount: number;
  articles: Article[];
}

export default function ArchivePage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [archiveIssues, setArchiveIssues] = useState<Map<number, ArchiveIssue[]>>(new Map());
  const [expandedYears, setExpandedYears] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [journalId, setJournalId] = useState<number | null>(null);
  const [journalTitle, setJournalTitle] = useState<string>('');
  const [selectedIssue, setSelectedIssue] = useState<ArchiveIssue | null>(null);
  const [showArticlesDialog, setShowArticlesDialog] = useState(false);
  const [selectedIssueForBreadcrumb, setSelectedIssueForBreadcrumb] = useState<{year: number, volume: string, issue: string} | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [showArticleView, setShowArticleView] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [saving, setSaving] = useState(false);
  const toast = useRef<Toast>(null);

  // Dropdown options for edit dialog
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

  const handleArticleClick = async (articleId: number, issue: ArchiveIssue) => {
    try {
      setSelectedIssueForBreadcrumb({
        year: issue.year,
        volume: issue.volume,
        issue: issue.issue
      });
      const articleResponse = await adminAPI.getArticle(articleId);
      setSelectedArticle(articleResponse.data as Article);
      setShowArticleView(true);
    } catch (error: any) {
      console.error('Error loading article:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load article details'
      });
    }
  };

  const handleBackToArchive = () => {
    setShowArticleView(false);
    setSelectedArticle(null);
    setSelectedIssueForBreadcrumb(null);
  };

  const handleEdit = async () => {
    if (!selectedArticle) return;
    try {
      const fullArticle = await adminAPI.getArticle(selectedArticle.id);
      setSelectedArticle(fullArticle.data as Article);
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
    if (!selectedArticle || !journalId) {
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
        journalId: journalId,
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
      await loadJournalAndArticles();
      // Reload article with updated data
      const updatedArticle = await adminAPI.getArticle(selectedArticle.id);
      setSelectedArticle(updatedArticle.data as Article);
    } catch (error: any) {
      console.error('Error saving article:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to save article';
      toast.current?.show({ severity: 'error', summary: 'Error', detail: errorMessage });
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    loadJournalAndArticles();
  }, []);

  const loadJournalAndArticles = async () => {
    try {
      setLoading(true);
      const journalData = await loadJournalData();
      
      if (!journalData) {
        toast.current?.show({ 
          severity: 'error', 
          summary: 'Error', 
          detail: 'Failed to load journal data. Please check console for details.' 
        });
        setLoading(false);
        return;
      }

      setJournalId(journalData.journalId);
      setJournalTitle(journalData.journalTitle);
      
      console.log('Loading articles for journal:', journalData.journalId);
      // Fetch all articles (ACCEPTED and PUBLISHED) - show in archive immediately after creation
      const articlesResponse = await adminAPI.getArticles({ 
        journalId: journalData.journalId
        // No status filter - get all articles with volume/issue info
      });
      console.log('Articles response:', articlesResponse);
      const allArticles = (articlesResponse.data as any[]) || [];
      setArticles(allArticles);
      
      // Organize articles by year and volume/issue
      const issuesByYear = new Map<number, ArchiveIssue[]>();
      
      allArticles.forEach((article: any) => {
        // Use year from article, or derive from publishedAt or acceptedAt
        let year: number;
        if (article.year) {
          year = parseInt(String(article.year));
        } else if (article.publishedAt) {
          const publishedDate = new Date(article.publishedAt);
          year = publishedDate.getFullYear();
        } else if (article.acceptedAt) {
          const acceptedDate = new Date(article.acceptedAt);
          year = acceptedDate.getFullYear();
        } else {
          return; // Skip articles without year info
        }
        
        // Volume and Issue are now required fields, but provide fallback for existing articles
        // Ensure they are strings (handle numbers from dropdowns)
        const volume = article.volumeNo ? String(article.volumeNo) : '1';
        const issue = article.issueNo ? String(article.issueNo) : '1';
        
        // Skip if volume or issue is missing (shouldn't happen for new articles)
        if (!volume || !issue || volume === 'undefined' || issue === 'undefined') {
          console.warn('Article missing volume or issue:', article.id, article.title);
          return;
        }
        
        if (!issuesByYear.has(year)) {
          issuesByYear.set(year, []);
          setExpandedYears(prev => new Set(prev).add(year));
        }
        
        const yearIssues = issuesByYear.get(year)!;
        const existingIssue = yearIssues.find(
          i => i.volume === volume && i.issue === issue
        );
        
        if (existingIssue) {
          existingIssue.articleCount++;
          existingIssue.articles.push(article);
        } else {
          yearIssues.push({
            volume,
            issue,
            year,
            articleCount: 1,
            articles: [article]
          });
        }
      });
      
      // Sort issues within each year (descending - newest first)
      issuesByYear.forEach((issues, year) => {
        issues.sort((a, b) => {
          // Ensure volumes and issues are strings, then convert to numbers for comparison
          const volA = parseInt(String(a.volume || '0'));
          const volB = parseInt(String(b.volume || '0'));
          const volCompare = volB - volA;
          if (volCompare !== 0) return volCompare;
          
          const issueA = parseInt(String(a.issue || '0'));
          const issueB = parseInt(String(b.issue || '0'));
          return issueB - issueA;
        });
      });
      
      setArchiveIssues(issuesByYear);
    } catch (error: any) {
      console.error('=== ERROR loading archive ===', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      const errorMessage = error.response?.data?.message || error.message || 'Failed to load archive';
      toast.current?.show({ severity: 'error', summary: 'Error', detail: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const toggleYear = (year: number) => {
    setExpandedYears(prev => {
      const newSet = new Set(prev);
      if (newSet.has(year)) {
        newSet.delete(year);
      } else {
        newSet.add(year);
      }
      return newSet;
    });
  };

  const getYears = () => {
    return Array.from(archiveIssues.keys()).sort((a, b) => b - a);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <i className="pi pi-spin pi-spinner text-4xl text-blue-600 mb-4"></i>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const years = getYears();

  return (
    <>
      <Toast ref={toast} />
      
      {/* Show article view if article is selected */}
      {showArticleView && selectedArticle ? (
        <div className="min-h-screen bg-slate-50 p-4 sm:p-8">
          {/* Back Button and Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <button
                type="button"
                onClick={handleBackToArchive}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors flex items-center gap-2"
              >
                <i className="pi pi-arrow-left"></i>
                <span>Back to Archive</span>
              </button>
              
              {/* Edit Button in Top Right */}
              <button
                type="button"
                onClick={handleEdit}
                className="px-4 py-2 bg-blue-600 text-black rounded hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium shadow-md"
                title="Edit Article"
              >
                <i className="pi pi-pencil"></i>
                <span>Edit</span>
              </button>
            </div>
            
            <div className="mb-4">
              {journalTitle && (
                <div className="mb-2">
                  <span className="text-sm text-gray-600">Journal: </span>
                  <span className="text-xl font-bold text-slate-800">{journalTitle}</span>
                  {selectedIssueForBreadcrumb && (
                    <span className="text-sm text-gray-600 ml-2">
                      / {selectedIssueForBreadcrumb.year}-{selectedIssueForBreadcrumb.volume}-{selectedIssueForBreadcrumb.issue}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Full Article View */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <article className="article">
              {/* Article Header */}
              <header className="article__header border-b-2 border-gray-200 pb-6 mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">{selectedArticle.title}</h1>

                {/* Authors */}
                {selectedArticle.authors && selectedArticle.authors.length > 0 && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                      {selectedArticle.authors.map((author, index) => (
                        <div key={index} className="flex flex-col">
                          <span className="font-semibold text-gray-900">{author.name}</span>
                          {author.affiliation && (
                            <span className="text-sm text-gray-600 italic">
                              {author.affiliation}
                            </span>
                          )}
                          {index < selectedArticle.authors!.length - 1 && <span className="mx-2">,</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Article Metadata */}
                <div className="flex flex-wrap gap-6 text-sm text-gray-600">
                  <div>
                    <span className="font-semibold">Published in: </span>
                    <span className="text-blue-600">{journalTitle}</span>
                  </div>
                  {selectedArticle.publishedAt && (
                    <div>
                      <span className="font-semibold">Published: </span>
                      {new Date(selectedArticle.publishedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </div>
                  )}
                  {selectedArticle.status && (
                    <div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        selectedArticle.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' :
                        selectedArticle.status === 'ACCEPTED' ? 'bg-blue-100 text-blue-800' :
                        selectedArticle.status === 'UNDER_REVIEW' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {selectedArticle.status}
                      </span>
                    </div>
                  )}
                  {selectedArticle.volumeNo && selectedArticle.issueNo && (
                    <div>
                      <span className="font-semibold">Volume {selectedArticle.volumeNo}, Issue {selectedArticle.issueNo}</span>
                      {selectedArticle.issueMonth && <span> ({selectedArticle.issueMonth} {selectedArticle.year})</span>}
                    </div>
                  )}
                </div>
              </header>

              {/* Abstract Section */}
              {selectedArticle.abstract && (
                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Abstract</h2>
                  <div className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: selectedArticle.abstract }} />
                </section>
              )}

              {/* PDF Download Section */}
              {selectedArticle.pdfUrl && (
                <section className="mb-8 border-t border-gray-200 pt-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Download</h2>
                  <a
                    href={selectedArticle.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="text-white"
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
              {selectedArticle.authors && selectedArticle.authors.length > 0 && (
                <section className="border-t border-gray-200 pt-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Author Information</h2>
                  <div className="space-y-4">
                    {selectedArticle.authors.map((author, index) => (
                      <div key={index} className="border-l-4 border-blue-600 pl-4">
                        <h3 className="text-lg font-semibold text-gray-900">{author.name}</h3>
                        {author.affiliation && (
                          <p className="text-gray-600 mt-1">{author.affiliation}</p>
                        )}
                        {author.email && (
                          <p className="text-blue-600 mt-1">
                            <a href={`mailto:${author.email}`}>{author.email}</a>
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </article>
          </div>
        </div>
      ) : (
        /* Archive List View */
        <div className="min-h-screen bg-slate-50 p-4 sm:p-8">

          <div className="mb-6 flex items-center justify-between">
            <div>
              {journalTitle && (
                <div className="mb-2">
                  <span className="text-sm text-gray-600">Journal: </span>
                  <span className="text-xl font-bold text-slate-800">{journalTitle}</span>
                  {selectedIssueForBreadcrumb && (
                    <span className="text-sm text-gray-600 ml-2">
                      / {selectedIssueForBreadcrumb.year}-{selectedIssueForBreadcrumb.volume}-{selectedIssueForBreadcrumb.issue}
                    </span>
                  )}
                </div>
              )}
              <h1 className="text-3xl font-bold text-slate-800 mb-2 flex items-center gap-3">
                <i className="pi pi-folder-open text-blue-600"></i>
                <span>Archive</span>
              </h1>
              <p className="text-slate-600">Browse archived issues by year</p>
            </div>
          </div>

      {years.length > 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Archive Page: {journalTitle}
          </h1>
          
          {/* Two Column Layout for Years */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {years.map((year) => {
              const issues = archiveIssues.get(year) || [];
              const isExpanded = expandedYears.has(year);
              
              return (
                <div key={year} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  {/* Year Header */}
                  <div className="bg-gray-700 text-white px-4 py-3 font-semibold">
                    Year: {year}
                  </div>
                  
                  {/* Issues Buttons - Display in 3 columns like the image */}
                  {isExpanded && (
                    <div className="p-4 bg-white">
                      <div className="grid grid-cols-3 gap-2">
                        {issues.map((issue, index) => {
                          // Ensure volume and issue are strings to avoid [object Object]
                          const volumeStr = String(issue.volume || '');
                          const issueStr = String(issue.issue || '');
                          // Get month from first article in this issue
                          const firstArticle = issue.articles && issue.articles.length > 0 ? issue.articles[0] : null;
                          const issueMonth = firstArticle?.issueMonth || '';
                          
                          return (
                            <button
                              key={`${volumeStr}-${issueStr}-${index}`}
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                // Set selected issue for breadcrumb display
                                setSelectedIssueForBreadcrumb({
                                  year: issue.year,
                                  volume: volumeStr,
                                  issue: issueStr
                                });
                                // Open article in dialog on same page (no navigation)
                                if (firstArticle && firstArticle.id) {
                                  handleArticleClick(firstArticle.id, issue);
                                } else {
                                  toast.current?.show({
                                    severity: 'warn',
                                    summary: 'No Article',
                                    detail: 'No articles found for this issue'
                                  });
                                }
                              }}
                              className={`px-4 py-2 rounded-lg border-2 transition-all text-sm ${
                                selectedIssue?.volume === volumeStr && selectedIssue?.issue === issueStr
                                  ? 'bg-gray-700 text-white border-gray-700'
                                  : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                              }`}
                            >
                              Volume {volumeStr}, Issue {issueStr}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <i className="pi pi-folder-open text-6xl text-gray-300 mb-4"></i>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No Archive Available</h3>
          <p className="text-gray-500">There are currently no archived issues for this journal.</p>
        </div>
      )}
      </div>
      )}

      {/* Edit Article Dialog - Available in both views */}
      <Dialog
        header="Edit Article"
        visible={showEditDialog}
        style={{ width: '90vw', maxWidth: '900px' }}
        contentStyle={{ maxHeight: 'calc(90vh - 120px)', overflow: 'auto' }}
        onHide={() => {
          setShowEditDialog(false);
        }}
        footer={
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setShowEditDialog(false);
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
                            value={selectedArticle[`heading${num}Title` as keyof Article] as string || ''}
                            onChange={(e) => setSelectedArticle({ ...selectedArticle, [`heading${num}Title`]: e.target.value } as any)}
                            className="w-full"
                            placeholder={`Enter heading ${num} title`}
                          />
                        </div>
                        <div className="flex flex-col">
                          <label className="block mb-2 text-sm font-medium text-gray-700">Heading {num} Content</label>
                          <Editor
                            value={selectedArticle[`heading${num}Content` as keyof Article] as string || ''}
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
    </>
  );
}
