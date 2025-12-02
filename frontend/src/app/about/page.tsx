'use client';

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Breadcrumb from '@/components/Breadcrumb';
import { Card } from 'primereact/card';

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="about-page">
        <Breadcrumb 
          items={[
            { label: 'Home', href: '/' },
            { label: 'About Us', href: '/about' }
          ]}
        />

        <div className="container">
          {/* Hero Section */}
          <section className="about-hero">
            <div className="hero-content">
              <h1>About Wissen Publication Group</h1>
              <p className="lead">
                Advancing knowledge through excellence in academic publishing since 1998
              </p>
            </div>
          </section>

          {/* Mission Section */}
          <section className="mission-section">
            <Card className="mission-card">
              <div className="icon-wrapper">
                <i className="pi pi-star"></i>
              </div>
              <h2>Our Mission</h2>
              <p>
                Wissen Publication Group is committed to advancing scholarly research and academic excellence 
                by providing a premier platform for researchers, academics, and institutions worldwide. 
                We strive to facilitate the dissemination of high-quality research across diverse 
                disciplines through rigorous peer review and innovative publishing practices.
              </p>
            </Card>
          </section>

          {/* Vision & Values */}
          <section className="values-section">
            <h2 className="section-title">Our Vision & Values</h2>
            <div className="values-grid">
              <Card className="value-card">
                <div className="value-icon">
                  <i className="pi pi-eye"></i>
                </div>
                <h3>Vision</h3>
                <p>
                  To be the leading global platform for open-access academic publishing, 
                  fostering innovation and collaboration in research communities worldwide.
                </p>
              </Card>

              <Card className="value-card">
                <div className="value-icon">
                  <i className="pi pi-shield"></i>
                </div>
                <h3>Integrity</h3>
                <p>
                  We uphold the highest standards of academic integrity, ensuring ethical 
                  research practices and transparent peer review processes.
                </p>
              </Card>

              <Card className="value-card">
                <div className="value-icon">
                  <i className="pi pi-users"></i>
                </div>
                <h3>Collaboration</h3>
                <p>
                  We foster a collaborative environment that brings together researchers, 
                  reviewers, and editors to advance knowledge and innovation.
                </p>
              </Card>

              <Card className="value-card">
                <div className="value-icon">
                  <i className="pi pi-chart-line"></i>
                </div>
                <h3>Excellence</h3>
                <p>
                  We are committed to publishing only the highest quality research that 
                  meets rigorous academic standards and contributes to scientific progress.
                </p>
              </Card>

              <Card className="value-card">
                <div className="value-icon">
                  <i className="pi pi-globe"></i>
                </div>
                <h3>Accessibility</h3>
                <p>
                  We believe in making research accessible to everyone, promoting open access 
                  and removing barriers to knowledge dissemination.
                </p>
              </Card>

              <Card className="value-card">
                <div className="value-icon">
                  <i className="pi pi-sparkles"></i>
                </div>
                <h3>Innovation</h3>
                <p>
                  We embrace cutting-edge technology and innovative approaches to enhance 
                  the publishing experience and research impact.
                </p>
              </Card>
            </div>
          </section>

          {/* Research Excellence & Editorial Process */}
          <section className="excellence-section">
            <h2 className="section-title">Our Commitment to Research Excellence</h2>
            <div className="excellence-grid">
              <Card className="excellence-card">
                <div className="excellence-icon">
                  <i className="pi pi-check-circle"></i>
                </div>
                <h3>Rigorous Peer Review</h3>
                <p>
                  Every submission undergoes a comprehensive double-blind peer review process 
                  conducted by experts in the field. Our editorial board ensures that only 
                  high-quality, original research that meets international standards reaches publication.
                </p>
              </Card>

              <Card className="excellence-card">
                <div className="excellence-icon">
                  <i className="pi pi-users"></i>
                </div>
                <h3>Expert Editorial Board</h3>
                <p>
                  Our distinguished editorial board comprises leading researchers and academics 
                  from prestigious institutions worldwide. They bring decades of experience and 
                  expertise to ensure the highest quality of published research.
                </p>
              </Card>

              <Card className="excellence-card">
                <div className="excellence-icon">
                  <i className="pi pi-globe"></i>
                </div>
                <h3>Global Indexing & Visibility</h3>
                <p>
                  Our journals are indexed in major databases and repositories, ensuring maximum 
                  visibility and impact for your research. We help authors reach a global audience 
                  and increase citation potential.
                </p>
              </Card>

              <Card className="excellence-card">
                <div className="excellence-icon">
                  <i className="pi pi-clock"></i>
                </div>
                <h3>Efficient Publication Process</h3>
                <p>
                  We understand the importance of timely publication. Our streamlined editorial 
                  process ensures rapid review and publication while maintaining the highest 
                  quality standards.
                </p>
              </Card>

              <Card className="excellence-card">
                <div className="excellence-icon">
                  <i className="pi pi-shield"></i>
                </div>
                <h3>Ethical Publishing Standards</h3>
                <p>
                  We adhere strictly to international ethical guidelines for academic publishing, 
                  including COPE guidelines. We maintain transparency, prevent plagiarism, and 
                  ensure research integrity at every stage.
                </p>
              </Card>

              <Card className="excellence-card">
                <div className="excellence-icon">
                  <i className="pi pi-heart"></i>
                </div>
                <h3>Author Support Services</h3>
                <p>
                  We provide comprehensive support throughout the publication journey, from 
                  manuscript preparation to post-publication promotion. Our team assists authors 
                  with formatting, language editing, and maximizing research impact.
                </p>
              </Card>
            </div>
          </section>

          {/* Statistics */}
          <section className="stats-section">
            <h2 className="section-title">Our Impact</h2>
            <div className="stats-grid">
              <Card className="stat-card">
                <div className="stat-icon">
                  <i className="pi pi-file-edit"></i>
                </div>
                <div className="stat-number">15,000+</div>
                <div className="stat-label">Published Articles</div>
              </Card>

              <Card className="stat-card">
                <div className="stat-icon">
                  <i className="pi pi-book"></i>
                </div>
                <div className="stat-number">50+</div>
                <div className="stat-label">Active Journals</div>
              </Card>

              <Card className="stat-card">
                <div className="stat-icon">
                  <i className="pi pi-users"></i>
                </div>
                <div className="stat-number">120+</div>
                <div className="stat-label">Countries Reached</div>
              </Card>

              <Card className="stat-card">
                <div className="stat-icon">
                  <i className="pi pi-star"></i>
                </div>
                <div className="stat-number">95%</div>
                <div className="stat-label">Author Satisfaction</div>
              </Card>
            </div>
          </section>

          {/* Contact CTA */}
          <section className="cta-section">
            <Card className="cta-card">
              <h2>Join Our Community</h2>
              <p>
                Become part of our global network of researchers, authors, and academics 
                committed to advancing knowledge and innovation.
              </p>
              <div className="cta-buttons">
                <a href="/submit-manuscript" className="btn-primary">
                  <i className="pi pi-send"></i>
                  Submit Your Research
                </a>
                <a href="/contact" className="btn-secondary">
                  <i className="pi pi-envelope"></i>
                  Contact Us
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
