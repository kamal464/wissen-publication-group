'use client';

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Breadcrumb from '@/components/Breadcrumb';
import { Card } from 'primereact/card';
import { Accordion, AccordionTab } from 'primereact/accordion';
import { Timeline } from 'primereact/timeline';

export default function InstructionsPage() {
  const submissionSteps = [
    {
      status: 'Step 1',
      title: 'Prepare Your Manuscript',
      icon: 'pi pi-file-edit',
      color: '#6366f1'
    },
    {
      status: 'Step 2',
      title: 'Create Account & Submit',
      icon: 'pi pi-upload',
      color: '#8b5cf6'
    },
    {
      status: 'Step 3',
      title: 'Peer Review Process',
      icon: 'pi pi-users',
      color: '#ec4899'
    },
    {
      status: 'Step 4',
      title: 'Revision & Resubmission',
      icon: 'pi pi-refresh',
      color: '#f59e0b'
    },
    {
      status: 'Step 5',
      title: 'Final Decision & Publication',
      icon: 'pi pi-check-circle',
      color: '#10b981'
    }
  ];

  return (
    <>
      <Header />
      <main className="instructions-page">
        <Breadcrumb 
          items={[
            { label: 'Home', href: '/' },
            { label: 'Instructions to Authors', href: '/instructions' }
          ]}
        />

        <div className="container">
          {/* Hero Section */}
          <section className="instructions-hero">
            <div className="hero-content">
              <h1>Instructions to Authors</h1>
              <p className="lead">
                Complete guidelines for preparing and submitting your manuscript to Wissen Publication Group
              </p>
            </div>
          </section>

          {/* Quick Start */}
          <section className="quick-start">
            <Card className="quick-start-card">
              <h2>Quick Start Guide</h2>
              <p>
                Follow these comprehensive guidelines to ensure your manuscript meets our publication 
                standards and expedite the review process.
              </p>
              <a href="/submit-manuscript" className="btn-primary">
                <i className="pi pi-send"></i>
                Submit Your Manuscript
              </a>
            </Card>
          </section>

          {/* Submission Process */}
          <section className="process-section">
            <h2 className="section-title">Submission Process</h2>
            <Timeline 
              value={submissionSteps} 
              content={(item) => (
                <Card className="timeline-card">
                  <div className="timeline-icon" style={{ backgroundColor: item.color }}>
                    <i className={item.icon}></i>
                  </div>
                  <h3>{item.title}</h3>
                </Card>
              )}
            />
          </section>

          {/* Detailed Guidelines */}
          <section className="guidelines-section">
            <h2 className="section-title">Detailed Guidelines</h2>
            
            <Accordion multiple activeIndex={[0]}>
              <AccordionTab header="1. Manuscript Preparation">
                <div className="guideline-content">
                  <h3>General Requirements</h3>
                  <ul>
                    <li><strong>Language:</strong> Manuscripts must be written in clear, concise English.</li>
                    <li><strong>Length:</strong> Typically 3,000-8,000 words (excluding references).</li>
                    <li><strong>Format:</strong> Microsoft Word (.docx) or LaTeX (.tex) format preferred.</li>
                    <li><strong>Font:</strong> Times New Roman, 12pt, double-spaced.</li>
                    <li><strong>Margins:</strong> 1-inch (2.54 cm) on all sides.</li>
                  </ul>

                  <h3>Manuscript Structure</h3>
                  <ol>
                    <li>
                      <strong>Title Page:</strong>
                      <ul>
                        <li>Article title (concise and descriptive)</li>
                        <li>Full names of all authors</li>
                        <li>Affiliations and email addresses</li>
                        <li>Corresponding author details</li>
                        <li>ORCID iDs (recommended)</li>
                      </ul>
                    </li>
                    <li>
                      <strong>Abstract:</strong>
                      <ul>
                        <li>150-250 words</li>
                        <li>Summarize purpose, methods, results, and conclusions</li>
                        <li>No citations or abbreviations</li>
                      </ul>
                    </li>
                    <li>
                      <strong>Keywords:</strong> 4-6 keywords for indexing purposes
                    </li>
                    <li>
                      <strong>Introduction:</strong> Background, context, and research objectives
                    </li>
                    <li>
                      <strong>Methods:</strong> Detailed methodology for reproducibility
                    </li>
                    <li>
                      <strong>Results:</strong> Present findings with appropriate figures/tables
                    </li>
                    <li>
                      <strong>Discussion:</strong> Interpret results and compare with existing literature
                    </li>
                    <li>
                      <strong>Conclusion:</strong> Summarize key findings and implications
                    </li>
                    <li>
                      <strong>Acknowledgments:</strong> Funding sources and contributors
                    </li>
                    <li>
                      <strong>References:</strong> Follow APA, MLA, or Chicago style consistently
                    </li>
                  </ol>
                </div>
              </AccordionTab>

              <AccordionTab header="2. Figures and Tables">
                <div className="guideline-content">
                  <h3>Figures</h3>
                  <ul>
                    <li>Submit as separate high-resolution files (300 dpi minimum)</li>
                    <li>Acceptable formats: TIFF, EPS, JPG, PNG</li>
                    <li>Number consecutively (Figure 1, Figure 2, etc.)</li>
                    <li>Include clear captions below each figure</li>
                    <li>Ensure all text is legible and professionally formatted</li>
                    <li>Color figures are acceptable for online publication</li>
                  </ul>

                  <h3>Tables</h3>
                  <ul>
                    <li>Create using table function in word processor</li>
                    <li>Number consecutively (Table 1, Table 2, etc.)</li>
                    <li>Include descriptive titles above each table</li>
                    <li>Footnotes should be placed below the table</li>
                    <li>Ensure data is clearly organized and readable</li>
                  </ul>
                </div>
              </AccordionTab>

              <AccordionTab header="3. Citations and References">
                <div className="guideline-content">
                  <h3>Citation Style</h3>
                  <p>
                    Wissen Publication Group accepts multiple citation styles. Please choose one and use 
                    it consistently throughout your manuscript:
                  </p>
                  <ul>
                    <li><strong>APA Style:</strong> (Author, Year) format</li>
                    <li><strong>MLA Style:</strong> (Author Page) format</li>
                    <li><strong>Chicago Style:</strong> Footnote or author-date system</li>
                    <li><strong>IEEE Style:</strong> Numerical citation system</li>
                    <li><strong>Vancouver Style:</strong> Numerical sequential system</li>
                  </ul>

                  <h3>Reference List</h3>
                  <ul>
                    <li>List all cited works alphabetically by first author's surname</li>
                    <li>Include DOI numbers when available</li>
                    <li>Verify accuracy of all bibliographic information</li>
                    <li>Use consistent formatting throughout</li>
                    <li>Minimum 20-30 references for research articles</li>
                  </ul>

                  <h3>Example References</h3>
                  <div className="example-box">
                    <strong>Journal Article:</strong><br/>
                    Smith, J., & Johnson, A. (2024). Research methodology in modern science. 
                    <em>Journal of Scientific Research</em>, 45(3), 123-145. 
                    https://doi.org/10.1234/jsr.2024.012
                  </div>
                  <div className="example-box">
                    <strong>Book:</strong><br/>
                    Brown, P. (2023). <em>Advanced Statistical Methods</em> (3rd ed.). 
                    Academic Press.
                  </div>
                </div>
              </AccordionTab>

              <AccordionTab header="4. Ethical Guidelines">
                <div className="guideline-content">
                  <h3>Research Ethics</h3>
                  <ul>
                    <li>All research must comply with relevant ethical guidelines</li>
                    <li>Human subjects research requires IRB/Ethics Committee approval</li>
                    <li>Animal research must follow institutional and international guidelines</li>
                    <li>Include ethics approval number in methods section</li>
                    <li>Obtain informed consent from all participants</li>
                  </ul>

                  <h3>Publication Ethics</h3>
                  <ul>
                    <li>
                      <strong>Originality:</strong> Manuscripts must be original and not under 
                      consideration elsewhere
                    </li>
                    <li>
                      <strong>Plagiarism:</strong> All submissions are checked using plagiarism 
                      detection software
                    </li>
                    <li>
                      <strong>Data Fabrication:</strong> Fabrication or manipulation of data is 
                      strictly prohibited
                    </li>
                    <li>
                      <strong>Authorship:</strong> All listed authors must have made substantial 
                      contributions
                    </li>
                    <li>
                      <strong>Conflicts of Interest:</strong> Disclose any potential conflicts of 
                      interest
                    </li>
                  </ul>

                  <h3>Data Sharing</h3>
                  <ul>
                    <li>Authors are encouraged to make data publicly available</li>
                    <li>Deposit datasets in recognized repositories</li>
                    <li>Include data availability statement in manuscript</li>
                  </ul>
                </div>
              </AccordionTab>

              <AccordionTab header="5. Submission Requirements">
                <div className="guideline-content">
                  <h3>Required Files</h3>
                  <ol>
                    <li>
                      <strong>Main Manuscript:</strong> Complete manuscript file (.docx or .tex)
                    </li>
                    <li>
                      <strong>Title Page:</strong> Separate file with author information
                    </li>
                    <li>
                      <strong>Cover Letter:</strong> Explaining significance and suitability
                    </li>
                    <li>
                      <strong>Figures:</strong> High-resolution separate files
                    </li>
                    <li>
                      <strong>Tables:</strong> Included in manuscript or as separate files
                    </li>
                    <li>
                      <strong>Supplementary Materials:</strong> Additional data, videos, etc. (optional)
                    </li>
                  </ol>

                  <h3>Cover Letter</h3>
                  <p>Your cover letter should include:</p>
                  <ul>
                    <li>Brief summary of the research and its significance</li>
                    <li>Why the manuscript is suitable for the journal</li>
                    <li>Confirmation that the work is original</li>
                    <li>Disclosure of any conflicts of interest</li>
                    <li>Suggested reviewers (optional but encouraged)</li>
                  </ul>
                </div>
              </AccordionTab>

              <AccordionTab header="6. Review Process">
                <div className="guideline-content">
                  <h3>Peer Review Timeline</h3>
                  <ul>
                    <li><strong>Initial Review:</strong> 1-2 weeks (editorial screening)</li>
                    <li><strong>Peer Review:</strong> 4-6 weeks (expert review)</li>
                    <li><strong>Decision:</strong> 1 week after reviews received</li>
                    <li><strong>Revision:</strong> 2-4 weeks for authors to revise</li>
                    <li><strong>Final Decision:</strong> 1-2 weeks after resubmission</li>
                  </ul>

                  <h3>Possible Decisions</h3>
                  <ul>
                    <li>
                      <strong>Accept:</strong> Manuscript accepted with no or minor changes
                    </li>
                    <li>
                      <strong>Minor Revision:</strong> Small changes required
                    </li>
                    <li>
                      <strong>Major Revision:</strong> Substantial revisions needed
                    </li>
                    <li>
                      <strong>Reject with Resubmission:</strong> Significant issues, may resubmit
                    </li>
                    <li>
                      <strong>Reject:</strong> Not suitable for publication
                    </li>
                  </ul>

                  <h3>After Acceptance</h3>
                  <ul>
                    <li>Manuscript sent for copyediting and typesetting</li>
                    <li>Authors receive proofs for final review</li>
                    <li>Publication online within 2-4 weeks</li>
                    <li>Article assigned DOI for permanent citation</li>
                  </ul>
                </div>
              </AccordionTab>

              <AccordionTab header="7. Publication Fees & Licenses">
                <div className="guideline-content">
                  <h3>Article Processing Charges (APC)</h3>
                  <ul>
                    <li>Standard APC: $500-$1,500 (varies by journal)</li>
                    <li>Waivers available for authors from developing countries</li>
                    <li>Discounts for institutional members</li>
                    <li>Fees cover peer review, editing, and publication</li>
                  </ul>

                  <h3>Open Access Licenses</h3>
                  <p>All articles published under Creative Commons licenses:</p>
                  <ul>
                    <li>
                      <strong>CC BY:</strong> Allows distribution and adaptation with attribution
                    </li>
                    <li>
                      <strong>CC BY-NC:</strong> Non-commercial use only
                    </li>
                    <li>
                      <strong>CC BY-NC-ND:</strong> Non-commercial, no derivatives
                    </li>
                  </ul>

                  <h3>Copyright</h3>
                  <ul>
                    <li>Authors retain copyright to their work</li>
                    <li>Grant Wissen Publication Group license to publish</li>
                    <li>Authors can reuse their work freely</li>
                  </ul>
                </div>
              </AccordionTab>
            </Accordion>
          </section>

          {/* Checklist */}
          <section className="checklist-section">
            <Card className="checklist-card">
              <h2>Submission Checklist</h2>
              <p>Before submitting, ensure you have completed the following:</p>
              <div className="checklist">
                <div className="checklist-item">
                  <i className="pi pi-check-square"></i>
                  <span>Manuscript follows formatting guidelines</span>
                </div>
                <div className="checklist-item">
                  <i className="pi pi-check-square"></i>
                  <span>All authors have approved the submission</span>
                </div>
                <div className="checklist-item">
                  <i className="pi pi-check-square"></i>
                  <span>Abstract is within word limit (150-250 words)</span>
                </div>
                <div className="checklist-item">
                  <i className="pi pi-check-square"></i>
                  <span>4-6 keywords included</span>
                </div>
                <div className="checklist-item">
                  <i className="pi pi-check-square"></i>
                  <span>Figures and tables are high quality</span>
                </div>
                <div className="checklist-item">
                  <i className="pi pi-check-square"></i>
                  <span>References formatted consistently</span>
                </div>
                <div className="checklist-item">
                  <i className="pi pi-check-square"></i>
                  <span>Ethics approval obtained (if applicable)</span>
                </div>
                <div className="checklist-item">
                  <i className="pi pi-check-square"></i>
                  <span>Conflicts of interest disclosed</span>
                </div>
                <div className="checklist-item">
                  <i className="pi pi-check-square"></i>
                  <span>Cover letter prepared</span>
                </div>
                <div className="checklist-item">
                  <i className="pi pi-check-square"></i>
                  <span>All required files ready</span>
                </div>
              </div>
            </Card>
          </section>

          {/* CTA */}
          <section className="submit-cta">
            <Card className="cta-card">
              <h2>Ready to Submit?</h2>
              <p>
                If you have followed all the guidelines and prepared your manuscript, 
                you're ready to submit!
              </p>
              <div className="cta-buttons">
                <a href="/submit-manuscript" className="btn-primary">
                  <i className="pi pi-upload"></i>
                  Submit Manuscript
                </a>
                <a href="/contact" className="btn-secondary">
                  <i className="pi pi-question-circle"></i>
                  Need Help?
                </a>
              </div>
            </Card>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
