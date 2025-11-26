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
  pdfUrl?: string;
}

export default function PendingSubmissions() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [assignedReviewer, setAssignedReviewer] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [journalFilter, setJournalFilter] = useState('');
  const toast = useRef<Toast>(null);

  useEffect(() => {
    loadArticles();
  }, []);

  useEffect(() => {
    filterArticles();
  }, [articles, searchTerm, journalFilter]);

  const loadArticles = async () => {
    try {
      // Fetch pending articles from API
      const response = await adminAPI.getArticles({ status: 'PENDING' });
      setArticles(response.data);
    } catch (error) {
      console.error('Error loading pending articles:', error);
      
      // Fallback to mock data
      setArticles([
        {
          id: 4,
          title: "Advanced Machine Learning Techniques for Data Analysis",
          abstract: "This paper presents novel machine learning techniques for analyzing large datasets...",
          keywords: "machine learning, data analysis, algorithms",
          status: "PENDING",
          journalTitle: "Journal of Advanced Research",
          journalId: 1,
          authors: ["Dr. Sarah Wilson", "Dr. Tom Brown"],
          submittedAt: "2024-01-20",
          pdfUrl: "/uploads/article4.pdf"
        },
        {
          id: 5,
          title: "Renewable Energy Integration in Smart Grids",
          abstract: "This research focuses on integrating renewable energy sources into smart grid systems...",
          keywords: "renewable energy, smart grid, integration",
          status: "PENDING",
          journalTitle: "International Journal of Engineering",
          journalId: 2,
          authors: ["Dr. Green Energy"],
          submittedAt: "2024-01-18",
          pdfUrl: "/uploads/article5.pdf"
        },
        {
          id: 6,
          title: "Telemedicine Applications in Rural Healthcare",
          abstract: "This study examines the effectiveness of telemedicine in rural healthcare settings...",
          keywords: "telemedicine, rural healthcare, technology",
          status: "PENDING",
          journalTitle: "Medical Research Quarterly",
          journalId: 3,
          authors: ["Dr. Health Tech", "Dr. Rural Medicine"],
          submittedAt: "2024-01-16",
          pdfUrl: "/uploads/article6.pdf"
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

    // Journal filter
    if (journalFilter) {
      filtered = filtered.filter(article => 
        article.journalTitle === journalFilter
      );
    }

    setFilteredArticles(filtered);
  };

  const handleAssignReviewer = (article: Article) => {
    setSelectedArticle(article);
    setAssignedReviewer('');
    setShowAssignDialog(true);
  };

  const handleSubmitAssignment = async () => {
    if (!selectedArticle || !assignedReviewer) {
      toast.current?.show({ 
        severity: 'error', 
        summary: 'Error', 
        detail: 'Please select a reviewer' 
      });
      return;
    }

    try {
      await adminAPI.updateArticleStatus(selectedArticle.id, 'UNDER_REVIEW');
      
      setArticles(articles.map(article => 
        article.id === selectedArticle.id ? { 
          ...article, 
          status: 'UNDER_REVIEW'
        } : article
      ));

      toast.current?.show({ 
        severity: 'success', 
        summary: 'Success', 
        detail: `Article assigned to ${assignedReviewer} for review` 
      });

      setShowAssignDialog(false);
    } catch (error) {
      console.error('Error assigning reviewer:', error);
      toast.current?.show({ 
        severity: 'error', 
        summary: 'Error', 
        detail: 'Failed to assign reviewer' 
      });
    }
  };

  const actionBodyTemplate = (rowData: Article) => {
    return (
      <div className="flex gap-2">
        <Button
          icon="pi pi-user-plus"
          className="p-button-rounded p-button-primary p-button-sm"
          tooltip="Assign Reviewer"
          onClick={() => handleAssignReviewer(rowData)}
        />
        <Button
          icon="pi pi-download"
          className="p-button-rounded p-button-secondary p-button-sm"
          tooltip="Download PDF"
          onClick={() => window.open(rowData.pdfUrl, '_blank')}
        />
        <Button
          icon="pi pi-eye"
          className="p-button-rounded p-button-info p-button-sm"
          tooltip="View Details"
          onClick={() => {
            setSelectedArticle(rowData);
            // Could open a view dialog here
          }}
        />
      </div>
    );
  };

  const journalOptions = [
    { label: 'All Journals', value: '' },
    { label: 'Journal of Advanced Research', value: 'Journal of Advanced Research' },
    { label: 'International Journal of Engineering', value: 'International Journal of Engineering' },
    { label: 'Medical Research Quarterly', value: 'Medical Research Quarterly' }
  ];

  const reviewerOptions = [
    { label: 'Dr. John Smith - Machine Learning Expert', value: 'Dr. John Smith' },
    { label: 'Dr. Jane Doe - Healthcare Researcher', value: 'Dr. Jane Doe' },
    { label: 'Dr. Mike Johnson - Engineering Specialist', value: 'Dr. Mike Johnson' },
    { label: 'Dr. Alice Johnson - Medical Expert', value: 'Dr. Alice Johnson' },
    { label: 'Dr. Bob Smith - Technology Researcher', value: 'Dr. Bob Smith' }
  ];

  return (
    <div className="admin-content">
      <Toast ref={toast} />
      
      {/* Header */}
      <div className="content-header mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Pending Submissions</h1>
            <p className="text-gray-600">Manage new article submissions awaiting review assignment</p>
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
          <div className="stat-value">{articles.length}</div>
          <div className="stat-label">Pending Review</div>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon info">
              <i className="pi pi-calendar"></i>
            </div>
          </div>
          <div className="stat-value">{articles.filter(a => {
            const days = (new Date().getTime() - new Date(a.submittedAt).getTime()) / (1000 * 60 * 60 * 24);
            return days > 7;
          }).length}</div>
          <div className="stat-label">Overdue (&gt;7 days)</div>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon success">
              <i className="pi pi-check-circle"></i>
            </div>
          </div>
          <div className="stat-value">5</div>
          <div className="stat-label">Assigned Today</div>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon primary">
              <i className="pi pi-users"></i>
            </div>
          </div>
          <div className="stat-value">12</div>
          <div className="stat-label">Available Reviewers</div>
        </div>
      </div>

      {/* Filters */}
      <div className="content-card mb-6">
        <div className="card-header">
          <h3 className="card-title">Filters</h3>
          <p className="card-subtitle">Filter pending submissions</p>
        </div>
        <div className="card-content">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="form-group">
              <label className="form-label">Search Submissions</label>
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
                    setJournalFilter('');
                  }}
                />
                <Button
                  label="Assign All"
                  icon="pi pi-user-plus"
                  className="btn btn-primary"
                  onClick={() => {
                    toast.current?.show({ 
                      severity: 'info', 
                      summary: 'Bulk Assignment', 
                      detail: 'Bulk assignment feature would open here' 
                    });
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
          <h3 className="table-title">Pending Submissions ({filteredArticles.length})</h3>
        </div>
        <DataTable
          value={filteredArticles}
          loading={loading}
          paginator
          rows={10}
          rowsPerPageOptions={[5, 10, 25]}
          className="p-datatable-sm"
          emptyMessage="No pending submissions found"
        >
          <Column field="title" header="Title" sortable />
          <Column field="journalTitle" header="Journal" sortable />
          <Column 
            field="authors" 
            header="Authors" 
            body={(rowData) => rowData.authors.join(', ')}
          />
          <Column field="submittedAt" header="Submitted" sortable />
          <Column 
            header="Days Pending" 
            body={(rowData) => {
              const days = Math.floor((new Date().getTime() - new Date(rowData.submittedAt).getTime()) / (1000 * 60 * 60 * 24));
              return (
                <Tag 
                  value={`${days} days`} 
                  severity={days > 7 ? 'danger' : days > 3 ? 'warning' : 'success'} 
                />
              );
            }}
          />
          <Column 
            header="Actions" 
            body={actionBodyTemplate}
            style={{ width: '150px' }}
          />
        </DataTable>
      </div>

      {/* Assignment Dialog */}
      <Dialog
        header={`Assign Reviewer: ${selectedArticle?.title}`}
        visible={showAssignDialog}
        style={{ width: '60vw', maxWidth: '600px' }}
        onHide={() => setShowAssignDialog(false)}
        footer={
          <div className="flex justify-end gap-3">
            <Button
              label="Cancel"
              icon="pi pi-times"
              className="btn btn-outline"
              onClick={() => setShowAssignDialog(false)}
            />
            <Button
              label="Assign Reviewer"
              icon="pi pi-user-plus"
              className="btn btn-primary"
              onClick={handleSubmitAssignment}
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
              <label className="form-label">Select Reviewer</label>
              <Dropdown
                value={assignedReviewer}
                onChange={(e) => setAssignedReviewer(e.value)}
                options={reviewerOptions}
                placeholder="Choose a reviewer"
                className="w-full"
              />
              <p className="text-sm text-gray-500 mt-2">
                Select an appropriate reviewer based on the article's subject area and the reviewer's expertise.
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
