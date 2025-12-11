'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { adminAPI } from '@/lib/api';
import { loadJournalData } from '@/lib/journalAdminUtils';

interface Article {
  id: number;
  title: string;
  publishedAt?: string;
  volumeNo?: string;
  issueNo?: string;
  issueMonth?: string;
  year?: string;
}

interface ArchiveIssue {
  volume: string;
  issue: string;
  year: number;
  articleCount: number;
  articles: Article[];
}

export default function ArchivePage() {
  const router = useRouter();
  const [articles, setArticles] = useState<Article[]>([]);
  const [archiveIssues, setArchiveIssues] = useState<Map<number, ArchiveIssue[]>>(new Map());
  const [expandedYears, setExpandedYears] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [journalId, setJournalId] = useState<number | null>(null);
  const [journalTitle, setJournalTitle] = useState<string>('');
  const [selectedIssue, setSelectedIssue] = useState<ArchiveIssue | null>(null);
  const [showArticlesDialog, setShowArticlesDialog] = useState(false);
  const toast = useRef<Toast>(null);

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
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8">
      <Toast ref={toast} />
      
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
                              onClick={() => {
                                // Open first article's detail page in new tab with admin flag
                                if (firstArticle && firstArticle.id) {
                                  window.open(`/articles/${firstArticle.id}?admin=true`, '_blank');
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

      {/* Articles Dialog */}
      <Dialog
        header={selectedIssue ? `Volume ${selectedIssue.volume}, Issue ${selectedIssue.issue} - Articles` : 'Articles'}
        visible={showArticlesDialog}
        style={{ width: '90vw', maxWidth: '1200px' }}
        contentStyle={{ maxHeight: 'calc(90vh - 120px)', overflow: 'auto' }}
        onHide={() => {
          setShowArticlesDialog(false);
          setSelectedIssue(null);
        }}
        footer={
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setShowArticlesDialog(false);
                setSelectedIssue(null);
              }}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
            >
              Close
            </button>
          </div>
        }
      >
        {selectedIssue && selectedIssue.articles.length > 0 ? (
          <div className="space-y-4">
            {selectedIssue.articles.map((article) => (
              <div key={article.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <h3 className="text-lg font-semibold text-blue-600 mb-2">{article.title}</h3>
                {article.publishedAt && (
                  <p className="text-sm text-gray-600">
                    Published: {new Date(article.publishedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <i className="pi pi-file text-4xl mb-4"></i>
            <p>No articles found for this issue.</p>
          </div>
        )}
      </Dialog>
    </div>
  );
}
