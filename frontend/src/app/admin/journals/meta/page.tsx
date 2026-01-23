'use client';

import { useState, useEffect } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dropdown } from 'primereact/dropdown';
import { Toast } from 'primereact/toast';
import { useRef } from 'react';
import { TabView, TabPanel } from 'primereact/tabview';

interface JournalMeta {
  id: number;
  journalId: number;
  journalTitle: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  doiPrefix: string;
  publisher: string;
  language: string;
  country: string;
  frequency: string;
  peerReview: string;
  indexing: string;
  copyright: string;
  license: string;
  createdAt: string;
  updatedAt: string;
}

export default function JournalMetaManagement() {
  const [metaData, setMetaData] = useState<JournalMeta[]>([]);
  const [selectedMeta, setSelectedMeta] = useState<JournalMeta | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const toast = useRef<Toast>(null);

  useEffect(() => {
    loadMetaData();
  }, []);

  const loadMetaData = async () => {
    try {
      // Mock data - in real app, fetch from API
      setMetaData([
        {
          id: 1,
          journalId: 1,
          journalTitle: "Journal of Advanced Research",
          metaTitle: "Journal of Advanced Research - Multidisciplinary Academic Journal",
          metaDescription: "A peer-reviewed multidisciplinary journal publishing cutting-edge research across various fields of study.",
          keywords: "research, academic, multidisciplinary, peer-reviewed, journal",
          doiPrefix: "10.1234/jar",
          publisher: "Wissen Publication Group",
          language: "English",
          country: "United States",
          frequency: "Quarterly",
          peerReview: "Double-blind",
          indexing: "Scopus, Web of Science, PubMed",
          copyright: "© 2026 Wissen Publication Group",
          license: "CC BY 4.0",
          createdAt: "2024-01-01",
          updatedAt: "2024-01-15"
        },
        {
          id: 2,
          journalId: 2,
          journalTitle: "International Journal of Engineering",
          metaTitle: "International Journal of Engineering - Engineering Research Journal",
          metaDescription: "A leading engineering journal publishing innovative research and technological advances.",
          keywords: "engineering, technology, innovation, research, journal",
          doiPrefix: "10.1234/ije",
          publisher: "Wissen Publication Group",
          language: "English",
          country: "United States",
          frequency: "Bi-monthly",
          peerReview: "Single-blind",
          indexing: "Scopus, Web of Science, IEEE Xplore",
          copyright: "© 2026 Wissen Publication Group",
          license: "CC BY 4.0",
          createdAt: "2024-01-15",
          updatedAt: "2024-02-01"
        }
      ]);
    } catch (error) {
      console.error('Error loading meta data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMeta = () => {
    setSelectedMeta({
      id: 0,
      journalId: 0,
      journalTitle: '',
      metaTitle: '',
      metaDescription: '',
      keywords: '',
      doiPrefix: '',
      publisher: '',
      language: '',
      country: '',
      frequency: '',
      peerReview: '',
      indexing: '',
      copyright: '',
      license: '',
      createdAt: '',
      updatedAt: ''
    });
    setEditing(true);
    setShowDialog(true);
  };

  const handleEditMeta = (meta: JournalMeta) => {
    setSelectedMeta(meta);
    setEditing(true);
    setShowDialog(true);
  };

  const handleSaveMeta = () => {
    if (selectedMeta) {
      if (editing && selectedMeta.id === 0) {
        // Create new meta
        const newMeta = {
          ...selectedMeta,
          id: metaData.length + 1,
          createdAt: new Date().toISOString().split('T')[0],
          updatedAt: new Date().toISOString().split('T')[0]
        };
        setMetaData([...metaData, newMeta]);
        toast.current?.show({ 
          severity: 'success', 
          summary: 'Success', 
          detail: 'Meta information created successfully' 
        });
      } else {
        // Update existing meta
        setMetaData(metaData.map(m => 
          m.id === selectedMeta.id 
            ? { ...selectedMeta, updatedAt: new Date().toISOString().split('T')[0] }
            : m
        ));
        toast.current?.show({ 
          severity: 'success', 
          summary: 'Success', 
          detail: 'Meta information updated successfully' 
        });
      }
      setShowDialog(false);
    }
  };

  const handleDeleteMeta = (metaId: number) => {
    if (confirm('Are you sure you want to delete this meta information?')) {
      setMetaData(metaData.filter(m => m.id !== metaId));
      toast.current?.show({ 
        severity: 'success', 
        summary: 'Success', 
        detail: 'Meta information deleted successfully' 
      });
    }
  };

  const languages = ['English', 'Spanish', 'French', 'German', 'Chinese', 'Japanese'];
  const countries = ['United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'France'];
  const frequencies = ['Monthly', 'Bi-monthly', 'Quarterly', 'Semi-annually', 'Annually'];
  const peerReviewTypes = ['Double-blind', 'Single-blind', 'Open review', 'No review'];
  const licenses = ['CC BY 4.0', 'CC BY-NC 4.0', 'CC BY-SA 4.0', 'All Rights Reserved'];

  const stats = [
    { title: 'Total Meta Records', value: metaData.length, icon: 'pi pi-tags', color: 'primary' },
    { title: 'English Journals', value: metaData.filter(m => m.language === 'English').length, icon: 'pi pi-globe', color: 'success' },
    { title: 'Open Access', value: metaData.filter(m => m.license.includes('CC BY')).length, icon: 'pi pi-unlock', color: 'info' },
    { title: 'Indexed Journals', value: metaData.filter(m => m.indexing).length, icon: 'pi pi-search', color: 'warning' }
  ];

  return (
    <div className="journal-meta-management">
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

      {/* Meta Data Table */}
      <div className="data-table-container">
        <div className="table-header">
          <h3 className="table-title">Journal Meta Information</h3>
          <div className="table-actions">
            <Button
              label="Add Meta Information"
              icon="pi pi-plus"
              className="btn btn-primary"
              onClick={handleCreateMeta}
            />
          </div>
        </div>
        <DataTable
          value={metaData}
          loading={loading}
          paginator
          rows={10}
          rowsPerPageOptions={[5, 10, 25]}
          className="p-datatable-sm"
        >
          <Column field="journalTitle" header="Journal" sortable />
          <Column field="metaTitle" header="Meta Title" />
          <Column field="language" header="Language" />
          <Column field="frequency" header="Frequency" />
          <Column field="peerReview" header="Peer Review" />
          <Column field="createdAt" header="Created" />
          <Column
            header="Actions"
            body={(rowData) => (
              <div className="flex gap-2">
                <Button
                  icon="pi pi-pencil"
                  size="small"
                  className="btn btn-outline btn-sm"
                  tooltip="Edit"
                  onClick={() => handleEditMeta(rowData)}
                />
                <Button
                  icon="pi pi-trash"
                  size="small"
                  className="btn btn-danger btn-sm"
                  tooltip="Delete"
                  onClick={() => handleDeleteMeta(rowData.id)}
                />
              </div>
            )}
          />
        </DataTable>
      </div>

      {/* Add/Edit Meta Dialog */}
      <Dialog
        header={editing ? (selectedMeta?.id === 0 ? 'Add Meta Information' : 'Edit Meta Information') : 'Meta Information Details'}
        visible={showDialog}
        style={{ width: '90vw', maxWidth: '1000px' }}
        onHide={() => setShowDialog(false)}
      >
        {selectedMeta && (
          <TabView>
            <TabPanel header="Basic Meta">
              <div className="form-container">
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Journal *</label>
                    <Dropdown
                      value={selectedMeta.journalTitle}
                      onChange={(e) => setSelectedMeta({...selectedMeta, journalTitle: e.value})}
                      options={['Journal of Advanced Research', 'International Journal of Engineering']}
                      className="form-input"
                      placeholder="Select journal"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Meta Title *</label>
                    <InputText
                      value={selectedMeta.metaTitle}
                      onChange={(e) => setSelectedMeta({...selectedMeta, metaTitle: e.target.value})}
                      className="form-input"
                      placeholder="SEO meta title"
                    />
                  </div>
                  <div className="form-group col-span-2">
                    <label className="form-label">Meta Description *</label>
                    <InputTextarea
                      value={selectedMeta.metaDescription}
                      onChange={(e) => setSelectedMeta({...selectedMeta, metaDescription: e.target.value})}
                      className="form-textarea"
                      placeholder="SEO meta description"
                      rows={3}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Keywords</label>
                    <InputText
                      value={selectedMeta.keywords}
                      onChange={(e) => setSelectedMeta({...selectedMeta, keywords: e.target.value})}
                      className="form-input"
                      placeholder="Comma-separated keywords"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">DOI Prefix</label>
                    <InputText
                      value={selectedMeta.doiPrefix}
                      onChange={(e) => setSelectedMeta({...selectedMeta, doiPrefix: e.target.value})}
                      className="form-input"
                      placeholder="10.1234/journal"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Publisher</label>
                    <InputText
                      value={selectedMeta.publisher}
                      onChange={(e) => setSelectedMeta({...selectedMeta, publisher: e.target.value})}
                      className="form-input"
                      placeholder="Publisher name"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Language</label>
                    <Dropdown
                      value={selectedMeta.language}
                      onChange={(e) => setSelectedMeta({...selectedMeta, language: e.value})}
                      options={languages}
                      className="form-input"
                      placeholder="Select language"
                    />
                  </div>
                </div>
              </div>
            </TabPanel>

            <TabPanel header="Publication Details">
              <div className="form-container">
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Country</label>
                    <Dropdown
                      value={selectedMeta.country}
                      onChange={(e) => setSelectedMeta({...selectedMeta, country: e.value})}
                      options={countries}
                      className="form-input"
                      placeholder="Select country"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Publication Frequency</label>
                    <Dropdown
                      value={selectedMeta.frequency}
                      onChange={(e) => setSelectedMeta({...selectedMeta, frequency: e.value})}
                      options={frequencies}
                      className="form-input"
                      placeholder="Select frequency"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Peer Review Type</label>
                    <Dropdown
                      value={selectedMeta.peerReview}
                      onChange={(e) => setSelectedMeta({...selectedMeta, peerReview: e.value})}
                      options={peerReviewTypes}
                      className="form-input"
                      placeholder="Select peer review type"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Indexing Databases</label>
                    <InputText
                      value={selectedMeta.indexing}
                      onChange={(e) => setSelectedMeta({...selectedMeta, indexing: e.target.value})}
                      className="form-input"
                      placeholder="Scopus, Web of Science, etc."
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Copyright Notice</label>
                    <InputText
                      value={selectedMeta.copyright}
                      onChange={(e) => setSelectedMeta({...selectedMeta, copyright: e.target.value})}
                      className="form-input"
                      placeholder="© 2026 Publisher"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">License</label>
                    <Dropdown
                      value={selectedMeta.license}
                      onChange={(e) => setSelectedMeta({...selectedMeta, license: e.value})}
                      options={licenses}
                      className="form-input"
                      placeholder="Select license"
                    />
                  </div>
                </div>
              </div>
            </TabPanel>
          </TabView>
        )}

        <div className="form-actions">
          <Button
            label="Cancel"
            className="btn btn-outline"
            onClick={() => setShowDialog(false)}
          />
          <Button
            label={editing ? (selectedMeta?.id === 0 ? 'Create Meta' : 'Update Meta') : 'Close'}
            className="btn btn-primary"
            onClick={editing ? handleSaveMeta : () => setShowDialog(false)}
          />
        </div>
      </Dialog>
    </div>
  );
}
