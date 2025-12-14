'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dropdown } from 'primereact/dropdown';
import { Editor } from 'primereact/editor';
import { TabView, TabPanel } from 'primereact/tabview';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { adminAPI } from '@/lib/api';
import { loadJournalData } from '@/lib/journalAdminUtils';
import 'quill/dist/quill.snow.css';

interface Article {
  id: number;
  title: string;
  abstract?: string;
  status: string;
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
  publishedAt?: string;
  authors?: Array<{ name: string; affiliation?: string; email?: string }>;
  pdfUrl?: string;
  doi?: string;
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

export default function ArchiveIssuePage() {
  const searchParams = useSearchParams();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [journalId, setJournalId] = useState<number | null>(null);
  const [journalTitle, setJournalTitle] = useState<string>('');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [saving, setSaving] = useState(false);
  const [movingToInpress, setMovingToInpress] = useState(false);
  const [selectedArticles, setSelectedArticles] = useState<Set<number>>(new Set());
  const toast = useRef<Toast>(null);

  const volume = searchParams.get('volume') || '';
  const issue = searchParams.get('issue') || '';
  const year = searchParams.get('year') || '';

  const articleTypes = [
    { label: 'Select Article Type', value: null },
    { label: 'Research Article', value: 'Research Article' },
    { label: 'Review Article', value: 'Review Article' },
    { label: 'Case Report', value: 'Case Report' },
    { label: 'Mini Review', value: 'Mini Review' },
    { label: 'Short Communication', value: 'Short Communication' }
  ];

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

  const currentYear = new Date().getFullYear();
  const startYear = 2040;
  const endYear = currentYear - 20; // Go back 20 years from current
  const yearOptions = Array.from({ length: startYear - endYear + 1 }, (_, i) => {
    const year = startYear - i;
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

  useEffect(() => {
    loadJournalAndArticles();
    // Clear selections when volume/issue/year changes
    setSelectedArticles(new Set());
  }, [volume, issue, year]);

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
        return;
      }

      setJournalId(journalData.journalId);
      setJournalTitle(journalData.journalTitle);
      
      // Fetch all articles and filter by volume/issue/year
      const articlesResponse = await adminAPI.getArticles({ 
        journalId: journalData.journalId,
        limit: 1000
      });
      
      const allArticles = (articlesResponse.data as any[]) || [];
      
      // Filter articles by volume, issue, and year
      const filteredArticles = allArticles.filter((article: any) => {
        if (volume && article.volumeNo !== volume) return false;
        if (issue && article.issueNo !== issue) return false;
        if (year && article.year !== year) return false;
        return true;
      });
      
      setArticles(filteredArticles);
    } catch (error: any) {
      console.error('=== ERROR loading articles ===', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to load articles';
      toast.current?.show({ severity: 'error', summary: 'Error', detail: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    } catch {
      return dateString;
    }
  };

  const formatAuthors = (authors?: Array<{ name: string; affiliation?: string }>) => {
    if (!authors || authors.length === 0) return 'No authors listed';
    return authors.map(a => a.name).join(', ');
  };

  const handleToggleSelectAll = () => {
    if (selectedArticles.size === articles.length) {
      // Deselect all
      setSelectedArticles(new Set());
    } else {
      // Select all
      setSelectedArticles(new Set(articles.map(a => a.id)));
    }
  };

  const handleToggleArticle = (articleId: number) => {
    setSelectedArticles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(articleId)) {
        newSet.delete(articleId);
      } else {
        newSet.add(articleId);
      }
      return newSet;
    });
  };

