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
  currentIssueContent: string;
}

export default function CurrentIssueManagement() {
  const [journals, setJournals] = useState<Journal[]>([]);
  const [selectedJournal, setSelectedJournal] = useState<Journal | null>(null);
  const [currentIssueContent, setCurrentIssueContent] = useState('');
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
        { id: 1, title: 'Journal of Advanced Research', currentIssueContent: 'Volume 15, Issue 3 - March 2024' },
        { id: 2, title: 'International Journal of Engineering', currentIssueContent: 'Volume 12, Issue 2 - February 2024' },
        { id: 3, title: 'Medical Research Quarterly', currentIssueContent: 'Volume 8, Issue 1 - January 2024' }
      ]);
    } catch (error) {
      console.error('Error loading journals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJournalSelect = (journal: Journal) => {
    setSelectedJournal(journal);
    setCurrentIssueContent(journal.currentIssueContent || '');
  };

  const handleSave = async () => {
    if (!selectedJournal) return;

    setSaving(true);
    try {
      // In a real app, save to API
      await journalAPI.updateCurrentIssue(selectedJournal.id, { currentIssueContent });
      
      // Update local state
      setJournals(journals.map(j => 
        j.id === selectedJournal.id ? { ...j, currentIssueContent } : j
      ));

      toast.current?.show({ 
        severity: 'success', 
        summary: 'Success', 
        detail: 'Current Issue updated successfully' 
      });
    } catch (error) {
      console.error('Error saving current issue:', error);
      toast.current?.show({ 
        severity: 'error', 
        summary: 'Error', 
        detail: 'Failed to save current issue' 
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Current Issue Management</h1>
            <p className="text-gray-600">Manage current issue content for each journal</p>
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
            <p className="card-subtitle">Choose a journal to edit its current issue</p>
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
                    {journal.currentIssueContent ? 'Current issue defined' : 'No current issue set'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Current Issue Editor */}
        <div className="lg:col-span-2 content-card">
          <div className="card-header">
            <h3 className="card-title">
              {selectedJournal ? `Current Issue - ${selectedJournal.title}` : 'Current Issue Editor'}
            </h3>
            <p className="card-subtitle">Manage the current issue information</p>
          </div>
          <div className="card-content">
            {selectedJournal ? (
              <div className="space-y-6">
                <div>
                  <label htmlFor="currentIssueContent" className="block text-sm font-medium text-gray-700 mb-2">
                    Current Issue Content
                  </label>
                  <InputTextarea
                    id="currentIssueContent"
                    value={currentIssueContent}
                    onChange={(e) => setCurrentIssueContent(e.target.value)}
                    rows={12}
                    placeholder="Enter current issue information..."
                    className="w-full"
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Include issue number, volume, publication date, and featured articles.
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button
                    label="Save Current Issue"
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
                <i className="pi pi-calendar text-6xl text-gray-300 mb-4"></i>
                <h4 className="text-xl font-semibold text-gray-600 mb-2">No Journal Selected</h4>
                <p className="text-gray-500">Please select a journal from the list to edit its current issue.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Current Issue Template */}
      <div className="content-card mt-6">
        <div className="card-header">
          <h3 className="card-title">Current Issue Template</h3>
          <p className="card-subtitle">Use this template to structure your current issue</p>
        </div>
        <div className="card-content">
          <div className="bg-gray-50 p-6 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-4">Current Issue Format:</h4>
            <div className="space-y-4 text-sm">
              <div className="border-l-4 border-green-500 pl-4">
                <h5 className="font-medium text-gray-800">Volume X, Issue Y - [Month Year]</h5>
                <p className="text-gray-600 mt-2">Featured Articles:</p>
                <ul className="ml-4 space-y-1 text-gray-600">
                  <li>• [Article Title] - [Author Names]</li>
                  <li>• [Article Title] - [Author Names]</li>
                  <li>• [Article Title] - [Author Names]</li>
                </ul>
                <p className="text-gray-500 text-xs mt-2">Published: [Date]</p>
              </div>
            </div>
            <div className="mt-4 p-4 bg-green-50 rounded-lg">
              <h5 className="font-medium text-green-800 mb-2">Tips:</h5>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Update regularly when new issues are published</li>
                <li>• Include volume and issue numbers</li>
                <li>• Highlight featured or important articles</li>
                <li>• Include publication date</li>
                <li>• Link to full issue content when available</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

