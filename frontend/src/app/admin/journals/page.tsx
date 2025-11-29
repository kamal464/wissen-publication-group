'use client';

import { useState, useEffect } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dropdown } from 'primereact/dropdown';
import { Toast } from 'primereact/toast';
import { useRef } from 'react';
import { TabView, TabPanel } from 'primereact/tabview';
import { FileUpload } from 'primereact/fileupload';
import Link from 'next/link';
import '@/styles/admin-global.scss';
import { adminAPI, journalAPI } from '@/lib/api';

interface Journal {
  id: number;
  title: string;
  description: string;
  issn: string;
  coverImage: string;
  publisher: string;
  accessType: string;
  subjectArea: string;
  category: string;
  discipline: string;
  impactFactor: string;
  aimsScope: string;
  guidelines: string;
  editorialBoard: string;
  homePageContent: string;
  currentIssueContent: string;
  archiveContent: string;
  articlesInPress: string;
  createdAt: string;
  updatedAt: string;
}

export default function JournalManagement() {
  const [journals, setJournals] = useState<Journal[]>([]);
  const [selectedJournal, setSelectedJournal] = useState<Journal | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const toast = useRef<Toast>(null);

  useEffect(() => {
    loadJournals();
  }, []);

  const loadJournals = async () => {
    try {
      // Fetch journals from API
      const response = await adminAPI.getJournals();
      setJournals(response.data as Journal[]);
    } catch (error) {
      console.error('Error loading journals:', error);
      
      // Fallback to mock data if API fails
      setJournals([
        {
          id: 1,
          title: "Journal of Advanced Research",
          description: "A multidisciplinary journal covering cutting-edge research in various fields",
          issn: "2090-1234",
          coverImage: "/images/journal1.jpg",
          publisher: "Wissen Publication Group",
          accessType: "Open Access",
          subjectArea: "Multidisciplinary",
          category: "Science",
          discipline: "Research",
          impactFactor: "2.5",
          aimsScope: "To publish high-quality research across multiple disciplines",
          guidelines: "Follow standard academic writing guidelines",
          editorialBoard: "Dr. John Smith (Editor-in-Chief), Dr. Jane Doe (Associate Editor)",
          homePageContent: "Welcome to the Journal of Advanced Research...",
          currentIssueContent: "Volume 15, Issue 3 - March 2024",
          archiveContent: "Browse our archive of previous issues...",
          articlesInPress: "Articles currently in press...",
          createdAt: "2024-01-01",
          updatedAt: "2024-01-15"
        },
        {
          id: 2,
          title: "International Journal of Engineering",
          description: "Engineering innovations and technological advances",
          issn: "2090-5678",
          coverImage: "/images/journal2.jpg",
          publisher: "Wissen Publication Group",
          accessType: "Subscription",
          subjectArea: "Engineering",
          category: "Engineering",
          discipline: "Technology",
          impactFactor: "2.1",
          aimsScope: "To advance engineering knowledge and practice",
          guidelines: "Engineering research guidelines",
          editorialBoard: "Dr. Mike Johnson (Editor-in-Chief)",
          homePageContent: "International Journal of Engineering homepage...",
          currentIssueContent: "Volume 12, Issue 2 - February 2024",
          archiveContent: "Engineering journal archive...",
          articlesInPress: "Engineering articles in press...",
          createdAt: "2024-01-15",
          updatedAt: "2024-02-01"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateJournal = () => {
    setSelectedJournal({
      id: 0,
      title: '',
      description: '',
      issn: '',
      coverImage: '',
      publisher: '',
      accessType: '',
      subjectArea: '',
      category: '',
      discipline: '',
      impactFactor: '',
      aimsScope: '',
      guidelines: '',
      editorialBoard: '',
      homePageContent: '',
      currentIssueContent: '',
      archiveContent: '',
      articlesInPress: '',
      createdAt: '',
      updatedAt: ''
    });
    setEditing(true);
    setShowDialog(true);
  };

  const handleEditJournal = (journal: Journal) => {
    setSelectedJournal(journal);
    setEditing(true);
    setShowDialog(true);
  };

  const handleViewJournal = (journal: Journal) => {
    setSelectedJournal(journal);
    setShowDetailsDialog(true);
  };

  const handleSaveJournal = async () => {
    if (selectedJournal) {
      try {
        if (editing && selectedJournal.id === 0) {
          // Create new journal
          const response = await adminAPI.createJournal(selectedJournal);
          setJournals([...journals, response.data as Journal]);
          toast.current?.show({ 
            severity: 'success', 
            summary: 'Success', 
            detail: 'Journal created successfully' 
          });
        } else {
          // Update existing journal
          const response = await adminAPI.updateJournal(selectedJournal.id, selectedJournal);
          setJournals(journals.map(j => 
            j.id === selectedJournal.id ? response.data as Journal : j
          ));
          toast.current?.show({ 
            severity: 'success', 
            summary: 'Success', 
            detail: 'Journal updated successfully' 
          });
        }
        setShowDialog(false);
      } catch (error) {
        console.error('Error saving journal:', error);
        toast.current?.show({ 
          severity: 'error', 
          summary: 'Error', 
          detail: 'Failed to save journal' 
        });
      }
    }
  };

  const handleDeleteJournal = async (journalId: number) => {
    if (confirm('Are you sure you want to delete this journal?')) {
      try {
        await adminAPI.deleteJournal(journalId);
        setJournals(journals.filter(j => j.id !== journalId));
        toast.current?.show({ 
          severity: 'success', 
          summary: 'Success', 
          detail: 'Journal deleted successfully' 
        });
      } catch (error) {
        console.error('Error deleting journal:', error);
        toast.current?.show({ 
          severity: 'error', 
          summary: 'Error', 
          detail: 'Failed to delete journal' 
        });
      }
    }
  };

  const categories = [
    'Science', 'Engineering', 'Medicine', 'Social Science', 'Arts', 'Business'
  ];

  const accessTypes = [
    'Open Access', 'Subscription', 'Hybrid', 'Free'
  ];

  const subjectAreas = [
    'Multidisciplinary', 'Computer Science', 'Medicine', 'Engineering', 
    'Social Sciences', 'Natural Sciences', 'Arts & Humanities'
  ];

  const stats = [
    { title: 'Total Journals', value: journals.length, icon: 'pi pi-book', color: 'primary' },
    { title: 'Active Journals', value: journals.length, icon: 'pi pi-check-circle', color: 'success' },
    { title: 'Open Access', value: journals.filter(j => j.accessType === 'Open Access').length, icon: 'pi pi-globe', color: 'info' },
    { title: 'This Month', value: 2, icon: 'pi pi-calendar', color: 'warning' }
  ];

  return (
    <div className="journal-management">
      <Toast ref={toast} />

      {/* Statistics Cards */}
      <div className="stats-grid mb-6">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card">
            <div className="stat-header">
              <div className={`stat-icon ${stat.color}`}>
                <i className={stat.icon}></i>
              </div>
            </div>
            <div className="stat-value">{stat.value}</div>
            <div className="stat-label">{stat.title}</div>
          </div>
        ))}
      </div>

      {/* Journals Table */}
      <div className="data-grid-container">
        <div className="grid-header">
          <div className="header-title">
            <i className="pi pi-book"></i>
            Journals Management
          </div>
          <div className="header-subtitle">
            Manage academic journals and their content
          </div>
          <div className="header-actions">
            <Button
              label="+ Add New Journal"
              icon="pi pi-plus"
              className="btn btn-primary btn-sm"
              onClick={handleCreateJournal}
            />
          </div>
        </div>
        <div className="grid-content">
        <DataTable
          value={journals}
          loading={loading}
          paginator
          rows={10}
          rowsPerPageOptions={[5, 10, 25]}
          className="p-datatable-sm"
        >
          <Column field="title" header="Title" sortable />
          <Column field="issn" header="ISSN" />
          <Column field="category" header="Category" />
          <Column field="accessType" header="Access Type" />
          <Column field="impactFactor" header="Impact Factor" />
          <Column field="createdAt" header="Created" />
          <Column
            header="Actions"
            body={(rowData) => (
              <div className="action-buttons">
                <button
                  className="action-btn btn-view"
                  data-tooltip="View Details"
                  onClick={() => handleViewJournal(rowData)}
                >
                  <i className="pi pi-eye"></i>
                </button>
                <button
                  className="action-btn btn-edit"
                  data-tooltip="Edit Journal"
                  onClick={() => handleEditJournal(rowData)}
                >
                  <i className="pi pi-pencil"></i>
                </button>
                <button
                  className="action-btn btn-delete"
                  data-tooltip="Delete Journal"
                  onClick={() => handleDeleteJournal(rowData.id)}
                >
                  <i className="pi pi-trash"></i>
                </button>
              </div>
            )}
          />
        </DataTable>
        </div>
      </div>

      {/* Add/Edit Journal Dialog */}
      <Dialog
        header={editing ? (selectedJournal?.id === 0 ? 'Add New Journal' : 'Edit Journal') : 'Journal Details'}
        visible={showDialog}
        style={{ width: '90vw', maxWidth: '1200px' }}
        onHide={() => setShowDialog(false)}
      >
        {selectedJournal && (
          <TabView>
            <TabPanel header="Basic Information">
              <div className="form-container">
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Title *</label>
                    <InputText
                      value={selectedJournal.title}
                      onChange={(e) => setSelectedJournal({...selectedJournal, title: e.target.value})}
                      className="form-input"
                      placeholder="Journal title"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">ISSN</label>
                    <InputText
                      value={selectedJournal.issn}
                      onChange={(e) => setSelectedJournal({...selectedJournal, issn: e.target.value})}
                      className="form-input"
                      placeholder="ISSN number"
                    />
                  </div>
                  <div className="form-group col-span-2">
                    <label className="form-label">Description</label>
                    <InputTextarea
                      value={selectedJournal.description}
                      onChange={(e) => setSelectedJournal({...selectedJournal, description: e.target.value})}
                      className="form-textarea"
                      placeholder="Journal description"
                      rows={3}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Publisher</label>
                    <InputText
                      value={selectedJournal.publisher}
                      onChange={(e) => setSelectedJournal({...selectedJournal, publisher: e.target.value})}
                      className="form-input"
                      placeholder="Publisher name"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Access Type</label>
                    <Dropdown
                      value={selectedJournal.accessType}
                      onChange={(e) => setSelectedJournal({...selectedJournal, accessType: e.value})}
                      options={accessTypes}
                      className="form-input"
                      placeholder="Select access type"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <Dropdown
                      value={selectedJournal.category}
                      onChange={(e) => setSelectedJournal({...selectedJournal, category: e.value})}
                      options={categories}
                      className="form-input"
                      placeholder="Select category"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Subject Area</label>
                    <Dropdown
                      value={selectedJournal.subjectArea}
                      onChange={(e) => setSelectedJournal({...selectedJournal, subjectArea: e.value})}
                      options={subjectAreas}
                      className="form-input"
                      placeholder="Select subject area"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Impact Factor</label>
                    <InputText
                      value={selectedJournal.impactFactor}
                      onChange={(e) => setSelectedJournal({...selectedJournal, impactFactor: e.target.value})}
                      className="form-input"
                      placeholder="Impact factor"
                    />
                  </div>
                </div>
              </div>
            </TabPanel>

            <TabPanel header="Content Management">
              <div className="form-container">
                <div className="form-group">
                  <label className="form-label">Cover Image</label>
                  <FileUpload
                    mode="basic"
                    name="coverImage"
                    accept="image/*"
                    maxFileSize={1000000}
                    chooseLabel="Upload Cover Image"
                    className="btn btn-outline"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Aims & Scope</label>
                  <InputTextarea
                    value={selectedJournal.aimsScope}
                    onChange={(e) => setSelectedJournal({...selectedJournal, aimsScope: e.target.value})}
                    className="form-textarea"
                    placeholder="Journal aims and scope"
                    rows={4}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Author Guidelines</label>
                  <InputTextarea
                    value={selectedJournal.guidelines}
                    onChange={(e) => setSelectedJournal({...selectedJournal, guidelines: e.target.value})}
                    className="form-textarea"
                    placeholder="Author submission guidelines"
                    rows={4}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Editorial Board</label>
                  <InputTextarea
                    value={selectedJournal.editorialBoard}
                    onChange={(e) => setSelectedJournal({...selectedJournal, editorialBoard: e.target.value})}
                    className="form-textarea"
                    placeholder="Editorial board members"
                    rows={3}
                  />
                </div>
              </div>
            </TabPanel>

            <TabPanel header="Journal Pages">
              <div className="form-container">
                <div className="form-group">
                  <label className="form-label">Journal Home Page Content</label>
                  <InputTextarea
                    value={selectedJournal.homePageContent}
                    onChange={(e) => setSelectedJournal({...selectedJournal, homePageContent: e.target.value})}
                    className="form-textarea"
                    placeholder="Home page content"
                    rows={4}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Current Issue Content</label>
                  <InputTextarea
                    value={selectedJournal.currentIssueContent}
                    onChange={(e) => setSelectedJournal({...selectedJournal, currentIssueContent: e.target.value})}
                    className="form-textarea"
                    placeholder="Current issue information"
                    rows={3}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Archive Page Content</label>
                  <InputTextarea
                    value={selectedJournal.archiveContent}
                    onChange={(e) => setSelectedJournal({...selectedJournal, archiveContent: e.target.value})}
                    className="form-textarea"
                    placeholder="Archive page content"
                    rows={3}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Articles in Press</label>
                  <InputTextarea
                    value={selectedJournal.articlesInPress}
                    onChange={(e) => setSelectedJournal({...selectedJournal, articlesInPress: e.target.value})}
                    className="form-textarea"
                    placeholder="Articles in press information"
                    rows={3}
                  />
                </div>
              </div>
            </TabPanel>
          </TabView>
        )}

        <div className="form-actions" style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', padding: '2rem', borderTop: '1px solid #e2e8f0', background: '#f8fafc' }}>
          <button
            className="btn btn-secondary"
            onClick={() => setShowDialog(false)}
          >
            <i className="pi pi-times mr-2"></i>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={editing ? handleSaveJournal : () => setShowDialog(false)}
          >
            <i className={`pi ${editing ? (selectedJournal?.id === 0 ? 'pi-plus' : 'pi-check') : 'pi-times'} mr-2`}></i>
            {editing ? (selectedJournal?.id === 0 ? 'Create Journal' : 'Update Journal') : 'Close'}
          </button>
        </div>
      </Dialog>

      {/* Journal Details Dialog */}
      <Dialog
        header={
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <i className="pi pi-book" style={{ color: '#3b82f6', fontSize: '1.5rem' }}></i>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1e293b' }}>
                {selectedJournal?.title || 'Journal Details'}
              </div>
              <div style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: '500' }}>
                {selectedJournal?.issn && `ISSN: ${selectedJournal.issn}`}
              </div>
            </div>
          </div>
        }
        visible={showDetailsDialog}
        style={{ width: '90vw', maxWidth: '1000px' }}
        onHide={() => setShowDetailsDialog(false)}
        className="journal-details-dialog"
      >
        {selectedJournal && (
          <div style={{ padding: '0' }}>
            <TabView>
              <TabPanel header="Overview">
                <div className="form-container">
                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">Title</label>
                      <div style={{ 
                        padding: '0.875rem 1rem', 
                        background: '#f8fafc', 
                        border: '2px solid #e2e8f0', 
                        borderRadius: '8px',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        color: '#1e293b'
                      }}>
                        {selectedJournal.title}
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">ISSN</label>
                      <div style={{ 
                        padding: '0.875rem 1rem', 
                        background: '#f8fafc', 
                        border: '2px solid #e2e8f0', 
                        borderRadius: '8px',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        color: '#1e293b'
                      }}>
                        {selectedJournal.issn || 'Not specified'}
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Category</label>
                      <div style={{ 
                        padding: '0.875rem 1rem', 
                        background: '#f8fafc', 
                        border: '2px solid #e2e8f0', 
                        borderRadius: '8px',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        color: '#1e293b'
                      }}>
                        {selectedJournal.category || 'Not specified'}
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Access Type</label>
                      <div style={{ 
                        padding: '0.875rem 1rem', 
                        background: '#f8fafc', 
                        border: '2px solid #e2e8f0', 
                        borderRadius: '8px',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        color: '#1e293b'
                      }}>
                        {selectedJournal.accessType || 'Not specified'}
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Impact Factor</label>
                      <div style={{ 
                        padding: '0.875rem 1rem', 
                        background: '#f8fafc', 
                        border: '2px solid #e2e8f0', 
                        borderRadius: '8px',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        color: '#1e293b'
                      }}>
                        {selectedJournal.impactFactor || 'Not specified'}
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Publisher</label>
                      <div style={{ 
                        padding: '0.875rem 1rem', 
                        background: '#f8fafc', 
                        border: '2px solid #e2e8f0', 
                        borderRadius: '8px',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        color: '#1e293b'
                      }}>
                        {selectedJournal.publisher || 'Not specified'}
                      </div>
                    </div>
                  </div>
                </div>
              </TabPanel>
              <TabPanel header="Statistics">
                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-header">
                      <div className="stat-icon primary">
                        <i className="pi pi-file-edit"></i>
                      </div>
                      <div className="stat-title">Total Articles</div>
                    </div>
                    <div className="stat-value">45</div>
                    <div className="stat-label">Published articles</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-header">
                      <div className="stat-icon success">
                        <i className="pi pi-calendar"></i>
                      </div>
                      <div className="stat-title">This Year</div>
                    </div>
                    <div className="stat-value">12</div>
                    <div className="stat-label">Published this year</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-header">
                      <div className="stat-icon warning">
                        <i className="pi pi-eye"></i>
                      </div>
                      <div className="stat-title">Under Review</div>
                    </div>
                    <div className="stat-value">8</div>
                    <div className="stat-label">Pending review</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-header">
                      <div className="stat-icon danger">
                        <i className="pi pi-times-circle"></i>
                      </div>
                      <div className="stat-title">Rejected</div>
                    </div>
                    <div className="stat-value">3</div>
                    <div className="stat-label">Rejected articles</div>
                  </div>
                </div>
              </TabPanel>
              <TabPanel header="Content">
                <div className="form-container">
                  <div className="form-group">
                    <label className="form-label">Aims & Scope</label>
                    <div style={{ 
                      padding: '1rem', 
                      background: '#f8fafc', 
                      border: '2px solid #e2e8f0', 
                      borderRadius: '8px',
                      fontSize: '0.875rem',
                      lineHeight: '1.6',
                      color: '#374151',
                      minHeight: '120px'
                    }}>
                      {selectedJournal.aimsScope || 'No aims and scope defined.'}
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Author Guidelines</label>
                    <div style={{ 
                      padding: '1rem', 
                      background: '#f8fafc', 
                      border: '2px solid #e2e8f0', 
                      borderRadius: '8px',
                      fontSize: '0.875rem',
                      lineHeight: '1.6',
                      color: '#374151',
                      minHeight: '120px'
                    }}>
                      {selectedJournal.guidelines || 'No author guidelines defined.'}
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Editorial Board</label>
                    <div style={{ 
                      padding: '1rem', 
                      background: '#f8fafc', 
                      border: '2px solid #e2e8f0', 
                      borderRadius: '8px',
                      fontSize: '0.875rem',
                      lineHeight: '1.6',
                      color: '#374151',
                      minHeight: '120px'
                    }}>
                      {selectedJournal.editorialBoard || 'No editorial board information available.'}
                    </div>
                  </div>
                </div>
              </TabPanel>
            </TabView>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', padding: '2rem', borderTop: '1px solid #e2e8f0', background: '#f8fafc' }}>
              <button
                className="btn btn-secondary"
                onClick={() => setShowDetailsDialog(false)}
              >
                <i className="pi pi-times mr-2"></i>
                Close
              </button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  setShowDetailsDialog(false);
                  handleEditJournal(selectedJournal);
                }}
              >
                <i className="pi pi-pencil mr-2"></i>
                Edit Journal
              </button>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}