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
  editorialBoard: string;
}

export default function EditorialBoardManagement() {
  const [journals, setJournals] = useState<Journal[]>([]);
  const [selectedJournal, setSelectedJournal] = useState<Journal | null>(null);
  const [editorialBoard, setEditorialBoard] = useState('');
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
        { id: 1, title: 'Journal of Advanced Research', editorialBoard: 'Dr. John Smith (Editor-in-Chief), Dr. Jane Doe (Associate Editor)' },
        { id: 2, title: 'International Journal of Engineering', editorialBoard: 'Dr. Mike Johnson (Editor-in-Chief)' },
        { id: 3, title: 'Medical Research Quarterly', editorialBoard: 'Dr. Sarah Wilson (Editor-in-Chief), Dr. Tom Brown (Associate Editor)' }
      ]);
    } catch (error) {
      console.error('Error loading journals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJournalSelect = (journal: Journal) => {
    setSelectedJournal(journal);
    setEditorialBoard(journal.editorialBoard || '');
  };

  const handleSave = async () => {
    if (!selectedJournal) return;

    setSaving(true);
    try {
      // In a real app, save to API
      await journalAPI.updateEditorialBoard(selectedJournal.id, { editorialBoard });
      
      // Update local state
      setJournals(journals.map(j => 
        j.id === selectedJournal.id ? { ...j, editorialBoard } : j
      ));

      toast.current?.show({ 
        severity: 'success', 
        summary: 'Success', 
        detail: 'Editorial Board updated successfully' 
      });
    } catch (error) {
      console.error('Error saving editorial board:', error);
      toast.current?.show({ 
        severity: 'error', 
        summary: 'Error', 
        detail: 'Failed to save editorial board' 
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Editorial Board Management</h1>
            <p className="text-gray-600">Manage editorial board information for each journal</p>
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
            <p className="card-subtitle">Choose a journal to edit its editorial board</p>
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
                    {journal.editorialBoard ? 'Editorial board defined' : 'No editorial board set'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Editorial Board Editor */}
        <div className="lg:col-span-2 content-card">
          <div className="card-header">
            <h3 className="card-title">
              {selectedJournal ? `Editorial Board - ${selectedJournal.title}` : 'Editorial Board Editor'}
            </h3>
            <p className="card-subtitle">Manage editorial board members and their roles</p>
          </div>
          <div className="card-content">
            {selectedJournal ? (
              <div className="space-y-6">
                <div>
                  <label htmlFor="editorialBoard" className="block text-sm font-medium text-gray-700 mb-2">
                    Editorial Board Information
                  </label>
                  <InputTextarea
                    id="editorialBoard"
                    value={editorialBoard}
                    onChange={(e) => setEditorialBoard(e.target.value)}
                    rows={12}
                    placeholder="Enter editorial board information..."
                    className="w-full"
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Include names, titles, affiliations, and roles of editorial board members.
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button
                    label="Save Editorial Board"
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
                <i className="pi pi-users text-6xl text-gray-300 mb-4"></i>
                <h4 className="text-xl font-semibold text-gray-600 mb-2">No Journal Selected</h4>
                <p className="text-gray-500">Please select a journal from the list to edit its editorial board.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Editorial Board Template */}
      <div className="content-card mt-6">
        <div className="card-header">
          <h3 className="card-title">Editorial Board Template</h3>
          <p className="card-subtitle">Use this template to structure your editorial board</p>
        </div>
        <div className="card-content">
          <div className="bg-gray-50 p-6 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-4">Editorial Board Structure:</h4>
            <div className="space-y-4 text-sm">
              <div>
                <h5 className="font-medium text-gray-800">Editor-in-Chief</h5>
                <p className="text-gray-600 ml-4">Dr. [Name], [Title], [Institution]</p>
              </div>
              <div>
                <h5 className="font-medium text-gray-800">Associate Editors</h5>
                <ul className="ml-4 space-y-1 text-gray-600">
                  <li>• Dr. [Name], [Title], [Institution]</li>
                  <li>• Dr. [Name], [Title], [Institution]</li>
                </ul>
              </div>
              <div>
                <h5 className="font-medium text-gray-800">Editorial Board Members</h5>
                <ul className="ml-4 space-y-1 text-gray-600">
                  <li>• Dr. [Name], [Title], [Institution]</li>
                  <li>• Dr. [Name], [Title], [Institution]</li>
                  <li>• Dr. [Name], [Title], [Institution]</li>
                </ul>
              </div>
              <div>
                <h5 className="font-medium text-gray-800">Reviewers</h5>
                <ul className="ml-4 space-y-1 text-gray-600">
                  <li>• Dr. [Name], [Title], [Institution]</li>
                  <li>• Dr. [Name], [Title], [Institution]</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

