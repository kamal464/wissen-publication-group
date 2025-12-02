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
import { Calendar } from 'primereact/calendar';
import { Checkbox } from 'primereact/checkbox';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';

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

export default function AdminLatestNewsPage() {
  const toast = useRef<Toast>(null);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingNews, setEditingNews] = useState<NewsItem | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    link: '',
    isPinned: false,
    publishedAt: null as Date | null,
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
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

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    }

    if (!formData.content.trim()) {
      errors.content = 'Content is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAdd = () => {
    setEditingNews(null);
    setValidationErrors({});
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
    setValidationErrors({});
    setFormData({
      title: item.title,
      content: item.content,
      link: item.link || '',
      isPinned: item.isPinned,
      publishedAt: item.publishedAt ? new Date(item.publishedAt) : new Date(),
    });
    setShowDialog(true);
  };

  const handleDelete = (id: number) => {
    confirmDialog({
      message: 'Are you sure you want to delete this news item?',
      header: 'Delete Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptClassName: 'p-button p-button-danger',
      rejectClassName: 'p-button p-button-secondary p-button-text',
      acceptLabel: 'Yes',
      rejectLabel: 'No',
      accept: async () => {
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
      },
    });
  };

  const handleSave = async () => {
    setValidationErrors({});

    if (!validateForm()) {
      toast.current?.show({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Please fix the errors in the form before submitting.',
        life: 5000
      });
      return;
    }

    try {
      const newsData = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        link: formData.link.trim() || undefined,
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
      <i className="pi pi-check-circle text-green-600" title="Pinned"></i>
    ) : (
      <i className="pi pi-times-circle text-gray-400" title="Not Pinned"></i>
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
          tooltipOptions={{ position: 'top' }}
        />
        <Button
          icon="pi pi-trash"
          className="p-button-rounded p-button-text p-button-danger p-button-sm"
          onClick={() => handleDelete(rowData.id)}
          tooltip="Delete"
          tooltipOptions={{ position: 'top' }}
        />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8">
      <Toast ref={toast} />
      <ConfirmDialog />
      
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2 flex items-center gap-3">
            <i className="pi pi-newspaper text-blue-600"></i>
            <span>Latest News Management</span>
          </h1>
          <p className="text-slate-600">Manage latest news and announcements for the platform</p>
        </div>
        <Button
          label="Add News"
          icon="pi pi-plus"
          onClick={handleAdd}
          className="p-button-primary !bg-blue-600 !border-blue-600 !text-white font-medium rounded-lg shadow"
        />
      </div>

      <div className="bg-white rounded-lg overflow-hidden shadow">
        <DataTable
          value={news}
          loading={loading}
          paginator
          rows={10}
          rowsPerPageOptions={[5, 10, 25, 50]}
          emptyMessage="No news items found. Click 'Add News' to create one."
        >
          <Column 
            field="isPinned" 
            header="Pinned" 
            body={pinnedTemplate} 
            style={{ width: '80px' }}
            sortable
          />
          <Column field="title" header="Title" sortable style={{ minWidth: '200px' }} />
          <Column
            field="content"
            header="Content"
            body={(rowData) => (
              <div className="max-w-md">
                <span className="text-sm text-gray-700 line-clamp-2">
                  {rowData.content.length > 150
                    ? rowData.content.substring(0, 150) + '...'
                    : rowData.content}
                </span>
              </div>
            )}
            style={{ minWidth: '300px', maxWidth: '400px' }}
          />
          <Column 
            field="publishedAt" 
            header="Published Date" 
            body={dateTemplate} 
            sortable 
            style={{ width: '150px' }}
          />
          <Column 
            body={actionTemplate} 
            header="Actions" 
            style={{ width: '120px' }}
            exportable={false}
          />
        </DataTable>
      </div>

      <Dialog
        header={editingNews ? 'Edit News Item' : 'Add News Item'}
        visible={showDialog}
        onHide={() => {
          setShowDialog(false);
          setValidationErrors({});
        }}
        style={{ width: '90vw', maxWidth: '700px' }}
        footer={
          <div className="flex justify-end gap-3 p-4 border-t border-gray-200" style={{ backgroundColor: '#f9fafb' }}>
            <Button
              label="Cancel"
              icon="pi pi-times"
              onClick={() => {
                setShowDialog(false);
                setValidationErrors({});
              }}
              className="p-button-text min-w-[100px]"
              style={{ 
                color: '#4b5563',
                backgroundColor: 'transparent'
              }}
            />
            <Button
              label={editingNews ? 'Update' : 'Create'}
              icon="pi pi-check"
              onClick={handleSave}
              className="p-button-primary min-w-[120px] font-medium"
              style={{ 
                backgroundColor: '#2563eb',
                borderColor: '#2563eb',
                color: '#ffffff'
              }}
            />
          </div>
        }
      >
        <div className="flex flex-col gap-6 py-4">
          <div className="flex flex-col">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <InputText
              id="title"
              value={formData.title}
              onChange={(e) => {
                setFormData({ ...formData, title: e.target.value });
                if (validationErrors.title) {
                  setValidationErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors.title;
                    return newErrors;
                  });
                }
              }}
              placeholder="Enter news title"
              className={`w-full ${validationErrors.title ? 'p-invalid' : ''}`}
            />
            {validationErrors.title && (
              <small className="p-error mt-1 block text-red-600 text-sm">
                {validationErrors.title}
              </small>
            )}
          </div>

          <div className="flex flex-col">
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
              Content <span className="text-red-500">*</span>
            </label>
            <InputTextarea
              id="content"
              value={formData.content}
              onChange={(e) => {
                setFormData({ ...formData, content: e.target.value });
                if (validationErrors.content) {
                  setValidationErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors.content;
                    return newErrors;
                  });
                }
              }}
              placeholder="Enter news content"
              rows={6}
              className={`w-full ${validationErrors.content ? 'p-invalid' : ''}`}
            />
            {validationErrors.content && (
              <small className="p-error mt-1 block text-red-600 text-sm">
                {validationErrors.content}
              </small>
            )}
          </div>

          <div className="flex flex-col">
            <label htmlFor="link" className="block text-sm font-medium text-gray-700 mb-2">
              Link (Optional)
            </label>
            <InputText
              id="link"
              value={formData.link}
              onChange={(e) => setFormData({ ...formData, link: e.target.value })}
              placeholder="https://example.com"
              className="w-full"
            />
            <small className="text-gray-500 text-xs mt-1">
              Optional URL to link to more information about this news
            </small>
          </div>

          <div className="flex flex-col">
            <label htmlFor="publishedAt" className="block text-sm font-medium text-gray-700 mb-2">
              Published Date
            </label>
            <Calendar
              id="publishedAt"
              value={formData.publishedAt}
              onChange={(e) => setFormData({ ...formData, publishedAt: e.value as Date })}
              showTime
              hourFormat="12"
              className="w-full"
              placeholder="Select published date"
            />
            <small className="text-gray-500 text-xs mt-1">
              Leave empty to use current date/time
            </small>
          </div>

          <div className="flex items-center">
            <Checkbox
              inputId="isPinned"
              checked={formData.isPinned}
              onChange={(e) => setFormData({ ...formData, isPinned: e.checked || false })}
            />
            <label htmlFor="isPinned" className="ml-2 text-sm font-medium text-gray-700">
              Pin this news item (show at top of list)
            </label>
          </div>
        </div>
      </Dialog>
    </div>
  );
}

