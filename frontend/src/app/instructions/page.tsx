'use client';

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Breadcrumb from '@/components/Breadcrumb';
import { Card } from 'primereact/card';
import { Accordion, AccordionTab } from 'primereact/accordion';
import { Timeline } from 'primereact/timeline';
import { Button } from 'primereact/button';
import Link from 'next/link';

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
      <main className="surface-ground min-h-screen">
        <Breadcrumb 
          items={[
            { label: 'Home', href: '/' },
            { label: 'Instructions to Authors', href: '/instructions' }
          ]}
        />

        <div className="container mx-auto px-3 md:px-4 lg:px-6 py-4 md:py-6">
          {/* Hero Section */}
          <section className="text-center py-4 md:py-6 lg:py-8">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-900 mb-3 md:mb-4">
                Instructions to Authors
              </h1>
              <p className="text-lg md:text-xl text-600 line-height-3">
                Complete guidelines for preparing and submitting your manuscript to Wissen Publication Group
              </p>
            </div>
          </section>

          {/* Quick Start */}
          <section className="mb-5 md:mb-6">
            <Card className="surface-card border-round-xl shadow-3">
              <div className="p-4 md:p-6 lg:p-8 text-center" style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)', borderRadius: '12px' }}>
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 md:mb-4">
                  Quick Start Guide
                </h2>
                <p className="text-white text-lg md:text-xl mb-4 md:mb-5 opacity-90 line-height-3">
                  Follow these comprehensive guidelines to ensure your manuscript meets our publication 
                  standards and expedite the review process.
                </p>
                <Link href="/submit-manuscript">
                  <Button 
                    label="Submit Your Manuscript" 
                    icon="pi pi-send" 
                    className="p-button-lg surface-0 text-primary border-none font-semibold"
                    style={{ padding: '0.75rem 2rem' }}
                  />
                </Link>
              </div>
            </Card>
          </section>

          {/* Submission Process */}
          <section className="mb-5 md:mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-900 mb-4 md:mb-5 text-center md:text-left">
              Submission Process
            </h2>
            <div className="p-3 md:p-4">
              <Timeline 
                value={submissionSteps} 
                content={(item) => (
                  <Card className="mb-3 shadow-2 border-round-lg">
                    <div className="flex align-items-center gap-3 p-3">
                      <div 
                        className="flex align-items-center justify-content-center border-circle text-white"
                        style={{ 
                          backgroundColor: item.color,
                          width: '3rem',
                          height: '3rem',
                          minWidth: '3rem'
                        }}
                      >
                        <i className={`${item.icon} text-2xl`}></i>
                      </div>
                      <h3 className="text-xl md:text-2xl font-semibold text-900 m-0">
                        {item.title}
                      </h3>
                    </div>
                  </Card>
                )}
              />
            </div>
          </section>

          {/* Detailed Guidelines */}
          <section className="mb-5 md:mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-900 mb-4 md:mb-5 text-center md:text-left">
              Detailed Guidelines
            </h2>
            
            <Accordion multiple activeIndex={[0]} className="w-full">
              <AccordionTab header="1. Manuscript Preparation">
                <div className="p-3 md:p-4">
                  <h3 className="text-xl font-semibold text-900 mb-3">General Requirements</h3>
                  <ul className="list-none p-0 m-0 line-height-3">
                    <li className="mb-2"><strong>Language:</strong> Manuscripts must be written in clear, concise English.</li>
                    <li className="mb-2"><strong>Length:</strong> Typically 3,000-8,000 words (excluding references).</li>
                    <li className="mb-2"><strong>Format:</strong> Microsoft Word (.docx) or LaTeX (.tex) format preferred.</li>
                    <li className="mb-2"><strong>Font:</strong> Times New Roman, 12pt, double-spaced.</li>
                    <li className="mb-2"><strong>Margins:</strong> 1-inch (2.54 cm) on all sides.</li>
                  </ul>

                  <h3 className="text-xl font-semibold text-900 mb-3 mt-4">Manuscript Structure</h3>
                  <ol className="line-height-3 pl-4">
                    <li className="mb-3">
                      <strong>Title Page:</strong>
                      <ul className="list-none pl-4 mt-2">
                        <li className="mb-1">• Article title (concise and descriptive)</li>
                        <li className="mb-1">• Full names of all authors</li>
                        <li className="mb-1">• Affiliations and email addresses</li>
                        <li className="mb-1">• Corresponding author details</li>
                        <li className="mb-1">• ORCID iDs (recommended)</li>
                      </ul>
                    </li>
                    <li className="mb-3">
                      <strong>Abstract:</strong>
                      <ul className="list-none pl-4 mt-2">
                        <li className="mb-1">• 150-250 words</li>
                        <li className="mb-1">• Summarize purpose, methods, results, and conclusions</li>
                        <li className="mb-1">• No citations or abbreviations</li>
                      </ul>
                    </li>
                    <li className="mb-3">
                      <strong>Keywords:</strong> 4-6 keywords for indexing purposes
                    </li>
                    <li className="mb-3">
                      <strong>Introduction:</strong> Background, context, and research objectives
                    </li>
                    <li className="mb-3">
                      <strong>Methods:</strong> Detailed methodology for reproducibility
                    </li>
                    <li className="mb-3">
                      <strong>Results:</strong> Present findings with appropriate figures/tables
                    </li>
                    <li className="mb-3">
                      <strong>Discussion:</strong> Interpret results and compare with existing literature
                    </li>
                    <li className="mb-3">
                      <strong>Conclusion:</strong> Summarize key findings and implications
                    </li>
                    <li className="mb-3">
                      <strong>Acknowledgments:</strong> Funding sources and contributors
                    </li>
                    <li className="mb-3">
                      <strong>References:</strong> Follow APA, MLA, or Chicago style consistently
                    </li>
                  </ol>
                </div>
              </AccordionTab>

              <AccordionTab header="2. Figures and Tables">
                <div className="p-3 md:p-4">
                  <h3 className="text-xl font-semibold text-900 mb-3">Figures</h3>
                  <ul className="list-none p-0 m-0 line-height-3">
                    <li className="mb-2">Submit as separate high-resolution files (300 dpi minimum)</li>
                    <li className="mb-2">Acceptable formats: TIFF, EPS, JPG, PNG</li>
                    <li className="mb-2">Number consecutively (Figure 1, Figure 2, etc.)</li>
                    <li className="mb-2">Include clear captions below each figure</li>
                    <li className="mb-2">Ensure all text is legible and professionally formatted</li>
                    <li className="mb-2">Color figures are acceptable for online publication</li>
                  </ul>

                  <h3 className="text-xl font-semibold text-900 mb-3 mt-4">Tables</h3>
                  <ul className="list-none p-0 m-0 line-height-3">
                    <li className="mb-2">Create using table function in word processor</li>
                    <li className="mb-2">Number consecutively (Table 1, Table 2, etc.)</li>
                    <li className="mb-2">Include descriptive titles above each table</li>
                    <li className="mb-2">Footnotes should be placed below the table</li>
                    <li className="mb-2">Ensure data is clearly organized and readable</li>
                  </ul>
                </div>
              </AccordionTab>

              <AccordionTab header="3. Citations and References">
                <div className="p-3 md:p-4">
                  <h3 className="text-xl font-semibold text-900 mb-3">Citation Style</h3>
                  <p className="line-height-3 mb-3">
                    Wissen Publication Group accepts multiple citation styles. Please choose one and use 
                    it consistently throughout your manuscript:
                  </p>
                  <ul className="list-none p-0 m-0 line-height-3 mb-4">
                    <li className="mb-2"><strong>APA Style:</strong> (Author, Year) format</li>
                    <li className="mb-2"><strong>MLA Style:</strong> (Author Page) format</li>
                    <li className="mb-2"><strong>Chicago Style:</strong> Footnote or author-date system</li>
                    <li className="mb-2"><strong>IEEE Style:</strong> Numerical citation system</li>
                    <li className="mb-2"><strong>Vancouver Style:</strong> Numerical sequential system</li>
                  </ul>

                  <h3 className="text-xl font-semibold text-900 mb-3">Reference List</h3>
                  <ul className="list-none p-0 m-0 line-height-3 mb-4">
                    <li className="mb-2">List all cited works alphabetically by first author's surname</li>
                    <li className="mb-2">Include DOI numbers when available</li>
                    <li className="mb-2">Verify accuracy of all bibliographic information</li>
                    <li className="mb-2">Use consistent formatting throughout</li>
                    <li className="mb-2">Minimum 20-30 references for research articles</li>
                  </ul>

                  <h3 className="text-xl font-semibold text-900 mb-3">Example References</h3>
                  <div className="p-3 mb-3 surface-100 border-round border-1 border-300">
                    <strong>Journal Article:</strong><br/>
                    <span className="text-sm">Smith, J., & Johnson, A. (2024). Research methodology in modern science. 
                    <em>Journal of Scientific Research</em>, 45(3), 123-145. 
                    https://doi.org/10.1234/jsr.2024.012</span>
                  </div>
                  <div className="p-3 surface-100 border-round border-1 border-300">
                    <strong>Book:</strong><br/>
                    <span className="text-sm">Brown, P. (2023). <em>Advanced Statistical Methods</em> (3rd ed.). 
                    Academic Press.</span>
                  </div>
                </div>
              </AccordionTab>

              <AccordionTab header="4. Ethical Guidelines">
                <div className="p-3 md:p-4">
                  <h3 className="text-xl font-semibold text-900 mb-3">Research Ethics</h3>
                  <ul className="list-none p-0 m-0 line-height-3 mb-4">
                    <li className="mb-2">All research must comply with relevant ethical guidelines</li>
                    <li className="mb-2">Human subjects research requires IRB/Ethics Committee approval</li>
                    <li className="mb-2">Animal research must follow institutional and international guidelines</li>
                    <li className="mb-2">Include ethics approval number in methods section</li>
                    <li className="mb-2">Obtain informed consent from all participants</li>
                  </ul>

                  <h3 className="text-xl font-semibold text-900 mb-3">Publication Ethics</h3>
                  <ul className="list-none p-0 m-0 line-height-3 mb-4">
                    <li className="mb-2">
                      <strong>Originality:</strong> Manuscripts must be original and not under 
                      consideration elsewhere
                    </li>
                    <li className="mb-2">
                      <strong>Plagiarism:</strong> All submissions are checked using plagiarism 
                      detection software
                    </li>
                    <li className="mb-2">
                      <strong>Data Fabrication:</strong> Fabrication or manipulation of data is 
                      strictly prohibited
                    </li>
                    <li className="mb-2">
                      <strong>Authorship:</strong> All listed authors must have made substantial 
                      contributions
                    </li>
                    <li className="mb-2">
                      <strong>Conflicts of Interest:</strong> Disclose any potential conflicts of 
                      interest
                    </li>
                  </ul>

                  <h3 className="text-xl font-semibold text-900 mb-3">Data Sharing</h3>
                  <ul className="list-none p-0 m-0 line-height-3">
                    <li className="mb-2">Authors are encouraged to make data publicly available</li>
                    <li className="mb-2">Deposit datasets in recognized repositories</li>
                    <li className="mb-2">Include data availability statement in manuscript</li>
                  </ul>
                </div>
              </AccordionTab>

              <AccordionTab header="5. Submission Requirements">
                <div className="p-3 md:p-4">
                  <h3 className="text-xl font-semibold text-900 mb-3">Required Files</h3>
                  <ol className="line-height-3 pl-4 mb-4">
                    <li className="mb-2">
                      <strong>Main Manuscript:</strong> Complete manuscript file (.docx or .tex)
                    </li>
                    <li className="mb-2">
                      <strong>Title Page:</strong> Separate file with author information
                    </li>
                    <li className="mb-2">
                      <strong>Cover Letter:</strong> Explaining significance and suitability
                    </li>
                    <li className="mb-2">
                      <strong>Figures:</strong> High-resolution separate files
                    </li>
                    <li className="mb-2">
                      <strong>Tables:</strong> Included in manuscript or as separate files
                    </li>
                    <li className="mb-2">
                      <strong>Supplementary Materials:</strong> Additional data, videos, etc. (optional)
                    </li>
                  </ol>

                  <h3 className="text-xl font-semibold text-900 mb-3">Cover Letter</h3>
                  <p className="mb-3 line-height-3">Your cover letter should include:</p>
                  <ul className="list-none p-0 m-0 line-height-3">
                    <li className="mb-2">Brief summary of the research and its significance</li>
                    <li className="mb-2">Why the manuscript is suitable for the journal</li>
                    <li className="mb-2">Confirmation that the work is original</li>
                    <li className="mb-2">Disclosure of any conflicts of interest</li>
                    <li className="mb-2">Suggested reviewers (optional but encouraged)</li>
                  </ul>
                </div>
              </AccordionTab>

              <AccordionTab header="6. Review Process">
                <div className="p-3 md:p-4">
                  <h3 className="text-xl font-semibold text-900 mb-3">Peer Review Timeline</h3>
                  <ul className="list-none p-0 m-0 line-height-3 mb-4">
                    <li className="mb-2"><strong>Initial Review:</strong> 1-2 weeks (editorial screening)</li>
                    <li className="mb-2"><strong>Peer Review:</strong> 4-6 weeks (expert review)</li>
                    <li className="mb-2"><strong>Decision:</strong> 1 week after reviews received</li>
                    <li className="mb-2"><strong>Revision:</strong> 2-4 weeks for authors to revise</li>
                    <li className="mb-2"><strong>Final Decision:</strong> 1-2 weeks after resubmission</li>
                  </ul>

                  <h3 className="text-xl font-semibold text-900 mb-3">Possible Decisions</h3>
                  <ul className="list-none p-0 m-0 line-height-3 mb-4">
                    <li className="mb-2">
                      <strong>Accept:</strong> Manuscript accepted with no or minor changes
                    </li>
                    <li className="mb-2">
                      <strong>Minor Revision:</strong> Small changes required
                    </li>
                    <li className="mb-2">
                      <strong>Major Revision:</strong> Substantial revisions needed
                    </li>
                    <li className="mb-2">
                      <strong>Reject with Resubmission:</strong> Significant issues, may resubmit
                    </li>
                    <li className="mb-2">
                      <strong>Reject:</strong> Not suitable for publication
                    </li>
                  </ul>

                  <h3 className="text-xl font-semibold text-900 mb-3">After Acceptance</h3>
                  <ul className="list-none p-0 m-0 line-height-3">
                    <li className="mb-2">Manuscript sent for copyediting and typesetting</li>
                    <li className="mb-2">Authors receive proofs for final review</li>
                    <li className="mb-2">Publication online within 2-4 weeks</li>
                    <li className="mb-2">Article assigned DOI for permanent citation</li>
                  </ul>
                </div>
              </AccordionTab>

              <AccordionTab header="7. Publication Fees & Licenses">
                <div className="p-3 md:p-4">
                  <h3 className="text-xl font-semibold text-900 mb-3">Article Processing Charges (APC)</h3>
                  <ul className="list-none p-0 m-0 line-height-3 mb-4">
                    <li className="mb-2">Standard APC: $500-$1,500 (varies by journal)</li>
                    <li className="mb-2">Waivers available for authors from developing countries</li>
                    <li className="mb-2">Discounts for institutional members</li>
                    <li className="mb-2">Fees cover peer review, editing, and publication</li>
                  </ul>

                  <h3 className="text-xl font-semibold text-900 mb-3">Open Access Licenses</h3>
                  <p className="mb-3 line-height-3">All articles published under Creative Commons licenses:</p>
                  <ul className="list-none p-0 m-0 line-height-3 mb-4">
                    <li className="mb-2">
                      <strong>CC BY:</strong> Allows distribution and adaptation with attribution
                    </li>
                    <li className="mb-2">
                      <strong>CC BY-NC:</strong> Non-commercial use only
                    </li>
                    <li className="mb-2">
                      <strong>CC BY-NC-ND:</strong> Non-commercial, no derivatives
                    </li>
                  </ul>

                  <h3 className="text-xl font-semibold text-900 mb-3">Copyright</h3>
                  <ul className="list-none p-0 m-0 line-height-3">
                    <li className="mb-2">Authors retain copyright to their work</li>
                    <li className="mb-2">Grant Wissen Publication Group license to publish</li>
                    <li className="mb-2">Authors can reuse their work freely</li>
                  </ul>
                </div>
              </AccordionTab>
            </Accordion>
          </section>

          {/* Checklist */}
          <section className="mb-5 md:mb-6">
            <Card className="surface-card shadow-3 border-round-xl">
              <div className="p-4 md:p-6">
                <h2 className="text-2xl md:text-3xl font-bold text-900 mb-3 md:mb-4">
                  Submission Checklist
                </h2>
                <p className="text-600 mb-4 md:mb-5 line-height-3">
                  Before submitting, ensure you have completed the following:
                </p>
                <div className="grid">
                  <div className="col-12 md:col-6">
                    <div className="flex align-items-center gap-2 mb-3">
                      <i className="pi pi-check-square text-primary text-xl"></i>
                      <span className="text-900">Manuscript follows formatting guidelines</span>
                    </div>
                    <div className="flex align-items-center gap-2 mb-3">
                      <i className="pi pi-check-square text-primary text-xl"></i>
                      <span className="text-900">All authors have approved the submission</span>
                    </div>
                    <div className="flex align-items-center gap-2 mb-3">
                      <i className="pi pi-check-square text-primary text-xl"></i>
                      <span className="text-900">Abstract is within word limit (150-250 words)</span>
                    </div>
                    <div className="flex align-items-center gap-2 mb-3">
                      <i className="pi pi-check-square text-primary text-xl"></i>
                      <span className="text-900">4-6 keywords included</span>
                    </div>
                    <div className="flex align-items-center gap-2 mb-3">
                      <i className="pi pi-check-square text-primary text-xl"></i>
                      <span className="text-900">Figures and tables are high quality</span>
                    </div>
                  </div>
                  <div className="col-12 md:col-6">
                    <div className="flex align-items-center gap-2 mb-3">
                      <i className="pi pi-check-square text-primary text-xl"></i>
                      <span className="text-900">References formatted consistently</span>
                    </div>
                    <div className="flex align-items-center gap-2 mb-3">
                      <i className="pi pi-check-square text-primary text-xl"></i>
                      <span className="text-900">Ethics approval obtained (if applicable)</span>
                    </div>
                    <div className="flex align-items-center gap-2 mb-3">
                      <i className="pi pi-check-square text-primary text-xl"></i>
                      <span className="text-900">Conflicts of interest disclosed</span>
                    </div>
                    <div className="flex align-items-center gap-2 mb-3">
                      <i className="pi pi-check-square text-primary text-xl"></i>
                      <span className="text-900">Cover letter prepared</span>
                    </div>
                    <div className="flex align-items-center gap-2 mb-3">
                      <i className="pi pi-check-square text-primary text-xl"></i>
                      <span className="text-900">All required files ready</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </section>

          {/* CTA */}
          <section className="mb-5 md:mb-6">
            <Card className="surface-card shadow-3 border-round-xl">
              <div className="p-4 md:p-6 text-center">
                <h2 className="text-2xl md:text-3xl font-bold text-900 mb-3 md:mb-4">
                  Ready to Submit?
                </h2>
                <p className="text-600 mb-4 md:mb-5 text-lg line-height-3 max-w-2xl mx-auto">
                  If you have followed all the guidelines and prepared your manuscript, 
                  you're ready to submit!
                </p>
                <div className="flex flex-column md:flex-row gap-3 justify-content-center align-items-center">
                  <Link href="/submit-manuscript">
                    <Button 
                      label="Submit Manuscript" 
                      icon="pi pi-upload" 
                      className="p-button-lg w-full md:w-auto"
                    />
                  </Link>
                  <Link href="/contact">
                    <Button 
                      label="Need Help?" 
                      icon="pi pi-question-circle" 
                      className="p-button-lg p-button-outlined w-full md:w-auto"
                    />
                  </Link>
                </div>
              </div>
            </Card>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
