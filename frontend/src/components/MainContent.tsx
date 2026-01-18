import Link from 'next/link';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import JournalCovers from './JournalCovers';
import LatestNewsSection from './LatestNewsSection';

export default function MainContent() {
  const features = [
    {
      title: "Academic Journals",
      description: "Peer-reviewed publications across multiple disciplines indexed in renowned databases",
      icon: "pi pi-book",
      link: "/journals",
      stats: "50+ Journals"
    },
    {
      title: "Research Articles",
      description: "Access thousands of cutting-edge research papers and scholarly articles", 
      icon: "pi pi-file-edit",
      link: "/articles",
      stats: "10,000+ Articles"
    }
  ];

  const forAuthors = [
    {
      title: "Submit Your Manuscript",
      description: "Easy online submission process with instant confirmation",
      icon: "pi pi-upload",
      link: "/submit-manuscript",
      cta: "Submit Now"
    },
    {
      title: "Author Guidelines",
      description: "Comprehensive instructions for manuscript preparation and submission",
      icon: "pi pi-list",
      link: "/instructions",
      cta: "View Guidelines"
    },
    {
      title: "Editorial Board",
      description: "Meet our distinguished panel of editors and reviewers",
      icon: "pi pi-users",
      link: "/editorial-board",
      cta: "Meet the Team"
    }
  ];

  const aboutHighlights = [
    {
      icon: "pi pi-check-circle",
      text: "Rigorous peer review process"
    },
    {
      icon: "pi pi-bolt",
      text: "Fast publication turnaround"
    },
    {
      icon: "pi pi-globe",
      text: "Global reach and indexing"
    },
    {
      icon: "pi pi-shield",
      text: "Open access options available"
    }
  ];

  return (
    <>
      {/* Journal Covers Section */}
      <JournalCovers />

      {/* Latest News Section */}
      <LatestNewsSection />

      {/* For Authors Section */}
      <section className="py-8 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <span className="text-sm font-semibold uppercase tracking-wide" style={{ color: '#1558a7' }}>For Researchers</span>
            <h2 className="text-4xl font-bold text-gray-800 mb-4 mt-2">
              Publish With Us
            </h2>
            <p className="text-xl text-gray-600 max-w-6xl mx-auto text-center pl-40 whitespace-nowrap">
              Join thousands of researchers who trust Wissen Publication Group for their scholarly publications.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {forAuthors.map((item, index) => (
              <div 
                key={index}
                className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 hover:shadow-lg transition-shadow duration-300"
              >
                <div className="flex items-start mb-4">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg text-white" style={{ backgroundColor: '#1558a7' }}>
                    <i className={`${item.icon} text-2xl`}></i>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">{item.title}</h3>
                <p className="text-gray-600 mb-4">{item.description}</p>
                <Link href={item.link}>
                  <Button 
                    label={item.cta}
                    className="p-button-text p-button-sm custom-link-btn"
                    icon="pi pi-arrow-right"
                    iconPos="right"
                    style={{ color: '#1558a7' }}
                  />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Us Teaser Section */}
      <section className="py-8 text-white relative overflow-hidden" style={{ background: '#1558a7' }}>
        {/* Decorative background elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 rounded-full blur-3xl" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full blur-3xl" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <div className="inline-block">
                {/* <span className="text-sm font-semibold text-blue-300 uppercase tracking-wider px-4 py-2 bg-blue-500/20 rounded-full border border-blue-400/30">
                  About Us
                </span> */}
              </div>
              <h2 className="text-5xl font-bold mb-6 leading-tight" style={{ color: '#ffffff' }}>
                About Wissen Publication Group
              </h2>
              <p className="text-lg leading-relaxed mb-8" style={{ color: '#ffffff' }}>
                Since 1998, we've been advancing knowledge through excellence in academic publishing. 
                Our commitment to scholarly research and academic excellence has made us a trusted 
                platform for researchers, academics, and institutions worldwide.
              </p>
              <div className="grid grid-cols-2 gap-4 mb-8">
                {aboutHighlights.map((highlight, index) => (
                  <div key={index} className="flex items-center p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors duration-300">
                    <div className="flex-shrink-0 mr-3">
                      <i className={`${highlight.icon} text-xl text-green-400`}></i>
                    </div>
                    <span className="text-sm text-blue-100 font-medium">{highlight.text}</span>
                  </div>
                ))}
              </div>
              
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <Link href="/about" className="group bg-white/10 backdrop-blur-lg rounded-2xl p-10 text-center hover:bg-white/20 hover:shadow-2xl hover:shadow-blue-500/20 hover:scale-105 hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col items-center justify-center border border-white/20 hover:border-white/40 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <div className="mb-4">
                    <i className="pi pi-info-circle text-4xl text-blue-300 group-hover:text-blue-200 group-hover:scale-110 transition-all duration-300"></i>
                  </div>
                  <div className="text-xl font-bold text-white uppercase tracking-wider group-hover:text-blue-100 transition-colors duration-300">About</div>
                </div>
              </Link>
              
              <Link href="/journals" className="group bg-white/10 backdrop-blur-lg rounded-2xl p-10 text-center hover:bg-white/20 hover:shadow-2xl hover:shadow-blue-500/20 hover:scale-105 hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col items-center justify-center border border-white/20 hover:border-white/40 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <div className="mb-4">
                    <i className="pi pi-book text-4xl text-blue-300 group-hover:text-blue-200 group-hover:scale-110 transition-all duration-300"></i>
                  </div>
                  <div className="text-xl font-bold text-white uppercase tracking-wider group-hover:text-blue-100 transition-colors duration-300">Journals</div>
                </div>
              </Link>
              
              <Link href="/instructions" className="group bg-white/10 backdrop-blur-lg rounded-2xl p-10 text-center hover:bg-white/20 hover:shadow-2xl hover:shadow-blue-500/20 hover:scale-105 hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col items-center justify-center border border-white/20 hover:border-white/40 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <div className="mb-4">
                    <i className="pi pi-file-edit text-4xl text-blue-300 group-hover:text-blue-200 group-hover:scale-110 transition-all duration-300"></i>
                  </div>
                  <div className="text-xl font-bold text-white uppercase tracking-wider group-hover:text-blue-100 transition-colors duration-300">Guidelines</div>
                </div>
              </Link>
              
              <Link href="/contact" className="group bg-white/10 backdrop-blur-lg rounded-2xl p-10 text-center hover:bg-white/20 hover:shadow-2xl hover:shadow-blue-500/20 hover:scale-105 hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col items-center justify-center border border-white/20 hover:border-white/40 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <div className="mb-4">
                    <i className="pi pi-envelope text-4xl text-blue-300 group-hover:text-blue-200 group-hover:scale-110 transition-all duration-300"></i>
                  </div>
                  <div className="text-xl font-bold text-white uppercase tracking-wider group-hover:text-blue-100 transition-colors duration-300">Contact US</div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Editorial Excellence Section */}
      <section className="py-4 bg-gray-50">
        <div className="container mx-auto px-4 pl-48 md:pl-72 lg:pl-[200px] xl:pl-[400px] 2xl:pl-[600px]">
          <div className="max-w-4xl mx-auto text-center">
            <i className="pi pi-star text-5xl text-yellow-500 mb-4"></i>
            <h2 className="text-4xl font-bold text-gray-800 mb-4 text-center">
              Editorial Excellence
            </h2>
            <p className="text-xl text-gray-600 mb-8 text-center">
              Our distinguished editorial board comprises leading experts from prestigious institutions worldwide, 
              ensuring rigorous peer review and maintaining the highest publication standards.
            </p>
            <div className="flex justify-center items-center gap-4 flex-wrap">
              <Link href="/contact">
                <Button 
                  label="Contact Us"
                  icon="pi pi-envelope"
                  className="p-button-outlined p-button-lg contact-us-btn"
                  iconPos="left"
                />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        :global(.contact-us-btn .p-button-icon) {
          margin-right: 0.5rem;
        }
      `}</style>

      {/* Final CTA Section */}
      <section className="py-8 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="relative rounded-3xl p-12 md:p-16 text-center text-white shadow-2xl overflow-hidden cta-section-white-text" style={{ background: '#1558a7' }}>
            {/* Decorative background elements */}
            <div className="absolute inset-0 opacity-8">
              <div className="absolute top-0 left-0 w-96 h-96 rounded-full blur-3xl" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}></div>
              <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full blur-3xl" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-3xl" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}></div>
            </div>
            
            {/* Subtle grid pattern overlay */}
            <div className="absolute inset-0 opacity-[0.04]" style={{
              backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)',
              backgroundSize: '50px 50px'
            }}></div>
            
            {/* Content */}
            <div className="relative z-10 text-center">
              <div className="inline-block mb-4">
                <span className="text-sm font-semibold text-white uppercase tracking-wider px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full border border-white/30 shadow-lg" style={{ color: '#ffffff' }}>
                  Get Started
                </span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight text-white drop-shadow-lg text-center" style={{ color: '#ffffff', textAlign: 'center' }}>
                Ready to Share Your Research?
              </h2>
              <p className="text-lg md:text-xl mb-10 text-white max-w-2xl mx-auto leading-relaxed drop-shadow-md text-center" style={{ color: '#ffffff', textAlign: 'center', marginLeft: 'auto', marginRight: 'auto', display: 'block' }}>
                Join our global community of researchers and publish your work with Wissen Publication Group today. 
                Experience excellence in academic publishing.
              </p>
              <div className="flex flex-col sm:flex-row justify-center items-center gap-4 md:gap-6">
                <Link href="/submit-manuscript" className="group">
                  <Button 
                    label="Submit Manuscript"
                    icon="pi pi-upload"
                    className="p-button-lg p-button-warning shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105"
                    severity="warning"
                  />
                </Link>
                <Link href="/journals" className="group">
                  <Button 
                    label="Browse Journals"
                    icon="pi pi-book"
                    className="p-button-lg p-button-outlined border-2 border-white text-white hover:bg-white hover:text-indigo-600 transition-all duration-300 group-hover:scale-105 shadow-lg"
                    style={{ color: '#ffffff' }}
                  />
                </Link>
              </div>
              
              {/* Trust indicators */}
              <div className="mt-12 pt-8 border-t border-white/30 flex flex-wrap justify-center items-center gap-6 md:gap-8 text-sm">
                <div className="flex items-center gap-2 text-white/90" style={{ color: '#ffffff' }}>
                  <i className="pi pi-check-circle text-green-400 text-lg"></i>
                  <span className="font-medium" style={{ color: '#ffffff' }}>Peer Reviewed</span>
                </div>
                <div className="flex items-center gap-2 text-white/90" style={{ color: '#ffffff' }}>
                  <i className="pi pi-globe text-blue-300 text-lg"></i>
                  <span className="font-medium" style={{ color: '#ffffff' }}>Global Reach</span>
                </div>
                <div className="flex items-center gap-2 text-white/90" style={{ color: '#ffffff' }}>
                  <i className="pi pi-clock text-yellow-300 text-lg"></i>
                  <span className="font-medium" style={{ color: '#ffffff' }}>Fast Publication</span>
                </div>
                <div className="flex items-center gap-2 text-white/90" style={{ color: '#ffffff' }}>
                  <i className="pi pi-shield text-purple-300 text-lg"></i>
                  <span className="font-medium" style={{ color: '#ffffff' }}>Open Access</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        /* Force white text in CTA section - overrides global p tag styles from base/_base.scss */
        .cta-section-white-text,
        .cta-section-white-text *,
        .cta-section-white-text p,
        .cta-section-white-text h2,
        .cta-section-white-text span,
        .cta-section-white-text div {
          color: #ffffff !important;
        }
        
        /* Force center alignment - overrides any global text alignment */
        .cta-section-white-text,
        .cta-section-white-text h2,
        .cta-section-white-text p,
        .cta-section-white-text .text-center {
          text-align: center !important;
        }
        
        /* Specifically target the paragraph to ensure it's centered */
        .cta-section-white-text p {
          text-align: center !important;
          margin-left: auto !important;
          margin-right: auto !important;
          display: block !important;
          width: 100% !important;
          max-width: 42rem !important; /* max-w-2xl equivalent */
        }
        
        /* Ensure colored icons maintain their colors */
        .cta-section-white-text i[class*="text-green"],
        .cta-section-white-text i[class*="text-blue"],
        .cta-section-white-text i[class*="text-yellow"],
        .cta-section-white-text i[class*="text-purple"] {
          color: inherit !important;
        }
        
        /* Force white text on PrimeReact buttons in CTA section */
        .cta-section-white-text .p-button,
        .cta-section-white-text .p-button .p-button-label,
        .cta-section-white-text .p-button-outlined,
        .cta-section-white-text .p-button-outlined .p-button-label {
          color: #ffffff !important;
        }
        
        /* Only change button text color on hover, not the base color */
        .cta-section-white-text .p-button-outlined:hover:not(:focus) {
          background-color: rgba(255, 255, 255, 0.1) !important;
        }
        
        .cta-section-white-text .p-button-outlined:hover:not(:focus) .p-button-label {
          color: #ffffff !important;
        }
      `}</style>
    </>
  );
}
