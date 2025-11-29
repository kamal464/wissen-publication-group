'use client';

import { useState, useEffect, useRef } from 'react';
import { Editor } from 'primereact/editor';
import { Toast } from 'primereact/toast';
import { adminAPI } from '@/lib/api';
import 'quill/dist/quill.snow.css';

export default function JournalHomePage() {
  const [content, setContent] = useState('');
  const [originalContent, setOriginalContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [journalId, setJournalId] = useState<number | null>(null);
  const [journalTitle, setJournalTitle] = useState<string>('');
  const toast = useRef<Toast>(null);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      setLoading(true);
      const username = localStorage.getItem('journalAdminUser');
      if (!username) return;

      const usersResponse = await adminAPI.getUsers();
      const users = (usersResponse.data as any[]) || [];
      const user = users.find((u: any) => u.userName === username || u.journalShort === username);
      
      if (user && user.journalName) {
        const journalsResponse = await adminAPI.getJournals();
        const journals = (journalsResponse.data as any[]) || [];
        const journal = journals.find((j: any) => j.title === user.journalName);
        if (journal) {
          setJournalId(journal.id);
          setJournalTitle(journal.title || '');
          const homeContent = journal.homePageContent || '';
          setContent(homeContent);
          setOriginalContent(homeContent);
        }
      }
    } catch (error: any) {
      console.error('Error loading content:', error);
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Failed to load content' });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setContent(originalContent);
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!journalId) return;

    try {
      setSaving(true);
      await adminAPI.updateJournal(journalId, { homePageContent: content });
      setOriginalContent(content);
      setIsEditing(false);
      toast.current?.show({ severity: 'success', summary: 'Success', detail: 'Home page content updated successfully' });
    } catch (error: any) {
      console.error('Error saving content:', error);
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Failed to save content' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <i className="pi pi-spin pi-spinner text-4xl text-blue-600 mb-4"></i>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8">
      <Toast ref={toast} />
      
      <div className="mb-6 flex items-center justify-between">
        <div>
          {journalTitle && (
            <div className="mb-2">
              <span className="text-sm text-gray-600">Journal: </span>
              <span className="text-xl font-bold text-slate-800">{journalTitle}</span>
            </div>
          )}
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Journal Home Page</h1>
          <p className="text-slate-600">Edit your journal home page content</p>
        </div>
        {!isEditing && (
          <button
            type="button"
            onClick={handleEdit}
            style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <i className="pi pi-pencil"></i>
            <span>Edit</span>
          </button>
        )}
      </div>

      {!isEditing ? (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: content || '<p class="text-gray-400 italic">No content available. Click Edit to add content.</p>' }} />
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium text-gray-700">Home Page Content</label>
            <Editor
              value={content}
              onTextChange={(e) => setContent(e.htmlValue || '')}
              style={{ height: '500px' }}
              placeholder="Enter home page content..."
            />
          </div>
          <div className="flex justify-end gap-2 mt-4" style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={handleCancel}
              disabled={saving}
              style={{
                backgroundColor: '#f1f5f9',
                color: '#475569',
                border: '1px solid #cbd5e1',
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                fontWeight: '500',
                cursor: saving ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                opacity: saving ? 0.6 : 1
              }}
            >
              <i className="pi pi-times"></i>
              <span>Cancel</span>
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              style={{
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                fontWeight: '500',
                cursor: saving ? 'wait' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                minWidth: '120px'
              }}
            >
              {saving ? <i className="pi pi-spin pi-spinner"></i> : <i className="pi pi-check"></i>}
              <span>{saving ? 'Saving...' : 'Save'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
