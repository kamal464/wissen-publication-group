'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Breadcrumb from '@/components/Breadcrumb';
import { Card } from 'primereact/card';

export default function AboutPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const imagesPerView = 4;
  
  // Indexing images from /images/indexing folder
  const indexingImages = [
    { id: 1, src: '/images/indexing/a232a457-69ee-4f16-8522-14046968acf5.jpg', alt: 'Indexing Partner 1' },
    { id: 2, src: '/images/indexing/a62a7b3f-0a8b-4b9c-8114-88b5c8fffda1.jpg', alt: 'Indexing Partner 2' },
    { id: 3, src: '/images/indexing/6d58cda7-58ed-4078-88ca-9d53bb698c31.jpg', alt: 'Indexing Partner 3' },
    { id: 4, src: '/images/indexing/7457b4eb-e178-42a3-af15-29af1d7386bb.jpg', alt: 'Indexing Partner 4' },
    { id: 5, src: '/images/indexing/12f38938-1ebd-4b41-89fd-9bd241ba2632.jpg', alt: 'Indexing Partner 5' },
    { id: 6, src: '/images/indexing/35b8ad54-8132-4af5-864b-270ea801f204.jpg', alt: 'Indexing Partner 6' },
    { id: 7, src: '/images/indexing/ba10581d-5e2a-44b5-b72b-c89c2ab7e0a3.jpg', alt: 'Indexing Partner 7' },
    { id: 8, src: '/images/indexing/9ff8733e-4f3c-495e-9ccd-e0a2fdd90ed6.jpg', alt: 'Indexing Partner 8' },
    { id: 9, src: '/images/indexing/0535f555-dcc1-4a9d-89ff-d2c405e881a3.jpg', alt: 'Indexing Partner 9' },
    { id: 10, src: '/images/indexing/c27f175c-904f-4e60-b429-df4c35b19267.jpg', alt: 'Indexing Partner 10' },
    { id: 11, src: '/images/indexing/8e62c5c6-5a5f-4946-a768-4cb376900eb4.jpg', alt: 'Indexing Partner 11' },
    { id: 12, src: '/images/indexing/de443c68-124f-40a0-9f3b-ead9cfb100c0.jpg', alt: 'Indexing Partner 12' }
  ];
  
  const imagePlaceholders = indexingImages;

  // Duplicate images multiple times for seamless infinite scroll
  // Add enough duplicates to ensure smooth looping
  const extendedImages = [...imagePlaceholders, ...imagePlaceholders, ...imagePlaceholders];
  const totalOriginalImages = imagePlaceholders.length;

  // Auto-scroll - move one image at a time for smooth continuous scrolling
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const nextIndex = prevIndex + 1;
        // When we reach the end of first set, continue seamlessly
        // Since we duplicated images, we can loop infinitely
        if (nextIndex >= totalOriginalImages) {
          // Reset to 0 for seamless loop (images are duplicated so it looks continuous)
          return 0;
        }
        return nextIndex;
      });
    }, 2000); // Change every 2 seconds

    return () => clearInterval(interval);
  }, [totalOriginalImages]);

  const handlePrevious = () => {
    setCurrentIndex((prevIndex) => {
      if (prevIndex === 0) {
        return totalOriginalImages - 1;
      }
      return prevIndex - 1;
    });
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => {
      const nextIndex = prevIndex + 1;
      if (nextIndex >= totalOriginalImages) {
        return 0;
      }
      return nextIndex;
    });
  };
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
                Advancing knowledge through excellence in academic publishing
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

          {/* Image Carousel */}
          <section className="stats-section">
            <h2 className="section-title">Indexing Services</h2>
            <div className="image-carousel-container" style={{
              position: 'relative',
              width: '100%',
              maxWidth: '1200px',
              margin: '0 auto',
              padding: '1rem 0',
              overflow: 'visible'
            }}>
              {/* Navigation Arrow - Left */}
              <button
                type="button"
                onClick={handlePrevious}
                className="carousel-arrow carousel-arrow-left"
                style={{
                  position: 'absolute',
                  left: '5px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '35px',
                  height: '35px',
                  borderRadius: '50%',
                  border: '2px solid #3b82f6',
                  backgroundColor: 'white',
                  color: '#3b82f6',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px',
                  zIndex: 20,
                  transition: 'all 0.3s ease',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                  visibility: 'visible',
                  opacity: 1
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#3b82f6';
                  e.currentTarget.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'white';
                  e.currentTarget.style.color = '#3b82f6';
                }}
                aria-label="Previous images"
              >
                <i className="pi pi-chevron-left"></i>
              </button>

              {/* Navigation Arrow - Right */}
              <button
                type="button"
                onClick={handleNext}
                className="carousel-arrow carousel-arrow-right"
                style={{
                  position: 'absolute',
                  right: '5px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '35px',
                  height: '35px',
                  borderRadius: '50%',
                  border: '2px solid #3b82f6',
                  backgroundColor: 'white',
                  color: '#3b82f6',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px',
                  zIndex: 20,
                  transition: 'all 0.3s ease',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                  visibility: 'visible',
                  opacity: 1
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#3b82f6';
                  e.currentTarget.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'white';
                  e.currentTarget.style.color = '#3b82f6';
                }}
                aria-label="Next images"
              >
                <i className="pi pi-chevron-right"></i>
              </button>

              <div className="image-carousel-wrapper" style={{
                position: 'relative',
                width: '100%',
                overflow: 'hidden',
                padding: '0.5rem 45px'
              }}>
                <div className="carousel-track" style={{
                  display: 'flex',
                  gap: '10px',
                  transform: `translateX(calc(-${currentIndex} * ((100% - 90px) / ${imagesPerView} + 10px)))`,
                  transition: 'transform 0.6s ease-in-out'
                }}>
                  {/* Render all images in a continuous row - duplicate enough for seamless loop */}
                  {extendedImages.slice(0, totalOriginalImages + imagesPerView).map((image, index) => {
                    // Use modulo to get the correct image from original set for seamless loop
                    const imageIndex = index % totalOriginalImages;
                    const actualImage = imagePlaceholders[imageIndex];
                    return (
                      <div
                        key={`${actualImage.id}-${index}`}
                        className="carousel-image-item"
                        style={{
                          flex: '0 0 calc(25% - 7.5px)',
                          minWidth: 'calc(25% - 7.5px)',
                          width: 'calc(25% - 7.5px)',
                          backgroundColor: '#f8f9fa',
                          borderRadius: '8px',
                          overflow: 'hidden',
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                          transition: 'transform 0.3s ease',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          padding: '12px'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'scale(1.05)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'scale(1)';
                        }}
                      >
                        <div style={{
                          width: '100%',
                          height: '150px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: '#ffffff',
                          borderRadius: '4px',
                          padding: '8px'
                        }}>
                          <img
                            src={actualImage.src}
                            alt={actualImage.alt}
                            style={{
                              maxWidth: '100%',
                              maxHeight: '100%',
                              width: 'auto',
                              height: 'auto',
                              objectFit: 'contain',
                              objectPosition: 'center',
                              display: 'block'
                            }}
                            onError={(e) => {
                              // Fallback to placeholder if image fails to load
                              (e.target as HTMLImageElement).src = '/wissen-logo.jpeg';
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          {/* Follow Us / Social */}
          <section className="about-social-section">
            <Card className="about-social-card">
              <h2>Follow Us</h2>
              <p className="about-social-lead">Connect with Wissen Publication Group</p>
              <div className="about-social-links">
                <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                  <i className="pi pi-facebook"></i>
                </a>
                <a href="https://x.com/wissen93634" target="_blank" rel="noopener noreferrer" aria-label="X (Twitter)">
                  <i className="pi pi-twitter"></i>
                </a>
                <a href="https://www.linkedin.com/in/wissen-publication-group-9432b33aa/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                  <i className="pi pi-linkedin"></i>
                </a>
              </div>
            </Card>
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
