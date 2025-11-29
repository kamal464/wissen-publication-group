'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { adminAPI } from '@/lib/api';
import '@/styles/admin-global.scss';

interface Submission {
  id: number;
  title: string;
  submitterName: string | null;
  submitterEmail: string | null;
  submitterAddress: string | null;
  submitterCountry: string | null;
  journal: {
    id: number;
    title: string;
  };
  articleType: string | null;
  abstract: string;
  keywords: string | null;
  pdfUrl?: string | null;
  wordUrl?: string | null;
  authors: Array<{
    id: number;
    name: string;
    email: string;
    affiliation: string | null;
  }>;
  submittedAt: string;
}

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const toast = useRef<Toast>(null);

  useEffect(() => {
    loadSubmissions();
  }, [searchQuery]);

  const loadSubmissions = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getSubmissions(searchQuery || undefined);
      setSubmissions(Array.isArray(response.data) ? response.data : []);
    } catch (error: any) {
      console.error('Error loading submissions:', error);
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Failed to load submissions. Make sure the backend server is running.';
      toast.current?.show({ 
        severity: 'error', 
        summary: 'Error', 
        detail: errorMessage,
        life: 5000
      });
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewSubmission = async (id: number) => {
    try {
      const response = await adminAPI.getSubmission(id);
      const submissionData = response.data as Submission;
      console.log('Submission data:', submissionData);
      console.log('PDF URL:', submissionData?.pdfUrl);
      console.log('Word URL:', submissionData?.wordUrl);
      setSelectedSubmission(submissionData);
      setShowDialog(true);
    } catch (error) {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Failed to load submission details' });
    }
  };

  const handleDownload = (url: string, filename: string) => {
    try {
      if (!url) {
        toast.current?.show({ 
          severity: 'warn', 
          summary: 'Warning', 
          detail: 'File not available for download' 
        });
        return;
      }

      // Construct the download URL - direct file link, no API calls
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL 
        ? (process.env.NEXT_PUBLIC_API_URL.endsWith('/api') 
          ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '') 
          : process.env.NEXT_PUBLIC_API_URL)
        : 'http://localhost:3001';
      let downloadUrl: string;
      
      if (url.startsWith('http://') || url.startsWith('https://')) {
        // Already a full URL
        downloadUrl = url;
      } else if (url.startsWith('/uploads/')) {
        // Use API route /api/uploads/ (FilesController) - direct link, no fetch
        // This is more reliable than static file serving
        downloadUrl = `${apiBaseUrl}${url}`;
      } else if (url.startsWith('/')) {
        // Other absolute paths
        const baseUrl = apiBaseUrl.replace(/\/api\/?$/, '');
        downloadUrl = `${baseUrl}${url}`;
      } else {
        // Relative path
        const baseUrl = apiBaseUrl.replace(/\/api\/?$/, '');
        downloadUrl = `${baseUrl}/${url}`;
      }

      console.log('Download URL:', downloadUrl);

      // Create a direct download link - force download behavior
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename; // This forces download instead of navigation
      link.style.display = 'none';
      link.setAttribute('download', filename); // Ensure download attribute is set
      
      // Append to body, click, then remove
      document.body.appendChild(link);
      
      // Trigger click to start download
      link.click();
      
      // Clean up after download starts
      setTimeout(() => {
        if (document.body.contains(link)) {
          document.body.removeChild(link);
        }
      }, 200);

      toast.current?.show({ 
        severity: 'success', 
        summary: 'Success', 
        detail: 'Download started' 
      });
    } catch (error: any) {
      console.error('Download error:', error);
      toast.current?.show({ 
        severity: 'error', 
        summary: 'Error', 
        detail: 'Failed to initiate download. Please check if the file exists on the server.',
        life: 5000
      });
    }
  };

  const abstractBodyTemplate = (rowData: Submission) => {
    return (
      <Button
        label="View"
        icon="pi pi-eye"
        className="p-button-link p-button-sm"
        onClick={() => handleViewSubmission(rowData.id)}
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

      <h1 className="text-2xl font-bold text-slate-800 mb-6">LIST OF ONLINE SUBMISSIONS</h1>

      <div className="mb-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-4 bg-white p-4 rounded-lg shadow">
        <InputText
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search submissions..."
          className="flex-1 w-full"
        />
        <Button 
          label="Search" 
          className="p-button-info"
          onClick={loadSubmissions}
        />
        {searchQuery && (
          <Button 
            icon="pi pi-times" 
            className="p-button-text"
            onClick={() => setSearchQuery('')}
            title="Clear"
          />
        )}
      </div>

      <div className="bg-white rounded-lg overflow-hidden shadow">
        <DataTable
          value={submissions}
          loading={loading}
          paginator
          rows={10}
          emptyMessage="No submissions found"
          scrollable
          responsiveLayout="stack"
          breakpoint="960px"
          scrollHeight="600px"
        >
          <Column field="id" header="#" style={{ width: '60px' }} headerClassName="text-left" bodyClassName="text-left" />
          <Column 
            field="submitterName" 
            header="Name" 
            sortable 
            headerClassName="text-left"
            bodyClassName="text-left whitespace-normal break-words"
            body={(rowData) => rowData.submitterName || rowData.authors?.[0]?.name || '-'}
          />
          <Column 
            field="submitterEmail" 
            header="Email" 
            sortable
            headerClassName="text-left"
            bodyClassName="text-left whitespace-normal break-words"
            body={(rowData) => rowData.submitterEmail || rowData.authors?.[0]?.email || '-'}
          />
          <Column field="submitterAddress" header="Address" headerClassName="text-left" bodyClassName="text-left whitespace-normal break-words" body={(rowData) => rowData.submitterAddress || '-'} />
          <Column field="submitterCountry" header="Country" sortable headerClassName="text-left" bodyClassName="text-left" body={(rowData) => rowData.submitterCountry || '-'} />
          <Column 
            field="journal.title" 
            header="Journal Name" 
            style={{ minWidth: '250px' }}
            headerClassName="text-left"
            bodyClassName="text-left whitespace-normal break-words"
            body={(rowData) => rowData.journal?.title || '-'}
          />
          <Column field="articleType" header="Article Type" sortable headerClassName="text-left" bodyClassName="text-left" body={(rowData) => rowData.articleType || '-'} />
          <Column 
            field="title" 
            header="Manuscript Title" 
            style={{ minWidth: '300px' }}
            headerClassName="text-left"
            bodyClassName="text-left whitespace-normal break-words"
          />
          <Column header="Abstract" body={abstractBodyTemplate} />
          <Column 
            field="submittedAt" 
            header="Date" 
            sortable
            headerClassName="text-left"
            bodyClassName="text-left"
            body={(rowData) => formatDate(rowData.submittedAt)}
          />
        </DataTable>
      </div>

      {/* View Submission Dialog */}
      <Dialog
        header="Submission Details"
        visible={showDialog}
        className="w-[95vw] sm:w-[80vw] max-w-[900px]"
        onHide={() => setShowDialog(false)}
        footer={
          <Button label="Close" onClick={() => setShowDialog(false)} />
        }
      >
        {selectedSubmission && (
          <div className="flex flex-col gap-6">
            <div>
              <h3 className="mb-2 text-slate-800">Manuscript Title</h3>
              <p className="text-slate-500">{selectedSubmission.title}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <h4 className="mb-2 text-slate-800">Submitter Name</h4>
                <p className="text-slate-500">{selectedSubmission.submitterName || selectedSubmission.authors?.[0]?.name || '-'}</p>
              </div>
              <div>
                <h4 className="mb-2 text-slate-800">Email</h4>
                <p className="text-slate-500">{selectedSubmission.submitterEmail || selectedSubmission.authors?.[0]?.email || '-'}</p>
              </div>
              <div>
                <h4 className="mb-2 text-slate-800">Address</h4>
                <p className="text-slate-500">{selectedSubmission.submitterAddress || '-'}</p>
              </div>
              <div>
                <h4 className="mb-2 text-slate-800">Country</h4>
                <p className="text-slate-500">{selectedSubmission.submitterCountry || '-'}</p>
              </div>
              <div>
                <h4 className="mb-2 text-slate-800">Journal Name</h4>
                <p className="text-slate-500">{selectedSubmission.journal?.title || '-'}</p>
              </div>
              <div>
                <h4 className="mb-2 text-slate-800">Article Type</h4>
                <p className="text-slate-500">{selectedSubmission.articleType || '-'}</p>
              </div>
              <div>
                <h4 className="mb-2 text-slate-800">Submission Date</h4>
                <p className="text-slate-500">{formatDate(selectedSubmission.submittedAt)}</p>
              </div>
            </div>

            <div>
              <h4 className="mb-2 text-slate-800">Authors</h4>
              <div className="flex flex-col gap-2">
                {selectedSubmission.authors?.map((author, index) => (
                  <div key={author.id} className="p-2 bg-slate-50 rounded">
                    <strong>{author.name}</strong> - {author.email}
                    {author.affiliation && <div className="text-slate-500 text-sm">{author.affiliation}</div>}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="mb-2 text-slate-800">Abstract</h4>
              <p className="text-slate-500 whitespace-pre-wrap">{selectedSubmission.abstract}</p>
            </div>

            {selectedSubmission.keywords && (
              <div>
                <h4 className="mb-2 text-slate-800">Keywords</h4>
                <p className="text-slate-500">{selectedSubmission.keywords}</p>
              </div>
            )}

            {(selectedSubmission.pdfUrl || selectedSubmission.wordUrl) && (
              <div>
                <h4 className="mb-2 text-slate-800">Download Files</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedSubmission.pdfUrl && (
                    <Button
                      label="Download PDF"
                      icon="pi pi-file-pdf"
                      className="p-button-danger p-button-outlined"
                      onClick={() => handleDownload(
                        selectedSubmission.pdfUrl!,
                        `${selectedSubmission.title.replace(/[^a-z0-9]/gi, '_')}.pdf`
                      )}
                    />
                  )}
                  {selectedSubmission.wordUrl && (
                    <Button
                      label="Download Word Document"
                      icon="pi pi-file-word"
                      className="p-button-primary p-button-outlined"
                      onClick={() => handleDownload(
                        selectedSubmission.wordUrl!,
                        `${selectedSubmission.title.replace(/[^a-z0-9]/gi, '_')}.docx`
                      )}
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </Dialog>
    </div>
  );
}
