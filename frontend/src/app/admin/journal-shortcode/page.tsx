'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { adminAPI } from '@/lib/api';
import '@/styles/admin-global.scss';

interface JournalShortcode {
  id: number;
  shortcode: string;
  journalName: string;
  journalId: number | null;
  createdAt: string;
}

export default function JournalShortcodePage() {
  const [journalName, setJournalName] = useState('');
  const [shortcode, setShortcode] = useState('');
  const [shortcodes, setShortcodes] = useState<JournalShortcode[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [checkingUniqueness, setCheckingUniqueness] = useState(false);
  const [isUnique, setIsUnique] = useState<boolean | null>(null);
  const [suggestedShortcode, setSuggestedShortcode] = useState<string>('');
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);
  const toast = useRef<Toast>(null);

  useEffect(() => {
    loadShortcodes();
  }, []);

  useEffect(() => {
    // Check uniqueness when shortcode changes
    if (shortcode && shortcode.length >= 2) {
      checkShortcodeUniqueness(shortcode);
    } else {
      setIsUnique(null);
    }
  }, [shortcode, shortcodes]);

  const loadShortcodes = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getJournalShortcodes();
      setShortcodes((response.data as JournalShortcode[]) || []);
      setBackendOnline(true);
    } catch (error: any) {
      console.error('Error loading shortcodes:', error);
      setBackendOnline(false);
      
      // Check if it's a network error (backend not running)
      if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED' || !error.response) {
        // Don't spam toast for network errors on page load
      } else {
        const errorMessage = error.response?.data?.message || 
                            error.message || 
                            'Failed to load journal shortcodes.';
        toast.current?.show({ 
          severity: 'error', 
          summary: 'Error', 
          detail: errorMessage,
          life: 5000
        });
      }
      
      setShortcodes([]);
    } finally {
      setLoading(false);
    }
  };

  const checkShortcodeUniqueness = (code: string) => {
    const exists = shortcodes.some(sc => sc.shortcode.toLowerCase() === code.toLowerCase());
    setIsUnique(!exists);
    return !exists;
  };

  const generateShortcode = async (name: string): Promise<string> => {
    if (!name || name.trim().length === 0) return '';

    const words = name.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(' ')
      .filter(w => w.length > 0);

    let baseCode = '';
    
    const meaningfulWords = words.filter(w => 
      !['journal', 'of', 'the', 'and', '&', 'for', 'on', 'in', 'at', 'to'].includes(w) && w.length > 2
    );
    
    if (meaningfulWords.length > 0) {
      baseCode = meaningfulWords.map(w => w.charAt(0)).join('');
    } else {
      baseCode = words.slice(0, 3).map(w => w.substring(0, Math.min(3, w.length))).join('');
    }

    baseCode = baseCode.substring(0, 10);

    let finalCode = baseCode;
    let counter = 1;
    let attempts = 0;
    const maxAttempts = 100;

    while (!checkShortcodeUniqueness(finalCode) && attempts < maxAttempts) {
      const suffix = counter.toString();
      finalCode = (baseCode.substring(0, 10 - suffix.length) + suffix);
      counter++;
      attempts++;
    }

    return finalCode.toLowerCase();
  };

  const handleJournalNameChange = async (value: string) => {
    setJournalName(value);
    
    if (value && value.trim().length > 0) {
      const generated = await generateShortcode(value);
      setSuggestedShortcode(generated);
      
      if (!shortcode) {
        setShortcode(generated);
      }
    } else {
      setSuggestedShortcode('');
      if (!shortcode) {
        setShortcode('');
      }
    }
  };

  const handleShortcodeChange = (value: string) => {
    const cleaned = value.toLowerCase().replace(/[^a-z0-9]/g, '');
    setShortcode(cleaned);
  };

  const handleUseSuggested = () => {
    if (suggestedShortcode) {
      setShortcode(suggestedShortcode);
    }
  };

  const handleCreate = async () => {
    if (!journalName || !journalName.trim()) {
      toast.current?.show({ 
        severity: 'warn', 
        summary: 'Validation', 
        detail: 'Journal name is required' 
      });
      return;
    }

    if (!shortcode || !shortcode.trim()) {
      toast.current?.show({ 
        severity: 'warn', 
        summary: 'Validation', 
        detail: 'Journal shortcode is required' 
      });
      return;
    }

    if (!/^[a-z0-9]+$/.test(shortcode)) {
      toast.current?.show({ 
        severity: 'warn', 
        summary: 'Validation', 
        detail: 'Shortcode must contain only lowercase letters and numbers' 
      });
      return;
    }

    if (!checkShortcodeUniqueness(shortcode)) {
      toast.current?.show({ 
        severity: 'warn', 
        summary: 'Validation', 
        detail: 'This shortcode already exists. Please choose a different one.' 
      });
      return;
    }

    try {
      setSaving(true);
      await adminAPI.createJournalShortcode(journalName.trim(), shortcode.trim());
      toast.current?.show({ 
        severity: 'success', 
        summary: 'Success', 
        detail: 'Journal shortcode created successfully' 
      });
      setJournalName('');
      setShortcode('');
      setSuggestedShortcode('');
      setIsUnique(null);
      loadShortcodes();
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to create journal shortcode';
      
      if (message.includes('exists') || message.includes('unique') || error.response?.status === 409) {
        toast.current?.show({ 
          severity: 'warn', 
          summary: 'Validation', 
          detail: 'This shortcode already exists. Please choose a different one.',
          life: 5000
        });
      } else {
        toast.current?.show({ 
          severity: 'error', 
          summary: 'Error', 
          detail: message,
          life: 5000
        });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (shortcodeItem: JournalShortcode) => {
    confirmDialog({
      message: `Are you sure you want to delete shortcode "${shortcodeItem.shortcode}" for "${shortcodeItem.journalName}"?`,
      header: 'Delete Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptClassName: 'p-button p-button-danger',
      rejectClassName: 'p-button p-button-secondary p-button-text',
      acceptLabel: 'Yes',
      rejectLabel: 'No',
      accept: async () => {
        try {
          await adminAPI.deleteJournalShortcode(shortcodeItem.id);
          toast.current?.show({ 
            severity: 'success', 
            summary: 'Success', 
            detail: 'Journal shortcode deleted successfully' 
          });
          loadShortcodes();
        } catch (error) {
          toast.current?.show({ 
            severity: 'error', 
            summary: 'Error', 
            detail: 'Failed to delete journal shortcode' 
          });
        }
      },
      reject: () => {
        // Cancel action
      }
    });
  };

  const deleteBodyTemplate = (rowData: JournalShortcode) => {
    return (
      <Button
        icon="pi pi-trash"
        label="Delete"
        className="p-button-danger p-button-sm action-delete-btn"
        onClick={() => handleDelete(rowData)}
        aria-label="Delete"
      />
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <Toast ref={toast} />
      <ConfirmDialog />

      {/* Backend Offline Warning */}
      {backendOnline === false && (
        <div className="bg-amber-100 border border-amber-500 rounded-lg p-4 mb-6 flex items-center gap-4">
          <i className="pi pi-exclamation-triangle text-amber-600 text-xl"></i>
          <div className="flex-1">
            <strong className="text-amber-700 block mb-1">Backend Server Offline</strong>
            <p className="text-amber-800 text-sm m-0">
              Please start the backend server to use this feature. Run: <code className="bg-amber-200 px-2 py-1 rounded text-sm">cd backend && npm run start:dev</code>
            </p>
          </div>
          <Button
            label="Retry"
            icon="pi pi-refresh"
            className="p-button-sm"
            onClick={loadShortcodes}
          />
        </div>
      )}

      {/* Create Section */}
      <div className="mb-12">
        <h1 className="text-2xl font-bold text-slate-800 mb-6">Create Journal Shortcode</h1>
        <div className="bg-white p-8 rounded-lg shadow border border-slate-200">
          <div className="flex gap-6 items-start flex-wrap">
            {/* Journal Name Field */}
            <div className="flex-1 min-w-[280px]">
              <label className="block mb-2 font-normal text-slate-700 text-sm">Journal Name</label>
              <InputText
                value={journalName}
                onChange={(e) => handleJournalNameChange(e.target.value)}
                placeholder="Enter journal name"
                className="w-full py-3"
              />
            </div>

            {/* Journal Shortcode Field */}
            <div className="flex-1 min-w-[280px]">
              <label className="block mb-2 font-normal text-slate-700 text-sm">Journal Shortcode</label>
              <div className="relative">
                <InputText
                  value={shortcode}
                  onChange={(e) => handleShortcodeChange(e.target.value)}
                  placeholder="Enter or auto-generate shortcode"
                  className={`w-full py-3 pr-${shortcode ? '10' : '4'}`}
                  maxLength={20}
                />
                {shortcode && isUnique !== null && (
                  <span className={`absolute right-3 top-1/2 -translate-y-1/2 ${isUnique ? 'text-emerald-500' : 'text-red-500'} text-lg font-bold pointer-events-none leading-none`}>
                    {isUnique ? '✓' : '✗'}
                  </span>
                )}
              </div>
              {/* Info messages below input */}
              <div className="mt-2">
                {suggestedShortcode && suggestedShortcode !== shortcode && (
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <small className="text-slate-500 text-xs">
                      Suggested: <strong className="text-blue-600">{suggestedShortcode}</strong>
                    </small>
                    <Button
                      label="Use"
                      icon="pi pi-check"
                      className="p-button-text p-button-sm"
                      onClick={handleUseSuggested}
                      style={{ padding: '0.125rem 0.5rem', minWidth: 'auto', height: '24px', fontSize: '0.75rem' }}
                    />
                  </div>
                )}
                <small className="text-slate-400 text-xs block mb-1 leading-6">
                  Lowercase letters and numbers only. Will be auto-generated if left empty.
                </small>
                {shortcode && isUnique === false && (
                  <small className="text-red-500 text-xs font-normal block leading-6">
                    This shortcode already exists. Please choose a different one.
                  </small>
                )}
                {shortcode && isUnique === true && (
                  <small className="text-emerald-500 text-xs font-normal block leading-6">
                    This shortcode is available.
                  </small>
                )}
              </div>
            </div>

            {/* Create Button */}
            <div className="flex flex-col justify-start pt-7 min-w-[120px]">
              <Button
                label="Create"
                icon="pi pi-plus"
                onClick={handleCreate}
                className="p-button-info !bg-blue-600 !border-blue-600 !text-white"
                disabled={!journalName || !shortcode || saving || isUnique === false || backendOnline === false}
                loading={saving}
                style={{ minWidth: '120px', height: '40px' }}
                tooltip={backendOnline === false ? "Backend server is offline" : undefined}
                tooltipOptions={{ position: 'top' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Existing Shortcodes */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 mb-6">Existing Journal Shortcodes</h2>
        <div className="bg-white rounded-lg overflow-hidden shadow border border-slate-200">
          <DataTable
            value={shortcodes}
            loading={loading}
            paginator
            rows={10}
            emptyMessage="No shortcodes found"
            className="p-datatable-sm w-full"
          responsiveLayout="stack"
          breakpoint="960px"
          >
            <Column 
              field="id" 
              header="S.No" 
              sortable 
              style={{ width: '80px' }}
              headerClassName="text-left bg-sky-100 text-sky-900 font-semibold"
              bodyClassName="text-left"
            />
            <Column 
              field="shortcode" 
              header="Shortcode" 
              sortable
              headerClassName="text-left bg-sky-100 text-sky-900 font-semibold"
              bodyClassName="text-left"
            />
            <Column 
              field="journalName" 
              header="Journal Name"
              headerClassName="text-left bg-sky-100 text-sky-900 font-semibold"
              bodyClassName="text-left"
            />
            <Column 
              field="createdAt" 
              header="Created" 
              body={(rowData) => formatDate(rowData.createdAt)}
              sortable
              style={{ width: '120px' }}
              headerClassName="text-left bg-sky-100 text-sky-900 font-semibold"
              bodyClassName="text-left"
            />
            <Column 
              header="Action" 
              body={deleteBodyTemplate} 
              style={{ width: '120px' }}
              headerClassName="text-left bg-sky-100 text-sky-900 font-semibold"
              bodyClassName="text-left"
            />
          </DataTable>
        </div>
      </div>
      {/* Add User Dialog */}
      {/* The Add User dialog is removed as per the edit hint. */}
    </div>
  );
}
