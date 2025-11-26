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
  articlesInPress: string;
}

export default function ArticlesInPressManagement() {
  const [journals, setJournals] = useState<Journal[]>([]);
  const [selectedJournal, setSelectedJournal] = useState<Journal | null>(null);
  const [articlesInPress, setArticlesInPress] = useState('');
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
        { id: 1, title: 'Journal of Advanced Research', articlesInPress: 'Articles currently in press...' },
        { id: 2, title: 'International Journal of Engineering', articlesInPress: 'Engineering articles in press...' },
        { id: 3, title: 'Medical Research Quarterly', articlesInPress: 'Medical articles in press...' }
      ]);
    } catch (error) {
      console.error('Error loading journals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJournalSelect = (journal: Journal) => {
    setSelectedJournal(journal);
    setArticlesInPress(journal.articlesInPress || '');
  };

  const handleSave = async () => {
    if (!selectedJournal) return;

    setSaving(true);
    try {
      // In a real app, save to API
      await journalAPI.updateArticlesInPress(selectedJournal.id, { articlesInPress });
      
      // Update local state
      setJournals(journals.map(j => 
        j.id === selectedJournal.id ? { ...j, articlesInPress } : j
      ));

      toast.current?.show({ 
        severity: 'success', 
        summary: 'Success', 
        detail: 'Articles in Press updated successfully' 
      });
    } catch (error) {
      console.error('Error saving articles in press:', error);
      toast.current?.show({ 
        severity: 'error', 
        summary: 'Error', 
        detail: 'Failed to save articles in press' 
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Articles in Press Management</h1>
            <p className="text-gray-600">Manage articles in press for each journal</p>
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
            <p className="card-subtitle">Choose a journal to edit its articles in press</p>
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
                    {journal.articlesInPress ? 'Articles in press defined' : 'No articles in press set'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Articles in Press Editor */}
        <div className="lg:col-span-2 content-card">
          <div className="card-header">
            <h3 className="card-title">
              {selectedJournal ? `Articles in Press - ${selectedJournal.title}` : 'Articles in Press Editor'}
            </h3>
            <p className="card-subtitle">Manage articles that are in press</p>
          </div>
          <div className="card-content">
            {selectedJournal ? (
              <div className="space-y-6">
                <div>
                  <label htmlFor="articlesInPress" className="block text-sm font-medium text-gray-700 mb-2">
                    Articles in Press
                  </label>
                  <InputTextarea
                    id="articlesInPress"
                    value={articlesInPress}
                    onChange={(e) => setArticlesInPress(e.target.value)}
                    rows={12}
                    placeholder="Enter articles in press information..."
                    className="w-full"
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    List articles that have been accepted but not yet published in a specific issue.
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button
                    label="Save Articles in Press"
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
                <i className="pi pi-clock text-6xl text-gray-300 mb-4"></i>
                <h4 className="text-xl font-semibold text-gray-600 mb-2">No Journal Selected</h4>
                <p className="text-gray-500">Please select a journal from the list to edit its articles in press.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Articles in Press Template */}
      <div className="content-card mt-6">
        <div className="card-header">
          <h3 className="card-title">Articles in Press Template</h3>
          <p className="card-subtitle">Use this template to structure your articles in press</p>
        </div>
        <div className="card-content">
          <div className="bg-gray-50 p-6 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-4">Articles in Press Format:</h4>
            <div className="space-y-4 text-sm">
              <div className="border-l-4 border-blue-500 pl-4">
                <h5 className="font-medium text-gray-800">Article Title</h5>
                <p className="text-gray-600">Author Names</p>
                <p className="text-gray-500 text-xs">DOI: 10.xxxx/xxxxx (if available)</p>
                <p className="text-gray-500 text-xs">Accepted: [Date]</p>
              </div>
              <div className="border-l-4 border-blue-500 pl-4">
                <h5 className="font-medium text-gray-800">Another Article Title</h5>
                <p className="text-gray-600">Author Names</p>
                <p className="text-gray-500 text-xs">DOI: 10.xxxx/xxxxx (if available)</p>
                <p className="text-gray-500 text-xs">Accepted: [Date]</p>
              </div>
            </div>
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <h5 className="font-medium text-blue-800 mb-2">Tips:</h5>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Include only articles that have been formally accepted</li>
                <li>• Update the list regularly as articles are published</li>
                <li>• Include DOI if available</li>
                <li>• List in chronological order by acceptance date</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

