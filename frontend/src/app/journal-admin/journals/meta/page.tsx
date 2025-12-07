'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dropdown } from 'primereact/dropdown';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { adminAPI } from '@/lib/api';
import { loadJournalData } from '@/lib/journalAdminUtils';

interface MetaPage {
  id: number;
  pageType: string;
  pageTitle: string;
  metaKeywords: string;
  metaDescription: string;
}

export default function ManageMetaInformation() {
  const [metaPages, setMetaPages] = useState<MetaPage[]>([]);
  const [selectedMeta, setSelectedMeta] = useState<MetaPage | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [journalId, setJournalId] = useState<number | null>(null);
  const toast = useRef<Toast>(null);

  const pageTypes = ['Home', 'About', 'Contact', 'Archive', 'Search', 'Article', 'Other'];

  useEffect(() => {
    loadJournalAndMeta();
  }, []);

  const loadJournalAndMeta = async () => {
    try {
      setLoading(true);
      const username = localStorage.getItem('journalAdminUser');
      if (!username) return;

      // Use loadJournalData() which correctly finds journal via JournalShortcode table
      const journalData = await loadJournalData();
      
      if (journalData) {
        setJournalId(journalData.journalId);
        // Load meta pages for this journal
        // For now, using mock data - replace with actual API call
        setMetaPages([
          { id: 1, pageType: 'Home', pageTitle: 'Journal Home Page', metaKeywords: 'journal, research', metaDescription: 'Home page description' },
          { id: 2, pageType: 'About', pageTitle: 'About Us', metaKeywords: 'about, journal', metaDescription: 'About page description' },
        ]);
      }
    } catch (error: any) {
      console.error('Error loading meta:', error);
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Failed to load meta information' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedMeta({ id: 0, pageType: 'Home', pageTitle: '', metaKeywords: '', metaDescription: '' });
    setShowDialog(true);
  };

  const handleEdit = (meta: MetaPage) => {
    setSelectedMeta(meta);
    setShowDialog(true);
  };

  const handleSave = async () => {
    if (!selectedMeta || !journalId) return;

    try {
      // Save meta page - replace with actual API call
      if (selectedMeta.id === 0) {
        const newMeta = { ...selectedMeta, id: Date.now() };
        setMetaPages([...metaPages, newMeta]);
        toast.current?.show({ severity: 'success', summary: 'Success', detail: 'Meta page created successfully' });
      } else {
        setMetaPages(metaPages.map(m => m.id === selectedMeta.id ? selectedMeta : m));
        toast.current?.show({ severity: 'success', summary: 'Success', detail: 'Meta page updated successfully' });
      }
      setShowDialog(false);
    } catch (error: any) {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Failed to save meta page' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8">
      <Toast ref={toast} />
      
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Manage Meta Information</h1>
          <p className="text-slate-600">Create and edit SEO meta pages</p>
        </div>
        <Button label="+ Create Meta Page" icon="pi pi-plus" className="p-button-primary" onClick={handleCreate} />
      </div>

      <div className="bg-white rounded-lg shadow">
        <DataTable value={metaPages} loading={loading} paginator rows={10}>
          <Column field="pageType" header="Page Type" sortable />
          <Column field="pageTitle" header="Page Title" sortable />
          <Column field="metaKeywords" header="Keywords" />
          <Column
            header="Actions"
            body={(rowData) => (
              <Button
                icon="pi pi-pencil"
                className="p-button-text p-button-sm"
                onClick={() => handleEdit(rowData)}
              />
            )}
          />
        </DataTable>
      </div>

      <Dialog
        header={selectedMeta?.id === 0 ? 'Create Meta Page' : 'Edit Meta Page'}
        visible={showDialog}
        style={{ width: '90vw', maxWidth: '700px' }}
        onHide={() => setShowDialog(false)}
        footer={
          <div className="flex justify-end gap-2">
            <Button label="Cancel" icon="pi pi-times" className="p-button-text" onClick={() => setShowDialog(false)} />
            <Button label="Save" icon="pi pi-check" className="p-button-primary" onClick={handleSave} />
          </div>
        }
      >
        {selectedMeta && (
          <div className="flex flex-col gap-4 py-4">
            <div className="flex flex-col">
              <label className="block mb-2 text-sm font-medium text-gray-700">Page Type *</label>
              <Dropdown
                value={selectedMeta.pageType}
                options={pageTypes}
                onChange={(e) => setSelectedMeta({ ...selectedMeta, pageType: e.value })}
                className="w-full"
                placeholder="Select page type"
              />
            </div>
            <div className="flex flex-col">
              <label className="block mb-2 text-sm font-medium text-gray-700">Page Title *</label>
              <InputText
                value={selectedMeta.pageTitle}
                onChange={(e) => setSelectedMeta({ ...selectedMeta, pageTitle: e.target.value })}
                className="w-full"
                placeholder="Enter page title"
              />
            </div>
            <div className="flex flex-col">
              <label className="block mb-2 text-sm font-medium text-gray-700">Meta Keywords (comma-separated) *</label>
              <InputTextarea
                value={selectedMeta.metaKeywords}
                onChange={(e) => setSelectedMeta({ ...selectedMeta, metaKeywords: e.target.value })}
                className="w-full"
                rows={2}
                placeholder="Enter keywords separated by commas"
              />
            </div>
            <div className="flex flex-col">
              <label className="block mb-2 text-sm font-medium text-gray-700">Meta Description *</label>
              <InputTextarea
                value={selectedMeta.metaDescription}
                onChange={(e) => setSelectedMeta({ ...selectedMeta, metaDescription: e.target.value })}
                className="w-full"
                rows={4}
                placeholder="Enter meta description"
              />
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}



