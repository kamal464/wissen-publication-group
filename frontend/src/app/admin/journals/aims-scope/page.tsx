'use client';

import { useState, useEffect } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { InputTextarea } from 'primereact/inputtextarea';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { useRef } from 'react';
import { Dropdown } from 'primereact/dropdown';
import Link from 'next/link';
import '@/styles/admin-global.scss';
import { journalAPI } from '@/lib/api';

interface Journal {
  id: number;
  title: string;
  aimsScope: string;
}

export default function AimsScopeManagement() {
  const [journals, setJournals] = useState<Journal[]>([]);
  const [selectedJournal, setSelectedJournal] = useState<Journal | null>(null);
  const [aimsScope, setAimsScope] = useState('');
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
        { id: 1, title: 'Journal of Advanced Research', aimsScope: 'To publish high-quality research across multiple disciplines' },
        { id: 2, title: 'International Journal of Engineering', aimsScope: 'To advance engineering knowledge and practice' },
        { id: 3, title: 'Medical Research Quarterly', aimsScope: 'To disseminate latest medical research and clinical studies' }
      ]);
    } catch (error) {
      console.error('Error loading journals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJournalSelect = (journal: Journal) => {
    setSelectedJournal(journal);
    setAimsScope(journal.aimsScope || '');
  };

  const handleSave = async () => {
    if (!selectedJournal) return;

    setSaving(true);
    try {
      // In a real app, save to API
      await journalAPI.updateAimsScope(selectedJournal.id, { aimsScope });
      
      // Update local state
      setJournals(journals.map(j => 
        j.id === selectedJournal.id ? { ...j, aimsScope } : j
      ));

      toast.current?.show({ 
        severity: 'success', 
        summary: 'Success', 
        detail: 'Aims & Scope updated successfully' 
      });
    } catch (error) {
      console.error('Error saving aims & scope:', error);
      toast.current?.show({ 
        severity: 'error', 
        summary: 'Error', 
        detail: 'Failed to save aims & scope' 
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Aims & Scope Management</h1>
            <p className="text-gray-600">Manage the aims and scope content for each journal</p>
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
            <p className="card-subtitle">Choose a journal to edit its aims & scope</p>
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
                    {journal.aimsScope ? 'Aims & Scope defined' : 'No aims & scope set'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Aims & Scope Editor */}
        <div className="lg:col-span-2 content-card">
          <div className="card-header">
            <h3 className="card-title">
              {selectedJournal ? `Aims & Scope - ${selectedJournal.title}` : 'Aims & Scope Editor'}
            </h3>
            <p className="card-subtitle">Define the journal's aims and scope</p>
          </div>
          <div className="card-content">
            {selectedJournal ? (
              <div className="space-y-6">
                <div>
                  <label htmlFor="aimsScope" className="block text-sm font-medium text-gray-700 mb-2">
                    Aims & Scope
                  </label>
                  <InputTextarea
                    id="aimsScope"
                    value={aimsScope}
                    onChange={(e) => setAimsScope(e.target.value)}
                    rows={12}
                    placeholder="Enter the journal's aims and scope. Describe the types of research, topics, and methodologies the journal covers..."
                    className="w-full"
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Describe the journal's purpose, scope, and the types of articles it publishes.
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button
                    label="Save Aims & Scope"
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
                      // In a real app, open preview modal
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
                <i className="pi pi-book text-6xl text-gray-300 mb-4"></i>
                <h4 className="text-xl font-semibold text-gray-600 mb-2">No Journal Selected</h4>
                <p className="text-gray-500">Please select a journal from the list to edit its aims & scope.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Help Section */}
      <div className="content-card mt-6">
        <div className="card-header">
          <h3 className="card-title">Guidelines for Aims & Scope</h3>
        </div>
        <div className="card-content">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">What to Include:</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <i className="pi pi-check-circle text-green-500 mr-2 mt-0.5"></i>
                  Clear statement of the journal's purpose
                </li>
                <li className="flex items-start">
                  <i className="pi pi-check-circle text-green-500 mr-2 mt-0.5"></i>
                  Subject areas and disciplines covered
                </li>
                <li className="flex items-start">
                  <i className="pi pi-check-circle text-green-500 mr-2 mt-0.5"></i>
                  Types of articles accepted
                </li>
                <li className="flex items-start">
                  <i className="pi pi-check-circle text-green-500 mr-2 mt-0.5"></i>
                  Target audience and readership
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Best Practices:</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <i className="pi pi-info-circle text-blue-500 mr-2 mt-0.5"></i>
                  Keep it concise but comprehensive
                </li>
                <li className="flex items-start">
                  <i className="pi pi-info-circle text-blue-500 mr-2 mt-0.5"></i>
                  Use clear, accessible language
                </li>
                <li className="flex items-start">
                  <i className="pi pi-info-circle text-blue-500 mr-2 mt-0.5"></i>
                  Update regularly to reflect changes
                </li>
                <li className="flex items-start">
                  <i className="pi pi-info-circle text-blue-500 mr-2 mt-0.5"></i>
                  Align with indexing requirements
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

