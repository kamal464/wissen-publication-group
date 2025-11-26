'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dropdown } from 'primereact/dropdown';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';
import { useRef } from 'react';
import { TabView, TabPanel } from 'primereact/tabview';

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
}

export default function ArticlesManagement() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const router = useRouter();
  const toast = useRef<Toast>(null);

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('adminAuth');
    if (!isAuthenticated) {
      router.push('/admin/login');
      return;
    }
    loadArticles();
  }, [router]);

  const loadArticles = async () => {
    try {
      // Mock data
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
          pdfUrl: "/uploads/article1.pdf"
        },
        {
          id: 2,
          title: "Sustainable Energy Solutions for Urban Areas",
          abstract: "This research investigates sustainable energy solutions...",
          keywords: "sustainable energy, urban planning, renewable resources",
          status: "PENDING",
          journalTitle: "International Journal of Engineering",
          journalId: 2,
          authors: ["Dr. Mike Johnson"],
          submittedAt: "2024-01-10"
        },
        {
          id: 3,
          title: "Social Media Impact on Education",
          abstract: "This study examines the impact of social media on educational outcomes...",
          keywords: "social media, education, learning outcomes",
          status: "PUBLISHED",
          journalTitle: "Journal of Advanced Research",
          journalId: 1,
          authors: ["Dr. Sarah Wilson", "Dr. Tom Brown"],
          submittedAt: "2023-12-20",
          publishedAt: "2024-01-05"
        }
      ]);
    } catch (error) {
      console.error('Error loading articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    localStorage.removeItem('adminUser');
    router.push('/admin/login');
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

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.abstract.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.authors.some(author => author.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = !statusFilter || article.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusOptions = [
    { label: 'All Statuses', value: '' },
    { label: 'Pending', value: 'PENDING' },
    { label: 'Under Review', value: 'UNDER_REVIEW' },
    { label: 'Accepted', value: 'ACCEPTED' },
    { label: 'Published', value: 'PUBLISHED' },
    { label: 'Rejected', value: 'REJECTED' }
  ];

  const handleStatusChange = (articleId: number, newStatus: string) => {
    setArticles(articles.map(article => 
      article.id === articleId ? { ...article, status: newStatus } : article
    ));
    toast.current?.show({ 
      severity: 'success', 
      summary: 'Success', 
      detail: `Article status updated to ${getStatusLabel(newStatus)}` 
    });
  };

  const openArticleDetails = (article: Article) => {
    setSelectedArticle(article);
    setShowDetailsDialog(true);
  };

  const stats = [
    { title: 'Total Articles', value: articles.length, icon: 'pi pi-file-edit', color: 'blue' },
    { title: 'Pending Review', value: articles.filter(a => a.status === 'PENDING').length, icon: 'pi pi-clock', color: 'orange' },
    { title: 'Under Review', value: articles.filter(a => a.status === 'UNDER_REVIEW').length, icon: 'pi pi-eye', color: 'info' },
    { title: 'Published', value: articles.filter(a => a.status === 'PUBLISHED').length, icon: 'pi pi-check', color: 'green' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Button
                icon="pi pi-arrow-left"
                className="p-button-text p-button-sm mr-4"
                onClick={() => router.push('/admin/dashboard')}
                tooltip="Back to Dashboard"
              />
              <i className="pi pi-file-edit text-2xl text-blue-600 mr-3"></i>
              <h1 className="text-2xl font-bold text-gray-900">Articles Management</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {localStorage.getItem('adminUser')}
              </span>
              <Button
                label="Logout"
                icon="pi pi-sign-out"
                className="p-button-outlined p-button-sm"
                onClick={handleLogout}
              />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Toast ref={toast} />

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="shadow-sm">
              <div className="flex items-center">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg bg-${stat.color}-100 mr-4`}>
                  <i className={`${stat.icon} text-xl text-${stat.color}-600`}></i>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Search and Filter */}
        <Card className="mb-8">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-64">
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Articles</label>
              <InputText
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by title, abstract, or author..."
                className="w-full"
              />
            </div>
            <div className="min-w-48">
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
              <Dropdown
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.value)}
                options={statusOptions}
                className="w-full"
              />
            </div>
            <div>
              <Button
                label="Clear Filters"
                icon="pi pi-times"
                className="p-button-outlined"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('');
                }}
              />
            </div>
          </div>
        </Card>

        {/* Articles Table */}
        <Card>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Articles ({filteredArticles.length})
            </h2>
            <div className="flex gap-2">
              <Button
                label="Export"
                icon="pi pi-download"
                className="p-button-outlined"
              />
              <Button
                label="Bulk Actions"
                icon="pi pi-cog"
                className="p-button-outlined"
              />
            </div>
          </div>

          <DataTable
            value={filteredArticles}
            loading={loading}
            paginator
            rows={10}
            rowsPerPageOptions={[5, 10, 25]}
            className="p-datatable-sm"
            selectionMode="single"
            onSelectionChange={(e) => openArticleDetails(e.value)}
          >
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
                    className="p-button-outlined p-button-sm"
                    tooltip="View Details"
                    onClick={() => openArticleDetails(rowData)}
                  />
                  <Button
                    icon="pi pi-file-pdf"
                    size="small"
                    className="p-button-outlined p-button-sm"
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
                    className="p-button-outlined p-button-sm"
                  />
                </div>
              )}
            />
          </DataTable>
        </Card>

        {/* Article Details Dialog */}
        <Dialog
          header={selectedArticle?.title || 'Article Details'}
          visible={showDetailsDialog}
          style={{ width: '80vw' }}
          onHide={() => setShowDetailsDialog(false)}
        >
          {selectedArticle && (
            <TabView>
              <TabPanel header="Overview">
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
                      {selectedArticle.publishedAt && (
                        <div>
                          <span className="font-medium">Published:</span> {selectedArticle.publishedAt}
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Authors</h3>
                    <div className="space-y-2">
                      {selectedArticle.authors.map((author, index) => (
                        <div key={index} className="bg-gray-50 p-2 rounded">
                          {author}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </TabPanel>

              <TabPanel header="Content">
                <div className="space-y-6">
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
                </div>
              </TabPanel>

              <TabPanel header="Review">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Review Comments</label>
                    <InputTextarea className="w-full" rows={4} placeholder="Add review comments..." />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      label="Accept"
                      icon="pi pi-check"
                      className="p-button-success"
                      onClick={() => handleStatusChange(selectedArticle.id, 'ACCEPTED')}
                    />
                    <Button
                      label="Reject"
                      icon="pi pi-times"
                      className="p-button-danger"
                      onClick={() => handleStatusChange(selectedArticle.id, 'REJECTED')}
                    />
                    <Button
                      label="Request Revision"
                      icon="pi pi-refresh"
                      className="p-button-warning"
                    />
                  </div>
                </div>
              </TabPanel>
            </TabView>
          )}
        </Dialog>
      </div>
    </div>
  );
}
