'use client';

import { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Toast } from 'primereact/toast';
import { adminAPI } from '@/lib/api';
import { loadJournalData } from '@/lib/journalAdminUtils';
import { Calendar } from 'primereact/calendar';
import { Checkbox } from 'primereact/checkbox';

interface NewsItem {
  id: number;
  title: string;
  content: string;
  link?: string;
  isPinned: boolean;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export default function LatestNewsPage() {
  const toast = useRef<Toast>(null);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingNews, setEditingNews] = useState<NewsItem | null>(null);
  const [journalId, setJournalId] = useState<number | null>(null);
  const [journalTitle, setJournalTitle] = useState<string>('');

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    link: '',
    isPinned: false,
    publishedAt: null as Date | null,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const journalData = await loadJournalData();
      
      if (!journalData) {
        // Try to get available journals to show in error message
        try {
          const journalsResponse = await adminAPI.getJournals();
          const availableJournals = Array.isArray(journalsResponse.data) ? journalsResponse.data : [];
          const journalTitles = availableJournals.map((j: any) => j.title).join(', ');
          
          toast.current?.show({
            severity: 'error',
            summary: 'Journal Not Found',
            detail: `Your user account is not linked to a journal. Available journals: ${journalTitles || 'None'}. Please contact the system administrator to update your journal assignment. Check the browser console for detailed information.`,
            life: 15000
          });
        } catch (err) {
          toast.current?.show({
            severity: 'error',
            summary: 'Journal Not Found',
            detail: 'Your user account is not linked to a journal. Please contact the system administrator to update your journal assignment. Check the browser console for details.',
            life: 10000
          });
        }
        return;
      }
      
      setJournalId(journalData.journalId);
      setJournalTitle(journalData.journalTitle);

