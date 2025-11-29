'use client';

import { useState, useEffect, useRef } from 'react';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { FileUpload } from 'primereact/fileupload';
import { adminAPI } from '@/lib/api';

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
  fulltextImages?: string[];
  authors?: Array<{ name: string; affiliation?: string; email?: string }>;
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
      const username = localStorage.getItem('journalAdminUser');
      if (!username) return;

      const usersResponse = await adminAPI.getUsers();
      const users = (usersResponse.data as any[]) || [];
      const user = users.find((u: any) => u.userName === username || u.journalShort === username);
      
      if (user && user.journalName) {
        const journalsResponse = await adminAPI.getJournals();
        const journals = (journalsResponse.data as any[]) || [];
        const journal = journals.find((j: any) => j.title === user.journalName);
        if (journal) {
          setJournalId(journal.id);
          setJournalTitle(journal.title || '');
          
          // Fetch published articles for current issue
          const articlesResponse = await adminAPI.getArticles({ 
            journalId: journal.id, 
            status: 'PUBLISHED' 
          });
              setArticles((articlesResponse.data as any[]) || []);
        }
      }
    } catch (error: any) {
      console.error('Error loading articles:', error);
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Failed to load articles' });
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
    if (imagePath.startsWith('http')) return imagePath;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    return `${baseUrl}${imagePath}`;
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
                        onClick={() => {
                          setSelectedArticle(article);
                          setShowUploadPdfDialog(true);
                        }}
                        className="px-3 py-1.5 text-sm bg-blue-50 text-blue-700 border border-blue-200 rounded hover:bg-blue-100 transition-colors flex items-center gap-1"
                      >
                        <i className="pi pi-upload text-xs"></i>
                        <span>Upload</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedArticle(article);
                          setShowUploadImagesDialog(true);
                        }}
                        className="px-3 py-1.5 text-sm bg-gray-50 text-gray-700 border border-gray-200 rounded hover:bg-gray-100 transition-colors flex items-center gap-1"
                      >
                        <i className="pi pi-cloud-upload text-xs"></i>
                        <span>Upload Fulltext Images</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedArticle(article);
                          setShowFullTextDialog(true);
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
        }}
        footer={
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setShowUploadPdfDialog(false);
                setSelectedArticle(null);
              }}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        }
      >
        {selectedArticle && (
          <FileUpload
            name="pdf"
            url={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}${process.env.NEXT_PUBLIC_API_URL?.endsWith('/api') ? '' : '/api'}/articles/${selectedArticle.id}/upload-pdf`}
            accept="application/pdf"
            maxFileSize={10000000}
            chooseLabel="Choose PDF"
            onUpload={(e) => {
              toast.current?.show({ severity: 'success', summary: 'Success', detail: 'PDF uploaded successfully' });
              setShowUploadPdfDialog(false);
              loadJournalAndArticles();
            }}
            onError={(e) => {
              toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Failed to upload PDF' });
            }}
            auto
          />
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
        }}
        footer={
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setShowUploadImagesDialog(false);
                setSelectedArticle(null);
              }}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        }
      >
        {selectedArticle && (
          <FileUpload
            name="files"
            url={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}${process.env.NEXT_PUBLIC_API_URL?.endsWith('/api') ? '' : '/api'}/articles/${selectedArticle.id}/upload-images`}
            multiple
            accept="image/*"
            maxFileSize={5000000}
            chooseLabel="Choose Images"
            onUpload={(e) => {
              toast.current?.show({ severity: 'success', summary: 'Success', detail: 'Images uploaded successfully' });
              setShowUploadImagesDialog(false);
              loadJournalAndArticles();
            }}
            onError={(e) => {
              toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Failed to upload images' });
            }}
            auto
          />
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
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setShowFullTextDialog(false);
                setSelectedArticle(null);
              }}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              Close
            </button>
          </div>
        }
      >
        {selectedArticle && (
          <div className="py-4 space-y-6">
            <div>
              <h3 className="text-xl font-bold mb-2">{selectedArticle.title}</h3>
              {selectedArticle.authors && selectedArticle.authors.length > 0 && (
                <p className="text-gray-600 mb-4">{formatAuthors(selectedArticle.authors)}</p>
              )}
            </div>
            
            {selectedArticle.fulltextImages && selectedArticle.fulltextImages.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedArticle.fulltextImages.map((imagePath, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                    <img src={getImageUrl(imagePath)} alt={`Fulltext image ${index + 1}`} className="w-full" />
                  </div>
                ))}
              </div>
            )}
            
            {selectedArticle.abstract && (
              <div>
                <h4 className="font-semibold mb-2">Abstract</h4>
                <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: selectedArticle.abstract }} />
              </div>
            )}
          </div>
        )}
      </Dialog>
    </div>
  );
}
