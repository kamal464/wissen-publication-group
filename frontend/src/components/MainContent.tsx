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
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-sm font-semibold text-blue-600 uppercase tracking-wide">For Researchers</span>
            <h2 className="text-4xl font-bold text-gray-800 mb-4 mt-2">
              Publish With Us
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Join thousands of researchers who trust Wissen Publication Group for their scholarly publications.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {forAuthors.map((item, index) => (
              <div 
                key={index}
                className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 hover:shadow-lg transition-shadow duration-300"
              >
                <div className="flex items-start mb-4">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-blue-600 text-white">
                    <i className={`${item.icon} text-2xl`}></i>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">{item.title}</h3>
                <p className="text-gray-600 mb-4">{item.description}</p>
                <Link href={item.link}>
                  <Button 
                    label={item.cta}
                    className="p-button-text p-button-sm"
                    icon="pi pi-arrow-right"
                    iconPos="right"
                  />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Us Teaser Section */}
      <section className="py-16 bg-gradient-to-br from-blue-900 to-indigo-900 text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-4">
                About Wissen Publication Group
              </h2>
              <p className="text-lg text-blue-100 mb-6">
                Since 1998, we've been advancing knowledge through excellence in academic publishing. 
                Our commitment to scholarly research and academic excellence has made us a trusted 
                platform for researchers, academics, and institutions worldwide.
              </p>
              <div className="grid grid-cols-2 gap-4 mb-6">
                {aboutHighlights.map((highlight, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <i className={`${highlight.icon} text-green-400`}></i>
                    <span className="text-sm">{highlight.text}</span>
                  </div>
                ))}
              </div>
              <Link href="/about">
                <Button 
                  label="Learn More About Us"
                  className="p-button-outlined p-button-secondary"
                  icon="pi pi-arrow-right"
                  iconPos="right"
                />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center">
                <div className="text-4xl font-bold text-blue-300 mb-2">25+</div>
                <div className="text-sm text-blue-100">Years of Excellence</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center">
                <div className="text-4xl font-bold text-blue-300 mb-2">50+</div>
                <div className="text-sm text-blue-100">Academic Journals</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center">
                <div className="text-4xl font-bold text-blue-300 mb-2">100+</div>
                <div className="text-sm text-blue-100">Countries Reached</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center">
                <div className="text-4xl font-bold text-blue-300 mb-2">10K+</div>
                <div className="text-sm text-blue-100">Published Articles</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Editorial Excellence Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <i className="pi pi-star text-5xl text-yellow-500 mb-4"></i>
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Editorial Excellence
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Our distinguished editorial board comprises leading experts from prestigious institutions worldwide, 
              ensuring rigorous peer review and maintaining the highest publication standards.
            </p>
            <div className="flex justify-center gap-4 flex-wrap">
              <Link href="/editorial-board">
                <Button 
                  label="View Editorial Board"
                  icon="pi pi-users"
                  className="p-button-lg"
                />
              </Link>
              <Link href="/contact">
                <Button 
                  label="Contact Us"
                  icon="pi pi-envelope"
                  className="p-button-outlined p-button-lg"
                />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-12 text-center text-white shadow-2xl">
            <h2 className="text-4xl font-bold mb-4">
              Ready to Share Your Research?
            </h2>
            <p className="text-xl mb-8 text-blue-100">
              Join our global community of researchers and publish your work with Wissen Publication Group today.
            </p>
            <div className="flex justify-center gap-4 flex-wrap">
              <Link href="/submit-manuscript">
                <Button 
                  label="Submit Manuscript"
                  icon="pi pi-upload"
                  className="p-button-lg p-button-warning"
                  severity="warning"
                />
              </Link>
              <Link href="/journals">
                <Button 
                  label="Browse Journals"
                  icon="pi pi-book"
                  className="p-button-lg p-button-outlined p-button-secondary"
                />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
