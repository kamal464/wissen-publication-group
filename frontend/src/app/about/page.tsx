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

          {/* History Timeline */}
          <section className="history-section">
            <h2 className="section-title">Our Journey</h2>
            <div className="timeline">
              <div className="timeline-item">
                <div className="timeline-marker"></div>
                <div className="timeline-content">
                  <h3>1998</h3>
                  <h4>Foundation</h4>
                  <p>
                    Wissen Publication Group was established with a vision to provide accessible 
                    academic publishing services to researchers worldwide.
                  </p>
                </div>
              </div>

              <div className="timeline-item">
                <div className="timeline-marker"></div>
                <div className="timeline-content">
                  <h3>2005</h3>
                  <h4>Digital Transformation</h4>
                  <p>
                    Launched our online platform, making research more accessible and 
                    streamlining the submission and review process.
                  </p>
                </div>
              </div>

              <div className="timeline-item">
                <div className="timeline-marker"></div>
                <div className="timeline-content">
                  <h3>2012</h3>
                  <h4>Open Access Initiative</h4>
                  <p>
                    Committed to open access publishing, removing financial barriers to 
                    research access for the global community.
                  </p>
                </div>
              </div>

              <div className="timeline-item">
                <div className="timeline-marker"></div>
                <div className="timeline-content">
                  <h3>2018</h3>
                  <h4>Global Expansion</h4>
                  <p>
                    Expanded our editorial board with international experts and established 
                    partnerships with institutions across 50+ countries.
                  </p>
                </div>
              </div>

              <div className="timeline-item">
                <div className="timeline-marker"></div>
                <div className="timeline-content">
                  <h3>2025</h3>
                  <h4>Innovation Hub</h4>
                  <p>
                    Launched advanced AI-assisted peer review tools and enhanced platform 
                    features to support researchers in the digital age.
                  </p>
                </div>
              </div>
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