      const response = await adminAPI.getNews();
      const newsData = Array.isArray(response.data) ? response.data : [];
      setNews(newsData);
    } catch (error: any) {
      console.error('Error loading news:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load latest news. Please refresh the page.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingNews(null);
    setFormData({
      title: '',
      content: '',
      link: '',
      isPinned: false,
      publishedAt: new Date(),
    });
    setShowDialog(true);
  };

  const handleEdit = (item: NewsItem) => {
    setEditingNews(item);
    setFormData({
      title: item.title,
      content: item.content,
      link: item.link || '',
      isPinned: item.isPinned,
      publishedAt: item.publishedAt ? new Date(item.publishedAt) : new Date(),
    });
    setShowDialog(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this news item?')) {
      return;
    }

    try {
      await adminAPI.deleteNews(id);
      toast.current?.show({
        severity: 'success',
        summary: 'Success',
        detail: 'News item deleted successfully',
      });
      loadData();
    } catch (error: any) {
      console.error('Error deleting news:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: error.response?.data?.message || 'Failed to delete news item',
      });
    }
  };

  const handleSave = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Validation Error',
        detail: 'Title and content are required',
      });
      return;
    }

    try {
      const newsData = {
        title: formData.title,
        content: formData.content,
        link: formData.link || undefined,
        isPinned: formData.isPinned,
        publishedAt: formData.publishedAt?.toISOString(),
      };

      if (editingNews) {
        await adminAPI.updateNews(editingNews.id, newsData);
        toast.current?.show({
          severity: 'success',
          summary: 'Success',
          detail: 'News item updated successfully',
        });
      } else {
        await adminAPI.createNews(newsData);
        toast.current?.show({
          severity: 'success',
          summary: 'Success',
          detail: 'News item created successfully',
        });
      }

      setShowDialog(false);
      loadData();
    } catch (error: any) {
      console.error('Error saving news:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: error.response?.data?.message || 'Failed to save news item',
      });
    }
  };

  const dateTemplate = (rowData: NewsItem) => {
    if (!rowData.publishedAt) return '-';
    return new Date(rowData.publishedAt).toLocaleDateString();
  };

  const pinnedTemplate = (rowData: NewsItem) => {
    return rowData.isPinned ? (
      <i className="pi pi-check-circle text-green-600"></i>
    ) : (
      <i className="pi pi-times-circle text-gray-400"></i>
    );
  };

  const actionTemplate = (rowData: NewsItem) => {
    return (
      <div className="flex gap-2">
        <Button
          icon="pi pi-pencil"
          className="p-button-rounded p-button-text p-button-sm"
          onClick={() => handleEdit(rowData)}
          tooltip="Edit"
        />
        <Button
          icon="pi pi-trash"
          className="p-button-rounded p-button-text p-button-danger p-button-sm"
          onClick={() => handleDelete(rowData.id)}
          tooltip="Delete"
        />
      </div>
    );
  };

  return (
    <div className="latest-news-page">
      <Toast ref={toast} />
      
      <div className="page-header">
        <h1>Latest News Management</h1>
        <p className="text-gray-600">
          Manage latest news and announcements for {journalTitle || 'your journal'}
        </p>
      </div>

      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h2>News Items</h2>
          <Button
            label="Add News"
            icon="pi pi-plus"
            onClick={handleAdd}
            className="p-button-primary"
          />
        </div>

        <DataTable
          value={news}
          loading={loading}
          paginator
          rows={10}
          rowsPerPageOptions={[5, 10, 25, 50]}
          emptyMessage="No news items found"
        >
          <Column field="isPinned" header="Pinned" body={pinnedTemplate} style={{ width: '80px' }} />
          <Column field="title" header="Title" sortable />
          <Column
            field="content"
            header="Content"
            body={(rowData) => (
              <span className="truncate-text">
                {rowData.content.length > 100
                  ? rowData.content.substring(0, 100) + '...'
                  : rowData.content}
              </span>
            )}
            style={{ maxWidth: '300px' }}
          />
          <Column field="publishedAt" header="Published Date" body={dateTemplate} sortable />
          <Column body={actionTemplate} header="Actions" style={{ width: '120px' }} />
        </DataTable>
      </div>

      <Dialog
        header={editingNews ? 'Edit News Item' : 'Add News Item'}
        visible={showDialog}
        onHide={() => setShowDialog(false)}
        style={{ width: '600px' }}
        footer={
          <div>
            <Button
              label="Cancel"
              icon="pi pi-times"
              onClick={() => setShowDialog(false)}
              className="p-button-text"
            />
            <Button
              label="Save"
              icon="pi pi-check"
              onClick={handleSave}
              className="p-button-primary"
            />
          </div>
        }
      >
        <div className="form-grid">
          <div className="form-field">
            <label htmlFor="title" className="required">
              Title
            </label>
            <InputText
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter news title"
              className="w-full"
            />
          </div>

          <div className="form-field">
            <label htmlFor="content" className="required">
              Content
            </label>
            <InputTextarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Enter news content"
              rows={6}
              className="w-full"
            />
          </div>

          <div className="form-field">
            <label htmlFor="link">Link (Optional)</label>
            <InputText
              id="link"
              value={formData.link}
              onChange={(e) => setFormData({ ...formData, link: e.target.value })}
              placeholder="https://example.com"
              className="w-full"
            />
          </div>

          <div className="form-field">
            <label htmlFor="publishedAt">Published Date</label>
            <Calendar
              id="publishedAt"
              value={formData.publishedAt}
              onChange={(e) => setFormData({ ...formData, publishedAt: e.value as Date })}
              showTime
              hourFormat="12"
              className="w-full"
            />
          </div>

          <div className="form-field">
            <div className="flex align-items-center">
              <Checkbox
                inputId="isPinned"
                checked={formData.isPinned}
                onChange={(e) => setFormData({ ...formData, isPinned: e.checked || false })}
              />
              <label htmlFor="isPinned" className="ml-2">
                Pin this news item (show at top)
              </label>
            </div>
          </div>
        </div>
      </Dialog>

      <style jsx>{`
        .latest-news-page {
          padding: 2rem;
        }

        .page-header {
          margin-bottom: 2rem;
        }

        .page-header h1 {
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .truncate-text {
          display: block;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .form-grid {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .form-field label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 600;
        }

        .form-field label.required::after {
          content: ' *';
          color: red;
        }
      `}</style>
    </div>
  );
}

