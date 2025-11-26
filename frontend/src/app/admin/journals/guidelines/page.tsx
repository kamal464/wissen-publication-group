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
  guidelines: string;
}

export default function GuidelinesManagement() {
  const [journals, setJournals] = useState<Journal[]>([]);
  const [selectedJournal, setSelectedJournal] = useState<Journal | null>(null);
  const [guidelines, setGuidelines] = useState('');
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
        { id: 1, title: 'Journal of Advanced Research', guidelines: 'Follow standard academic writing guidelines...' },
        { id: 2, title: 'International Journal of Engineering', guidelines: 'Engineering research guidelines...' },
        { id: 3, title: 'Medical Research Quarterly', guidelines: 'Medical research guidelines...' }
      ]);
    } catch (error) {
      console.error('Error loading journals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJournalSelect = (journal: Journal) => {
    setSelectedJournal(journal);
    setGuidelines(journal.guidelines || '');
  };

  const handleSave = async () => {
    if (!selectedJournal) return;

    setSaving(true);
    try {
      // In a real app, save to API
      await journalAPI.updateGuidelines(selectedJournal.id, { guidelines });
      
      // Update local state
      setJournals(journals.map(j => 
        j.id === selectedJournal.id ? { ...j, guidelines } : j
      ));

      toast.current?.show({ 
        severity: 'success', 
        summary: 'Success', 
        detail: 'Guidelines updated successfully' 
      });
    } catch (error) {
      console.error('Error saving guidelines:', error);
      toast.current?.show({ 
        severity: 'error', 
        summary: 'Error', 
        detail: 'Failed to save guidelines' 
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Guidelines Management</h1>
            <p className="text-gray-600">Manage submission guidelines for each journal</p>
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
            <p className="card-subtitle">Choose a journal to edit its guidelines</p>
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
                    {journal.guidelines ? 'Guidelines defined' : 'No guidelines set'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Guidelines Editor */}
        <div className="lg:col-span-2 content-card">
          <div className="card-header">
            <h3 className="card-title">
              {selectedJournal ? `Guidelines - ${selectedJournal.title}` : 'Guidelines Editor'}
            </h3>
            <p className="card-subtitle">Define submission guidelines for authors</p>
          </div>
          <div className="card-content">
            {selectedJournal ? (
              <div className="space-y-6">
                <div>
                  <label htmlFor="guidelines" className="block text-sm font-medium text-gray-700 mb-2">
                    Submission Guidelines
                  </label>
                  <InputTextarea
                    id="guidelines"
                    value={guidelines}
                    onChange={(e) => setGuidelines(e.target.value)}
                    rows={15}
                    placeholder="Enter detailed submission guidelines for authors..."
                    className="w-full"
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Provide comprehensive guidelines for manuscript preparation, formatting, and submission.
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button
                    label="Save Guidelines"
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
                <i className="pi pi-file-text text-6xl text-gray-300 mb-4"></i>
                <h4 className="text-xl font-semibold text-gray-600 mb-2">No Journal Selected</h4>
                <p className="text-gray-500">Please select a journal from the list to edit its guidelines.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Template Section */}
      <div className="content-card mt-6">
        <div className="card-header">
          <h3 className="card-title">Guidelines Template</h3>
          <p className="card-subtitle">Use this template to structure your guidelines</p>
        </div>
        <div className="card-content">
          <div className="bg-gray-50 p-6 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-4">Standard Guidelines Structure:</h4>
            <div className="space-y-4 text-sm">
              <div>
                <h5 className="font-medium text-gray-800">1. Manuscript Preparation</h5>
                <ul className="ml-4 space-y-1 text-gray-600">
                  <li>• Document format and length requirements</li>
                  <li>• Font, spacing, and margin specifications</li>
                  <li>• Title page requirements</li>
                </ul>
              </div>
              <div>
                <h5 className="font-medium text-gray-800">2. Content Requirements</h5>
                <ul className="ml-4 space-y-1 text-gray-600">
                  <li>• Abstract and keywords guidelines</li>
                  <li>• Introduction, methodology, and conclusion structure</li>
                  <li>• Reference formatting standards</li>
                </ul>
              </div>
              <div>
                <h5 className="font-medium text-gray-800">3. Submission Process</h5>
                <ul className="ml-4 space-y-1 text-gray-600">
                  <li>• Online submission instructions</li>
                  <li>• Required documents and files</li>
                  <li>• Review timeline and process</li>
                </ul>
              </div>
              <div>
                <h5 className="font-medium text-gray-800">4. Ethical Guidelines</h5>
                <ul className="ml-4 space-y-1 text-gray-600">
                  <li>• Authorship and contribution requirements</li>
                  <li>• Conflict of interest disclosure</li>
                  <li>• Data availability and reproducibility</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

