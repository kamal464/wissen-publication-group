'use client';

import { useState, useRef, useEffect } from 'react';
import { FileUpload, FileUploadSelectEvent, FileUploadHeaderTemplateOptions } from 'primereact/fileupload';
import { Toast } from 'primereact/toast';
import { ProgressBar } from 'primereact/progressbar';
import { Tooltip } from 'primereact/tooltip';
import { Tag } from 'primereact/tag';
import { Dropdown } from 'primereact/dropdown';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Chip } from 'primereact/chip';
import { Divider } from 'primereact/divider';
import { articleService } from '@/services/api';
import { getApiUrl } from '@/lib/apiConfig';
import 'primereact/resources/primereact.min.css';
import 'primereact/resources/themes/lara-light-blue/theme.css';

interface Author {
  name: string;
  email: string;
  affiliation: string;
  phone: string;
}

interface Journal {
  id: number;
  title: string;
  description: string;
  issn: string;
}

export default function SubmitManuscriptPage() {
  const toast = useRef<Toast>(null);
  const fileUploadRef = useRef<FileUpload>(null);
  
  // Prevent hydration mismatch by only rendering form after client-side mount
  const [mounted, setMounted] = useState(false);
  
  const [form, setForm] = useState({
    title: '',
    journalId: null as number | null,
    abstract: '',
    keywords: '',
    pdf: null as File | null,
  });
  
  const [authors, setAuthors] = useState<Author[]>([
    { name: '', email: '', affiliation: '', phone: '' }
  ]);
  
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [journals, setJournals] = useState<{ label: string; value: number }[]>([]);
  const [loadingJournals, setLoadingJournals] = useState(true);
  
  // Set mounted to true after component mounts on client
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fix dropdown panel positioning on mobile
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleDropdownOpen = () => {
      const dropdownPanels = document.querySelectorAll('.p-dropdown-panel');
      dropdownPanels.forEach((panel) => {
        const htmlPanel = panel as HTMLElement;
        if (window.innerWidth <= 640) {
          htmlPanel.style.left = '1rem';
          htmlPanel.style.right = '1rem';
          htmlPanel.style.width = 'calc(100vw - 2rem)';
          htmlPanel.style.maxWidth = 'calc(100vw - 2rem)';
        }
      });
    };

    // Use MutationObserver to watch for dropdown panel creation
    const observer = new MutationObserver(handleDropdownOpen);
    observer.observe(document.body, { childList: true, subtree: true });

    // Also listen for click events on dropdown triggers
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target.closest('.p-dropdown-trigger')) {
        setTimeout(handleDropdownOpen, 100);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  // Fetch journals from API
  useEffect(() => {
    const fetchJournals = async () => {
      try {
        const apiUrl = getApiUrl('/journals');
        const response = await fetch(apiUrl);
        const data: Journal[] = await response.json();
        const journalOptions = data.map(journal => ({
          label: journal.title,
          value: journal.id
        }));
        setJournals(journalOptions);
      } catch (error) {
        console.error('Error fetching journals:', error);
        toast.current?.show({ 
          severity: 'error', 
          summary: 'Error', 
          detail: 'Failed to load journals. Please refresh the page.',
          life: 5000 
        });
      } finally {
        setLoadingJournals(false);
      }
    };

    fetchJournals();
  }, []);

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAuthorChange = (index: number, field: keyof Author, value: string) => {
    const newAuthors = [...authors];
    newAuthors[index][field] = value;
    setAuthors(newAuthors);
  };

  const addAuthor = () => {
    setAuthors([...authors, { name: '', email: '', affiliation: '', phone: '' }]);
  };

  const removeAuthor = (index: number) => {
    if (authors.length > 1) {
      setAuthors(authors.filter((_, i) => i !== index));
    }
  };

  const handleFileSelect = (e: FileUploadSelectEvent) => {
    if (e.files && e.files.length > 0) {
      setForm({ ...form, pdf: e.files[0] });
      toast.current?.show({ 
        severity: 'info', 
        summary: 'File Selected', 
        detail: `${e.files[0].name} (${(e.files[0].size / 1024 / 1024).toFixed(2)} MB)`,
        life: 3000 
      });
    }
  };

  const handleFileRemove = () => {
    setForm({ ...form, pdf: null });
    fileUploadRef.current?.clear();
  };

  const getFileIcon = (file: File) => {
    if (file.type === 'application/pdf') return 'pi pi-file-pdf';
    if (file.type === 'application/msword' || 
        file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      return 'pi pi-file-word';
    }
    if (file.type === 'image/png' || file.type === 'image/jpeg' || file.type === 'image/jpg') {
      return 'pi pi-image';
    }
    return 'pi pi-file';
  };

  const validateForm = (): boolean => {
    if (!form.title.trim()) {
      toast.current?.show({ severity: 'warn', summary: 'Validation Error', detail: 'Title is required', life: 3000 });
      return false;
    }
    if (!form.journalId) {
      toast.current?.show({ severity: 'warn', summary: 'Validation Error', detail: 'Please select a journal', life: 3000 });
      return false;
    }
    if (!form.abstract.trim() || form.abstract.length < 100) {
      toast.current?.show({ severity: 'warn', summary: 'Validation Error', detail: 'Abstract must be at least 100 characters', life: 3000 });
      return false;
    }
    if (authors.some(a => !a.name.trim() || !a.email.trim())) {
      toast.current?.show({ severity: 'warn', summary: 'Validation Error', detail: 'All authors must have name and email', life: 3000 });
      return false;
    }
    // Validate phone number format only if provided (phone is optional)
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    if (authors.some(a => a.phone.trim() && !phoneRegex.test(a.phone.trim()))) {
      toast.current?.show({ severity: 'warn', summary: 'Validation Error', detail: 'Please enter a valid phone number or leave blank', life: 3000 });
      return false;
    }
    if (!form.pdf) {
      toast.current?.show({ severity: 'warn', summary: 'Validation Error', detail: 'Please upload a file (PDF, Word, PNG, or JPEG)', life: 3000 });
      return false;
    }
    
    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/png',
      'image/jpeg',
      'image/jpg'
    ];
    if (!allowedTypes.includes(form.pdf.type)) {
      toast.current?.show({ 
        severity: 'error', 
        summary: 'Invalid File Type', 
        detail: 'Only PDF, Word (.doc, .docx), PNG, and JPEG files are allowed', 
        life: 5000 
      });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setSubmitting(true);
    setUploadProgress(0);
    
    try {
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('journalId', form.journalId?.toString() || '');
      formData.append('abstract', form.abstract);
      formData.append('keywords', form.keywords);
      formData.append('authors', JSON.stringify(authors));
      
      if (form.pdf) {
        formData.append('pdf', form.pdf);
      }

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await articleService.submitManuscript(formData);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Extract response data
      const manuscriptData: any = response.data;
      const manuscriptId = manuscriptData?.manuscriptId || manuscriptData?.article?.id || '0';
      const journalName = manuscriptData?.article?.journal?.title || 'Selected Journal';
      
      // Show brief success toast
      toast.current?.show({ 
        severity: 'success', 
        summary: 'Manuscript Submitted!', 
        detail: 'Redirecting to confirmation page...',
        life: 2000 
      });
      
      // Redirect to success page with manuscript details
      setTimeout(() => {
        const params = new URLSearchParams({
          id: manuscriptId?.toString() || '',
          title: encodeURIComponent(form.title),
          journal: encodeURIComponent(journalName),
          authors: authors.length.toString(),
        });
        window.location.href = `/submission-success?${params.toString()}`;
      }, 2000);
      
    } catch (err: any) {
      setUploadProgress(0);
      console.error('Submission error:', err);
      toast.current?.show({ 
        severity: 'error', 
        summary: 'Submission Failed', 
        detail: err.response?.data?.message || 'An error occurred while submitting your manuscript. Please try again.',
        life: 5000 
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Prevent hydration mismatch - only render form after client-side mount
  if (!mounted) {
    return (
      <>
        <Header />
        <main className="submit-manuscript-page">
          <div className="container">
            <Toast ref={toast} />
            <div className="page-header">
              <h1 className="page-title">Submit Your Manuscript</h1>
              <p className="page-description">
                Share your research with the global academic community. Fill out the form below to submit your manuscript for peer review.
              </p>
            </div>
            <div className="flex items-center justify-center py-12">
              <i className="pi pi-spin pi-spinner text-4xl text-blue-600"></i>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="submit-manuscript-page">
        <div className="container">
          <Toast ref={toast} />
          
          {/* Page Header */}
          <div className="page-header">
            <h1 className="page-title">Submit Your Manuscript</h1>
            <p className="page-description">
              Share your research with the global academic community. Fill out the form below to submit your manuscript for peer review.
            </p>
          </div>

          <div className="manuscript-form-wrapper">
            <form className="manuscript-form" onSubmit={handleSubmit} suppressHydrationWarning>
              
              {/* Manuscript Details Section */}
              <div className="form-section">
                <h2 className="section-title">
                  <i className="pi pi-file-edit"></i>
                  Manuscript Details
                </h2>
                
                <div className="form-row">
                  <div className="form-group full-width">
                    <label htmlFor="title" className="form-label required">
                      Manuscript Title
                    </label>
                    <InputText 
                      id="title" 
                      name="title" 
                      value={form.title} 
                      onChange={handleChange} 
                      placeholder="Enter the full title of your manuscript"
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group full-width">
                    <label htmlFor="journalId" className="form-label required">
                      Select Journal
                    </label>
                    <Dropdown
                      id="journalId"
                      value={form.journalId}
                      options={journals}
                      onChange={(e) => setForm({ ...form, journalId: e.value })}
                      placeholder={loadingJournals ? "Loading journals..." : "Choose the most appropriate journal"}
                      className="w-full journal-dropdown"
                      disabled={loadingJournals}
                      loading={loadingJournals}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group full-width">
                    <label htmlFor="abstract" className="form-label required">
                      Abstract
                    </label>
                    <InputTextarea 
                      id="abstract" 
                      name="abstract" 
                      value={form.abstract} 
                      onChange={handleChange} 
                      rows={8}
                      placeholder="Provide a concise summary of your research, including objectives, methods, results, and conclusions..."
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group full-width">
                    <label htmlFor="keywords" className="form-label">
                      Keywords
                      <span className="help-text">(Separate with commas)</span>
                    </label>
                    <InputText 
                      id="keywords" 
                      name="keywords" 
                      value={form.keywords} 
                      onChange={handleChange} 
                      placeholder="e.g., machine learning, data analysis, neural networks"
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Authors Section */}
              <div className="form-section">
                <h2 className="section-title">
                  <i className="pi pi-users"></i>
                  Author Information
                </h2>
                
                {authors.map((author, index) => (
                  <div key={index} className="author-group">
                    <div className="author-header">
                      <h3 className="author-title">Author {index + 1}</h3>
                      {authors.length > 1 && (
                        <Button
                          type="button"
                          icon="pi pi-trash"
                          className="p-button-text p-button-danger p-button-sm"
                          onClick={() => removeAuthor(index)}
                          tooltip="Remove author"
                        />
                      )}
                    </div>
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor={`author-name-${index}`} className="form-label required">
                          Full Name
                        </label>
                        <InputText
                          id={`author-name-${index}`}
                          value={author.name}
                          onChange={(e) => handleAuthorChange(index, 'name', e.target.value)}
                          placeholder="e.g., Dr. John Smith"
                          className="w-full"
                        />
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor={`author-email-${index}`} className="form-label required">
                          Email Address
                        </label>
                        <InputText
                          id={`author-email-${index}`}
                          type="email"
                          value={author.email}
                          onChange={(e) => handleAuthorChange(index, 'email', e.target.value)}
                          placeholder="email@institution.edu"
                          className="w-full"
                        />
                      </div>
                    </div>
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor={`author-affiliation-${index}`} className="form-label">
                          Affiliation / Institution
                        </label>
                        <InputText
                          id={`author-affiliation-${index}`}
                          value={author.affiliation}
                          onChange={(e) => handleAuthorChange(index, 'affiliation', e.target.value)}
                          placeholder="e.g., Department of Computer Science, MIT"
                          className="w-full"
                        />
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor={`author-phone-${index}`} className="form-label">
                          Phone Number (optional)
                        </label>
                        <InputText
                          id={`author-phone-${index}`}
                          type="tel"
                          value={author.phone}
                          onChange={(e) => handleAuthorChange(index, 'phone', e.target.value)}
                          placeholder="e.g., +1 (555) 123-4567"
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                
                <Button
                  type="button"
                  icon="pi pi-plus"
                  label="Add Another Author"
                  className="p-button-outlined p-button-secondary add-author-btn"
                  onClick={addAuthor}
                />
              </div>

              {/* File Upload Section */}
              <div className="form-section">
                <h2 className="section-title">
                  <i className="pi pi-upload"></i>
                  Manuscript File
                </h2>
                
                <div className="form-group full-width">
                  <label htmlFor="pdf" className="form-label required">
                    Upload Manuscript
                  </label>
                  
                  <FileUpload
                    ref={fileUploadRef}
                    name="pdf"
                    accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/png,image/jpeg,image/jpg"
                    onSelect={handleFileSelect}
                    emptyTemplate={
                      <div className="upload-placeholder">
                        <i className="pi pi-cloud-upload" style={{ fontSize: '3rem', color: '#6366f1' }}></i>
                        <p className="upload-text">Drag and drop your file here</p>
                        <p className="upload-subtext">PDF, Word, PNG, or JPEG</p>
                      </div>
                    }
                    chooseOptions={{ icon: 'pi pi-file', className: 'p-button-primary' }}
                    className="custom-file-upload"
                  />
                  
                  {form.pdf && (
                    <div className="selected-file">
                      <div className="file-info">
                        <i className={`${getFileIcon(form.pdf)} file-icon`}></i>
                        <div className="file-details">
                          <span className="file-name">{form.pdf.name}</span>
                          <span className="file-size">
                            {(form.pdf.size / 1024 / 1024).toFixed(2)} MB
                          </span>
                        </div>
                      </div>
                      <Button
                        type="button"
                        icon="pi pi-times"
                        className="p-button-text p-button-danger"
                        onClick={handleFileRemove}
                        tooltip="Remove file"
                      />
                    </div>
                  )}
                </div>

                {submitting && uploadProgress > 0 && (
                  <div className="upload-progress">
                    <label>Upload Progress</label>
                    <ProgressBar value={uploadProgress} />
                  </div>
                )}
              </div>

              {/* Submit Section */}
              <div className="form-actions">
                <Button
                  type="button"
                  label="Cancel"
                  icon="pi pi-times"
                  className="p-button-text p-button-secondary"
                  onClick={() => window.history.back()}
                  disabled={submitting}
                />
                <Button
                  type="submit"
                  label={submitting ? 'Submitting...' : 'Submit Manuscript'}
                  icon={submitting ? 'pi pi-spin pi-spinner' : 'pi pi-check'}
                  className="p-button-primary"
                  disabled={submitting}
                />
              </div>
            </form>

            {/* Submission Guidelines Sidebar */}
            <aside className="submission-guidelines">
              <div className="guidelines-card">
                <h3 className="guidelines-title">
                  <i className="pi pi-info-circle"></i>
                  Submission Guidelines
                </h3>
                
                <div className="guideline-item">
                  <i className="pi pi-check-circle"></i>
                  <div style={{ marginLeft: '1.5rem' }}>
                    <strong>Manuscript Format</strong>
                    <p>submit your manuscript in PDF or Word format, properly formatted with clear headings and references.</p>
                  </div>
                </div>
                
                <div className="guideline-item">
                  <i className="pi pi-check-circle"></i>
                  <div>
                    <strong>Abstract Requirements</strong>
                    <p>Provide a concise abstract (100-500 characters) summarizing your research.</p>
                  </div>
                </div>
                
                <div className="guideline-item">
                  <i className="pi pi-check-circle"></i>
                  <div>
                    <strong>Author Details</strong>
                    <p>Include complete information for all authors, including corresponding author's email.</p>
                  </div>
                </div>
                
                <div className="guideline-item">
                  <i className="pi pi-check-circle"></i>
                  <div>
                    <strong>Review Process</strong>
                    <p>Your manuscript will undergo peer review within 2-4 weeks of submission.</p>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
