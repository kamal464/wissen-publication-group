'use client';

import { useState, useEffect, useRef } from 'react';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dropdown } from 'primereact/dropdown';
import { Editor } from 'primereact/editor';
import { FileUpload } from 'primereact/fileupload';
import { Toast } from 'primereact/toast';
import { TabView, TabPanel } from 'primereact/tabview';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { adminAPI } from '@/lib/api';
import { loadJournalData } from '@/lib/journalAdminUtils';
import { getFileUrl, getApiUrl } from '@/lib/apiConfig';
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
  doi?: string;
  correspondingAuthorDetails?: string;
  citeAs?: string;
  country?: string;
  receivedAt?: string;
  acceptedAt?: string;
  publishedAt?: string;
  authors?: Array<{ name: string; email?: string; affiliation?: string }>;
  pdfUrl?: string;
  fulltextImages?: string[];
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

export default function ArticlesInPressPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showUploadPdfDialog, setShowUploadPdfDialog] = useState(false);
  const [showUploadImagesDialog, setShowUploadImagesDialog] = useState(false);
  const [showFullTextDialog, setShowFullTextDialog] = useState(false);
  const [selectedArticleForUpload, setSelectedArticleForUpload] = useState<Article | null>(null);
  const [previewMonth, setPreviewMonth] = useState<string>('');
  const [previewYear, setPreviewYear] = useState<string>('');
  const [previewSelectedArticles, setPreviewSelectedArticles] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [savingFullText, setSavingFullText] = useState(false);
  const [selectedPdfFile, setSelectedPdfFile] = useState<File | null>(null);
  const [selectedImageFiles, setSelectedImageFiles] = useState<File[]>([]);
  const [journalId, setJournalId] = useState<number | null>(null);
  const [journalTitle, setJournalTitle] = useState<string>('');
  const [currentMonth, setCurrentMonth] = useState<string>('');
  const toast = useRef<Toast>(null);

  const articleTypes = [
    { label: 'Select Article Type', value: null },
    { label: 'Research Article', value: 'Research Article' },
    { label: 'Review Article', value: 'Review Article' },
    { label: 'Case Report', value: 'Case Report' },
    { label: 'Mini Review', value: 'Mini Review' },
    { label: 'Short Communication', value: 'Short Communication' }
  ];

  const months = [
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

  const years = Array.from({ length: 20 }, (_, i) => {
    const year = new Date().getFullYear() - i;
    return { label: year.toString(), value: year.toString() };
  });
  years.unshift({ label: 'Select Year', value: '' });

  const volumes = Array.from({ length: 50 }, (_, i) => ({
    label: `Volume ${i + 1}`,
    value: (i + 1).toString()
  }));
  volumes.unshift({ label: 'Select Volume', value: '' });

  const issues = Array.from({ length: 12 }, (_, i) => ({
    label: `Issue ${i + 1}`,
    value: (i + 1).toString()
  }));
  issues.unshift({ label: 'Select Issue', value: '' });

  useEffect(() => {
    loadJournalAndArticles();
    const now = new Date();
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    setCurrentMonth(`${monthNames[now.getMonth()]} ${now.getFullYear()}`);
    
    // Check for URL parameters to open preview with filters
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('preview') === 'true') {
      const month = urlParams.get('month');
      const year = urlParams.get('year');
      if (month && year) {
        setPreviewMonth(month);
        setPreviewYear(year);
        setShowPreviewDialog(true);
      }
    }
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
        return;
      }

      setJournalId(journalData.journalId);
      setJournalTitle(journalData.journalTitle);
      
      console.log('Loading articles for journal:', journalData.journalId);
      // Fetch articles with status IN_PRESS or ACCEPTED
      const articlesResponse = await adminAPI.getArticles({ 
        journalId: journalData.journalId, 
        status: 'ACCEPTED' 
      });
      console.log('Articles response:', articlesResponse);
      setArticles((articlesResponse.data as any[]) || []);
    } catch (error: any) {
      console.error('=== ERROR loading articles ===', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      const errorMessage = error.response?.data?.message || error.message || 'Failed to load articles';
      toast.current?.show({ severity: 'error', summary: 'Error', detail: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    const now = new Date();
    setSelectedArticle({
      id: 0,
      title: '',
      abstract: '',
      status: 'ACCEPTED',
      articleType: 'Research Article',
      volumeNo: '',
      issueNo: '',
      issueMonth: '',
      year: now.getFullYear().toString(),
      specialIssue: '',
      keywords: '',
      firstPageNumber: '',
      lastPageNumber: '',
      doi: '',
      correspondingAuthorDetails: '',
      citeAs: '',
      country: '',
      authors: [{ name: '', email: '', affiliation: '' }],
      receivedAt: now.toISOString().split('T')[0],
      acceptedAt: now.toISOString().split('T')[0],
      publishedAt: '',
      heading1Title: '',
      heading1Content: '',
      heading2Title: '',
      heading2Content: '',
      heading3Title: '',
      heading3Content: '',
      heading4Title: '',
      heading4Content: '',
      heading5Title: '',
      heading5Content: '',
    });
    setShowAddDialog(true);
  };

  const handleEdit = (article: Article) => {
    setSelectedArticle(article);
    setShowEditDialog(true);
  };

  const handlePreview = (article: Article) => {
    setSelectedArticle(article);
    setShowPreviewDialog(true);
  };

  const handleDeleteClick = (article: Article) => {
    setSelectedArticle(article);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedArticle) return;

    try {
      setDeleting(true);
      await adminAPI.deleteArticle(selectedArticle.id);
      setArticles(articles.filter(a => a.id !== selectedArticle.id));
      setShowDeleteDialog(false);
      setSelectedArticle(null);
      toast.current?.show({ severity: 'success', summary: 'Success', detail: 'Article deleted successfully' });
    } catch (error: any) {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Failed to delete article' });
    } finally {
      setDeleting(false);
    }
  };

  // Check if all mandatory fields are filled
  const isFormValid = () => {
    if (!selectedArticle) return false;

    // Required fields - convert to string and trim to handle null/undefined/number values
    if (!selectedArticle.title || !String(selectedArticle.title).trim()) return false;
    // Volume is REQUIRED when creating articles (as per user requirement)
    if (!selectedArticle.volumeNo || !String(selectedArticle.volumeNo).trim()) return false;
    if (!selectedArticle.issueNo || !String(selectedArticle.issueNo).trim()) return false;
    if (!selectedArticle.issueMonth || !String(selectedArticle.issueMonth).trim()) return false;
    if (!selectedArticle.year || !String(selectedArticle.year).trim()) return false;
    if (!selectedArticle.firstPageNumber || !String(selectedArticle.firstPageNumber).trim()) return false;
    if (!selectedArticle.lastPageNumber || !String(selectedArticle.lastPageNumber).trim()) return false;
    
    // Authors validation
    if (!selectedArticle.authors || selectedArticle.authors.length === 0) return false;
    
    // Validate author emails
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const invalidAuthors = selectedArticle.authors.filter(a => !a.email || !emailRegex.test(a.email));
    if (invalidAuthors.length > 0) return false;

    // Check if at least one author has a name
    const hasAuthorNames = selectedArticle.authors.some(a => a.name && String(a.name).trim());
    if (!hasAuthorNames) return false;

    return true;
  };

  const handleSave = async () => {
    console.log('=== handleSave called ===');
    console.log('1. Current journalId state:', journalId);
    console.log('2. Selected article:', selectedArticle?.id);
    
    if (!selectedArticle || !journalId) {
      console.error('3. Missing required data:', { selectedArticle: !!selectedArticle, journalId });
      toast.current?.show({ 
        severity: 'error', 
        summary: 'Error', 
        detail: `Missing required data. Journal ID: ${journalId}, Article: ${selectedArticle ? 'present' : 'missing'}` 
      });
      return;
    }

    // Validate required fields
    if (!selectedArticle.title || !selectedArticle.title.trim()) {
      toast.current?.show({ severity: 'error', summary: 'Validation Error', detail: 'Article title is required' });
      return;
    }

    // Volume is REQUIRED when creating articles
    // Convert to string and check if it's not empty
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

    // Validate author emails
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const invalidAuthors = selectedArticle.authors.filter(a => !a.email || !emailRegex.test(a.email));
    if (invalidAuthors.length > 0) {
      toast.current?.show({ severity: 'error', summary: 'Validation Error', detail: 'All authors must have valid email addresses' });
      return;
    }

    try {
      setSaving(true);
      
      // Format authors - ensure they have email (required by DTO)
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
        abstract: getPlainText(selectedArticle.abstract) || selectedArticle.title, // Use title as fallback if abstract is empty
        authors: formattedAuthors,
        journalId: journalId,
        status: selectedArticle.status || 'ACCEPTED',
        pdfUrl: selectedArticle.pdfUrl,
        articleType: selectedArticle.articleType,
        keywords: getPlainText(selectedArticle.keywords),
        doi: selectedArticle.doi,
        // Volume and Issue Management - convert to strings to handle dropdown values (numbers)
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

      if (selectedArticle.id === 0) {
        // Create new article
        const response = await adminAPI.createArticle(articleData);
        toast.current?.show({ severity: 'success', summary: 'Success', detail: 'Article added successfully' });
      } else {
        // Update existing article
        await adminAPI.updateArticle(selectedArticle.id, articleData);
        toast.current?.show({ severity: 'success', summary: 'Success', detail: 'Article updated successfully' });
      }
      setShowAddDialog(false);
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
      
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          {journalTitle && (
            <div className="mb-2">
              <span className="text-sm text-gray-600">Journal: </span>
              <span className="text-xl font-bold text-slate-800">{journalTitle}</span>
            </div>
          )}
          <h1 className="text-3xl font-bold text-slate-800 mb-2 flex items-center gap-3">
            <i className="pi pi-file-edit text-blue-600"></i>
            <span>Articles Inpress</span>
          </h1>
          <div className="flex items-center gap-2 text-gray-600">
            <i className="pi pi-calendar"></i>
            <span className="text-sm">Current Month: {currentMonth}</span>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleAdd}
            style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              border: '1px solid #3b82f6',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <i className="pi pi-plus"></i>
            <span>Add Article</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setShowPreviewDialog(true);
              const now = new Date();
              const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
              setPreviewMonth(monthNames[now.getMonth()]);
              setPreviewYear(now.getFullYear().toString());
            }}
            style={{
              backgroundColor: 'transparent',
              color: '#10b981',
              border: '1px solid #10b981',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <i className="pi pi-eye"></i>
            <span>Preview</span>
          </button>
          <button
            type="button"
            onClick={() => {
              toast.current?.show({ severity: 'info', summary: 'Upload', detail: 'Upload PDF/Fulltext functionality' });
            }}
            style={{
              backgroundColor: 'transparent',
              color: '#f59e0b',
              border: '1px solid #f59e0b',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <i className="pi pi-upload"></i>
            <span>Upload PDF/Fulltext</span>
          </button>
        </div>
      </div>

      {/* Articles List - Sortable Cards */}
      {articles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {articles.map((article, index) => (
            <div
              key={article.id}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('text/plain', index.toString());
                e.currentTarget.style.opacity = '0.5';
              }}
              onDragEnd={(e) => {
                e.currentTarget.style.opacity = '1';
              }}
              onDragOver={(e) => {
                e.preventDefault();
                e.currentTarget.style.borderColor = '#3b82f6';
              }}
              onDragLeave={(e) => {
                e.currentTarget.style.borderColor = '#e5e7eb';
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.currentTarget.style.borderColor = '#e5e7eb';
                const draggedIndex = parseInt(e.dataTransfer.getData('text/plain'));
                if (draggedIndex !== index) {
                  const newArticles = [...articles];
                  const [removed] = newArticles.splice(draggedIndex, 1);
                  newArticles.splice(index, 0, removed);
                  setArticles(newArticles);
                  // Optionally save order to backend
                }
              }}
              className="bg-white rounded-lg shadow-md p-4 border-2 border-gray-200 cursor-move hover:shadow-lg transition-all"
              style={{ minHeight: '200px' }}
            >
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
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(article);
                    }}
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
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick(article);
                    }}
                    style={{
                      backgroundColor: '#ef4444',
                      color: 'white',
                      border: 'none',
                      padding: '0.4rem',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.875rem'
                    }}
                    title="Delete"
                  >
                    <i className="pi pi-trash"></i>
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

              {/* Drag Handle Indicator */}
              <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-center">
                <i className="pi pi-bars text-gray-400 text-sm"></i>
                <span className="text-xs text-gray-500 ml-2">Drag to reorder</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <i className="pi pi-file-edit text-6xl text-gray-300 mb-4"></i>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No Articles in Press</h3>
          <p className="text-gray-500">There are currently no articles in press for this journal.</p>
        </div>
      )}

      {/* Add/Edit Article Dialog */}
      <Dialog
        header={selectedArticle?.id === 0 ? 'Add Article' : 'Edit Article'}
        visible={showAddDialog || showEditDialog}
        style={{ width: '90vw', maxWidth: '900px' }}
        contentStyle={{ maxHeight: 'calc(90vh - 120px)', overflow: 'auto' }}
        onHide={() => {
          setShowAddDialog(false);
          setShowEditDialog(false);
          setSelectedArticle(null);
        }}
        footer={
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setShowAddDialog(false);
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
                        options={volumes}
                        onChange={(e) => setSelectedArticle({ ...selectedArticle, volumeNo: e.value })}
                        className="w-full"
                        placeholder="Select Volume"
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="block mb-2 text-sm font-medium text-gray-700">Issue No *</label>
                      <Dropdown
                        value={selectedArticle.issueNo}
                        options={issues}
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
                        options={months}
                        onChange={(e) => setSelectedArticle({ ...selectedArticle, issueMonth: e.value })}
                        className="w-full"
                        placeholder="Select Month"
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="block mb-2 text-sm font-medium text-gray-700">Year *</label>
                      <Dropdown
                        value={selectedArticle.year}
                        options={years}
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
                    <label className="block mb-2 text-sm font-medium text-gray-700">Enter Author Emails *</label>
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

      {/* Preview Dialog - Full Screen with Month Navigation */}
      <Dialog
        header="List of Articles"
        visible={showPreviewDialog}
        style={{ width: '95vw', maxWidth: '1400px' }}
        contentStyle={{ height: 'calc(90vh - 120px)', overflow: 'auto' }}
        onHide={() => {
          setShowPreviewDialog(false);
          setPreviewMonth('');
          setPreviewYear('');
          setPreviewSelectedArticles(new Set());
        }}
        footer={
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                // Use selected articles from checkboxes, or all filtered articles if none selected
                const filteredArticles = previewMonth && previewYear
                  ? articles.filter(a => a.issueMonth === previewMonth && a.year === previewYear)
                  : articles;
                
                const articlesToMove = previewSelectedArticles.size > 0
                  ? filteredArticles.filter(a => previewSelectedArticles.has(a.id))
                  : filteredArticles;
                
                if (articlesToMove.length === 0) {
                  if (previewSelectedArticles.size === 0) {
                    toast.current?.show({ severity: 'warn', summary: 'No Articles', detail: previewMonth && previewYear ? `No articles found for ${previewMonth} ${previewYear}` : 'No articles available' });
                  } else {
                    toast.current?.show({ severity: 'warn', summary: 'No Articles', detail: 'Selected articles not found in filtered results' });
                  }
                  return;
                }
                
                confirmDialog({
                  message: `Are you sure you want to move ${articlesToMove.length} article(s) to Current Issue?`,
                  header: 'Confirm Move to Current Issue',
                  icon: 'pi pi-exclamation-triangle',
                  accept: async () => {
                    try {
                      // Update each article status to PUBLISHED (for current issue)
                      for (const article of articlesToMove) {
                        await adminAPI.updateArticle(article.id, {
                          status: 'PUBLISHED'
                        });
                      }
                      
                      toast.current?.show({ severity: 'success', summary: 'Success', detail: 'Articles moved to Current Issue successfully' });
                      setShowPreviewDialog(false);
                      setPreviewMonth('');
                      setPreviewYear('');
                      setPreviewSelectedArticles(new Set());
                      await loadJournalAndArticles();
                      // Navigate to current issue tab
                      setTimeout(() => {
                        window.location.href = '/journal-admin/journals/current-issue';
                      }, 500);
                    } catch (error: any) {
                      console.error('Error moving articles:', error);
                      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Failed to move articles to Current Issue' });
                    }
                  },
                  reject: () => {
                    // Do nothing
                  }
                });
              }}
              style={{
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <i className="pi pi-arrow-right"></i>
              <span>Move to Current Issue</span>
            </button>
            <button
              type="button"
              onClick={() => {
                // Use selected articles from checkboxes, or all filtered articles if none selected
                const filteredArticles = previewMonth && previewYear
                  ? articles.filter(a => a.issueMonth === previewMonth && a.year === previewYear)
                  : articles;
                
                const articlesToMove = previewSelectedArticles.size > 0
                  ? filteredArticles.filter(a => previewSelectedArticles.has(a.id))
                  : filteredArticles;
                
                if (articlesToMove.length === 0) {
                  if (previewSelectedArticles.size === 0) {
                    toast.current?.show({ severity: 'warn', summary: 'No Articles', detail: previewMonth && previewYear ? `No articles found for ${previewMonth} ${previewYear}` : 'No articles available' });
                  } else {
                    toast.current?.show({ severity: 'warn', summary: 'No Articles', detail: 'Selected articles not found in filtered results' });
                  }
                  return;
                }
                
                confirmDialog({
                  message: `Are you sure you want to move ${articlesToMove.length} article(s) to Months?`,
                  header: 'Confirm Move to Months',
                  icon: 'pi pi-exclamation-triangle',
                  accept: async () => {
                    try {
                      // Update each article status to ACCEPTED (for in-press/months)
                      for (const article of articlesToMove) {
                        await adminAPI.updateArticle(article.id, {
                          status: 'ACCEPTED'
                        });
                      }
                      
                      toast.current?.show({ severity: 'success', summary: 'Success', detail: 'Articles moved to Months successfully' });
                      setShowPreviewDialog(false);
                      setPreviewMonth('');
                      setPreviewYear('');
                      setPreviewSelectedArticles(new Set());
                      await loadJournalAndArticles();
                    } catch (error: any) {
                      console.error('Error moving articles:', error);
                      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Failed to move articles to Months' });
                    }
                  },
                  reject: () => {
                    // Do nothing
                  }
                });
              }}
              style={{
                backgroundColor: '#6b7280',
                color: 'white',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <i className="pi pi-calendar"></i>
              <span>Move to Months</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setShowPreviewDialog(false);
                setPreviewMonth('');
                setPreviewYear('');
              }}
              style={{
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              Close
            </button>
          </div>
        }
      >
        <div className="py-4">
          {/* Month Navigation Bar with Year Dropdowns */}
          <div className="mb-6 flex flex-wrap gap-2 relative">
            {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((month) => {
              const isSelected = previewMonth === month;
              const currentYear = new Date().getFullYear();
              const yearOptions = Array.from({ length: currentYear - 2017 }, (_, i) => {
                const year = 2018 + i;
                return { label: `${month} ${year}`, value: year.toString() };
              });
              
              return (
                <div key={month} className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewMonth(isSelected ? '' : month);
                    }}
                    className={`px-4 py-2 rounded-lg border-2 transition-all ${
                      isSelected
                        ? 'bg-blue-50 border-blue-600'
                        : 'bg-white border-gray-300 hover:border-blue-400'
                    }`}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      color: isSelected ? '#1e40af' : '#374151',
                      fontWeight: isSelected ? '600' : '500'
                    }}
                  >
                    <i className="pi pi-calendar" style={{ color: isSelected ? '#2563eb' : '#6b7280' }}></i>
                    <span style={{ color: isSelected ? '#1e40af' : '#374151' }}>{month}</span>
                    <i className="pi pi-chevron-down text-xs" style={{ color: isSelected ? '#2563eb' : '#6b7280' }}></i>
                  </button>
                  {isSelected && (
                    <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[200px] max-h-[300px] overflow-y-auto">
                      {yearOptions.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => {
                            setPreviewYear(option.value);
                          }}
                          className={`w-full text-left px-4 py-2 hover:bg-blue-50 transition-colors ${
                            previewYear === option.value ? 'bg-blue-100 font-semibold' : ''
                          }`}
                          style={{
                            color: previewYear === option.value ? '#1e40af' : '#374151'
                          }}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
            <button
              type="button"
              className="px-4 py-2 rounded-lg border-2 bg-black border-black hover:bg-gray-800"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: '#ffffff'
              }}
            >
              <i className="pi pi-calendar"></i>
              <span>specialissue</span>
              <i className="pi pi-chevron-down text-xs"></i>
            </button>
          </div>

          {/* Journal Info */}
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <i className="pi pi-list text-blue-600 text-xl"></i>
              <h2 className="text-2xl font-bold text-gray-900">List of Articles</h2>
              {previewMonth && previewYear && (
                <div className="flex items-center gap-2 text-gray-600">
                  <i className="pi pi-calendar"></i>
                  <span>{previewMonth} {previewYear}</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <i className="pi pi-bookmark"></i>
              <span>Journal: {journalTitle}</span>
            </div>
          </div>

          {/* Articles Table */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input type="checkbox" className="rounded" />
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">Title & Details</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  // Filter articles by selected month/year if both are selected
                  const filteredArticles = previewMonth && previewYear
                    ? articles.filter(a => a.issueMonth === previewMonth && a.year === previewYear)
                    : articles;
                  
                  return filteredArticles.length > 0 ? (
                    filteredArticles.map((article) => (
                    <tr key={article.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          checked={previewSelectedArticles.has(article.id)}
                          onChange={(e) => {
                            setPreviewSelectedArticles(prev => {
                              const newSet = new Set(prev);
                              if (newSet.has(article.id)) {
                                newSet.delete(article.id);
                              } else {
                                newSet.add(article.id);
                              }
                              return newSet;
                            });
                          }}
                          className="rounded"
                        />
                      </td>
                      <td className="px-4 py-4">
                        <div>
                          <a href="#" className="text-blue-600 hover:underline font-medium text-lg mb-2 block">
                            {article.title}
                          </a>
                          {article.authors && article.authors.length > 0 && (
                            <div className="flex items-center gap-2 text-gray-600 mb-3">
                              <i className="pi pi-user text-sm"></i>
                              <span className="text-sm">{formatAuthors(article.authors)}</span>
                            </div>
                          )}
                          <div className="flex gap-2 flex-wrap">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedArticleForUpload(article);
                                setShowUploadPdfDialog(true);
                              }}
                              className="px-3 py-1.5 text-sm border border-blue-500 text-blue-600 rounded hover:bg-blue-50 flex items-center gap-1"
                            >
                              <i className="pi pi-upload"></i>
                              <span>Upload</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedArticleForUpload(article);
                                setShowUploadImagesDialog(true);
                              }}
                              className="px-3 py-1.5 text-sm border border-blue-500 text-blue-600 rounded hover:bg-blue-50 flex items-center gap-1"
                            >
                              <i className="pi pi-cloud-upload"></i>
                              <span>Upload Fulltext Images</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedArticleForUpload(article);
                                setShowFullTextDialog(true);
                              }}
                              className="px-3 py-1.5 text-sm border border-green-500 text-green-600 rounded hover:bg-green-50"
                            >
                              Full Text
                            </button>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <button
                          type="button"
                          onClick={() => {
                            setShowPreviewDialog(false);
                            handleEdit(article);
                          }}
                          className="px-4 py-2 border border-blue-500 text-blue-600 rounded hover:bg-blue-50"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="px-4 py-8 text-center text-gray-500">
                        {previewMonth && previewYear
                          ? `No articles found for ${previewMonth} ${previewYear}`
                          : 'No articles available'}
                      </td>
                    </tr>
                  );
                })()}
              </tbody>
            </table>
          </div>
        </div>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        header="Confirm Delete"
        visible={showDeleteDialog}
        style={{ width: '90vw', maxWidth: '500px' }}
        onHide={() => {
          setShowDeleteDialog(false);
          setSelectedArticle(null);
        }}
        footer={
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setShowDeleteDialog(false);
                setSelectedArticle(null);
              }}
              disabled={deleting}
              style={{
                backgroundColor: '#f1f5f9',
                color: '#475569',
                border: '1px solid #cbd5e1',
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                fontWeight: '500',
                cursor: deleting ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                opacity: deleting ? 0.6 : 1
              }}
            >
              <i className="pi pi-times"></i>
              <span>Cancel</span>
            </button>
            <button
              type="button"
              onClick={handleDeleteConfirm}
              disabled={deleting}
              style={{
                backgroundColor: '#ef4444',
                color: 'white',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                fontWeight: '500',
                cursor: deleting ? 'wait' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                minWidth: '120px'
              }}
            >
              {deleting ? <i className="pi pi-spin pi-spinner"></i> : <i className="pi pi-trash"></i>}
              <span>{deleting ? 'Deleting...' : 'Delete'}</span>
            </button>
          </div>
        }
      >
        <div className="py-4">
          <div className="flex items-center gap-4 mb-4">
            <i className="pi pi-exclamation-triangle text-4xl text-red-500"></i>
            <div>
              <p className="text-lg font-semibold text-gray-900 mb-2">Are you sure you want to delete this article?</p>
              {selectedArticle && (
                <p className="text-gray-600">
                  <strong>{selectedArticle.title}</strong> will be permanently deleted.
                </p>
              )}
            </div>
          </div>
          <p className="text-sm text-gray-500">This action cannot be undone.</p>
        </div>
      </Dialog>

      {/* Upload PDF Dialog */}
      <Dialog
        header="Upload PDF for Article"
        visible={showUploadPdfDialog}
        style={{ width: '90vw', maxWidth: '600px' }}
        contentStyle={{ maxHeight: 'calc(90vh - 120px)', overflow: 'auto' }}
        onHide={() => {
          setShowUploadPdfDialog(false);
          setSelectedArticleForUpload(null);
        }}
        footer={
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setShowUploadPdfDialog(false);
                setSelectedArticleForUpload(null);
              }}
              style={{
                backgroundColor: '#f1f5f9',
                color: '#475569',
                border: '1px solid #cbd5e1',
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={async () => {
                if (!selectedArticleForUpload || !selectedPdfFile) {
                  toast.current?.show({ severity: 'warn', summary: 'Warning', detail: 'Please select a PDF file to upload' });
                  return;
                }

                try {
                  setUploadingPdf(true);
                  const formData = new FormData();
                  formData.append('pdf', selectedPdfFile);

                  const response = await fetch(getApiUrl(`/articles/${selectedArticleForUpload.id}/upload-pdf`), {
                    method: 'POST',
                    body: formData,
                  });

                  if (!response.ok) {
                    const errorData = await response.json().catch(() => ({ message: 'Upload failed' }));
                    throw new Error(errorData.message || 'Failed to upload PDF');
                  }

                  const result = await response.json();
                  toast.current?.show({ severity: 'success', summary: 'Success', detail: 'PDF uploaded successfully' });
                  await loadJournalAndArticles();
                  setShowUploadPdfDialog(false);
                  setSelectedArticleForUpload(null);
                  setSelectedPdfFile(null);
                } catch (error: any) {
                  console.error('Error uploading PDF:', error);
                  toast.current?.show({ severity: 'error', summary: 'Error', detail: error.message || 'Failed to upload PDF' });
                } finally {
                  setUploadingPdf(false);
                }
              }}
              disabled={uploadingPdf || !selectedPdfFile}
              style={{
                backgroundColor: uploadingPdf || !selectedPdfFile ? '#9ca3af' : '#10b981',
                color: 'white',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                fontWeight: '500',
                cursor: uploadingPdf || !selectedPdfFile ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                opacity: uploadingPdf || !selectedPdfFile ? 0.6 : 1
              }}
            >
              {uploadingPdf ? <i className="pi pi-spin pi-spinner"></i> : <i className="pi pi-upload"></i>}
              <span>{uploadingPdf ? 'Uploading...' : 'Upload'}</span>
            </button>
          </div>
        }
      >
        {selectedArticleForUpload && (
          <div className="py-4 space-y-4">
            <div className="flex flex-col">
              <label className="block mb-2 text-sm font-medium text-gray-700">Article Title</label>
              <InputText
                value={selectedArticleForUpload.title}
                readOnly
                className="w-full bg-gray-50"
              />
            </div>
            <div className="flex flex-col">
              <label className="block mb-2 text-sm font-medium text-gray-700">PDF Filename</label>
              <InputText
                value={selectedArticleForUpload.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') + '.pdf'}
                className="w-full"
              />
            </div>
            <div className="flex flex-col">
              <label className="block mb-2 text-sm font-medium text-gray-700">Select PDF File</label>
              <FileUpload
                mode="basic"
                accept="application/pdf"
                maxFileSize={10000000}
                chooseLabel="Choose File"
                className="w-full"
                onSelect={(e) => {
                  if (e.files && e.files.length > 0) {
                    setSelectedPdfFile(e.files[0]);
                  }
                }}
                onClear={() => {
                  setSelectedPdfFile(null);
                }}
              />
              {selectedPdfFile && (
                <p className="text-sm text-gray-600 mt-2">
                  Selected: {selectedPdfFile.name} ({(selectedPdfFile.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
            </div>
          </div>
        )}
      </Dialog>

      {/* Upload Fulltext Images Dialog */}
      <Dialog
        header="Upload Fulltext Images"
        visible={showUploadImagesDialog}
        style={{ width: '90vw', maxWidth: '600px' }}
        contentStyle={{ maxHeight: 'calc(90vh - 120px)', overflow: 'auto' }}
        onHide={() => {
          setShowUploadImagesDialog(false);
          setSelectedArticleForUpload(null);
        }}
        footer={
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setShowUploadImagesDialog(false);
                setSelectedArticleForUpload(null);
              }}
              style={{
                backgroundColor: '#f1f5f9',
                color: '#475569',
                border: '1px solid #cbd5e1',
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={async () => {
                if (!selectedArticleForUpload || selectedImageFiles.length === 0) {
                  toast.current?.show({ severity: 'warn', summary: 'Warning', detail: 'Please select at least one image to upload' });
                  return;
                }

                try {
                  setUploadingImages(true);
                  const formData = new FormData();
                  selectedImageFiles.forEach((file) => {
                    formData.append('files', file);
                  });

                  const response = await fetch(`${getApiUrl('')}/articles/${selectedArticleForUpload.id}/upload-images`, {
                    method: 'POST',
                    body: formData,
                  });

                  if (!response.ok) {
                    const errorData = await response.json().catch(() => ({ message: 'Upload failed' }));
                    throw new Error(errorData.message || 'Failed to upload images');
                  }

                  const result = await response.json();
                  toast.current?.show({ severity: 'success', summary: 'Success', detail: `${selectedImageFiles.length} image(s) uploaded successfully` });
                  await loadJournalAndArticles();
                  setShowUploadImagesDialog(false);
                  setSelectedArticleForUpload(null);
                  setSelectedImageFiles([]);
                } catch (error: any) {
                  console.error('Error uploading images:', error);
                  toast.current?.show({ severity: 'error', summary: 'Error', detail: error.message || 'Failed to upload images' });
                } finally {
                  setUploadingImages(false);
                }
              }}
              disabled={uploadingImages || selectedImageFiles.length === 0}
              style={{
                backgroundColor: uploadingImages || selectedImageFiles.length === 0 ? '#9ca3af' : '#3b82f6',
                color: 'white',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                fontWeight: '500',
                cursor: uploadingImages || selectedImageFiles.length === 0 ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                opacity: uploadingImages || selectedImageFiles.length === 0 ? 0.6 : 1
              }}
            >
              {uploadingImages ? <i className="pi pi-spin pi-spinner"></i> : <i className="pi pi-upload"></i>}
              <span>{uploadingImages ? 'Uploading...' : 'Upload Images'}</span>
            </button>
          </div>
        }
      >
        <div className="py-4">
          <div className="flex flex-col">
            <label className="block mb-2 text-sm font-medium text-gray-700">Select Images</label>
            <FileUpload
              mode="basic"
              accept="image/*"
              multiple
              maxFileSize={5000000}
              chooseLabel="Choose Files"
              className="w-full"
              onSelect={(e) => {
                if (e.files && e.files.length > 0) {
                  setSelectedImageFiles(Array.from(e.files));
                }
              }}
              onClear={() => {
                setSelectedImageFiles([]);
              }}
            />
            {selectedImageFiles.length > 0 && (
              <div className="mt-2">
                <p className="text-sm text-gray-600 mb-2">Selected {selectedImageFiles.length} file(s):</p>
                <ul className="text-xs text-gray-500 space-y-1">
                  {selectedImageFiles.map((file, index) => (
                    <li key={index}>
                      {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </Dialog>

      {/* Full Text Dialog - Shows Article Content and Uploaded Images */}
      <Dialog
        header={selectedArticleForUpload ? selectedArticleForUpload.title : 'Full Text'}
        visible={showFullTextDialog}
        style={{ width: '90vw', maxWidth: '1000px' }}
        contentStyle={{ height: 'calc(90vh - 120px)', overflow: 'auto' }}
        onHide={() => {
          setShowFullTextDialog(false);
          setSelectedArticleForUpload(null);
        }}
        footer={
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setShowFullTextDialog(false);
                setSelectedArticleForUpload(null);
              }}
              style={{
                backgroundColor: '#f1f5f9',
                color: '#475569',
                border: '1px solid #cbd5e1',
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={async () => {
                if (!selectedArticleForUpload || !journalId) return;
                
                try {
                  // Extract HTML content from Editor fields
                  const getPlainText = (html?: string) => {
                    if (!html) return '';
                    const tmp = document.createElement('DIV');
                    tmp.innerHTML = html;
                    return tmp.textContent || tmp.innerText || '';
                  };

                  // Update article with all heading content
                  const articleData = {
                    title: selectedArticleForUpload.title,
                    abstract: getPlainText(selectedArticleForUpload.abstract) || selectedArticleForUpload.title,
                    keywords: getPlainText(selectedArticleForUpload.keywords),
                    journalId: journalId,
                    status: selectedArticleForUpload.status || 'ACCEPTED',
                    pdfUrl: selectedArticleForUpload.pdfUrl,
                    articleType: selectedArticleForUpload.articleType,
                    doi: selectedArticleForUpload.doi,
                    // Save all heading content
                    heading1Title: selectedArticleForUpload.heading1Title,
                    heading1Content: selectedArticleForUpload.heading1Content,
                    heading2Title: selectedArticleForUpload.heading2Title,
                    heading2Content: selectedArticleForUpload.heading2Content,
                    heading3Title: selectedArticleForUpload.heading3Title,
                    heading3Content: selectedArticleForUpload.heading3Content,
                    heading4Title: selectedArticleForUpload.heading4Title,
                    heading4Content: selectedArticleForUpload.heading4Content,
                    heading5Title: selectedArticleForUpload.heading5Title,
                    heading5Content: selectedArticleForUpload.heading5Content,
                  };
                  
                  setSavingFullText(true);
                  await adminAPI.updateArticle(selectedArticleForUpload.id, articleData);
                  toast.current?.show({ 
                    severity: 'success', 
                    summary: 'Success', 
                    detail: 'Article content saved successfully' 
                  });
                  await loadJournalAndArticles();
                  setShowFullTextDialog(false);
                  setSelectedArticleForUpload(null);
                } catch (error: any) {
                  console.error('Error saving article:', error);
                  const errorMessage = error.response?.data?.message || error.message || 'Failed to save article content';
                  toast.current?.show({ 
                    severity: 'error', 
                    summary: 'Error', 
                    detail: errorMessage
                  });
                } finally {
                  setSavingFullText(false);
                }
              }}
              disabled={savingFullText}
              style={{
                backgroundColor: savingFullText ? '#9ca3af' : '#3b82f6',
                color: 'white',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                fontWeight: '500',
                cursor: savingFullText ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                opacity: savingFullText ? 0.6 : 1
              }}
            >
              {savingFullText ? <i className="pi pi-spin pi-spinner"></i> : <i className="pi pi-check"></i>}
              <span>{savingFullText ? 'Saving...' : 'Save'}</span>
            </button>
          </div>
        }
      >
        {selectedArticleForUpload && (
          <div className="py-4 space-y-6">
            {/* Article Title */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedArticleForUpload.title}</h2>
              {selectedArticleForUpload.authors && selectedArticleForUpload.authors.length > 0 && (
                <p className="text-gray-600 mb-4">
                  <span className="font-semibold">Authors: </span>
                  {formatAuthors(selectedArticleForUpload.authors)}
                </p>
              )}
            </div>

            {/* Upload Images Section */}
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Fulltext Images</h3>
              
              {/* File Upload Component */}
              <div className="mb-4">
                <FileUpload
                  mode="basic"
                  accept="image/*"
                  multiple
                  maxFileSize={5000000}
                  chooseLabel="Choose Images"
                  className="w-full"
                  onSelect={(e) => {
                    if (e.files && e.files.length > 0) {
                      setSelectedImageFiles(Array.from(e.files));
                    }
                  }}
                  onClear={() => {
                    setSelectedImageFiles([]);
                  }}
                />
                <p className="text-xs text-gray-500 mt-2">Select multiple images to upload (Max 5MB per image)</p>
                {selectedImageFiles.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600 mb-2">Selected {selectedImageFiles.length} file(s):</p>
                    <ul className="text-xs text-gray-500 space-y-1">
                      {selectedImageFiles.map((file, index) => (
                        <li key={index}>
                          {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      onClick={async () => {
                        if (!selectedArticleForUpload || selectedImageFiles.length === 0) {
                          toast.current?.show({ severity: 'warn', summary: 'Warning', detail: 'Please select at least one image to upload' });
                          return;
                        }

                        try {
                          setUploadingImages(true);
                          const formData = new FormData();
                          selectedImageFiles.forEach((file) => {
                            formData.append('files', file);
                          });

                          const response = await fetch(getApiUrl(`/articles/${selectedArticleForUpload.id}/upload-images`), {
                            method: 'POST',
                            body: formData,
                          });

                          if (!response.ok) {
                            const errorData = await response.json().catch(() => ({ message: 'Upload failed' }));
                            throw new Error(errorData.message || 'Failed to upload images');
                          }

                          const result = await response.json();
                          toast.current?.show({ severity: 'success', summary: 'Success', detail: `${selectedImageFiles.length} image(s) uploaded successfully` });
                          await loadJournalAndArticles();
                          setSelectedImageFiles([]);
                          // Reload the article to get updated images
                          const updatedArticle = await adminAPI.getArticle(selectedArticleForUpload.id);
                          setSelectedArticleForUpload(updatedArticle.data as Article);
                        } catch (error: any) {
                          console.error('Error uploading images:', error);
                          toast.current?.show({ severity: 'error', summary: 'Error', detail: error.message || 'Failed to upload images' });
                        } finally {
                          setUploadingImages(false);
                        }
                      }}
                      disabled={uploadingImages || selectedImageFiles.length === 0}
                      className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {uploadingImages ? 'Uploading...' : 'Upload Selected Images'}
                    </button>
                  </div>
                )}
              </div>

              {/* Uploaded Images Display */}
              {(() => {
                try {
                  let images: string[] = [];
                  if (selectedArticleForUpload.fulltextImages) {
                    if (typeof selectedArticleForUpload.fulltextImages === 'string') {
                      images = JSON.parse(selectedArticleForUpload.fulltextImages);
                    } else if (Array.isArray(selectedArticleForUpload.fulltextImages)) {
                      images = selectedArticleForUpload.fulltextImages;
                    }
                  }
                  
                  return images.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {images.map((imagePath, index) => {
                    const imageUrl = getFileUrl(imagePath);
                    
                    return (
                      <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                        <img
                          src={imageUrl}
                          alt={`Fulltext image ${index + 1}`}
                          className="w-full h-auto object-contain bg-gray-50"
                          style={{ maxHeight: '400px' }}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent) {
                              const errorDiv = document.createElement('div');
                              errorDiv.className = 'w-full h-64 bg-gray-100 flex items-center justify-center';
                              errorDiv.innerHTML = '<div class="text-center text-gray-500"><i class="pi pi-image text-4xl mb-2"></i><p class="text-sm">Image not found</p></div>';
                              parent.appendChild(errorDiv);
                            }
                          }}
                        />
                        <div className="p-2 bg-gray-50 text-center">
                          <span className="text-xs text-gray-600">Image {index + 1}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                  ) : (
                    <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                      <i className="pi pi-image text-4xl text-gray-400 mb-3"></i>
                      <p className="text-gray-600 mb-2">No images uploaded yet</p>
                      <p className="text-sm text-gray-500">Use the file upload above to add fulltext images</p>
                    </div>
                  );
                } catch (error) {
                  return (
                    <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                      <i className="pi pi-image text-4xl text-gray-400 mb-3"></i>
                      <p className="text-gray-600 mb-2">No images uploaded yet</p>
                      <p className="text-sm text-gray-500">Use the file upload above to add fulltext images</p>
                    </div>
                  );
                }
              })()}
            </div>

            {/* Article Content - Headings 1-5 with Editable Fields */}
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Article Content</h3>
              <div className="space-y-6">
                {[1, 2, 3, 4, 5].map((num) => (
                  <div key={num} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex flex-col mb-4">
                      <label className="block mb-2 text-sm font-medium text-gray-700">Heading {num} Title</label>
                      <InputText
                        value={selectedArticleForUpload[`heading${num}Title` as keyof Article] as string || ''}
                        onChange={(e) => {
                          const updatedArticle = {
                            ...selectedArticleForUpload,
                            [`heading${num}Title`]: e.target.value
                          } as any;
                          setSelectedArticleForUpload(updatedArticle);
                        }}
                        className="w-full"
                        placeholder={`Enter heading ${num} title`}
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="block mb-2 text-sm font-medium text-gray-700">Heading {num} Content</label>
                      <Editor
                        value={selectedArticleForUpload[`heading${num}Content` as keyof Article] as string || ''}
                        onTextChange={(e) => {
                          const updatedArticle = {
                            ...selectedArticleForUpload,
                            [`heading${num}Content`]: e.htmlValue || ''
                          } as any;
                          setSelectedArticleForUpload(updatedArticle);
                        }}
                        style={{ height: '200px' }}
                        placeholder={`Enter heading ${num} content...`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}
