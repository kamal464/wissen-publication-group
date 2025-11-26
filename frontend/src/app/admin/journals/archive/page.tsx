'use client';

import { useState, useEffect } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { InputTextarea } from 'primereact/inputtextarea';
import { Toast } from 'primereact/toast';
import { useRef } from 'react';
import Link from 'next/link';
import '@/styles/admin-global.scss';
import { journalAPI } from '@/lib/api';

interface Journal {
  id: number;
  title: string;
  archiveContent: string;
}

export default function ArchiveManagement() {
  const [journals, setJournals] = useState<Journal[]>([]);
  const [selectedJournal, setSelectedJournal] = useState<Journal | null>(null);
  const [archiveContent, setArchiveContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const toast = useRef<Toast>(null);

  useEffect(() => {
    loadJournals();
  }, []);

  const loadJournals = async () => {
    try {
      // In a real app, fetch from API
      setJournals([
        { id: 1, title: 'Journal of Advanced Research', archiveContent: 'Browse our archive of previous issues...' },
        { id: 2, title: 'International Journal of Engineering', archiveContent: 'Engineering journal archive...' },
        { id: 3, title: 'Medical Research Quarterly', archiveContent: 'Medical research archive...' }
      ]);
    } catch (error) {
      console.error('Error loading journals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJournalSelect = (journal: Journal) => {
    setSelectedJournal(journal);
    setArchiveContent(journal.archiveContent || '');
  };

  const handleSave = async () => {
    if (!selectedJournal) return;

    setSaving(true);
    try {
      // In a real app, save to API
      await journalAPI.updateArchive(selectedJournal.id, { archiveContent });
      
      // Update local state
      setJournals(journals.map(j => 
        j.id === selectedJournal.id ? { ...j, archiveContent } : j
      ));

      toast.current?.show({ 
        severity: 'success', 
        summary: 'Success', 
        detail: 'Archive updated successfully' 
      });
    } catch (error) {
      console.error('Error saving archive:', error);
      toast.current?.show({ 
        severity: 'error', 
        summary: 'Error', 
        detail: 'Failed to save archive' 
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-content">
      <Toast ref={toast} />
      
      {/* Header */}
      <div className="content-header mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Archive Management</h1>
            <p className="text-gray-600">Manage archive content for each journal</p>
          </div>
          <Link href="/admin/dashboard">
            <Button label="Back to Dashboard" icon="pi pi-arrow-left" className="btn btn-outline" />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Journal Selection */}
        <div className="content-card">
          <div className="card-header">
            <h3 className="card-title">Select Journal</h3>
            <p className="card-subtitle">Choose a journal to edit its archive</p>
          </div>
          <div className="card-content">
            <div className="space-y-3">
              {journals.map((journal) => (
                <div
                  key={journal.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                    selectedJournal?.id === journal.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleJournalSelect(journal)}
                >
                  <h4 className="font-semibold text-gray-900">{journal.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    {journal.archiveContent ? 'Archive defined' : 'No archive set'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Archive Editor */}
        <div className="lg:col-span-2 content-card">
          <div className="card-header">
            <h3 className="card-title">
              {selectedJournal ? `Archive - ${selectedJournal.title}` : 'Archive Editor'}
            </h3>
            <p className="card-subtitle">Manage archive content and past issues</p>
          </div>
          <div className="card-content">
            {selectedJournal ? (
              <div className="space-y-6">
                <div>
                  <label htmlFor="archiveContent" className="block text-sm font-medium text-gray-700 mb-2">
                    Archive Content
                  </label>
                  <InputTextarea
                    id="archiveContent"
                    value={archiveContent}
                    onChange={(e) => setArchiveContent(e.target.value)}
                    rows={12}
                    placeholder="Enter archive content..."
                    className="w-full"
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Include information about past issues, search functionality, and archive navigation.
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button
                    label="Save Archive"
                    icon="pi pi-save"
                    onClick={handleSave}
                    loading={saving}
                    className="btn btn-primary"
                  />
                  <Button
                    label="Preview"
                    icon="pi pi-eye"
                    className="btn btn-outline"
                    onClick={() => {
                      toast.current?.show({ 
                        severity: 'info', 
                        summary: 'Preview', 
                        detail: 'Preview functionality would open here' 
                      });
                    }}
                  />
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <i className="pi pi-archive text-6xl text-gray-300 mb-4"></i>
                <h4 className="text-xl font-semibold text-gray-600 mb-2">No Journal Selected</h4>
                <p className="text-gray-500">Please select a journal from the list to edit its archive.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Archive Template */}
      <div className="content-card mt-6">
        <div className="card-header">
          <h3 className="card-title">Archive Template</h3>
          <p className="card-subtitle">Use this template to structure your archive</p>
        </div>
        <div className="card-content">
          <div className="bg-gray-50 p-6 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-4">Archive Structure:</h4>
            <div className="space-y-4 text-sm">
              <div className="border-l-4 border-purple-500 pl-4">
                <h5 className="font-medium text-gray-800">2024 Issues</h5>
                <ul className="ml-4 space-y-1 text-gray-600">
                  <li>• Volume 15, Issue 3 - March 2024</li>
                  <li>• Volume 15, Issue 2 - February 2024</li>
                  <li>• Volume 15, Issue 1 - January 2024</li>
                </ul>
              </div>
              <div className="border-l-4 border-purple-500 pl-4">
                <h5 className="font-medium text-gray-800">2023 Issues</h5>
                <ul className="ml-4 space-y-1 text-gray-600">
                  <li>• Volume 14, Issue 12 - December 2023</li>
                  <li>• Volume 14, Issue 11 - November 2023</li>
                  <li>• Volume 14, Issue 10 - October 2023</li>
                </ul>
              </div>
              <div className="border-l-4 border-purple-500 pl-4">
                <h5 className="font-medium text-gray-800">Search Archive</h5>
                <p className="text-gray-600 ml-4">Search through all past issues by title, author, or keyword.</p>
              </div>
            </div>
            <div className="mt-4 p-4 bg-purple-50 rounded-lg">
              <h5 className="font-medium text-purple-800 mb-2">Archive Features:</h5>
              <ul className="text-sm text-purple-700 space-y-1">
                <li>• Chronological listing of all past issues</li>
                <li>• Search functionality across all content</li>
                <li>• Download links for PDFs</li>
                <li>• Citation information</li>
                <li>• DOI links for each article</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

