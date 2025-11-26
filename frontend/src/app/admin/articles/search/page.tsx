'use client';

import { useState, useEffect } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Toast } from 'primereact/toast';
import { useRef } from 'react';
import { Dialog } from 'primereact/dialog';
import { InputTextarea } from 'primereact/inputtextarea';
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

export default function ArticleSearchManagement() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [selectedArticles, setSelectedArticles] = useState<Article[]>([]);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [journalFilter, setJournalFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const toast = useRef<Toast>(null);

  useEffect(() => {
    loadArticles();
  }, []);

  useEffect(() => {
    filterArticles();
  }, [articles, searchTerm, statusFilter, journalFilter, dateFilter]);

  const loadArticles = async () => {
    try {
      // Fetch articles from API
      const response = await adminAPI.getArticles();
      setArticles(response.data);
    } catch (error) {
      console.error('Error loading articles:', error);
      
      // Fallback to mock data if API fails
      setArticles([
        {
          id: 1,
          title: "Machine Learning Applications in Healthcare",
          abstract: "This paper explores the various applications of machine learning in healthcare, including diagnostic tools, treatment optimization, and patient monitoring systems.",
          keywords: "machine learning, healthcare, AI, medical diagnosis, treatment optimization",
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
          abstract: "This research investigates sustainable energy solutions for urban environments, focusing on renewable energy integration and smart grid technologies.",
          keywords: "sustainable energy, urban planning, renewable resources, smart grid",
          status: "PENDING",
          journalTitle: "International Journal of Engineering",
          journalId: 2,
          authors: ["Dr. Mike Johnson"],
          submittedAt: "2024-01-10"
        },
        {
          id: 3,
          title: "Social Media Impact on Education",
          abstract: "This study examines the impact of social media on educational outcomes, student engagement, and learning methodologies in modern educational settings.",
          keywords: "social media, education, learning outcomes, student engagement",
          status: "PUBLISHED",
          journalTitle: "Journal of Advanced Research",
          journalId: 1,
          authors: ["Dr. Sarah Wilson", "Dr. Tom Brown"],
          submittedAt: "2023-12-20",
          publishedAt: "2024-01-05",
          pdfUrl: "/uploads/article3.pdf"
        },
        {
          id: 4,
          title: "AI in Medical Diagnosis: A Comprehensive Review",
          abstract: "A comprehensive review of artificial intelligence applications in medical diagnosis, covering recent advances and future prospects.",
          keywords: "artificial intelligence, medical diagnosis, healthcare technology, review",
          status: "ACCEPTED",
          journalTitle: "Medical Research Quarterly",
          journalId: 3,
          authors: ["Dr. Alice Johnson", "Dr. Bob Smith"],
          submittedAt: "2024-01-05",
          pdfUrl: "/uploads/article4.pdf"
        },
        {
          id: 5,
          title: "Renewable Energy Technologies: Current Trends",
          abstract: "An analysis of current trends in renewable energy technologies and their potential for widespread adoption.",
          keywords: "renewable energy, solar, wind, technology trends",
          status: "REJECTED",
          journalTitle: "International Journal of Engineering",
          journalId: 2,
          authors: ["Dr. Green Energy"],
          submittedAt: "2023-12-15",
          reviewComments: "The scope is too broad and lacks specific technical contributions."
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filterArticles = () => {
    let filtered = articles;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(article =>
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.abstract.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.keywords.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.authors.some(author => author.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Status filter
    if (statusFilter) {
      filtered = filtered.filter(article => article.status === statusFilter);
    }

    // Journal filter
    if (journalFilter) {
      filtered = filtered.filter(article => article.journalTitle === journalFilter);
    }

    // Date filter
    if (dateFilter) {
      const filterDate = new Date();
      switch (dateFilter) {
        case 'today':
          filtered = filtered.filter(article => 
            new Date(article.submittedAt).toDateString() === filterDate.toDateString()
          );
          break;
        case 'week':
          const weekAgo = new Date(filterDate.getTime() - 7 * 24 * 60 * 60 * 1000);
          filtered = filtered.filter(article => new Date(article.submittedAt) >= weekAgo);
          break;
        case 'month':
          const monthAgo = new Date(filterDate.getTime() - 30 * 24 * 60 * 60 * 1000);
          filtered = filtered.filter(article => new Date(article.submittedAt) >= monthAgo);
          break;
      }
    }

    setFilteredArticles(filtered);
  };

  const getStatusSeverity = (status: string) => {
    switch (status) {
      case 'PENDING': return 'warning';
      case 'UNDER_REVIEW': return 'info';
      case 'ACCEPTED': return 'success';
      case 'PUBLISHED': return 'success';
      case 'REJECTED': return 'danger';
      default: return 'secondary';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'UNDER_REVIEW': return 'Under Review';
      case 'PENDING': return 'Pending';
      case 'ACCEPTED': return 'Accepted';
      case 'PUBLISHED': return 'Published';
      case 'REJECTED': return 'Rejected';
      default: return status;
    }
  };

  const handleStatusChange = async (articleId: number, newStatus: string) => {
    try {
      await adminAPI.updateArticleStatus(articleId, newStatus);
      setArticles(articles.map(article => 
        article.id === articleId ? { ...article, status: newStatus } : article
      ));
      toast.current?.show({ 
        severity: 'success', 
        summary: 'Success', 
        detail: `Article status updated to ${getStatusLabel(newStatus)}` 
      });
    } catch (error) {
      console.error('Error updating article status:', error);
      toast.current?.show({ 
        severity: 'error', 
        summary: 'Error', 
        detail: 'Failed to update article status' 
      });
    }
  };

  const handleReviewArticle = (article: Article) => {
    setSelectedArticle(article);
    setShowReviewDialog(true);
  };

  const handleSaveReview = () => {
    if (selectedArticle) {
      // In a real app, save review comments to backend
      toast.current?.show({ 
        severity: 'success', 
        summary: 'Success', 
        detail: 'Review comments saved successfully' 
      });
      setShowReviewDialog(false);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setJournalFilter('');
    setDateFilter('');
  };

  const statusOptions = [
    { label: 'All Statuses', value: '' },
    { label: 'Pending', value: 'PENDING' },
    { label: 'Under Review', value: 'UNDER_REVIEW' },
    { label: 'Accepted', value: 'ACCEPTED' },
    { label: 'Published', value: 'PUBLISHED' },
    { label: 'Rejected', value: 'REJECTED' }
  ];

  const journalOptions = [
    { label: 'All Journals', value: '' },
    ...Array.from(new Set(articles.map(a => a.journalTitle))).map(journal => ({
      label: journal,
      value: journal
    }))
  ];

  const dateOptions = [
    { label: 'All Time', value: '' },
    { label: 'Today', value: 'today' },
    { label: 'This Week', value: 'week' },
    { label: 'This Month', value: 'month' }
  ];

  const stats = [
    { title: 'Total Articles', value: articles.length, icon: 'pi pi-file-edit', color: 'primary' },
    { title: 'Pending Review', value: articles.filter(a => a.status === 'PENDING').length, icon: 'pi pi-clock', color: 'warning' },
    { title: 'Under Review', value: articles.filter(a => a.status === 'UNDER_REVIEW').length, icon: 'pi pi-eye', color: 'info' },
    { title: 'Published', value: articles.filter(a => a.status === 'PUBLISHED').length, icon: 'pi pi-check', color: 'success' }
  ];

  return (
    <div className="article-search-management">
      <Toast ref={toast} />

      {/* Statistics Cards */}
      <div className="stats-grid mb-6">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card">
            <div className="stat-header">
              <div className={`stat-icon ${stat.color}`}>
                <i className={stat.icon}></i>
              </div>
            </div>
            <div className="stat-value">{stat.value}</div>
            <div className="stat-label">{stat.title}</div>
          </div>
        ))}
      </div>

      {/* Search and Filter */}
      <div className="content-card mb-6">
        <div className="card-content">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-2">
              <label className="form-label">Search Articles</label>
              <div className="relative">
                <i className="pi pi-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                <InputText
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by title, abstract, author, or keywords..."
                  className="form-input pl-10"
                />
              </div>
            </div>
            <div>
              <label className="form-label">Status</label>
              <Dropdown
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.value)}
                options={statusOptions}
                className="form-input"
                placeholder="All Statuses"
              />
            </div>
            <div>
              <label className="form-label">Journal</label>
              <Dropdown
                value={journalFilter}
                onChange={(e) => setJournalFilter(e.value)}
                options={journalOptions}
                className="form-input"
                placeholder="All Journals"
              />
            </div>
            <div>
              <label className="form-label">Date</label>
              <Dropdown
                value={dateFilter}
                onChange={(e) => setDateFilter(e.value)}
                options={dateOptions}
                className="form-input"
                placeholder="All Time"
              />
            </div>
          </div>
          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-gray-600">
              Showing {filteredArticles.length} of {articles.length} articles
            </div>
            <Button
              label="Clear Filters"
              icon="pi pi-times"
              className="btn btn-outline btn-sm"
              onClick={clearFilters}
            />
          </div>
        </div>
      </div>

      {/* Articles Table */}
      <div className="data-table-container">
        <div className="table-header">
          <h3 className="table-title">Search Results</h3>
          <div className="table-actions">
            <Button
              label="Export Results"
              icon="pi pi-download"
              className="btn btn-outline btn-sm"
            />
            <Button
              label="Bulk Actions"
              icon="pi pi-cog"
              className="btn btn-outline btn-sm"
            />
          </div>
        </div>
        <DataTable
          value={filteredArticles}
          loading={loading}
          paginator
          rows={10}
          rowsPerPageOptions={[5, 10, 25, 50]}
          className="p-datatable-sm"
          selectionMode="multiple"
          selection={selectedArticles}
          onSelectionChange={(e) => setSelectedArticles(e.value)}
        >
          <Column selectionMode="multiple" headerStyle={{ width: '3rem' }} />
          <Column field="title" header="Title" sortable />
          <Column 
            field="authors" 
            header="Authors" 
            body={(rowData) => (
              <div className="text-sm">
                {rowData.authors.slice(0, 2).join(', ')}
                {rowData.authors.length > 2 && ` +${rowData.authors.length - 2} more`}
              </div>
            )}
          />
          <Column field="journalTitle" header="Journal" />
          <Column 
            field="status" 
            header="Status" 
            body={(rowData) => (
              <Tag value={getStatusLabel(rowData.status)} severity={getStatusSeverity(rowData.status)} />
            )}
          />
          <Column field="submittedAt" header="Submitted" />
          <Column
            header="Actions"
            body={(rowData) => (
              <div className="flex gap-2">
                <Button
                  icon="pi pi-eye"
                  size="small"
                  className="btn btn-outline btn-sm"
                  tooltip="View Details"
                  onClick={() => handleReviewArticle(rowData)}
                />
                <Button
                  icon="pi pi-file-pdf"
                  size="small"
                  className="btn btn-outline btn-sm"
                  tooltip="View PDF"
                  disabled={!rowData.pdfUrl}
                />
                <Dropdown
                  options={[
                    { label: 'Accept', value: 'ACCEPTED' },
                    { label: 'Reject', value: 'REJECTED' },
                    { label: 'Publish', value: 'PUBLISHED' }
                  ]}
                  onChange={(e) => handleStatusChange(rowData.id, e.value)}
                  placeholder="Actions"
                  className="btn btn-outline btn-sm"
                />
              </div>
            )}
          />
        </DataTable>
      </div>

      {/* Review Dialog */}
      <Dialog
        header={`Review Article: ${selectedArticle?.title || ''}`}
        visible={showReviewDialog}
        style={{ width: '80vw', maxWidth: '1000px' }}
        onHide={() => setShowReviewDialog(false)}
      >
        {selectedArticle && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Article Information</h3>
                <div className="space-y-3">
                  <div>
                    <span className="font-medium">Title:</span> {selectedArticle.title}
                  </div>
                  <div>
                    <span className="font-medium">Journal:</span> {selectedArticle.journalTitle}
                  </div>
                  <div>
                    <span className="font-medium">Status:</span> 
                    <Tag value={getStatusLabel(selectedArticle.status)} severity={getStatusSeverity(selectedArticle.status)} className="ml-2" />
                  </div>
                  <div>
                    <span className="font-medium">Submitted:</span> {selectedArticle.submittedAt}
                  </div>
                  <div>
                    <span className="font-medium">Authors:</span> {selectedArticle.authors.join(', ')}
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">Review Actions</h3>
                <div className="space-y-2">
                  <Button
                    label="Accept Article"
                    icon="pi pi-check"
                    className="btn btn-success w-full"
                    onClick={() => handleStatusChange(selectedArticle.id, 'ACCEPTED')}
                  />
                  <Button
                    label="Reject Article"
                    icon="pi pi-times"
                    className="btn btn-danger w-full"
                    onClick={() => handleStatusChange(selectedArticle.id, 'REJECTED')}
                  />
                  <Button
                    label="Request Revision"
                    icon="pi pi-refresh"
                    className="btn btn-warning w-full"
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Abstract</h3>
              <p className="text-gray-700 bg-gray-50 p-4 rounded">{selectedArticle.abstract}</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Keywords</h3>
              <div className="flex flex-wrap gap-2">
                {selectedArticle.keywords?.split(',').map((keyword, index) => (
                  <Tag key={index} value={keyword.trim()} className="p-button-sm" />
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Review Comments</h3>
              <InputTextarea
                value={selectedArticle.reviewComments || ''}
                onChange={(e) => setSelectedArticle({...selectedArticle, reviewComments: e.target.value})}
                className="form-textarea"
                placeholder="Add your review comments here..."
                rows={4}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                label="Cancel"
                className="btn btn-outline"
                onClick={() => setShowReviewDialog(false)}
              />
              <Button
                label="Save Review"
                className="btn btn-primary"
                onClick={handleSaveReview}
              />
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}
