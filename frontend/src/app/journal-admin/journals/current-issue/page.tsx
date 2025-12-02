'use client';

import { useState, useEffect, useRef } from 'react';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { FileUpload } from 'primereact/fileupload';
import { Editor } from 'primereact/editor';
import { InputText } from 'primereact/inputtext';
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
  receivedAt?: string;
  acceptedAt?: string;
  publishedAt?: string;
  doi?: string;
  pdfUrl?: string;
  fulltextImages?: string | string[]; // Can be JSON string or array
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

export default function CurrentIssuePage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [journalId, setJournalId] = useState<number | null>(null);
  const [journalTitle, setJournalTitle] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [selectedSpecialIssue, setSelectedSpecialIssue] = useState<string>('');
  const [selectedArticles, setSelectedArticles] = useState<Set<number>>(new Set());
  const [showUploadPdfDialog, setShowUploadPdfDialog] = useState(false);
  const [showUploadImagesDialog, setShowUploadImagesDialog] = useState(false);
  const [showFullTextDialog, setShowFullTextDialog] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [savingFullText, setSavingFullText] = useState(false);
  const [selectedPdfFile, setSelectedPdfFile] = useState<File | null>(null);
  const [selectedImageFiles, setSelectedImageFiles] = useState<File[]>([]);
  const toast = useRef<Toast>(null);

  useEffect(() => {
    loadJournalAndArticles();
  }, []);

  // Clear selected articles if they're no longer in the filtered list
  useEffect(() => {
    setSelectedArticles(prev => {
      if (prev.size === 0) return prev;
      const newSet = new Set<number>();
      const filteredIds = new Set(filteredArticles.map(a => a.id));
      prev.forEach(id => {
        if (filteredIds.has(id)) {
          newSet.add(id);
        }
      });
      return newSet;
    });
  }, [articles, selectedMonth, selectedYear, selectedSpecialIssue]);

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
      // Fetch published articles for current issue
      const articlesResponse = await adminAPI.getArticles({ 
        journalId: journalData.journalId, 
        status: 'PUBLISHED' 
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

  const getImageUrl = (imagePath?: string) => {
    if (!imagePath) return '';
    return getFileUrl(imagePath);
  };

  // Parse fulltextImages from JSON string to array
  const parseFulltextImages = (fulltextImages?: string | string[]): string[] => {
    if (!fulltextImages) return [];
    if (Array.isArray(fulltextImages)) return fulltextImages;
    if (typeof fulltextImages === 'string') {
      try {
        const parsed = JSON.parse(fulltextImages);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  };

  // Filter articles by selected month/year
  const filteredArticles = articles.filter((article) => {
    if (selectedMonth && article.issueMonth !== selectedMonth) return false;
    if (selectedYear && article.year !== selectedYear) return false;
    if (selectedSpecialIssue && article.specialIssue !== selectedSpecialIssue) return false;
    return true;
  });

  // Get unique special issues
  const specialIssues = Array.from(new Set(articles.map(a => a.specialIssue).filter(Boolean))) as string[];

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 2017 }, (_, i) => {
    const year = 2018 + i;
    return { label: year.toString(), value: year.toString() };
  }).reverse();

  const toggleArticleSelection = (articleId: number) => {
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

  const toggleSelectAll = () => {
    if (selectedArticles.size === filteredArticles.length) {
      setSelectedArticles(new Set());
    } else {
      setSelectedArticles(new Set(filteredArticles.map(a => a.id)));
    }
  };

  /**
   * Move articles from Current Issue (PUBLISHED) back to Articles in Press (ACCEPTED)
   * This "unpublishes" articles - they will no longer appear in the Current Issue
   * but will be available in the Articles in Press section
   */
  const handleMoveToArticlesInPress = async () => {
    if (selectedArticles.size === 0) {
      toast.current?.show({ severity: 'warn', summary: 'No Selection', detail: 'Please select at least one article to move' });
      return;
    }
    confirmDialog({
      message: `Are you sure you want to move ${selectedArticles.size} article(s) back to Articles in Press? This will change their status from PUBLISHED to ACCEPTED, unpublishing them from the Current Issue. They will appear in the Articles in Press section instead.`,
      header: 'Confirm Move to Articles in Press',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        try {
          // Get selected articles from filtered articles
          const articlesToMove = filteredArticles.filter(a => selectedArticles.has(a.id));
          
          if (articlesToMove.length === 0) {
            toast.current?.show({ severity: 'warn', summary: 'No Articles', detail: 'No articles found to move' });
            return;
          }
          
          // Clear selection immediately to prevent checkbox issues
          setSelectedArticles(new Set());
          
          // Update each article - change status from PUBLISHED to ACCEPTED (unpublish)
          for (const article of articlesToMove) {
            await adminAPI.updateArticle(article.id, {
              status: 'ACCEPTED'
            });
          }
          
          toast.current?.show({ severity: 'success', summary: 'Success', detail: `${articlesToMove.length} article(s) moved to Articles in Press successfully. They are no longer in the Current Issue.` });
          // Clear filters to show updated list
          setSelectedMonth('');
          setSelectedYear('');
          setSelectedSpecialIssue('');
          await loadJournalAndArticles();
        } catch (error: any) {
          console.error('Error moving articles:', error);
          toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Failed to move articles to Articles in Press' });
        }
      },
      reject: () => {
        // Do nothing
      }
    });
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
      
      {/* Month Navigation Bar */}
      <div className="mb-6 flex flex-wrap gap-2">
        {months.map((month) => {
          const isSelected = selectedMonth === month;
          return (
            <div key={month} className="relative">
              <button
                type="button"
                onClick={() => {
                  setSelectedMonth(isSelected ? '' : month);
                  if (!isSelected) setSelectedYear('');
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
                  {years.map((yearOption) => (
                    <button
                      key={yearOption.value}
                      type="button"
                      onClick={() => {
                        setSelectedYear(yearOption.value);
                      }}
                      className={`w-full text-left px-4 py-2 hover:bg-blue-50 transition-colors ${
                        selectedYear === yearOption.value ? 'bg-blue-100 font-semibold' : ''
                      }`}
                      style={{
                        color: selectedYear === yearOption.value ? '#1e40af' : '#374151'
                      }}
                    >
                      {month} {yearOption.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        
        {/* Special Issue Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              // Toggle special issue filter dropdown only if no specific issue is selected
              if (selectedSpecialIssue && selectedSpecialIssue !== 'special' && specialIssues.includes(selectedSpecialIssue)) {
                // If a specific issue is selected, clicking should just show/hide dropdown
                setSelectedSpecialIssue(selectedSpecialIssue === 'special' ? selectedSpecialIssue : 'special');
              } else {
                setSelectedSpecialIssue(selectedSpecialIssue ? '' : 'special');
              }
            }}
            className={`px-4 py-2 rounded-lg border-2 transition-all ${
              selectedSpecialIssue && selectedSpecialIssue !== 'special' && specialIssues.includes(selectedSpecialIssue)
                ? 'bg-blue-600 border-blue-600'
                : 'bg-white border-gray-300 hover:border-gray-400'
            }`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: selectedSpecialIssue && selectedSpecialIssue !== 'special' && specialIssues.includes(selectedSpecialIssue) ? '#ffffff' : '#374151'
            }}
          >
            <i className="pi pi-calendar"></i>
            <span>specialissue</span>
            <i className="pi pi-chevron-down text-xs"></i>
          </button>
          {(selectedSpecialIssue === 'special' || (selectedSpecialIssue && selectedSpecialIssue !== 'special' && specialIssues.includes(selectedSpecialIssue))) && specialIssues.length > 0 && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[200px] max-h-[300px] overflow-y-auto">
              <button
                type="button"
                onClick={() => setSelectedSpecialIssue('')}
                className="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors"
              >
                All Issues
              </button>
              {specialIssues.map((issue) => (
                <button
                  key={issue}
                  type="button"
                  onClick={() => setSelectedSpecialIssue(issue)}
                  className={`w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors ${
                    selectedSpecialIssue === issue ? 'bg-blue-100 font-semibold' : ''
                  }`}
                >
                  {issue}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* List of Articles Section */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="mb-6 flex items-center justify-between border-b-2 border-gray-200 pb-4">
          <div className="flex items-center gap-3">
            <i className="pi pi-list text-blue-600 text-2xl"></i>
            <h2 className="text-2xl font-bold text-gray-900">List of Articles</h2>
            {selectedMonth && selectedYear && (
              <span className="text-gray-600">
                {selectedMonth} {selectedYear}
              </span>
            )}
          </div>
          <div className="flex items-center gap-4">
            {filteredArticles.length > 0 && (
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={filteredArticles.length > 0 && selectedArticles.size === filteredArticles.length}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-600">
                  Select All ({selectedArticles.size}/{filteredArticles.length})
                </span>
              </div>
            )}
            {journalTitle && (
              <span className="text-sm text-gray-600">Journal: {journalTitle}</span>
            )}
          </div>
        </div>

        {filteredArticles.length > 0 ? (
          <div className="space-y-4">
            {filteredArticles.map((article) => (
              <div key={article.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    checked={selectedArticles.has(article.id)}
                    onChange={() => toggleArticleSelection(article.id)}
                    className="mt-2 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />

                  {/* Title & Details */}
                  <div className="flex-1">
                    <a
                      href={`/articles/${article.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-lg font-semibold text-blue-600 hover:text-blue-800 hover:underline mb-2 block"
                    >
                      {article.title}
                    </a>
                    
                    {/* Authors */}
                    {article.authors && article.authors.length > 0 && (
                      <div className="mb-3 flex items-start gap-2">
                        <i className="pi pi-user text-gray-500 mt-0.5"></i>
                        <span className="text-sm text-gray-700">{formatAuthors(article.authors)}</span>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            const fullArticle = await adminAPI.getArticle(article.id);
                            setSelectedArticle(fullArticle.data as Article);
                            setShowUploadPdfDialog(true);
                          } catch (error: any) {
                            console.error('Error loading article:', error);
                            toast.current?.show({ 
                              severity: 'error', 
                              summary: 'Error', 
                              detail: 'Failed to load article details' 
                            });
                          }
                        }}
                        className="px-3 py-1.5 text-sm bg-blue-50 text-blue-700 border border-blue-200 rounded hover:bg-blue-100 transition-colors flex items-center gap-1"
                      >
                        <i className="pi pi-upload text-xs"></i>
                        <span>Upload</span>
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            const fullArticle = await adminAPI.getArticle(article.id);
                            setSelectedArticle(fullArticle.data as Article);
                            setShowUploadImagesDialog(true);
                          } catch (error: any) {
                            console.error('Error loading article:', error);
                            toast.current?.show({ 
                              severity: 'error', 
                              summary: 'Error', 
                              detail: 'Failed to load article details' 
                            });
                          }
                        }}
                        className="px-3 py-1.5 text-sm bg-gray-50 text-gray-700 border border-gray-200 rounded hover:bg-gray-100 transition-colors flex items-center gap-1"
                      >
                        <i className="pi pi-cloud-upload text-xs"></i>
                        <span>Upload Fulltext Images</span>
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            // Fetch full article data to ensure we have all heading fields
                            const fullArticle = await adminAPI.getArticle(article.id);
                            setSelectedArticle(fullArticle.data as Article);
                            setShowFullTextDialog(true);
                          } catch (error: any) {
                            console.error('Error loading article:', error);
                            toast.current?.show({ 
                              severity: 'error', 
                              summary: 'Error', 
                              detail: 'Failed to load article details' 
                            });
                          }
                        }}
                        className="px-3 py-1.5 text-sm bg-white text-gray-700 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                      >
                        Full Text
                      </button>
                    </div>
                  </div>

                  {/* Actions Column - Edit Button */}
                  <div className="flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        // Navigate to edit article
                        window.location.href = `/journal-admin/journals/articles-press`;
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <i className="pi pi-calendar text-6xl text-gray-300 mb-4"></i>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No Articles Found</h3>
            <p className="text-gray-500">
              {selectedMonth || selectedYear || selectedSpecialIssue
                ? 'No articles match the selected filters.'
                : 'There are currently no articles in the current issue.'}
            </p>
          </div>
        )}
      </div>

      {/* Bottom Action Buttons */}
      {filteredArticles.length > 0 && (
        <div className="mt-6 flex justify-end gap-4">
          <button
            type="button"
            onClick={handleMoveToArticlesInPress}
            disabled={selectedArticles.size === 0}
            style={{
              opacity: selectedArticles.size === 0 ? 0.5 : 1,
              cursor: selectedArticles.size === 0 ? 'not-allowed' : 'pointer',
              backgroundColor: selectedArticles.size === 0 ? '#d1d5db' : '#4b5563',
              color: selectedArticles.size === 0 ? '#6b7280' : '#ffffff',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              fontWeight: '500',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
            title={selectedArticles.size === 0 ? 'Please select at least one article to move' : `Move ${selectedArticles.size} selected article(s) back to Articles in Press (unpublish them)`}
          >
            <i className="pi pi-calendar"></i>
            <span>Move to Articles in Press</span>
            {selectedArticles.size > 0 && (
              <span style={{
                marginLeft: '0.25rem',
                padding: '0.125rem 0.5rem',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '4px',
                fontSize: '0.75rem'
              }}>
                {selectedArticles.size}
              </span>
            )}
          </button>
        </div>
      )}

      {/* Upload PDF Dialog */}
      <Dialog
        header="Upload PDF"
        visible={showUploadPdfDialog}
        style={{ width: '500px' }}
        onHide={() => {
          setShowUploadPdfDialog(false);
          setSelectedArticle(null);
          setSelectedPdfFile(null);
        }}
        footer={
          <div className="flex justify-end gap-2" style={{ padding: '0.75rem' }}>
            <button
              type="button"
              onClick={() => {
                setShowUploadPdfDialog(false);
                setSelectedArticle(null);
                setSelectedPdfFile(null);
              }}
              style={{
                backgroundColor: '#e5e7eb',
                color: '#374151',
                border: '1px solid #d1d5db',
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
                if (!selectedArticle || !selectedPdfFile) {
                  toast.current?.show({ severity: 'warn', summary: 'Warning', detail: 'Please select a PDF file to upload' });
                  return;
                }

                try {
                  setUploadingPdf(true);
                  const formData = new FormData();
                  formData.append('file', selectedPdfFile);

                  const response = await fetch(getApiUrl(`/articles/${selectedArticle.id}/upload-pdf`), {
                    method: 'POST',
                    body: formData,
                  });

                  if (!response.ok) {
                    const errorData = await response.json().catch(() => ({ message: 'Upload failed' }));
                    throw new Error(errorData.message || 'Failed to upload PDF');
                  }

                  toast.current?.show({ severity: 'success', summary: 'Success', detail: 'PDF uploaded successfully' });
                  setShowUploadPdfDialog(false);
                  setSelectedPdfFile(null);
                  await loadJournalAndArticles();
                } catch (error: any) {
                  console.error('Error uploading PDF:', error);
                  toast.current?.show({ severity: 'error', summary: 'Error', detail: error.message || 'Failed to upload PDF' });
                } finally {
                  setUploadingPdf(false);
                }
              }}
              disabled={uploadingPdf || !selectedPdfFile}
              style={{
                backgroundColor: uploadingPdf || !selectedPdfFile ? '#9ca3af' : '#2563eb',
                color: '#ffffff',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: uploadingPdf || !selectedPdfFile ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                opacity: uploadingPdf || !selectedPdfFile ? 0.7 : 1
              }}
            >
              {uploadingPdf ? (
                <>
                  <i className="pi pi-spin pi-spinner"></i>
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <i className="pi pi-upload"></i>
                  <span>Upload PDF</span>
                </>
              )}
            </button>
          </div>
        }
      >
        {selectedArticle && (
          <div className="space-y-4">
            <FileUpload
              mode="basic"
              accept="application/pdf"
              maxFileSize={10000000}
              chooseLabel="Choose PDF"
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
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm font-medium text-blue-900 mb-1">Selected file:</p>
                <p className="text-sm text-blue-700">{selectedPdfFile.name}</p>
                <p className="text-xs text-blue-600 mt-1">Size: {(selectedPdfFile.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            )}
          </div>
        )}
      </Dialog>

      {/* Upload Images Dialog */}
      <Dialog
        header="Upload Fulltext Images"
        visible={showUploadImagesDialog}
        style={{ width: '500px' }}
        onHide={() => {
          setShowUploadImagesDialog(false);
          setSelectedArticle(null);
          setSelectedImageFiles([]);
        }}
        footer={
          <div className="flex justify-end gap-2" style={{ padding: '0.75rem' }}>
            <button
              type="button"
              onClick={() => {
                setShowUploadImagesDialog(false);
                setSelectedArticle(null);
                setSelectedImageFiles([]);
              }}
              style={{
                backgroundColor: '#e5e7eb',
                color: '#374151',
                border: '1px solid #d1d5db',
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
                if (!selectedArticle || selectedImageFiles.length === 0) {
                  toast.current?.show({ severity: 'warn', summary: 'Warning', detail: 'Please select at least one image to upload' });
                  return;
                }

                try {
                  setUploadingImages(true);
                  const formData = new FormData();
                  selectedImageFiles.forEach((file) => {
                    formData.append('files', file);
                  });

                  const response = await fetch(getApiUrl(`/articles/${selectedArticle.id}/upload-images`), {
                    method: 'POST',
                    body: formData,
                  });

                  if (!response.ok) {
                    const errorData = await response.json().catch(() => ({ message: 'Upload failed' }));
                    throw new Error(errorData.message || 'Failed to upload images');
                  }

                  toast.current?.show({ severity: 'success', summary: 'Success', detail: `${selectedImageFiles.length} image(s) uploaded successfully` });
                  setShowUploadImagesDialog(false);
                  setSelectedImageFiles([]);
                  await loadJournalAndArticles();
                } catch (error: any) {
                  console.error('Error uploading images:', error);
                  toast.current?.show({ severity: 'error', summary: 'Error', detail: error.message || 'Failed to upload images' });
                } finally {
                  setUploadingImages(false);
                }
              }}
              disabled={uploadingImages || selectedImageFiles.length === 0}
              style={{
                backgroundColor: uploadingImages || selectedImageFiles.length === 0 ? '#9ca3af' : '#2563eb',
                color: '#ffffff',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: uploadingImages || selectedImageFiles.length === 0 ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                opacity: uploadingImages || selectedImageFiles.length === 0 ? 0.7 : 1
              }}
            >
              {uploadingImages ? (
                <>
                  <i className="pi pi-spin pi-spinner"></i>
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <i className="pi pi-upload"></i>
                  <span>Upload Images</span>
                </>
              )}
            </button>
          </div>
        }
      >
        {selectedArticle && (
          <div className="space-y-4">
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
            {selectedImageFiles.length > 0 && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm font-medium text-blue-900 mb-2">Selected {selectedImageFiles.length} file(s):</p>
                <ul className="text-sm text-blue-700 space-y-1 max-h-40 overflow-y-auto">
                  {selectedImageFiles.map((file, index) => (
                    <li key={index}>
                      {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </Dialog>

      {/* Full Text Dialog */}
      <Dialog
        header={selectedArticle ? selectedArticle.title : 'Full Text'}
        visible={showFullTextDialog}
        style={{ width: '90vw', maxWidth: '1000px', height: '90vh' }}
        contentStyle={{ maxHeight: 'calc(90vh - 120px)', overflow: 'auto' }}
        onHide={() => {
          setShowFullTextDialog(false);
          setSelectedArticle(null);
        }}
        footer={
          <div className="flex justify-end gap-2" style={{ padding: '0.75rem' }}>
            <button
              type="button"
              onClick={() => {
                setShowFullTextDialog(false);
                setSelectedArticle(null);
              }}
              style={{
                backgroundColor: '#e5e7eb',
                color: '#374151',
                border: '1px solid #d1d5db',
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
                if (!selectedArticle || !journalId) return;
                
                try {
                  setSavingFullText(true);
                  
                  // Update article with all heading content
                  const articleData = {
                    heading1Title: selectedArticle.heading1Title || '',
                    heading1Content: selectedArticle.heading1Content || '',
                    heading2Title: selectedArticle.heading2Title || '',
                    heading2Content: selectedArticle.heading2Content || '',
                    heading3Title: selectedArticle.heading3Title || '',
                    heading3Content: selectedArticle.heading3Content || '',
                    heading4Title: selectedArticle.heading4Title || '',
                    heading4Content: selectedArticle.heading4Content || '',
                    heading5Title: selectedArticle.heading5Title || '',
                    heading5Content: selectedArticle.heading5Content || '',
                  };
                  
                  await adminAPI.updateArticle(selectedArticle.id, articleData);
                  toast.current?.show({ 
                    severity: 'success', 
                    summary: 'Success', 
                    detail: 'Article content saved successfully' 
                  });
                  await loadJournalAndArticles();
                  setShowFullTextDialog(false);
                  setSelectedArticle(null);
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
                backgroundColor: savingFullText ? '#9ca3af' : '#10b981',
                color: '#ffffff',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: savingFullText ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                opacity: savingFullText ? 0.7 : 1
              }}
            >
              {savingFullText ? (
                <>
                  <i className="pi pi-spin pi-spinner"></i>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <i className="pi pi-check"></i>
                  <span>Save</span>
                </>
              )}
            </button>
          </div>
        }
      >
        {selectedArticle && (
          <div className="py-4 space-y-6">
            {/* Article Title */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedArticle.title}</h2>
              {selectedArticle.authors && selectedArticle.authors.length > 0 && (
                <p className="text-gray-600 mb-4">
                  <span className="font-semibold">Authors: </span>
                  {formatAuthors(selectedArticle.authors)}
                </p>
              )}
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
                        value={selectedArticle[`heading${num}Title` as keyof Article] as string || ''}
                        onChange={(e) => {
                          const updatedArticle = {
                            ...selectedArticle,
                            [`heading${num}Title`]: e.target.value
                          } as any;
                          setSelectedArticle(updatedArticle);
                        }}
                        className="w-full"
                        placeholder={`Enter heading ${num} title`}
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="block mb-2 text-sm font-medium text-gray-700">Heading {num} Content</label>
                      <Editor
                        value={selectedArticle[`heading${num}Content` as keyof Article] as string || ''}
                        onTextChange={(e) => {
                          const updatedArticle = {
                            ...selectedArticle,
                            [`heading${num}Content`]: e.htmlValue || ''
                          } as any;
                          setSelectedArticle(updatedArticle);
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
