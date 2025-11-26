'use client';

import { useState, useEffect } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { Dialog } from 'primereact/dialog';
import { InputTextarea } from 'primereact/inputtextarea';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Toast } from 'primereact/toast';
import { useRef } from 'react';
import Link from 'next/link';
import '@/styles/admin-global.scss';
import { adminAPI } from '@/lib/api';

interface Article {
  id: number;
  title: string;
  abstract: string;
  keywords: string;
  status: string;
  journalTitle: string;
  journalId: number;
  authors: string[];
  submittedAt: string;
  publishedAt?: string;
  pdfUrl?: string;
  reviewComments?: string;
  reviewerId?: number;
  reviewerName?: string;
}

export default function ReviewArticles() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [reviewComments, setReviewComments] = useState('');
  const [reviewDecision, setReviewDecision] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [journalFilter, setJournalFilter] = useState('');
  const toast = useRef<Toast>(null);

  useEffect(() => {
    loadArticles();
  }, []);

  useEffect(() => {
    filterArticles();
  }, [articles, searchTerm, statusFilter, journalFilter]);

  const loadArticles = async () => {
    try {
      // Fetch articles from API
      const response = await adminAPI.getArticles();
      setArticles(response.data);
    } catch (error) {
      console.error('Error loading articles:', error);
      
      // Fallback to mock data
      setArticles([
        {
          id: 1,
          title: "Machine Learning Applications in Healthcare",
          abstract: "This paper explores the various applications of machine learning in healthcare...",
          keywords: "machine learning, healthcare, AI, medical diagnosis",
          status: "UNDER_REVIEW",
          journalTitle: "Journal of Advanced Research",
          journalId: 1,
          authors: ["Dr. John Smith", "Dr. Jane Doe"],
          submittedAt: "2024-01-15",
          pdfUrl: "/uploads/article1.pdf",
          reviewComments: "The methodology is sound but needs more experimental validation.",
          reviewerId: 1,
          reviewerName: "Dr. Review Expert"
        },
        {
          id: 2,
          title: "Sustainable Energy Solutions for Urban Areas",
          abstract: "This research investigates sustainable energy solutions for urban environments...",
          keywords: "sustainable energy, urban planning, renewable resources",
          status: "UNDER_REVIEW",
          journalTitle: "International Journal of Engineering",
          journalId: 2,
          authors: ["Dr. Mike Johnson"],
          submittedAt: "2024-01-10",
          pdfUrl: "/uploads/article2.pdf"
        },
        {
          id: 3,
          title: "AI in Medical Diagnosis: A Comprehensive Review",
          abstract: "A comprehensive review of artificial intelligence applications in medical diagnosis...",
          keywords: "artificial intelligence, medical diagnosis, healthcare technology",
          status: "UNDER_REVIEW",
          journalTitle: "Medical Research Quarterly",
          journalId: 3,
          authors: ["Dr. Alice Johnson", "Dr. Bob Smith"],
          submittedAt: "2024-01-05",
          pdfUrl: "/uploads/article3.pdf"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);

  const filterArticles = () => {
    let filtered = articles;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(article =>
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.abstract.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.authors.some(author => 
          author.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Status filter
    if (statusFilter) {
      filtered = filtered.filter(article => article.status === statusFilter);
    }

    // Journal filter
    if (journalFilter) {
      filtered = filtered.filter(article => 
        article.journalTitle === journalFilter
      );
    }

    setFilteredArticles(filtered);
  };

  const getStatusSeverity = (status: string) => {
    switch (status) {
      case 'PENDING': return 'warning';
      case 'UNDER_REVIEW': return 'info';
      case 'ACCEPTED': return 'success';
      case 'REJECTED': return 'danger';
      case 'PUBLISHED': return 'success';
      default: return 'secondary';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'UNDER_REVIEW': return 'Under Review';
      case 'PENDING': return 'Pending';
      case 'ACCEPTED': return 'Accepted';
      case 'REJECTED': return 'Rejected';
      case 'PUBLISHED': return 'Published';
      default: return status;
    }
  };

  const handleReviewArticle = (article: Article) => {
    setSelectedArticle(article);
    setReviewComments(article.reviewComments || '');
    setReviewDecision('');
    setShowReviewDialog(true);
  };

  const handleSubmitReview = async () => {
    if (!selectedArticle || !reviewDecision) {
      toast.current?.show({ 
        severity: 'error', 
        summary: 'Error', 
        detail: 'Please select a review decision' 
      });
      return;
    }

    try {
      await adminAPI.updateArticleStatus(selectedArticle.id, reviewDecision, reviewComments);
      
      setArticles(articles.map(article => 
        article.id === selectedArticle.id ? { 
          ...article, 
          status: reviewDecision,
          reviewComments: reviewComments
        } : article
      ));

      toast.current?.show({ 
        severity: 'success', 
        summary: 'Success', 
        detail: `Article ${reviewDecision.toLowerCase()} successfully` 
      });

      setShowReviewDialog(false);
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.current?.show({ 
        severity: 'error', 
        summary: 'Error', 
        detail: 'Failed to submit review' 
      });
    }
  };

  const statusOptions = [
    { label: 'All Statuses', value: '' },
    { label: 'Under Review', value: 'UNDER_REVIEW' },
    { label: 'Pending', value: 'PENDING' },
    { label: 'Accepted', value: 'ACCEPTED' },
    { label: 'Rejected', value: 'REJECTED' }
  ];

  const journalOptions = [
    { label: 'All Journals', value: '' },
    { label: 'Journal of Advanced Research', value: 'Journal of Advanced Research' },
    { label: 'International Journal of Engineering', value: 'International Journal of Engineering' },
    { label: 'Medical Research Quarterly', value: 'Medical Research Quarterly' }
  ];

  const reviewOptions = [
    { label: 'Accept Article', value: 'ACCEPTED' },
    { label: 'Request Minor Revisions', value: 'MINOR_REVISIONS' },
    { label: 'Request Major Revisions', value: 'MAJOR_REVISIONS' },
    { label: 'Reject Article', value: 'REJECTED' }
  ];

  const actionBodyTemplate = (rowData: Article) => {
    return (
      <div className="flex gap-2">
        <Button
          icon="pi pi-eye"
          className="p-button-rounded p-button-success p-button-sm"
          tooltip="Review Article"
          onClick={() => handleReviewArticle(rowData)}
        />
        <Button
          icon="pi pi-download"
          className="p-button-rounded p-button-secondary p-button-sm"
          tooltip="Download PDF"
          onClick={() => window.open(rowData.pdfUrl, '_blank')}
        />
      </div>
    );
  };

  return (
    <div className="admin-content">
      <Toast ref={toast} />
      
      {/* Header */}
      <div className="content-header mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Review Articles</h1>
            <p className="text-gray-600">Review and make decisions on submitted articles</p>
          </div>
          <Link href="/admin/dashboard">
            <Button label="Back to Dashboard" icon="pi pi-arrow-left" className="btn btn-outline" />
          </Link>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon warning">
              <i className="pi pi-clock"></i>
            </div>
          </div>
          <div className="stat-value">{articles.filter(a => a.status === 'UNDER_REVIEW').length}</div>
          <div className="stat-label">Under Review</div>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon info">
              <i className="pi pi-inbox"></i>
            </div>
          </div>
          <div className="stat-value">{articles.filter(a => a.status === 'PENDING').length}</div>
          <div className="stat-label">Pending Review</div>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon success">
              <i className="pi pi-check"></i>
            </div>
          </div>
          <div className="stat-value">{articles.filter(a => a.status === 'ACCEPTED').length}</div>
          <div className="stat-label">Accepted</div>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon danger">
              <i className="pi pi-times"></i>
            </div>
          </div>
          <div className="stat-value">{articles.filter(a => a.status === 'REJECTED').length}</div>
          <div className="stat-label">Rejected</div>
        </div>
      </div>

      {/* Filters */}
      <div className="content-card mb-6">
        <div className="card-header">
          <h3 className="card-title">Filters</h3>
          <p className="card-subtitle">Filter articles for review</p>
        </div>
        <div className="card-content">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="form-group">
              <label className="form-label">Search Articles</label>
              <div className="search-input-container">
                <i className="pi pi-search search-icon"></i>
                <InputText
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by title, author, or keywords..."
                  className="search-input"
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <Dropdown
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.value)}
                options={statusOptions}
                placeholder="Select Status"
                className="w-full"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Journal</label>
              <Dropdown
                value={journalFilter}
                onChange={(e) => setJournalFilter(e.value)}
                options={journalOptions}
                placeholder="Select Journal"
                className="w-full"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Actions</label>
              <div className="flex gap-2">
                <Button
                  label="Clear Filters"
                  icon="pi pi-filter-slash"
                  className="btn btn-outline"
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('');
                    setJournalFilter('');
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Articles Table */}
      <div className="data-table-container">
        <div className="table-header">
          <h3 className="table-title">Articles for Review ({filteredArticles.length})</h3>
        </div>
        <DataTable
          value={filteredArticles}
          loading={loading}
          paginator
          rows={10}
          rowsPerPageOptions={[5, 10, 25]}
          className="p-datatable-sm"
          emptyMessage="No articles found"
        >
          <Column field="title" header="Title" sortable />
          <Column field="journalTitle" header="Journal" sortable />
          <Column 
            field="status" 
            header="Status" 
            body={(rowData) => (
              <Tag value={getStatusLabel(rowData.status)} severity={getStatusSeverity(rowData.status)} />
            )}
            sortable
          />
          <Column 
            field="authors" 
            header="Authors" 
            body={(rowData) => rowData.authors.join(', ')}
          />
          <Column field="submittedAt" header="Submitted" sortable />
          <Column 
            header="Actions" 
            body={actionBodyTemplate}
            style={{ width: '120px' }}
          />
        </DataTable>
      </div>

      {/* Review Dialog */}
      <Dialog
        header={`Review Article: ${selectedArticle?.title}`}
        visible={showReviewDialog}
        style={{ width: '80vw', maxWidth: '800px' }}
        onHide={() => setShowReviewDialog(false)}
        footer={
          <div className="flex justify-end gap-3">
            <Button
              label="Cancel"
              icon="pi pi-times"
              className="btn btn-outline"
              onClick={() => setShowReviewDialog(false)}
            />
            <Button
              label="Submit Review"
              icon="pi pi-check"
              className="btn btn-primary"
              onClick={handleSubmitReview}
            />
          </div>
        }
      >
        {selectedArticle && (
          <div className="space-y-6">
            <div className="article-info">
              <h4 className="font-semibold text-gray-900 mb-2">Article Information</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Journal:</strong> {selectedArticle.journalTitle}
                </div>
                <div>
                  <strong>Authors:</strong> {selectedArticle.authors.join(', ')}
                </div>
                <div>
                  <strong>Submitted:</strong> {selectedArticle.submittedAt}
                </div>
                <div>
                  <strong>Keywords:</strong> {selectedArticle.keywords}
                </div>
              </div>
            </div>

            <div>
              <label className="form-label">Review Decision</label>
              <Dropdown
                value={reviewDecision}
                onChange={(e) => setReviewDecision(e.value)}
                options={reviewOptions}
                placeholder="Select Review Decision"
                className="w-full"
              />
            </div>

            <div>
              <label className="form-label">Review Comments</label>
              <InputTextarea
                value={reviewComments}
                onChange={(e) => setReviewComments(e.target.value)}
                rows={8}
                placeholder="Provide detailed feedback for the authors..."
                className="w-full"
              />
              <p className="text-sm text-gray-500 mt-2">
                Your comments will be shared with the authors to help improve the manuscript.
              </p>
            </div>

            <div>
              <label className="form-label">Abstract</label>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-700">{selectedArticle.abstract}</p>
              </div>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}

