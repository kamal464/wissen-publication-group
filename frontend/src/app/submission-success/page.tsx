'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from 'primereact/button';
import jsPDF from 'jspdf';

function SubmissionSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [manuscriptData, setManuscriptData] = useState<any>(null);
  const [countdown, setCountdown] = useState(250);

  useEffect(() => {
    // Get manuscript data from URL params
    const manuscriptId = searchParams.get('id');
    const title = searchParams.get('title');
    const journalName = searchParams.get('journal');
    const authorsCount = searchParams.get('authors');
    
    if (manuscriptId) {
      setManuscriptData({
        id: manuscriptId,
        title: decodeURIComponent(title || ''),
        journal: decodeURIComponent(journalName || ''),
        authorsCount: authorsCount || '1',
      });
    }

    // Countdown timer
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Confetti effect
    createConfetti();

    return () => {
      clearInterval(timer);
    };
  }, [searchParams]);

  const createConfetti = () => {
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const colors = ['#6366f1', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

    const frame = () => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) return;

      const particleCount = 2;
      for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'confetti-particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        particle.style.animationDuration = (Math.random() * 2 + 2) + 's';
        document.body.appendChild(particle);

        setTimeout(() => {
          particle.remove();
        }, 4000);
      }

      requestAnimationFrame(frame);
    };

    frame();
  };

  const handleGoToHome = () => {
    router.push('/');
  };

  const handleViewArticles = () => {
    router.push('/articles');
  };

  const handleSubmitAnother = () => {
    router.push('/submit-manuscript');
  };

  const handleDownloadPDF = () => {
    if (!manuscriptData) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPos = 20;

    // Header with green background
    doc.setFillColor(16, 185, 129); // Green color
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('MANUSCRIPT SUBMISSION RECEIPT', pageWidth / 2, 20, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const submissionDate = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    doc.text(submissionDate, pageWidth / 2, 30, { align: 'center' });

    // Reset text color
    doc.setTextColor(0, 0, 0);
    yPos = 55;

    // Manuscript Details Section
    doc.setFillColor(249, 249, 249);
    doc.rect(10, yPos, pageWidth - 20, 65, 'F');
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(26, 26, 26);
    doc.text('Manuscript Details', 15, yPos + 10);
    
    doc.setDrawColor(229, 231, 235);
    doc.line(15, yPos + 13, pageWidth - 15, yPos + 13);

    yPos += 20;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(102, 102, 102);
    
    // Manuscript ID
    doc.text('Manuscript ID:', 15, yPos);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(99, 102, 241); // Indigo color
    doc.setFontSize(16);
    doc.text(`#${manuscriptData.id}`, pageWidth - 15, yPos, { align: 'right' });
    
    yPos += 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(102, 102, 102);
    doc.text('Title:', 15, yPos);
    doc.setTextColor(26, 26, 26);
    doc.setFont('helvetica', 'bold');
    const splitTitle = doc.splitTextToSize(manuscriptData.title, pageWidth - 80);
    doc.text(splitTitle, pageWidth - 15, yPos, { align: 'right' });
    
    yPos += 10;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(102, 102, 102);
    doc.text('Journal:', 15, yPos);
    doc.setTextColor(26, 26, 26);
    doc.setFont('helvetica', 'bold');
    doc.text(manuscriptData.journal, pageWidth - 15, yPos, { align: 'right' });
    
    yPos += 10;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(102, 102, 102);
    doc.text('Number of Authors:', 15, yPos);
    doc.setTextColor(26, 26, 26);
    doc.setFont('helvetica', 'bold');
    doc.text(manuscriptData.authorsCount, pageWidth - 15, yPos, { align: 'right' });
    
    yPos += 10;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(102, 102, 102);
    doc.text('Status:', 15, yPos);
    doc.setFillColor(245, 158, 11); // Amber color
    doc.roundedRect(pageWidth - 55, yPos - 5, 40, 8, 3, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('Pending Review', pageWidth - 35, yPos, { align: 'center' });

    // Review Process Timeline
    yPos += 25;
    doc.setFillColor(249, 249, 249);
    doc.rect(10, yPos, pageWidth - 20, 75, 'F');
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(26, 26, 26);
    doc.text('Review Process Timeline', 15, yPos + 10);
    
    doc.setDrawColor(229, 231, 235);
    doc.line(15, yPos + 13, pageWidth - 15, yPos + 13);

    yPos += 20;
    doc.setFontSize(10);
    
    // Timeline items
    const timelineItems = [
      { title: '1. Submission Received ✓', desc: 'Your manuscript has been successfully submitted', completed: true },
      { title: '2. Initial Review', desc: 'Our editorial team will review your submission (1-2 weeks)', completed: false },
      { title: '3. Peer Review', desc: 'Expert reviewers will assess your research (4-6 weeks)', completed: false },
      { title: '4. Decision', desc: 'You\'ll receive feedback and our publication decision', completed: false }
    ];

    timelineItems.forEach((item, index) => {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(item.completed ? 16 : 26, item.completed ? 185 : 26, item.completed ? 129 : 26);
      doc.text(item.title, 20, yPos);
      
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(102, 102, 102);
      doc.setFontSize(9);
      doc.text(item.desc, 20, yPos + 5);
      
      yPos += 15;
      doc.setFontSize(10);
    });

    // Important Information
    yPos += 5;
    doc.setFillColor(239, 246, 255); // Light blue
    doc.rect(10, yPos, pageWidth - 20, 40, 'F');
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(26, 26, 26);
    doc.text('Important Information', 15, yPos + 10);
    
    doc.setDrawColor(219, 234, 254);
    doc.line(15, yPos + 13, pageWidth - 15, yPos + 13);

    yPos += 20;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 64, 175); // Blue color
    
    doc.text('✉  A confirmation email has been sent to all authors', 15, yPos);
    yPos += 6;
    doc.text(`🔍 Track your submission using Manuscript ID: #${manuscriptData.id}`, 15, yPos);
    yPos += 6;
    doc.text('⏰ Please allow 1-2 weeks for initial review', 15, yPos);
    yPos += 6;
    doc.text('📧 You will be notified at each stage of the review process', 15, yPos);

    // Footer
    yPos = pageHeight - 30;
    doc.setDrawColor(229, 231, 235);
    doc.line(10, yPos, pageWidth - 10, yPos);
    
    yPos += 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(102, 102, 102);
    doc.text('Contact Information', 15, yPos);
    
    yPos += 7;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('📧 editorial@universalpublishers.com  |  📞 +1 (555) 123-4567', 15, yPos);
    
    yPos += 10;
    doc.setFontSize(8);
    doc.setTextColor(153, 153, 153);
    doc.text(`© ${new Date().getFullYear()} Wissen Publication Group. All rights reserved.`, pageWidth / 2, yPos, { align: 'center' });

    // Save the PDF
    doc.save(`manuscript-receipt-${manuscriptData.id}.pdf`);
  };

  const handlePrintReceipt = () => {
    if (!manuscriptData) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const printContent = `
<!DOCTYPE html>
<html>
<head>
  <title>Manuscript Submission Receipt</title>
  <style>
    body {
      font-family: 'Times New Roman', Times, serif;
      padding: 40px;
      max-width: 800px;
      margin: 0 auto;
      line-height: 1.6;
      color: #333;
    }
    .header {
      text-align: center;
      border-bottom: 3px solid #10b981;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .header h1 {
      color: #10b981;
      margin: 0;
      font-size: 28px;
    }
    .header p {
      color: #666;
      margin: 10px 0 0 0;
    }
    .section {
      margin: 30px 0;
      padding: 20px;
      background: #f9f9f9;
      border-radius: 8px;
    }
    .section h2 {
      color: #1a1a1a;
      margin-top: 0;
      font-size: 20px;
      border-bottom: 2px solid #e5e7eb;
      padding-bottom: 10px;
    }
    .detail-row {
      display: flex;
      justify-content: space-between;
      padding: 12px 0;
      border-bottom: 1px solid #e5e7eb;
    }
    .detail-row:last-child {
      border-bottom: none;
    }
    .label {
      font-weight: 600;
      color: #666;
    }
    .value {
      color: #1a1a1a;
      font-weight: 500;
    }
    .manuscript-id {
      color: #6366f1;
      font-size: 24px;
      font-weight: 700;
    }
    .status-badge {
      background: #f59e0b;
      color: white;
      padding: 6px 16px;
      border-radius: 20px;
      font-weight: 600;
      display: inline-block;
    }
    .timeline {
      margin: 20px 0;
    }
    .timeline-item {
      padding: 15px 0;
      border-left: 3px solid #e5e7eb;
      padding-left: 30px;
      position: relative;
    }
    .timeline-item.completed {
      border-left-color: #10b981;
    }
    .timeline-item::before {
      content: '';
      width: 16px;
      height: 16px;
      background: white;
      border: 3px solid #e5e7eb;
      border-radius: 50%;
      position: absolute;
      left: -10px;
      top: 18px;
    }
    .timeline-item.completed::before {
      background: #10b981;
      border-color: #10b981;
    }
    .timeline-item h4 {
      margin: 0 0 5px 0;
      color: #1a1a1a;
    }
    .timeline-item p {
      margin: 0;
      color: #666;
      font-size: 14px;
    }
    .footer {
      text-align: center;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #e5e7eb;
      color: #666;
      font-size: 14px;
    }
    .checkmark {
      color: #10b981;
      font-weight: bold;
    }
    @media print {
      body {
        padding: 20px;
      }
      .no-print {
        display: none;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>📄 Manuscript Submission Receipt</h1>
    <p>${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
  </div>

  <div class="section">
    <h2>Manuscript Details</h2>
    <div class="detail-row">
      <span class="label">Manuscript ID:</span>
      <span class="manuscript-id">#${manuscriptData.id}</span>
    </div>
    <div class="detail-row">
      <span class="label">Title:</span>
      <span class="value">${manuscriptData.title}</span>
    </div>
    <div class="detail-row">
      <span class="label">Journal:</span>
      <span class="value">${manuscriptData.journal}</span>
    </div>
    <div class="detail-row">
      <span class="label">Number of Authors:</span>
      <span class="value">${manuscriptData.authorsCount}</span>
    </div>
    <div class="detail-row">
      <span class="label">Status:</span>
      <span class="status-badge">⏱ Pending Review</span>
    </div>
  </div>

  <div class="section">
    <h2>Review Process Timeline</h2>
    <div class="timeline">
      <div class="timeline-item completed">
        <h4><span class="checkmark">✓</span> Submission Received</h4>
        <p>Your manuscript has been successfully submitted</p>
      </div>
      <div class="timeline-item">
        <h4>2. Initial Review</h4>
        <p>Our editorial team will review your submission (1-2 weeks)</p>
      </div>
      <div class="timeline-item">
        <h4>3. Peer Review</h4>
        <p>Expert reviewers will assess your research (4-6 weeks)</p>
      </div>
      <div class="timeline-item">
        <h4>4. Decision</h4>
        <p>You'll receive feedback and our publication decision</p>
      </div>
    </div>
  </div>

  <div class="section">
    <h2>Important Information</h2>
    <p>✉️ A confirmation email has been sent to all authors with detailed submission information.</p>
    <p>🔍 You can track your submission status using the manuscript ID: <strong>#${manuscriptData.id}</strong></p>
    <p>⏰ Please allow 1-2 weeks for initial review by our editorial team.</p>
    <p>📧 You will be notified at each stage of the review process.</p>
  </div>

  <div class="section">
    <h2>Contact Information</h2>
    <p><strong>For questions about your submission:</strong></p>
    <p>📧 Email: editorial@universalpublishers.com</p>
    <p>📞 Phone: +1 (555) 123-4567</p>
    <p>🌐 Website: www.universalpublishers.com</p>
  </div>

  <div class="footer">
    <p>© ${new Date().getFullYear()} Wissen Publication Group. All rights reserved.</p>
    <p>This is an automated receipt. Please keep it for your records.</p>
  </div>

  <script>
    window.onload = function() {
      window.print();
    };
  </script>
</body>
</html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  if (!manuscriptData) {
    return (
      <>
        <Header />
        <div className="success-page">
          <div className="container">
            <div className="loading-state">
              <i className="pi pi-spin pi-spinner" style={{ fontSize: '3rem' }}></i>
              <p>Loading...</p>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="success-page">
        <div className="container">
          <div className="success-content">
            {/* Success Icon */}
            <div className="success-icon-wrapper">
              <div className="success-icon">
                <i className="pi pi-check"></i>
              </div>
              <div className="success-pulse"></div>
            </div>

            {/* Success Message */}
            <h1 className="success-title">Manuscript Submitted Successfully!</h1>
            <p className="success-subtitle">
              Your research paper has been received and is now under review
            </p>

            {/* Manuscript Details Card */}
            <div className="manuscript-details-card">
              <div className="detail-row">
                <span className="detail-label">Manuscript ID:</span>
                <span className="detail-value manuscript-id">#{manuscriptData.id}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Title:</span>
                <span className="detail-value">{manuscriptData.title}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Journal:</span>
                <span className="detail-value">{manuscriptData.journal}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Number of Authors:</span>
                <span className="detail-value">{manuscriptData.authorsCount}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Status:</span>
                <span className="status-badge">
                  <i className="pi pi-clock"></i> Pending Review
                </span>
              </div>
            </div>

            {/* Timeline */}
            <div className="submission-timeline">
              <h3>What Happens Next?</h3>
              <div className="timeline">
                <div className="timeline-item completed">
                  <div className="timeline-marker">
                    <i className="pi pi-check"></i>
                  </div>
                  <div className="timeline-content">
                    <h4>Submission Received</h4>
                    <p>Your manuscript has been successfully submitted</p>
                  </div>
                </div>
                <div className="timeline-item">
                  <div className="timeline-marker">
                    <span>2</span>
                  </div>
                  <div className="timeline-content">
                    <h4>Initial Review</h4>
                    <p>Our editorial team will review your submission (1-2 weeks)</p>
                  </div>
                </div>
                <div className="timeline-item">
                  <div className="timeline-marker">
                    <span>3</span>
                  </div>
                  <div className="timeline-content">
                    <h4>Peer Review</h4>
                    <p>Expert reviewers will assess your research (4-6 weeks)</p>
                  </div>
                </div>
                <div className="timeline-item">
                  <div className="timeline-marker">
                    <span>4</span>
                  </div>
                  <div className="timeline-content">
                    <h4>Decision</h4>
                    <p>You'll receive feedback and our publication decision</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Email Confirmation */}
            <div className="email-confirmation">
              <i className="pi pi-envelope"></i>
              <p>
                A confirmation email has been sent to all authors with detailed submission information 
                and tracking instructions.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="action-buttons">
              <Button
                label="View All Articles"
                icon="pi pi-list"
                className="p-button-outlined p-button-secondary"
                onClick={handleViewArticles}
                size="large"
              />
              <Button
                label="Submit Another Manuscript"
                icon="pi pi-plus"
                className="p-button-outlined p-button-info"
                onClick={handleSubmitAnother}
                size="large"
              />
              <Button
                label="Go to Homepage"
                icon="pi pi-home"
                className="p-button-success home-button"
                onClick={handleGoToHome}
                size="large"
              />
            </div>

            {/* Auto Redirect Notice */}
            {countdown > 0 && (
              <div className="redirect-notice">
                <i className="pi pi-info-circle"></i>
                <span>Redirecting to homepage in {countdown} seconds...</span>
              </div>
            )}

            {/* Download Options */}
            <div className="download-section">
              <h4>Download Submission Receipt</h4>
              <div className="download-buttons">
                <Button
                  label="Download Receipt"
                  icon="pi pi-file-pdf"
                  className="p-button-sm p-button-text"
                  onClick={handleDownloadPDF}
                />
                <Button
                  label="Print Receipt"
                  icon="pi pi-print"
                  className="p-button-sm p-button-text"
                  onClick={handlePrintReceipt}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default function SubmissionSuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SubmissionSuccessContent />
    </Suspense>
  );
}
