'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { TabView, TabPanel } from 'primereact/tabview';
import { FileUpload } from 'primereact/fileupload';
import { adminAPI } from '@/lib/api';
import { getFileUrl } from '@/lib/apiConfig';

interface Journal {
  id: number;
  title: string;
  issn: string;
  journalImpactFactor?: string;
  articleProcessingCharge?: string;
  icv?: string;
  pubmedId?: string;
  indexingAbstracting?: string;
  email?: string;
  classification?: string;
  citationsValue?: string;
  acceptanceRate?: string;
  conferenceUrl?: string;
  bannerImage?: string;
  flyerImage?: string;
  flyerPdf?: string;
  googleIndexingImage?: string;
}

export default function ManageJournalInformation() {
  const [journal, setJournal] = useState<Journal | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const toast = useRef<Toast>(null);

  useEffect(() => {
    loadJournal();
  }, []);

  const loadJournal = async () => {
    try {
      setLoading(true);
      const username = localStorage.getItem('journalAdminUser');
      if (!username) {
        toast.current?.show({ severity: 'error', summary: 'Error', detail: 'User not found' });
        return;
      }

      // Get user's journal info
      const usersResponse = await adminAPI.getUsers();
      const users = (usersResponse.data as any[]) || [];
      const user = users.find((u: any) => u.userName === username || u.journalShort === username);
      
      if (!user || !user.journalName) {
        toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Journal not found for this user' });
        return;
      }

      // Get journal by name
      const journalsResponse = await adminAPI.getJournals();
      const journals = (journalsResponse.data as any[]) || [];
      const foundJournal = journals.find((j: any) => j.title === user.journalName);
      
      if (foundJournal) {
        setJournal({
          id: foundJournal.id,
          title: foundJournal.title || '',
          issn: foundJournal.issn || '',
          journalImpactFactor: foundJournal.journalImpactFactor || '',
          articleProcessingCharge: foundJournal.articleProcessingCharge || '',
          icv: foundJournal.icv || '',
          pubmedId: foundJournal.pubmedId || '',
          indexingAbstracting: foundJournal.indexingAbstracting || '',
          email: foundJournal.email || '',
          classification: foundJournal.classification || '',
          citationsValue: foundJournal.citationsValue || '',
          acceptanceRate: foundJournal.acceptanceRate || '',
          conferenceUrl: foundJournal.conferenceUrl || '',
          bannerImage: foundJournal.bannerImage || '',
          flyerImage: foundJournal.flyerImage || '',
          flyerPdf: foundJournal.flyerPdf || '',
          googleIndexingImage: foundJournal.googleIndexingImage || '',
        });
      } else {
        // Create placeholder if journal doesn't exist
        setJournal({
          id: 0,
          title: user.journalName,
          issn: '',
          journalImpactFactor: '',
          articleProcessingCharge: '',
          icv: '',
          pubmedId: '',
          indexingAbstracting: '',
          email: '',
          classification: '',
          citationsValue: '',
          acceptanceRate: '',
          conferenceUrl: '',
          bannerImage: '',
          flyerImage: '',
          flyerPdf: '',
          googleIndexingImage: '',
        });
      }
    } catch (error: any) {
      console.error('Error loading journal:', error);
      toast.current?.show({ 
        severity: 'error', 
        summary: 'Error', 
        detail: error.response?.data?.message || 'Failed to load journal information' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (field: 'bannerImage' | 'flyerImage' | 'flyerPdf' | 'googleIndexingImage', file: File) => {
    if (!journal || journal.id === 0) {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Please save journal information first' });
      return;
    }

    try {
      setUploading(field);
      const response = await adminAPI.uploadJournalImage(journal.id, field, file);
      const responseData = response.data as { url?: string };
      const imageUrl = responseData.url || '';
      
      setJournal({ ...journal, [field]: imageUrl });
      toast.current?.show({ severity: 'success', summary: 'Success', detail: 'Image uploaded successfully' });
      await loadJournal(); // Reload to get updated data
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast.current?.show({ 
        severity: 'error', 
        summary: 'Error', 
        detail: error.response?.data?.message || 'Failed to upload image' 
      });
    } finally {
      setUploading(null);
    }
  };

  const handleSave = async () => {
    if (!journal) return;

    try {
      setSaving(true);
      
      // Get user's shortcode
      const username = localStorage.getItem('journalAdminUser');
      const usersResponse = await adminAPI.getUsers();
      const users = (usersResponse.data as any[]) || [];
      const user = users.find((u: any) => u.userName === username || u.journalShort === username);
      const userShortcode = user?.journalShort || user?.userName;
      
      const journalData = {
        ...journal,
        title: journal.title,
        description: journal.title, // Use title as description if not provided
        issn: journal.issn,
        shortcode: userShortcode, // Set shortcode from user
        impactFactor: journal.journalImpactFactor,
        // Map other fields as needed
      };

      if (journal.id > 0) {
        await adminAPI.updateJournal(journal.id, journalData);
        toast.current?.show({ severity: 'success', summary: 'Success', detail: 'Journal information updated successfully' });
      } else {
        const response = await adminAPI.createJournal(journalData);
        const responseData = response.data as { id?: number };
        setJournal({ ...journal, id: responseData.id || 0 });
        toast.current?.show({ severity: 'success', summary: 'Success', detail: 'Journal information created successfully' });
        
        // Update the JournalShortcode to link to the created journal
        if (userShortcode) {
          try {
            const shortcodesResponse = await adminAPI.getJournalShortcodes();
            const shortcodes = (shortcodesResponse.data as any[]) || [];
            const shortcodeEntry = shortcodes.find((sc: any) => sc.shortcode === userShortcode);
            if (shortcodeEntry && !shortcodeEntry.journalId) {
              // The backend should handle this, but we can trigger a refresh
              await loadJournal();
            }
          } catch (e) {
            console.error('Error updating shortcode link:', e);
          }
        }
      }
      setShowDialog(false);
      loadJournal();
    } catch (error: any) {
      console.error('Error saving journal:', error);
      toast.current?.show({ 
        severity: 'error', 
        summary: 'Error', 
        detail: error.response?.data?.message || 'Failed to save journal information' 
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <i className="pi pi-spin pi-spinner text-4xl text-blue-600 mb-4"></i>
          <p className="text-gray-600">Loading journal information...</p>
        </div>
      </div>
    );
  }

  if (!journal) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600">No journal found for this user.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8">
      <Toast ref={toast} />
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Manage Journal Information</h1>
        <p className="text-slate-600">Edit your journal details and settings</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center justify-between mb-4" style={{ gap: '1rem', flexWrap: 'wrap' }}>
          <div className="flex-1" style={{ minWidth: '200px' }}>
            <h2 className="text-xl font-semibold text-slate-800">{journal.title}</h2>
            {journal.issn && <p className="text-sm text-slate-600">ISSN: {journal.issn}</p>}
          </div>
          <div style={{ flexShrink: 0, position: 'relative', zIndex: 10 }}>
            <button
              onClick={() => setShowDialog(true)}
              style={{ 
                minWidth: '120px',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '500',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                fontSize: '0.875rem',
                boxShadow: '0 2px 4px rgba(59, 130, 246, 0.3)',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#2563eb';
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 8px rgba(59, 130, 246, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#3b82f6';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(59, 130, 246, 0.3)';
              }}
            >
              <i className="pi pi-pencil"></i>
              <span>Edit</span>
            </button>
          </div>
        </div>
        {/* Display existing images */}
        {(journal.bannerImage || journal.flyerImage || journal.googleIndexingImage) && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Current Images</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {journal.bannerImage && (
                <div>
                  <p className="text-xs text-gray-600 mb-1">Banner Image</p>
                  <img 
                    src={getFileUrl(journal.bannerImage)} 
                    alt="Banner" 
                    className="w-full h-24 object-cover rounded border border-gray-200"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
              {journal.flyerImage && (
                <div>
                  <p className="text-xs text-gray-600 mb-1">Flyer Image</p>
                  <img 
                    src={getFileUrl(journal.flyerImage)} 
                    alt="Flyer" 
                    className="w-full h-24 object-cover rounded border border-gray-200"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
              {journal.googleIndexingImage && (
                <div>
                  <p className="text-xs text-gray-600 mb-1">Google Indexing Image</p>
                  <img 
                    src={getFileUrl(journal.googleIndexingImage)} 
                    alt="Google Indexing" 
                    className="w-full h-24 object-cover rounded border border-gray-200"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <Dialog
        header="Edit Journal Information"
        visible={showDialog}
        style={{ width: '90vw', maxWidth: '1000px' }}
        onHide={() => setShowDialog(false)}
        footer={
          <div className="flex justify-end gap-2" style={{ padding: '1rem', borderTop: '1px solid #e2e8f0' }}>
            <button
              onClick={() => setShowDialog(false)}
              style={{ 
                padding: '0.75rem 1.5rem',
                backgroundColor: 'transparent',
                color: '#64748b',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '500',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                fontSize: '0.875rem',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f1f5f9';
                e.currentTarget.style.color = '#475569';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#64748b';
              }}
            >
              <i className="pi pi-times"></i>
              <span>Cancel</span>
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{ 
                minWidth: '120px',
                backgroundColor: saving ? '#94a3b8' : '#3b82f6',
                color: 'white',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                cursor: saving ? 'not-allowed' : 'pointer',
                fontWeight: '500',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                fontSize: '0.875rem',
                boxShadow: '0 2px 4px rgba(59, 130, 246, 0.3)',
                transition: 'all 0.2s',
                opacity: saving ? 0.7 : 1
              }}
              onMouseEnter={(e) => {
                if (!saving) {
                  e.currentTarget.style.backgroundColor = '#2563eb';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(59, 130, 246, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                if (!saving) {
                  e.currentTarget.style.backgroundColor = '#3b82f6';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(59, 130, 246, 0.3)';
                }
              }}
            >
              {saving ? (
                <>
                  <i className="pi pi-spin pi-spinner"></i>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <i className="pi pi-check"></i>
                  <span>Save</span>
                </>
              )}
            </button>
          </div>
        }
      >
        {journal && (
          <TabView>
            <TabPanel header="Basic Information">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
                <div className="flex flex-col">
                  <label className="block mb-2 text-sm font-medium text-gray-700">ISSN *</label>
                  <InputText
                    value={journal.issn}
                    onChange={(e) => setJournal({ ...journal, issn: e.target.value })}
                    className="w-full"
                    placeholder="Enter ISSN"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="block mb-2 text-sm font-medium text-gray-700">Journal Impact Factor</label>
                  <InputText
                    value={journal.journalImpactFactor || ''}
                    onChange={(e) => setJournal({ ...journal, journalImpactFactor: e.target.value })}
                    className="w-full"
                    placeholder="Enter impact factor"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="block mb-2 text-sm font-medium text-gray-700">Article Processing Charge</label>
                  <InputText
                    value={journal.articleProcessingCharge || ''}
                    onChange={(e) => setJournal({ ...journal, articleProcessingCharge: e.target.value })}
                    className="w-full"
                    placeholder="Enter APC"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="block mb-2 text-sm font-medium text-gray-700">ICV</label>
                  <InputText
                    value={journal.icv || ''}
                    onChange={(e) => setJournal({ ...journal, icv: e.target.value })}
                    className="w-full"
                    placeholder="Enter ICV"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="block mb-2 text-sm font-medium text-gray-700">PubMed ID</label>
                  <InputText
                    value={journal.pubmedId || ''}
                    onChange={(e) => setJournal({ ...journal, pubmedId: e.target.value })}
                    className="w-full"
                    placeholder="Enter PubMed ID"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="block mb-2 text-sm font-medium text-gray-700">Email</label>
                  <InputText
                    value={journal.email || ''}
                    onChange={(e) => setJournal({ ...journal, email: e.target.value })}
                    className="w-full"
                    placeholder="Enter email"
                  />
                </div>
                <div className="flex flex-col sm:col-span-2">
                  <label className="block mb-2 text-sm font-medium text-gray-700">Indexing & Abstracting</label>
                  <InputTextarea
                    value={journal.indexingAbstracting || ''}
                    onChange={(e) => setJournal({ ...journal, indexingAbstracting: e.target.value })}
                    className="w-full"
                    rows={3}
                    placeholder="Enter indexing and abstracting information"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="block mb-2 text-sm font-medium text-gray-700">Classification</label>
                  <InputText
                    value={journal.classification || ''}
                    onChange={(e) => setJournal({ ...journal, classification: e.target.value })}
                    className="w-full"
                    placeholder="Enter classification"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="block mb-2 text-sm font-medium text-gray-700">Citations Value</label>
                  <InputText
                    value={journal.citationsValue || ''}
                    onChange={(e) => setJournal({ ...journal, citationsValue: e.target.value })}
                    className="w-full"
                    placeholder="Enter citations value"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="block mb-2 text-sm font-medium text-gray-700">Acceptance Rate</label>
                  <InputText
                    value={journal.acceptanceRate || ''}
                    onChange={(e) => setJournal({ ...journal, acceptanceRate: e.target.value })}
                    className="w-full"
                    placeholder="Enter acceptance rate"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="block mb-2 text-sm font-medium text-gray-700">Conference URL</label>
                  <InputText
                    value={journal.conferenceUrl || ''}
                    onChange={(e) => setJournal({ ...journal, conferenceUrl: e.target.value })}
                    className="w-full"
                    placeholder="Enter conference URL"
                  />
                </div>
              </div>
            </TabPanel>
            <TabPanel header="Images & Files">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
                <div className="flex flex-col">
                  <label className="block mb-2 text-sm font-medium text-gray-700">Banner Image</label>
                  <FileUpload
                    mode="basic"
                    name="bannerImage"
                    accept="image/*"
                    maxFileSize={5000000}
                    chooseLabel={uploading === 'bannerImage' ? 'Uploading...' : 'Upload Banner'}
                    className="w-full"
                    disabled={uploading === 'bannerImage'}
                    onSelect={(e) => {
                      const file = e.files[0];
                      if (file) {
                        handleImageUpload('bannerImage', file);
                      }
                    }}
                    auto
                  />
                  {journal.bannerImage && (
                    <div className="mt-2">
                      <img 
                        src={getFileUrl(journal.bannerImage)} 
                        alt="Banner" 
                        className="w-full h-32 object-cover rounded border border-gray-200"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                      <p className="text-xs text-gray-500 mt-1">Current banner image</p>
                    </div>
                  )}
                </div>
                <div className="flex flex-col">
                  <label className="block mb-2 text-sm font-medium text-gray-700">Flyer Image</label>
                  <FileUpload
                    mode="basic"
                    name="flyerImage"
                    accept="image/*"
                    maxFileSize={5000000}
                    chooseLabel={uploading === 'flyerImage' ? 'Uploading...' : 'Upload Flyer Image'}
                    className="w-full"
                    disabled={uploading === 'flyerImage'}
                    onSelect={(e) => {
                      const file = e.files[0];
                      if (file) {
                        handleImageUpload('flyerImage', file);
                      }
                    }}
                    auto
                  />
                  {journal.flyerImage && (
                    <div className="mt-2">
                      <img 
                        src={getFileUrl(journal.flyerImage)} 
                        alt="Flyer" 
                        className="w-full h-32 object-cover rounded border border-gray-200"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                      <p className="text-xs text-gray-500 mt-1">Current flyer image</p>
                    </div>
                  )}
                </div>
                <div className="flex flex-col">
                  <label className="block mb-2 text-sm font-medium text-gray-700">Flyer PDF</label>
                  <FileUpload
                    mode="basic"
                    name="flyerPdf"
                    accept="application/pdf"
                    maxFileSize={10000000}
                    chooseLabel={uploading === 'flyerPdf' ? 'Uploading...' : 'Upload Flyer PDF'}
                    className="w-full"
                    disabled={uploading === 'flyerPdf'}
                    onSelect={(e) => {
                      const file = e.files[0];
                      if (file) {
                        handleImageUpload('flyerPdf', file);
                      }
                    }}
                    auto
                  />
                  {journal.flyerPdf && (
                    <div className="mt-2">
                      <a 
                        href={getFileUrl(journal.flyerPdf)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm flex items-center gap-1"
                      >
                        <i className="pi pi-file-pdf"></i>
                        View Flyer PDF
                      </a>
                    </div>
                  )}
                </div>
                <div className="flex flex-col">
                  <label className="block mb-2 text-sm font-medium text-gray-700">Google Indexing Image</label>
                  <FileUpload
                    mode="basic"
                    name="googleIndexingImage"
                    accept="image/*"
                    maxFileSize={5000000}
                    chooseLabel={uploading === 'googleIndexingImage' ? 'Uploading...' : 'Upload Google Indexing Image'}
                    className="w-full"
                    disabled={uploading === 'googleIndexingImage'}
                    onSelect={(e) => {
                      const file = e.files[0];
                      if (file) {
                        handleImageUpload('googleIndexingImage', file);
                      }
                    }}
                    auto
                  />
                  {journal.googleIndexingImage && (
                    <div className="mt-2">
                      <img 
                        src={getFileUrl(journal.googleIndexingImage)} 
                        alt="Google Indexing" 
                        className="w-full h-32 object-cover rounded border border-gray-200"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                      <p className="text-xs text-gray-500 mt-1">Current Google indexing image</p>
                    </div>
                  )}
                </div>
              </div>
            </TabPanel>
          </TabView>
        )}
      </Dialog>
    </div>
  );
}