  const handleMoveToInpress = () => {
    if (selectedArticles.size === 0) {
      toast.current?.show({ 
        severity: 'warn', 
        summary: 'No Selection', 
        detail: 'Please select at least one article to move' 
      });
      return;
    }

    const articlesToMove = articles.filter(a => selectedArticles.has(a.id));
    if (articlesToMove.length === 0) {
      toast.current?.show({ 
        severity: 'warn', 
        summary: 'No Articles', 
        detail: 'No articles selected to move' 
      });
      return;
    }

    confirmDialog({
      message: `Are you sure you want to move ${articlesToMove.length} selected article(s) to Inpress? This will change their status from PUBLISHED to ACCEPTED.`,
      header: 'Confirm Move to Inpress',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        try {
          setMovingToInpress(true);
          // Update each selected article status to ACCEPTED (for inpress)
          for (const article of articlesToMove) {
            await adminAPI.updateArticle(article.id, {
              status: 'ACCEPTED'
            });
          }
          
          toast.current?.show({ 
            severity: 'success', 
            summary: 'Success', 
            detail: `${articlesToMove.length} article(s) moved to Inpress successfully` 
          });
          
          // Clear selection and reload articles
          setSelectedArticles(new Set());
          await loadJournalAndArticles();
        } catch (error: any) {
          console.error('Error moving articles to inpress:', error);
          toast.current?.show({ 
            severity: 'error', 
            summary: 'Error', 
            detail: error.message || 'Failed to move articles to Inpress' 
          });
        } finally {
          setMovingToInpress(false);
        }
      },
      reject: () => {
        // Do nothing
      }
    });
  };

  const handleEdit = async (article: Article) => {
    try {
      // Fetch full article data to ensure we have all fields
      const fullArticle = await adminAPI.getArticle(article.id);
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
      
      // Format authors - email is optional
      const formattedAuthors = selectedArticle.authors.map(author => ({
        name: author.name || '',
        email: author.email || '',
        affiliation: author.affiliation || ''
      }));

      // Extract HTML content from Editor fields
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
      };

      // Update existing article
      await adminAPI.updateArticle(selectedArticle.id, articleData);
      toast.current?.show({ severity: 'success', summary: 'Success', detail: 'Article updated successfully' });
      setShowEditDialog(false);
      setSelectedArticle(null);
      await loadJournalAndArticles();
    } catch (error: any) {
      console.error('Error saving article:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to save article';
      toast.current?.show({ severity: 'error', summary: 'Error', detail: errorMessage });
    } finally {
      setSaving(false);
    }
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

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8">
      <Toast ref={toast} />
      <ConfirmDialog />
      
      <div className="mb-6 flex items-center justify-between">
        <div>
          {journalTitle && (
            <div className="mb-2">
              <span className="text-sm text-gray-600">Journal: </span>
              <span className="text-xl font-bold text-slate-800">{journalTitle}</span>
            </div>
          )}
          <h1 className="text-3xl font-bold text-slate-800 mb-2 flex items-center gap-3">
            <i className="pi pi-folder-open text-blue-600"></i>
            <span>Archive Issue Articles</span>
          </h1>
          {volume && issue && year && (
            <p className="text-slate-600">
              Volume {volume}, Issue {issue} - {year}
            </p>
          )}
        </div>
      </div>

      {articles.length > 0 ? (
        <>
          {/* Select All / Deselect All Button */}
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleToggleSelectAll}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors flex items-center gap-2 text-sm"
              >
                <i className={`pi ${selectedArticles.size === articles.length ? 'pi-check-square' : 'pi-square'}`}></i>
                <span>{selectedArticles.size === articles.length ? 'Deselect All' : 'Select All'}</span>
              </button>
              {selectedArticles.size > 0 && (
                <span className="text-sm text-gray-600">
                  {selectedArticles.size} of {articles.length} article(s) selected
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {articles.map((article) => (
              <div
                key={article.id}
                className={`bg-white rounded-lg shadow-md p-4 border-2 transition-all ${
                  selectedArticles.has(article.id) 
                    ? 'border-blue-500 shadow-lg' 
                    : 'border-gray-200 hover:shadow-lg'
                }`}
              >
                {/* Checkbox */}
                <div className="mb-3 flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedArticles.has(article.id)}
                    onChange={() => handleToggleArticle(article.id)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label className="text-sm text-gray-700 cursor-pointer" onClick={() => handleToggleArticle(article.id)}>
                    Select article
                  </label>
                </div>

                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                  {/* Article Type Badge */}
                  {article.articleType && (
                    <div className="mb-2">
                      <span className="inline-block px-2 py-0.5 text-xs font-bold text-white bg-gray-700 rounded-full">
                        {article.articleType}
                      </span>
                    </div>
                  )}

                  {/* Article Title */}
                  <h3 className="text-base font-bold text-gray-900 mb-2 line-clamp-2" style={{
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {article.title}
                  </h3>

                  {/* Authors */}
                  {article.authors && article.authors.length > 0 && (
                    <div className="mb-2">
                      <span className="text-xs font-semibold text-gray-700">Author(s): </span>
                      <span className="text-xs text-gray-600 line-clamp-1">{formatAuthors(article.authors)}</span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-1 ml-2 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => handleEdit(article)}
                    style={{
                      backgroundColor: '#fbbf24',
                      color: 'white',
                      border: 'none',
                      padding: '0.4rem',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.875rem'
                    }}
                    title="Edit"
                  >
                    <i className="pi pi-pencil"></i>
                  </button>
                </div>
              </div>

              {/* Dates - Compact */}
              <div className="space-y-1 text-xs text-gray-600">
                {article.receivedAt && (
                  <div>
                    <span className="font-semibold">Received:</span> {formatDate(article.receivedAt)}
                  </div>
                )}
                {article.acceptedAt && (
                  <div>
                    <span className="font-semibold">Accepted:</span> {formatDate(article.acceptedAt)}
                  </div>
                )}
                {article.publishedAt && (
                  <div>
                    <span className="font-semibold">Published:</span> {formatDate(article.publishedAt)}
                  </div>
                )}
              </div>
            </div>
          ))}
          </div>
        </>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <i className="pi pi-file text-6xl text-gray-300 mb-4"></i>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No Articles Found</h3>
          <p className="text-gray-500">
            {volume && issue && year
              ? `No articles found for Volume ${volume}, Issue ${issue}, Year ${year}`
              : 'No articles available for the selected filters.'}
          </p>
        </div>
      )}

      {/* Move to Inpress Button */}
      {articles.length > 0 && (
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={handleMoveToInpress}
            disabled={movingToInpress || selectedArticles.size === 0}
            style={{
              backgroundColor: (movingToInpress || selectedArticles.size === 0) ? '#9ca3af' : '#10b981',
              color: 'white',
              border: 'none',
              padding: '0.75rem 2rem',
              borderRadius: '8px',
              fontWeight: '500',
              cursor: (movingToInpress || selectedArticles.size === 0) ? 'not-allowed' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '1rem',
              opacity: (movingToInpress || selectedArticles.size === 0) ? 0.6 : 1
            }}
          >
            {movingToInpress ? (
              <>
                <i className="pi pi-spin pi-spinner"></i>
                <span>Moving to Inpress...</span>
              </>
            ) : (
              <>
                <i className="pi pi-arrow-right"></i>
                <span>Move to Inpress {selectedArticles.size > 0 && `(${selectedArticles.size})`}</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Edit Article Dialog */}
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
    </div>
  );
}


