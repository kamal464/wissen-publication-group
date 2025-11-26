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
import { FileUpload } from 'primereact/fileupload';

interface JournalHomePage {
  id: number;
  journalId: number;
  journalTitle: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string;
  aboutTitle: string;
  aboutContent: string;
  aboutImage: string;
  featuresTitle: string;
  featuresContent: string;
  callToActionTitle: string;
  callToActionContent: string;
  callToActionButton: string;
  callToActionLink: string;
  sidebarContent: string;
  footerContent: string;
  createdAt: string;
  updatedAt: string;
}

export default function JournalHomePageManagement() {
  const [homePages, setHomePages] = useState<JournalHomePage[]>([]);
  const [selectedHomePage, setSelectedHomePage] = useState<JournalHomePage | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const toast = useRef<Toast>(null);

  useEffect(() => {
    loadHomePages();
  }, []);

  const loadHomePages = async () => {
    try {
      // Mock data - in real app, fetch from API
      setHomePages([
        {
          id: 1,
          journalId: 1,
          journalTitle: "Journal of Advanced Research",
          heroTitle: "Journal of Advanced Research",
          heroSubtitle: "Publishing cutting-edge research across multiple disciplines",
          heroImage: "/images/hero-jar.jpg",
          aboutTitle: "About Our Journal",
          aboutContent: "The Journal of Advanced Research is a peer-reviewed, open-access journal that publishes high-quality research across various fields of study. We are committed to advancing knowledge and promoting scholarly excellence.",
          aboutImage: "/images/about-jar.jpg",
          featuresTitle: "Why Choose Our Journal",
          featuresContent: "Rigorous peer review process, fast publication turnaround, global reach and indexing, open access options available.",
          callToActionTitle: "Submit Your Research",
          callToActionContent: "Join thousands of researchers who trust our journal for their scholarly publications.",
          callToActionButton: "Submit Manuscript",
          callToActionLink: "/submit-manuscript",
          sidebarContent: "Latest articles, upcoming events, and journal statistics.",
          footerContent: "© 2024 Journal of Advanced Research. All rights reserved.",
          createdAt: "2024-01-01",
          updatedAt: "2024-01-15"
        },
        {
          id: 2,
          journalId: 2,
          journalTitle: "International Journal of Engineering",
          heroTitle: "International Journal of Engineering",
          heroSubtitle: "Advancing engineering knowledge and technological innovation",
          heroImage: "/images/hero-ije.jpg",
          aboutTitle: "About Our Journal",
          aboutContent: "The International Journal of Engineering is a leading publication in the field of engineering research and technological advancement.",
          aboutImage: "/images/about-ije.jpg",
          featuresTitle: "Engineering Excellence",
          featuresContent: "Cutting-edge research, expert peer review, rapid publication, global engineering community.",
          callToActionTitle: "Publish Your Work",
          callToActionContent: "Share your engineering innovations with the global research community.",
          callToActionButton: "Submit Article",
          callToActionLink: "/submit-article",
          sidebarContent: "Engineering news, research highlights, and industry updates.",
          footerContent: "© 2024 International Journal of Engineering. All rights reserved.",
          createdAt: "2024-01-15",
          updatedAt: "2024-02-01"
        }
      ]);
    } catch (error) {
      console.error('Error loading home pages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateHomePage = () => {
    setSelectedHomePage({
      id: 0,
      journalId: 0,
      journalTitle: '',
      heroTitle: '',
      heroSubtitle: '',
      heroImage: '',
      aboutTitle: '',
      aboutContent: '',
      aboutImage: '',
      featuresTitle: '',
      featuresContent: '',
      callToActionTitle: '',
      callToActionContent: '',
      callToActionButton: '',
      callToActionLink: '',
      sidebarContent: '',
      footerContent: '',
      createdAt: '',
      updatedAt: ''
    });
    setEditing(true);
    setShowDialog(true);
  };

  const handleEditHomePage = (homePage: JournalHomePage) => {
    setSelectedHomePage(homePage);
    setEditing(true);
    setShowDialog(true);
  };

  const handleSaveHomePage = () => {
    if (selectedHomePage) {
      if (editing && selectedHomePage.id === 0) {
        // Create new home page
        const newHomePage = {
          ...selectedHomePage,
          id: homePages.length + 1,
          createdAt: new Date().toISOString().split('T')[0],
          updatedAt: new Date().toISOString().split('T')[0]
        };
        setHomePages([...homePages, newHomePage]);
        toast.current?.show({ 
          severity: 'success', 
          summary: 'Success', 
          detail: 'Home page created successfully' 
        });
      } else {
        // Update existing home page
        setHomePages(homePages.map(h => 
          h.id === selectedHomePage.id 
            ? { ...selectedHomePage, updatedAt: new Date().toISOString().split('T')[0] }
            : h
        ));
        toast.current?.show({ 
          severity: 'success', 
          summary: 'Success', 
          detail: 'Home page updated successfully' 
        });
      }
      setShowDialog(false);
    }
  };

  const handleDeleteHomePage = (homePageId: number) => {
    if (confirm('Are you sure you want to delete this home page?')) {
      setHomePages(homePages.filter(h => h.id !== homePageId));
      toast.current?.show({ 
        severity: 'success', 
        summary: 'Success', 
        detail: 'Home page deleted successfully' 
      });
    }
  };

  const handlePreviewHomePage = (homePage: JournalHomePage) => {
    // In a real app, this would open a preview window or navigate to preview page
    window.open(`/preview/journal/${homePage.journalId}`, '_blank');
  };

  const stats = [
    { title: 'Total Home Pages', value: homePages.length, icon: 'pi pi-globe', color: 'primary' },
    { title: 'Published', value: homePages.length, icon: 'pi pi-check-circle', color: 'success' },
    { title: 'With Images', value: homePages.filter(h => h.heroImage).length, icon: 'pi pi-image', color: 'info' },
    { title: 'This Month', value: 1, icon: 'pi pi-calendar', color: 'warning' }
  ];

  return (
    <div className="journal-home-page-management">
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

      {/* Home Pages Table */}
      <div className="data-table-container">
        <div className="table-header">
          <h3 className="table-title">Journal Home Pages</h3>
          <div className="table-actions">
            <Button
              label="Add Home Page"
              icon="pi pi-plus"
              className="btn btn-primary"
              onClick={handleCreateHomePage}
            />
          </div>
        </div>
        <DataTable
          value={homePages}
          loading={loading}
          paginator
          rows={10}
          rowsPerPageOptions={[5, 10, 25]}
          className="p-datatable-sm"
        >
          <Column field="journalTitle" header="Journal" sortable />
          <Column field="heroTitle" header="Hero Title" />
          <Column field="aboutTitle" header="About Title" />
          <Column field="createdAt" header="Created" />
          <Column
            header="Actions"
            body={(rowData) => (
              <div className="flex gap-2">
                <Button
                  icon="pi pi-eye"
                  size="small"
                  className="btn btn-outline btn-sm"
                  tooltip="Preview"
                  onClick={() => handlePreviewHomePage(rowData)}
                />
                <Button
                  icon="pi pi-pencil"
                  size="small"
                  className="btn btn-outline btn-sm"
                  tooltip="Edit"
                  onClick={() => handleEditHomePage(rowData)}
                />
                <Button
                  icon="pi pi-trash"
                  size="small"
                  className="btn btn-danger btn-sm"
                  tooltip="Delete"
                  onClick={() => handleDeleteHomePage(rowData.id)}
                />
              </div>
            )}
          />
        </DataTable>
      </div>

      {/* Add/Edit Home Page Dialog */}
      <Dialog
        header={editing ? (selectedHomePage?.id === 0 ? 'Add Home Page' : 'Edit Home Page') : 'Home Page Details'}
        visible={showDialog}
        style={{ width: '95vw', maxWidth: '1400px' }}
        onHide={() => setShowDialog(false)}
      >
        {selectedHomePage && (
          <TabView>
            <TabPanel header="Hero Section">
              <div className="form-container">
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Journal *</label>
                    <Dropdown
                      value={selectedHomePage.journalTitle}
                      onChange={(e) => setSelectedHomePage({...selectedHomePage, journalTitle: e.value})}
                      options={['Journal of Advanced Research', 'International Journal of Engineering']}
                      className="form-input"
                      placeholder="Select journal"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Hero Image</label>
                    <FileUpload
                      mode="basic"
                      name="heroImage"
                      accept="image/*"
                      maxFileSize={2000000}
                      chooseLabel="Upload Hero Image"
                      className="btn btn-outline"
                    />
                  </div>
                  <div className="form-group col-span-2">
                    <label className="form-label">Hero Title *</label>
                    <InputText
                      value={selectedHomePage.heroTitle}
                      onChange={(e) => setSelectedHomePage({...selectedHomePage, heroTitle: e.target.value})}
                      className="form-input"
                      placeholder="Main hero title"
                    />
                  </div>
                  <div className="form-group col-span-2">
                    <label className="form-label">Hero Subtitle *</label>
                    <InputTextarea
                      value={selectedHomePage.heroSubtitle}
                      onChange={(e) => setSelectedHomePage({...selectedHomePage, heroSubtitle: e.target.value})}
                      className="form-textarea"
                      placeholder="Hero subtitle or description"
                      rows={2}
                    />
                  </div>
                </div>
              </div>
            </TabPanel>

            <TabPanel header="About Section">
              <div className="form-container">
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">About Image</label>
                    <FileUpload
                      mode="basic"
                      name="aboutImage"
                      accept="image/*"
                      maxFileSize={2000000}
                      chooseLabel="Upload About Image"
                      className="btn btn-outline"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">About Title *</label>
                    <InputText
                      value={selectedHomePage.aboutTitle}
                      onChange={(e) => setSelectedHomePage({...selectedHomePage, aboutTitle: e.target.value})}
                      className="form-input"
                      placeholder="About section title"
                    />
                  </div>
                  <div className="form-group col-span-2">
                    <label className="form-label">About Content *</label>
                    <InputTextarea
                      value={selectedHomePage.aboutContent}
                      onChange={(e) => setSelectedHomePage({...selectedHomePage, aboutContent: e.target.value})}
                      className="form-textarea"
                      placeholder="About section content"
                      rows={4}
                    />
                  </div>
                </div>
              </div>
            </TabPanel>

            <TabPanel header="Features Section">
              <div className="form-container">
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Features Title *</label>
                    <InputText
                      value={selectedHomePage.featuresTitle}
                      onChange={(e) => setSelectedHomePage({...selectedHomePage, featuresTitle: e.target.value})}
                      className="form-input"
                      placeholder="Features section title"
                    />
                  </div>
                  <div className="form-group col-span-2">
                    <label className="form-label">Features Content *</label>
                    <InputTextarea
                      value={selectedHomePage.featuresContent}
                      onChange={(e) => setSelectedHomePage({...selectedHomePage, featuresContent: e.target.value})}
                      className="form-textarea"
                      placeholder="Features section content (comma-separated)"
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            </TabPanel>

            <TabPanel header="Call to Action">
              <div className="form-container">
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">CTA Title *</label>
                    <InputText
                      value={selectedHomePage.callToActionTitle}
                      onChange={(e) => setSelectedHomePage({...selectedHomePage, callToActionTitle: e.target.value})}
                      className="form-input"
                      placeholder="Call to action title"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">CTA Button Text *</label>
                    <InputText
                      value={selectedHomePage.callToActionButton}
                      onChange={(e) => setSelectedHomePage({...selectedHomePage, callToActionButton: e.target.value})}
                      className="form-input"
                      placeholder="Button text"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">CTA Link *</label>
                    <InputText
                      value={selectedHomePage.callToActionLink}
                      onChange={(e) => setSelectedHomePage({...selectedHomePage, callToActionLink: e.target.value})}
                      className="form-input"
                      placeholder="/submit-manuscript"
                    />
                  </div>
                  <div className="form-group col-span-2">
                    <label className="form-label">CTA Content *</label>
                    <InputTextarea
                      value={selectedHomePage.callToActionContent}
                      onChange={(e) => setSelectedHomePage({...selectedHomePage, callToActionContent: e.target.value})}
                      className="form-textarea"
                      placeholder="Call to action content"
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            </TabPanel>

            <TabPanel header="Sidebar & Footer">
              <div className="form-container">
                <div className="form-grid">
                  <div className="form-group col-span-2">
                    <label className="form-label">Sidebar Content</label>
                    <InputTextarea
                      value={selectedHomePage.sidebarContent}
                      onChange={(e) => setSelectedHomePage({...selectedHomePage, sidebarContent: e.target.value})}
                      className="form-textarea"
                      placeholder="Sidebar content (HTML allowed)"
                      rows={4}
                    />
                  </div>
                  <div className="form-group col-span-2">
                    <label className="form-label">Footer Content</label>
                    <InputTextarea
                      value={selectedHomePage.footerContent}
                      onChange={(e) => setSelectedHomePage({...selectedHomePage, footerContent: e.target.value})}
                      className="form-textarea"
                      placeholder="Footer content (HTML allowed)"
                      rows={3}
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
            label={editing ? (selectedHomePage?.id === 0 ? 'Create Home Page' : 'Update Home Page') : 'Close'}
            className="btn btn-primary"
            onClick={editing ? handleSaveHomePage : () => setShowDialog(false)}
          />
        </div>
      </Dialog>
    </div>
  );
}
