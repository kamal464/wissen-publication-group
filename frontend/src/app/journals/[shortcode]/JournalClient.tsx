'use client';
// Fixed author display for in-press articles
import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { journalService } from '@/services/api';
import { adminAPI } from '@/lib/api';
import { getFileUrl } from '@/lib/apiConfig';

export default function JournalDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const shortcode = params?.shortcode as string;
  
  const [journal, setJournal] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [articles, setArticles] = useState<any[]>([]);
  const [activeSection, setActiveSection] = useState('home');
  const [sectionContent, setSectionContent] = useState<string>('');
  const [boardMembers, setBoardMembers] = useState<any[]>([]);
  const [archiveIssues, setArchiveIssues] = useState<Map<number, any[]>>(new Map());
  const [contentLoading, setContentLoading] = useState(false);
  const [expandedAbstracts, setExpandedAbstracts] = useState<Set<number>>(new Set());
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Fetch journal data
  useEffect(() => {
    const fetchJournal = async () => {
      if (!shortcode) return;

      try {
        setLoading(true);
          const shortcodeResponse = await (journalService as any).getByShortcode(shortcode);
        const journalData = (shortcodeResponse?.data || shortcodeResponse) as any;
        
        if (journalData && journalData.id) {
          // Fetch full details
          const fullResponse = await adminAPI.getJournal(journalData.id) as any;
          const fullJournal = fullResponse?.data || fullResponse;
          setJournal({ ...journalData, ...fullJournal, shortcode });
        }
          } catch (err) {
        setError('Failed to load journal');
      } finally {
        setLoading(false);
      }
    };

    fetchJournal();
  }, [shortcode]);

  // Handle section changes from URL
  useEffect(() => {
    const section = searchParams.get('section') || 'home';
    setActiveSection(section);
  }, [searchParams]);

  // Load section content
  const loadSectionContent = useCallback(async (section: string) => {
    if (!journal || journal.id <= 0) return;

    try {
      setContentLoading(true);
      setError(null);
      
      switch (section) {
        case 'home':
          // Home section - no articles needed
          setArticles([]);
          setSectionContent(journal.homePageContent || journal.journalDescription || journal.description || '');
          break;

        case 'aims-scope':
          setSectionContent(journal.aimsScope || 'Aims and Scope content will be available soon.');
          setArticles([]);
          break;

        case 'editorial-board':
          try {
            const membersResponse = await adminAPI.getBoardMembers(journal.id);
            const members = (membersResponse.data as any[]) || [];
            console.log('Board members loaded:', members);
            // Log each member's image fields for debugging
            members.forEach((member: any) => {
              console.log(`Member ${member.name} image fields:`, {
                imageUrl: member.imageUrl,
                profileUrl: member.profileUrl,
                image: member.image,
                photo: member.photo,
                photoUrl: member.photoUrl,
                allFields: Object.keys(member)
              });
            });
            setBoardMembers(members);
            setSectionContent(journal.editorialBoard || '');
          } catch (err) {
            console.error('Error loading board members:', err);
            setBoardMembers([]);
          }
          setArticles([]);
          break;

        case 'in-press':
          try {
            const articlesResponse = await adminAPI.getArticles({ 
              journalId: journal.id, 
              status: 'INPRESS',
              showInInpressCards: 'true'
            });
            setArticles((articlesResponse.data as any[]) || []);
            setSectionContent(journal.articlesInPress || '');
          } catch (err) {
            console.error('Error loading in-press articles:', err);
            setArticles([]);
          }
          break;

        case 'current-issue':
          try {
            const articlesResponse = await adminAPI.getArticles({ 
              journalId: journal.id, 
              status: 'CURRENT_ISSUE' 
            });
            setArticles((articlesResponse.data as any[]) || []);
            setSectionContent(journal.currentIssueContent || '');
          } catch (err) {
            console.error('Error loading current issue:', err);
            setArticles([]);
          }
          break;

        case 'archive':
          try {
            // Get URL parameters for filtering
            const volumeParam = searchParams?.get('volume');
            const issueParam = searchParams?.get('issue');
            const yearParam = searchParams?.get('year');

            const articlesResponse = await adminAPI.getArticles({ 
              journalId: journal.id,
              limit: 1000
            });
            const allArticles = (articlesResponse.data as any[]) || [];
            let filteredArticles = allArticles.filter((article: any) => {
              const hasVolume = article.volumeNo && String(article.volumeNo).trim() !== '';
              const hasIssue = article.issueNo && String(article.issueNo).trim() !== '';
              const hasYear = (article.year && String(article.year).trim() !== '') ||
                             (article.inPressYear && String(article.inPressYear).trim() !== '') ||
                             article.publishedAt || article.acceptedAt;
              return hasVolume && hasIssue && hasYear;
            });

            // If specific volume/issue/year are requested, filter articles
            if (volumeParam && issueParam && yearParam) {
              filteredArticles = filteredArticles.filter((article: any) => {
                let articleYear: number | null = null;
                if (article.year) {
                  articleYear = parseInt(String(article.year));
                } else if (article.inPressYear) {
                  articleYear = parseInt(String(article.inPressYear));
                } else if (article.publishedAt) {
                  articleYear = new Date(article.publishedAt).getFullYear();
                } else if (article.acceptedAt) {
                  articleYear = new Date(article.acceptedAt).getFullYear();
                }

                const volumeMatch = String(article.volumeNo) === String(volumeParam);
                const issueMatch = String(article.issueNo) === String(issueParam);
                const yearMatch = articleYear === parseInt(String(yearParam));

                return volumeMatch && issueMatch && yearMatch;
              });

              // Set the filtered articles to display
              setArticles(filteredArticles);
              setArchiveIssues(new Map()); // Clear archive structure when showing specific issue
            } else {
              // Organize by year for archive structure view
              const issuesByYear = new Map<number, any[]>();
              filteredArticles.forEach((article: any) => {
                let year: number;
                if (article.year) {
                  year = parseInt(String(article.year));
                } else if (article.inPressYear) {
                  year = parseInt(String(article.inPressYear));
                } else if (article.publishedAt) {
                  year = new Date(article.publishedAt).getFullYear();
                } else if (article.acceptedAt) {
                  year = new Date(article.acceptedAt).getFullYear();
                } else {
                  return;
                }
                
                if (!issuesByYear.has(year)) {
                  issuesByYear.set(year, []);
                }
                issuesByYear.get(year)!.push(article);
              });

              setArchiveIssues(issuesByYear);
              setArticles([]); // Clear articles when showing archive structure
            }

            setSectionContent(journal.archiveContent || '');
          } catch (err) {
            console.error('Error loading archive:', err);
            setArticles([]);
          }
          break;

        case 'guidelines':
          setSectionContent(journal.guidelines || 'Journal Guidelines will be available soon.');
          setArticles([]);
          break;

        default:
          setSectionContent('');
          setArticles([]);
      }
    } catch (err) {
      console.error('Error loading section:', err);
      setError('Failed to load section content. Please try again.');
    } finally {
      setContentLoading(false);
    }
  }, [journal, searchParams]);

  // Load content when section, journal, or URL params change
  useEffect(() => {
        if (journal && journal.id > 0) {
      loadSectionContent(activeSection);
        }
  }, [activeSection, journal, loadSectionContent, searchParams]);

  // Close menu when clicking outside or pressing Escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // Prevent body scroll when sidebar is open
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  // Inject responsive styles
  useEffect(() => {
    if (typeof document === 'undefined') return;
    
    const styleId = 'journal-responsive-styles';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      @keyframes fadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }
      
      .journal-sidebar {
        -webkit-overflow-scrolling: touch;
      }
      
      /* Desktop Navigation - Hide on mobile */
      @media (max-width: 768px) {
        .journal-desktop-nav {
          display: none !important;
        }
        
        .journal-submit-btn-desktop {
          display: none !important;
        }
        
        .journal-hamburger-btn {
          display: flex !important;
        }
      }
      
      /* Mobile - Hide hamburger on desktop */
      @media (min-width: 769px) {
        .journal-hamburger-btn {
          display: none !important;
        }
        
        .journal-desktop-nav {
          display: flex !important;
        }
        
        .journal-submit-btn-desktop {
          display: block !important;
        }
        
        .journal-sidebar {
          display: none !important;
        }
      }
      
      @media (max-width: 768px) {
        .journal-sidebar {
          width: 100% !important;
          max-width: 100% !important;
        }
        .journal-main-content {
          padding: 24px 16px !important;
        }
        
        .journal-content-grid {
          grid-template-columns: 1fr !important;
          gap: 24px !important;
        }
        
        .journal-left-column {
          width: 100% !important;
          max-width: 100% !important;
          overflow-x: hidden !important;
        }
        
        .journal-introduction-card {
          margin-left: 0 !important;
          width: 100% !important;
          max-width: 100% !important;
          box-sizing: border-box !important;
          overflow-x: hidden !important;
        }
        
        .journal-editorial-board-card {
          margin-left: 0 !important;
          width: 100% !important;
          max-width: 100% !important;
          box-sizing: border-box !important;
          overflow-x: hidden !important;
          padding: 24px 16px !important;
        }
        
        .journal-editorial-board-card .editors-grid {
          grid-template-columns: 1fr !important;
          gap: 1.5rem !important;
        }
        
        .journal-editorial-board-card .editor-content {
          flex-direction: column !important;
          align-items: center !important;
          text-align: center !important;
          gap: 1rem !important;
        }
        
        .journal-editorial-board-card .editor-avatar {
          margin: 0 auto 1rem auto !important;
        }
      }
      
      @media (min-width: 769px) {
        .journal-introduction-card {
          margin-left: -20px !important;
        }
        
        .journal-introduction-card * {
          max-width: 100% !important;
          word-wrap: break-word !important;
          overflow-wrap: break-word !important;
          box-sizing: border-box !important;
        }
        
        .journal-introduction-card h2 {
          word-wrap: break-word !important;
          overflow-wrap: break-word !important;
        }
        
        .journal-editorial-board-card {
          margin-left: 98px !important;
        }
        
        .journal-right-column {
          width: 100% !important;
          align-items: stretch !important;
        }
        
        .journal-cover-card,
        .journal-useful-links-card {
          margin-left: 0 !important;
          max-width: 100% !important;
          width: 100% !important;
          box-sizing: border-box !important;
        }
        
        .journal-cover-card button {
          width: 100% !important;
          padding: 12px 24px !important;
        }
      }
      
      @media (max-width: 640px) {
        .journal-main-content {
          padding: 20px 12px !important;
        }
        
        .journal-content-grid {
          gap: 20px !important;
        }
        
        .journal-introduction-card {
          padding: 24px 16px !important;
        }
        
        .journal-editorial-board-card {
          padding: 20px 12px !important;
        }
        
        .journal-editorial-board-card .editors-grid {
          gap: 1rem !important;
        }
        
        .journal-cover-card {
          padding: 12px !important;
        }
        
        .journal-useful-links-card {
          padding: 20px 16px !important;
        }
        
        .journal-cover-card button {
          font-size: 14px !important;
          padding: 10px 20px !important;
        }
      }
    `;
    document.head.appendChild(style);

    return () => {
      const existingStyle = document.getElementById(styleId);
      if (existingStyle) {
        existingStyle.remove();
      }
    };
  }, []);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F5F7FB'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            display: 'inline-block',
            width: '48px',
            height: '48px',
            border: '4px solid #E5E9F2',
            borderTopColor: '#1E5DA8',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <p style={{ marginTop: '16px', color: '#6B7280' }}>Loading journal...</p>
          <style jsx>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  if (error && !journal) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F5F7FB'
      }}>
        <div style={{
          textAlign: 'center',
          padding: '40px',
          backgroundColor: '#FFFFFF',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
          maxWidth: '500px'
        }}>
          <h1 style={{
            fontSize: '24px',
            fontWeight: '700',
            color: '#DC2626',
            marginBottom: '16px'
          }}>Journal Not Found</h1>
          <p style={{
            fontSize: '15px',
            color: '#6B7280',
            marginBottom: '24px'
          }}>{error || 'The journal you are looking for does not exist.'}</p>
          <Link href="/journals" style={{
            display: 'inline-block',
            backgroundColor: '#1E5DA8',
            color: '#FFFFFF',
            padding: '10px 24px',
            borderRadius: '8px',
            textDecoration: 'none',
            fontSize: '15px',
            fontWeight: '600',
            transition: 'all 0.2s'
          }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#164a8a'}
             onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1E5DA8'}>
            Back to Journals
          </Link>
        </div>
      </div>
    );
  }
  
  if (!journal) {
    return null;
  }

  const getImageUrl = (imagePath: string | undefined | null) => {
    // Guard against invalid values that would generate /uploads/undefined
    if (
      !imagePath ||
      imagePath === 'undefined' ||
      imagePath === 'null' ||
      typeof imagePath !== 'string' ||
      imagePath.trim() === '' ||
      imagePath.includes('/undefined') ||
      imagePath.includes('/null')
    ) {
      return null;
    }
    
    // If it's already a data URI, return as is
    if (imagePath.startsWith('data:')) {
      return imagePath;
    }
    
    // If it's already a full URL, return as is
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    
    // Otherwise, use getFileUrl to construct the full URL
    // Ensure the path starts with /uploads/ for proper server routing
    const normalizedPath = imagePath.startsWith('/uploads/') ? imagePath : `/uploads/${imagePath.replace(/^\/?uploads\//, '')}`;
    return getFileUrl(normalizedPath);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F5F7FB' }}>
      {/* NAVBAR - White background with exact menu items */}
      <nav style={{
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid #E5E9F2',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '70px'
        }}>
          {/* Logo */}
          <Link href="/" style={{
            display: 'flex',
            alignItems: 'center',
            textDecoration: 'none',
            outline: 'none',
            border: 'none',
            boxShadow: 'none'
          }} onFocus={(e) => {
            e.currentTarget.style.outline = 'none';
            e.currentTarget.style.border = 'none';
            e.currentTarget.style.boxShadow = 'none';
          }}>
            <img 
              src="/wissen-logo.png" 
              alt="Wissen Publication Group" 
              style={{
                height: '190px',
                width: 'auto',
                objectFit: 'contain',
                paddingTop: '19px'
              }}
            />
          </Link>

          {/* Desktop Navigation - Visible on desktop only */}
          <nav className="journal-desktop-nav" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '32px'
          }}>
            <Link 
              href={`/journals/${shortcode}`}
              style={{
                color: activeSection === 'home' ? '#1E5DA8' : '#000000',
                textDecoration: 'none',
                fontSize: '15px',
                fontWeight: activeSection === 'home' ? '600' : '500',
                transition: 'all 0.2s',
                outline: 'none',
                borderBottom: activeSection === 'home' ? '2px solid #1E5DA8' : '2px solid transparent',
                paddingBottom: '4px'
              }}
              onMouseEnter={(e) => {
                if (activeSection !== 'home') {
                  e.currentTarget.style.color = '#1E5DA8';
                }
              }}
              onMouseLeave={(e) => {
                if (activeSection !== 'home') {
                  e.currentTarget.style.color = '#000000';
                }
              }}
            >
              Journal Home
            </Link>
            <Link 
              href={`/journals/${shortcode}?section=aims-scope`}
              style={{
                color: activeSection === 'aims-scope' ? '#1E5DA8' : '#000000',
                textDecoration: 'none',
                fontSize: '15px',
                fontWeight: activeSection === 'aims-scope' ? '600' : '500',
                transition: 'all 0.2s',
                outline: 'none',
                borderBottom: activeSection === 'aims-scope' ? '2px solid #1E5DA8' : '2px solid transparent',
                paddingBottom: '4px'
              }}
              onMouseEnter={(e) => {
                if (activeSection !== 'aims-scope') {
                  e.currentTarget.style.color = '#1E5DA8';
                }
              }}
              onMouseLeave={(e) => {
                if (activeSection !== 'aims-scope') {
                  e.currentTarget.style.color = '#000000';
                }
              }}
            >
              Aims and Scope
            </Link>
            <Link 
              href={`/journals/${shortcode}?section=editorial-board`}
              style={{
                color: activeSection === 'editorial-board' ? '#1E5DA8' : '#000000',
                textDecoration: 'none',
                fontSize: '15px',
                fontWeight: activeSection === 'editorial-board' ? '600' : '500',
                transition: 'all 0.2s',
                outline: 'none',
                borderBottom: activeSection === 'editorial-board' ? '2px solid #1E5DA8' : '2px solid transparent',
                paddingBottom: '4px'
              }}
              onMouseEnter={(e) => {
                if (activeSection !== 'editorial-board') {
                  e.currentTarget.style.color = '#1E5DA8';
                }
              }}
              onMouseLeave={(e) => {
                if (activeSection !== 'editorial-board') {
                  e.currentTarget.style.color = '#000000';
                }
              }}
            >
              Editorial Board
            </Link>
            <Link 
              href={`/journals/${shortcode}?section=in-press`}
              style={{
                color: activeSection === 'in-press' ? '#1E5DA8' : '#000000',
                textDecoration: 'none',
                fontSize: '15px',
                fontWeight: activeSection === 'in-press' ? '600' : '500',
                transition: 'all 0.2s',
                outline: 'none',
                borderBottom: activeSection === 'in-press' ? '2px solid #1E5DA8' : '2px solid transparent',
                paddingBottom: '4px'
              }}
              onMouseEnter={(e) => {
                if (activeSection !== 'in-press') {
                  e.currentTarget.style.color = '#1E5DA8';
                }
              }}
              onMouseLeave={(e) => {
                if (activeSection !== 'in-press') {
                  e.currentTarget.style.color = '#000000';
                }
              }}
            >
              In Press
            </Link>
            <Link 
              href={`/journals/${shortcode}?section=current-issue`}
              style={{
                color: activeSection === 'current-issue' ? '#1E5DA8' : '#000000',
                textDecoration: 'none',
                fontSize: '15px',
                fontWeight: activeSection === 'current-issue' ? '600' : '500',
                transition: 'all 0.2s',
                outline: 'none',
                borderBottom: activeSection === 'current-issue' ? '2px solid #1E5DA8' : '2px solid transparent',
                paddingBottom: '4px'
              }}
              onMouseEnter={(e) => {
                if (activeSection !== 'current-issue') {
                  e.currentTarget.style.color = '#1E5DA8';
                }
              }}
              onMouseLeave={(e) => {
                if (activeSection !== 'current-issue') {
                  e.currentTarget.style.color = '#000000';
                }
              }}
            >
              Current Issue
            </Link>
            <Link 
              href={`/journals/${shortcode}?section=archive`}
              style={{
                color: activeSection === 'archive' ? '#1E5DA8' : '#000000',
                textDecoration: 'none',
                fontSize: '15px',
                fontWeight: activeSection === 'archive' ? '600' : '500',
                transition: 'all 0.2s',
                outline: 'none',
                borderBottom: activeSection === 'archive' ? '2px solid #1E5DA8' : '2px solid transparent',
                paddingBottom: '4px'
              }}
              onMouseEnter={(e) => {
                if (activeSection !== 'archive') {
                  e.currentTarget.style.color = '#1E5DA8';
                }
              }}
              onMouseLeave={(e) => {
                if (activeSection !== 'archive') {
                  e.currentTarget.style.color = '#000000';
                }
              }}
            >
              Archive
            </Link>
            <Link 
              href={`/journals/${shortcode}?section=guidelines`}
              style={{
                color: activeSection === 'guidelines' ? '#1E5DA8' : '#000000',
                textDecoration: 'none',
                fontSize: '15px',
                fontWeight: activeSection === 'guidelines' ? '600' : '500',
                transition: 'all 0.2s',
                outline: 'none',
                borderBottom: activeSection === 'guidelines' ? '2px solid #1E5DA8' : '2px solid transparent',
                paddingBottom: '4px'
              }}
              onMouseEnter={(e) => {
                if (activeSection !== 'guidelines') {
                  e.currentTarget.style.color = '#1E5DA8';
                }
              }}
              onMouseLeave={(e) => {
                if (activeSection !== 'guidelines') {
                  e.currentTarget.style.color = '#000000';
                }
              }}
            >
              Journal Guidelines
            </Link>
          </nav>

          {/* Right side: Hamburger Menu (Mobile) and Submit Button */}
          <div 
            data-menu-container
            className="journal-nav-right"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              position: 'relative'
            }}
          >
            {/* Hamburger Menu Button - Mobile only */}
            <button
              className="journal-hamburger-btn"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              style={{
                backgroundColor: 'transparent',
                border: '1px solid #E5E9F2',
                borderRadius: '8px',
                padding: '10px 12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s',
                outline: 'none'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#F3F4F6';
                e.currentTarget.style.borderColor = '#1E5DA8';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.borderColor = '#E5E9F2';
              }}
              aria-label="Toggle navigation menu"
            >
              <i 
                className={isMenuOpen ? 'pi pi-times' : 'pi pi-bars'} 
                style={{ 
                  fontSize: '20px', 
                  color: '#374151' 
                }}
              ></i>
            </button>

            {/* Submit Manuscript Button - Desktop */}
            <Link 
              className="journal-submit-btn-desktop"
              href={`/submit-manuscript?journal=${shortcode}`} 
              style={{
                backgroundColor: '#20B486',
                color: '#FFFFFF',
                padding: '10px 24px',
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: '15px',
                fontWeight: '600',
                transition: 'all 0.2s',
                border: 'none',
                outline: 'none'
              }} 
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1a9b73'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#20B486'}
            >
              Submit Manuscript
            </Link>

            {/* Sidebar Overlay */}
            {isMenuOpen && (
              <div 
                onClick={() => setIsMenuOpen(false)}
                style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  zIndex: 9998,
                  animation: 'fadeIn 0.3s ease-out'
                }}
              />
            )}

            {/* Sidebar Menu - Slides from right */}
            <div 
              className={`journal-sidebar ${isMenuOpen ? 'journal-sidebar-open' : ''}`}
              style={{
                position: 'fixed',
                top: 0,
                right: isMenuOpen ? '0' : '-100%',
                width: '320px',
                maxWidth: '85vw',
                height: '100vh',
                backgroundColor: '#FFFFFF',
                boxShadow: '-4px 0 12px rgba(0, 0, 0, 0.15)',
                zIndex: 9999,
                transition: 'right 0.3s ease-out',
                overflowY: 'auto',
                overflowX: 'hidden',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              {/* Sidebar Header */}
              <div style={{
                padding: '20px',
                borderBottom: '1px solid #E5E9F2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                position: 'sticky',
                top: 0,
                backgroundColor: '#FFFFFF',
                zIndex: 1
              }}>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#0B3C78',
                  margin: 0
                }}>
                  Navigation
                </h3>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  style={{
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '8px',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'background-color 0.2s',
                    outline: 'none'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F3F4F6'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  aria-label="Close menu"
                >
                  <i className="pi pi-times" style={{ fontSize: '20px', color: '#374151' }}></i>
                </button>
              </div>

              {/* Sidebar Navigation */}
              <nav style={{
                display: 'flex',
                flexDirection: 'column',
                padding: '12px',
                gap: '4px',
                flex: 1,
                overflowY: 'auto'
              }}>
                  <Link 
                    href={`/journals/${shortcode}`}
                    onClick={() => setIsMenuOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 16px',
                      borderRadius: '6px',
                      color: activeSection === 'home' ? '#1E5DA8' : '#374151',
                      backgroundColor: activeSection === 'home' ? '#E0F0FF' : 'transparent',
                      textDecoration: 'none',
                      fontSize: '15px',
                      fontWeight: activeSection === 'home' ? '600' : '500',
                      transition: 'all 0.2s',
                      outline: 'none'
                    }}
                    onMouseEnter={(e) => {
                      if (activeSection !== 'home') {
                        e.currentTarget.style.backgroundColor = '#F3F4F6';
                        e.currentTarget.style.color = '#1E5DA8';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (activeSection !== 'home') {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = '#374151';
                      }
                    }}
                  >
                    <i className="pi pi-home" style={{ fontSize: '16px' }}></i>
                    <span>Journal Home</span>
                  </Link>
                  <Link 
                    href={`/journals/${shortcode}?section=aims-scope`}
                    onClick={() => setIsMenuOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 16px',
                      borderRadius: '6px',
                      color: activeSection === 'aims-scope' ? '#1E5DA8' : '#374151',
                      backgroundColor: activeSection === 'aims-scope' ? '#E0F0FF' : 'transparent',
                      textDecoration: 'none',
                      fontSize: '15px',
                      fontWeight: activeSection === 'aims-scope' ? '600' : '500',
                      transition: 'all 0.2s',
                      outline: 'none'
                    }}
                    onMouseEnter={(e) => {
                      if (activeSection !== 'aims-scope') {
                        e.currentTarget.style.backgroundColor = '#F3F4F6';
                        e.currentTarget.style.color = '#1E5DA8';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (activeSection !== 'aims-scope') {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = '#374151';
                      }
                    }}
                  >
                    <i className="pi pi-compass" style={{ fontSize: '16px' }}></i>
                    <span>Aims and Scope</span>
                  </Link>
                  <Link 
                    href={`/journals/${shortcode}?section=editorial-board`}
                    onClick={() => setIsMenuOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 16px',
                      borderRadius: '6px',
                      color: activeSection === 'editorial-board' ? '#1E5DA8' : '#374151',
                      backgroundColor: activeSection === 'editorial-board' ? '#E0F0FF' : 'transparent',
                      textDecoration: 'none',
                      fontSize: '15px',
                      fontWeight: activeSection === 'editorial-board' ? '600' : '500',
                      transition: 'all 0.2s',
                      outline: 'none'
                    }}
                    onMouseEnter={(e) => {
                      if (activeSection !== 'editorial-board') {
                        e.currentTarget.style.backgroundColor = '#F3F4F6';
                        e.currentTarget.style.color = '#1E5DA8';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (activeSection !== 'editorial-board') {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = '#374151';
                      }
                    }}
                  >
                    <i className="pi pi-users" style={{ fontSize: '16px' }}></i>
                    <span>Editorial Board</span>
                  </Link>
                  <Link 
                    href={`/journals/${shortcode}?section=in-press`}
                    onClick={() => setIsMenuOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 16px',
                      borderRadius: '6px',
                      color: activeSection === 'in-press' ? '#1E5DA8' : '#374151',
                      backgroundColor: activeSection === 'in-press' ? '#E0F0FF' : 'transparent',
                      textDecoration: 'none',
                      fontSize: '15px',
                      fontWeight: activeSection === 'in-press' ? '600' : '500',
                      transition: 'all 0.2s',
                      outline: 'none'
                    }}
                    onMouseEnter={(e) => {
                      if (activeSection !== 'in-press') {
                        e.currentTarget.style.backgroundColor = '#F3F4F6';
                        e.currentTarget.style.color = '#1E5DA8';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (activeSection !== 'in-press') {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = '#374151';
                      }
                    }}
                  >
                    <i className="pi pi-clock" style={{ fontSize: '16px' }}></i>
                    <span>In Press</span>
                  </Link>
                  <Link 
                    href={`/journals/${shortcode}?section=current-issue`}
                    onClick={() => setIsMenuOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 16px',
                      borderRadius: '6px',
                      color: activeSection === 'current-issue' ? '#1E5DA8' : '#374151',
                      backgroundColor: activeSection === 'current-issue' ? '#E0F0FF' : 'transparent',
                      textDecoration: 'none',
                      fontSize: '15px',
                      fontWeight: activeSection === 'current-issue' ? '600' : '500',
                      transition: 'all 0.2s',
                      outline: 'none'
                    }}
                    onMouseEnter={(e) => {
                      if (activeSection !== 'current-issue') {
                        e.currentTarget.style.backgroundColor = '#F3F4F6';
                        e.currentTarget.style.color = '#1E5DA8';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (activeSection !== 'current-issue') {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = '#374151';
                      }
                    }}
                  >
                    <i className="pi pi-calendar" style={{ fontSize: '16px' }}></i>
                    <span>Current Issue</span>
                  </Link>
                  <Link 
                    href={`/journals/${shortcode}?section=archive`}
                    onClick={() => setIsMenuOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 16px',
                      borderRadius: '6px',
                      color: activeSection === 'archive' ? '#1E5DA8' : '#374151',
                      backgroundColor: activeSection === 'archive' ? '#E0F0FF' : 'transparent',
                      textDecoration: 'none',
                      fontSize: '15px',
                      fontWeight: activeSection === 'archive' ? '600' : '500',
                      transition: 'all 0.2s',
                      outline: 'none'
                    }}
                    onMouseEnter={(e) => {
                      if (activeSection !== 'archive') {
                        e.currentTarget.style.backgroundColor = '#F3F4F6';
                        e.currentTarget.style.color = '#1E5DA8';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (activeSection !== 'archive') {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = '#374151';
                      }
                    }}
                  >
                    <i className="pi pi-archive" style={{ fontSize: '16px' }}></i>
                    <span>Archive</span>
                  </Link>
                  <Link 
                    href={`/journals/${shortcode}?section=guidelines`}
                    onClick={() => setIsMenuOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 16px',
                      borderRadius: '6px',
                      color: activeSection === 'guidelines' ? '#1E5DA8' : '#374151',
                      backgroundColor: activeSection === 'guidelines' ? '#E0F0FF' : 'transparent',
                      textDecoration: 'none',
                      fontSize: '15px',
                      fontWeight: activeSection === 'guidelines' ? '600' : '500',
                      transition: 'all 0.2s',
                      outline: 'none'
                    }}
                    onMouseEnter={(e) => {
                      if (activeSection !== 'guidelines') {
                        e.currentTarget.style.backgroundColor = '#F3F4F6';
                        e.currentTarget.style.color = '#1E5DA8';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (activeSection !== 'guidelines') {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = '#374151';
                      }
                    }}
                  >
                    <i className="pi pi-book" style={{ fontSize: '16px' }}></i>
                    <span>Journal Guidelines</span>
                  </Link>
                </nav>

                {/* Submit Manuscript Button - Prominent in Sidebar */}
                <div style={{
                  padding: '16px 12px',
                  borderTop: '1px solid #E5E9F2',
                  backgroundColor: '#FFFFFF',
                  position: 'sticky',
                  bottom: 0
                }}>
                  <Link 
                    href={`/submit-manuscript?journal=${shortcode}`}
                    onClick={() => setIsMenuOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      backgroundColor: '#20B486',
                      color: '#FFFFFF',
                      padding: '14px 20px',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      fontSize: '15px',
                      fontWeight: '600',
                      transition: 'all 0.2s',
                      border: 'none',
                      outline: 'none',
                      width: '100%'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1a9b73'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#20B486'}
                  >
                    <i className="pi pi-pencil" style={{ fontSize: '16px' }}></i>
                    <span>Submit Manuscript</span>
                  </Link>
                </div>
            </div>
          </div>
        </div>
      </nav>

      {/* HERO SECTION - Blue background */}
      <div style={{
        backgroundColor: '#1E5DA8',
        padding: '48px 24px'
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto'
        }}>
          <h1 style={{
            color: '#FFFFFF',
            fontSize: '36px',
            fontWeight: '700',
            marginBottom: '0',
            lineHeight: '1.2'
          }}>
            {journal.title}
          </h1>
                            </div>
                          </div>

      {/* MAIN CONTENT - Two Column Layout */}
      <div className="journal-main-content" style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '40px 24px'
      }}>
        <div className="journal-content-grid" style={{
          display: 'grid',
          gridTemplateColumns: '70% 30%',
          gap: '32px'
        }}>
          {/* LEFT COLUMN - 70% */}
          <div className="journal-left-column" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Error Message */}
            {error && activeSection !== 'home' && (
              <div style={{
                backgroundColor: '#FEE2E2',
                borderRadius: '8px',
                padding: '16px',
                border: '1px solid #FCA5A5',
                color: '#DC2626',
                fontSize: '15px'
              }}>
                <strong>Error:</strong> {error}
              </div>
            )}
            
            {/* Loading Indicator */}
            {contentLoading && (
              <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                padding: '40px',
                textAlign: 'center'
              }}>
                <div style={{
                  display: 'inline-block',
                  width: '32px',
                  height: '32px',
                  border: '3px solid #E5E9F2',
                  borderTopColor: '#1E5DA8',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
                <p style={{ marginTop: '12px', color: '#6B7280' }}>Loading content...</p>
              </div>
            )}
            
            {/* Dynamic Content Card */}
            {!contentLoading && activeSection === 'home' && (
              <>
                {/* Introduction Card */}
                <div className="journal-introduction-card" style={{
                  backgroundColor: 'rgb(255, 255, 255)',
                  borderRadius: '8px',
                  boxShadow: 'rgba(0, 0, 0, 0.08) 0px 2px 8px',
                  padding: '32px',
                  width: '100%',
                  maxWidth: '100%',
                  boxSizing: 'border-box',
                  overflow: 'hidden'
                }}>
                  <h2 style={{
                    fontSize: '24px',
                    fontWeight: '600',
                    color: 'rgb(11, 60, 120)',
                    marginBottom: '12px',
                    paddingBottom: '12px',
                    borderBottom: '3px solid rgb(30, 93, 168)'
                  }}>
                    Introduction
                  </h2>
                  <div style={{
                    color: 'rgb(55, 65, 81)',
                    fontSize: '15px',
                    lineHeight: '1.8',
                    overflowWrap: 'break-word',
                    wordBreak: 'break-word',
                    whiteSpace: 'pre-wrap',
                    maxWidth: '100%',
                    overflow: 'hidden'
                  }} dangerouslySetInnerHTML={{ 
                    __html: sectionContent || 
                      `Welcome to ${journal.title}. This journal publishes original peer-reviewed articles in the field.`
                  }} />
                    </div>
              </>
            )}

            {/* Aims and Scope */}
            {!contentLoading && activeSection === 'aims-scope' && (
              <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                padding: '32px'
              }}>
                <h2 style={{
                  fontSize: '24px',
                  fontWeight: '600',
                  color: '#0B3C78',
                  marginBottom: '12px',
                  paddingBottom: '12px',
                  borderBottom: '3px solid #1E5DA8'
                }}>
                  Aims and Scope
                </h2>
                <div style={{
                  color: '#374151',
                  fontSize: '15px',
                  lineHeight: '1.8'
                }} dangerouslySetInnerHTML={{ __html: sectionContent }} />
                        </div>
                      )}

            {/* Editorial Board */}
            {!contentLoading && activeSection === 'editorial-board' && (
              <div className="journal-editorial-board-card" style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                padding: '32px',
                marginLeft: '98px',
                width: '100%',
                maxWidth: '100%',
                boxSizing: 'border-box'
              }}>
                <h2 style={{
                  fontSize: '24px',
                  fontWeight: '600',
                  color: '#0B3C78',
                  marginBottom: '12px',
                  paddingBottom: '12px',
                  borderBottom: '3px solid #1E5DA8'
                }}>
                    Editorial Board
                  </h2>
                {sectionContent && (
                  <div style={{
                    color: '#374151',
                    fontSize: '15px',
                    lineHeight: '1.8',
                    marginBottom: '24px'
                  }} dangerouslySetInnerHTML={{ __html: sectionContent }} />
                )}
                {boardMembers.length > 0 ? (
                  <div 
                    className="editors-grid"
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                      gap: '2rem',
                      marginTop: '1rem'
                    }}
                  >
                    {boardMembers.map((member) => {
                      const role =
                        (member as any).position ||
                        (member as any).memberType ||
                        (member as any).editorType ||
                        'Editorial Board Member';

                      return (
                        <div 
                          key={member.id} 
                          className="editor-card"
                          style={{
                            marginBottom: '1.5rem'
                          }}
                        >
                          <div
                            className="editor-content"
                            style={{
                              display: 'flex',
                              gap: '1.5rem',
                              alignItems: 'flex-start',
                              width: '100%'
                            }}
                          >
                            <div
                              className="editor-avatar"
                              style={{ 
                                flexShrink: 0, 
                                position: 'relative',
                                width: '80px',
                                height: '80px'
                              }}
                            >
                              {(() => {
                                // Check multiple possible field names for the image
                                // Prefer profileUrl first (most reliable), then fall back to others
                                const rawImagePath = (member as any).profileUrl || 
                                                     (member as any).imageUrl || 
                                                     (member as any).image || 
                                                     (member as any).photo || 
                                                     (member as any).photoUrl;
                                
                                // Filter out invalid values that lead to /uploads/undefined
                                const imagePath =
                                  rawImagePath &&
                                  typeof rawImagePath === 'string' &&
                                  rawImagePath.trim() !== '' &&
                                  rawImagePath !== 'undefined' &&
                                  rawImagePath !== 'null' &&
                                  !rawImagePath.includes('/undefined') &&
                                  !rawImagePath.includes('/null')
                                    ? rawImagePath
                                    : null;
                                
                                const imageUrl = getImageUrl(imagePath);
                                
                                if (imageUrl) {
                                  return (
                                    <img
                                      src={imageUrl}
                                      alt={member.name}
                                      style={{
                                        width: '80px',
                                        height: '80px',
                                        borderRadius: '9999px',
                                        objectFit: 'cover',
                                      }}
                                      onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.style.display = 'none';
                                        const placeholder = target.nextElementSibling as HTMLElement;
                                        if (placeholder) {
                                          placeholder.style.display = 'flex';
                                        }
                                      }}
                                    />
                                  );
                                }
                                return null;
                              })()}
                              <div
                                style={{
                                  width: '80px',
                                  height: '80px',
                                  borderRadius: '9999px',
                                  backgroundColor: '#6366f1',
                                  display: (() => {
                                    const rawImagePath = (member as any).profileUrl || 
                                                         (member as any).imageUrl || 
                                                         (member as any).image || 
                                                         (member as any).photo || 
                                                         (member as any).photoUrl;
                                    const imagePath =
                                      rawImagePath &&
                                      typeof rawImagePath === 'string' &&
                                      rawImagePath.trim() !== '' &&
                                      rawImagePath !== 'undefined' &&
                                      rawImagePath !== 'null' &&
                                      !rawImagePath.includes('/undefined') &&
                                      !rawImagePath.includes('/null')
                                        ? rawImagePath
                                        : null;
                                    const imageUrl = getImageUrl(imagePath);
                                    return imageUrl ? 'none' : 'flex';
                                  })(),
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: '#ffffff',
                                  fontSize: '32px',
                                  position: 'absolute',
                                  top: 0,
                                  left: 0,
                                }}
                              >
                                <i className="pi pi-user" />
                              </div>
                            </div>
                            <div 
                              className="editor-info"
                              style={{
                                flex: 1,
                                minWidth: 0
                              }}
                            >
                              <h3>{member.name}</h3>

                              <div className="editor-role">
                                <i className="pi pi-briefcase" style={{ marginRight: '8px' }} />
                                <span>{role}</span>
                              </div>

                              {(member as any).affiliation && (
                                <div className="editor-affiliation">
                                  <i className="pi pi-building" style={{ marginRight: '8px' }} />
                                  <span>{(member as any).affiliation}</span>
                                </div>
                              )}
                              {(member as any).tags && (
                                <div className="editor-tags" style={{
                                  marginTop: '8px',
                                  fontSize: '14px',
                                  color: '#6B7280'
                                }}>
                                  <span>{(member as any).tags}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p style={{ color: '#6B7280', fontSize: '15px' }}>
                    Editorial board information will be available soon.
                  </p>
                )}
                    </div>
                  )}

            {/* In Press, Current Issue - Show Articles */}
            {!contentLoading && (activeSection === 'in-press' || activeSection === 'current-issue') && (
              <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                padding: '32px'
              }}>
                <h2 style={{
                  fontSize: '24px',
                  fontWeight: '600',
                  color: '#0B3C78',
                  marginBottom: '12px',
                  paddingBottom: '12px',
                  borderBottom: '3px solid #1E5DA8'
                }}>
                  {activeSection === 'in-press' ? 'Articles In Press' : 'Current Issue'}
                </h2>
                {sectionContent && (
                  <div style={{
                    color: '#374151',
                    fontSize: '15px',
                    lineHeight: '1.8',
                    marginBottom: '24px'
                  }} dangerouslySetInnerHTML={{ __html: sectionContent }} />
                )}
                {articles.length > 0 ? (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
                    {articles.map((article) => (
                      <div
                        key={article.id}
                        onClick={(e) => {
                          // Don't navigate if clicking on buttons or links
                          const target = e.target as HTMLElement;
                          if (target.tagName === 'BUTTON' || target.tagName === 'A' || target.closest('button') || target.closest('a')) {
                            return;
                          }
                          router.push(`/articles/${article.id}`);
                        }}
                        style={{
                          padding: '16px 20px',
                          borderRadius: '12px',
                          background:
                            'linear-gradient(135deg, #f9fafb 0%, #eef2ff 100%)',
                          border: '1px solid #e5e7eb',
                          borderLeft: '3px solid #4f46e5',
                          boxShadow:
                            '0 4px 12px rgba(15, 23, 42, 0.08)',
                          transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '12px',
                        }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow =
                          '0 8px 20px rgba(15, 23, 42, 0.12)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow =
                          '0 4px 12px rgba(15, 23, 42, 0.08)';
                        e.currentTarget.style.transform =
                          'translateY(0)';
                      }}
                      >
                        {/* Article Type Badge */}
                        {article.articleType && (
                          <div style={{
                            display: 'inline-block',
                            alignSelf: 'flex-start',
                            padding: '3px 10px',
                            backgroundColor: '#E0F2FE',
                            color: '#0369A1',
                            borderRadius: '5px',
                            fontSize: '11px',
                            fontWeight: '600',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                          }}>
                            {article.articleType}
                          </div>
                        )}

                        {/* Title */}
                        <h3 style={{
                          fontSize: '18px',
                          fontWeight: '700',
                          color: '#0B3C78',
                          marginBottom: '0',
                          lineHeight: '1.4'
                        }}>
                          <Link href={`/articles/${article.id}`} style={{
                            color: 'inherit',
                            textDecoration: 'none',
                            transition: 'color 0.2s'
                          }} onMouseEnter={(e) => e.currentTarget.style.color = '#1E5DA8'}
                             onMouseLeave={(e) => e.currentTarget.style.color = '#0B3C78'}>
                            {article.title}
                          </Link>
                        </h3>

                        {/* Authors */}
                        {article.authors && (
                          <div style={{
                            fontSize: '13px',
                            color: '#6B7280',
                            lineHeight: '1.5'
                          }}>
                            <strong style={{ color: '#374151' }}>Authors: </strong>
                            {Array.isArray(article.authors) 
                              ? article.authors.map((author: any) => author.name || author).join(', ')
                              : article.authors
                            }
                          </div>
                        )}

                        {/* DOI */}
                        {article.doi && (
                          <p style={{
                            fontSize: '13px',
                            color: '#6B7280',
                            lineHeight: '1.6',
                            margin: '0'
                          }}>
                            <strong style={{ color: '#374151' }}>DOI:</strong>{' '}
                            <span style={{ fontFamily: 'monospace' }}>{article.doi}</span>
                          </p>
                        )}

                        {/* Abstract (shown when expanded) */}
                        {expandedAbstracts.has(article.id) && article.abstract && (
                          <div style={{
                            padding: '12px',
                            backgroundColor: '#F9FAFB',
                            borderRadius: '8px',
                            border: '1px solid #E5E7EB',
                            marginTop: '8px'
                          }}>
                            <p style={{
                              fontSize: '13px',
                              color: '#374151',
                              lineHeight: '1.6',
                              margin: '0'
                            }}>
                              <strong style={{ color: '#1F2937', display: 'block', marginBottom: '8px' }}>Abstract:</strong>
                              {article.abstract}
                            </p>
                          </div>
                        )}

                        {/* Keywords */}
                        {article.keywords && (
                          <div style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '6px'
                          }}>
                            {article.keywords.split(',').slice(0, 5).map((keyword: string, idx: number) => (
                              <span key={idx} style={{
                                padding: '3px 8px',
                                backgroundColor: '#F3F4F6',
                                color: '#4B5563',
                                borderRadius: '4px',
                                fontSize: '11px',
                                fontWeight: '500'
                              }}>
                                {keyword.trim()}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div style={{
                          display: 'flex',
                          gap: '10px',
                          marginTop: 'auto',
                          flexWrap: 'wrap'
                        }}>
                          {/* Abstract Toggle Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpandedAbstracts(prev => {
                                const newSet = new Set(prev);
                                if (newSet.has(article.id)) {
                                  newSet.delete(article.id);
                                } else {
                                  newSet.add(article.id);
                                }
                                return newSet;
                              });
                            }}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '8px 16px',
                              backgroundColor: expandedAbstracts.has(article.id) ? '#164a8a' : '#1E5DA8',
                              color: '#FFFFFF',
                              border: 'none',
                              borderRadius: '6px',
                              fontSize: '13px',
                              fontWeight: '600',
                              cursor: 'pointer',
                              transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                              if (!expandedAbstracts.has(article.id)) {
                                e.currentTarget.style.backgroundColor = '#164a8a';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!expandedAbstracts.has(article.id)) {
                                e.currentTarget.style.backgroundColor = '#1E5DA8';
                              }
                            }}
                          >
                            {expandedAbstracts.has(article.id) ? 'Hide Abstract' : 'Abstract'}
                          </button>

                          {/* PDF Download Button */}
                          {article.pdfUrl && (
                            <a
                              href={getFileUrl(article.pdfUrl)}
                              download
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '8px 16px',
                                backgroundColor: '#DC2626',
                                color: '#FFFFFF',
                                borderRadius: '6px',
                                textDecoration: 'none',
                                fontSize: '13px',
                                fontWeight: '600',
                                transition: 'all 0.2s'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#B91C1C'}
                              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#DC2626'}
                            >
                              <span>📄</span>
                              Download PDF
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: '#6B7280', fontSize: '15px' }}>
                    No articles available yet.
                  </p>
                )}
                    </div>
                  )}

            {/* Archive */}
            {!contentLoading && activeSection === 'archive' && (
              <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                padding: '32px'
              }}>
                <h2 style={{
                  fontSize: '24px',
                  fontWeight: '600',
                  color: '#0B3C78',
                  marginBottom: '24px'
                }}>
                  Archive
                  {searchParams?.get('volume') && searchParams?.get('issue') && searchParams?.get('year') && (
                    <span style={{ fontSize: '18px', fontWeight: '500', color: '#6B7280', marginLeft: '12px' }}>
                      - Volume {searchParams.get('volume')}, Issue {searchParams.get('issue')} ({searchParams.get('year')})
                    </span>
                  )}
                </h2>
                {sectionContent && !searchParams?.get('volume') && (
                  <div style={{
                    color: '#374151',
                    fontSize: '15px',
                    lineHeight: '1.8',
                    marginBottom: '24px'
                  }} dangerouslySetInnerHTML={{ __html: sectionContent }} />
                )}
                
                {/* Show articles list when volume/issue/year are specified */}
                {searchParams?.get('volume') && searchParams?.get('issue') && searchParams?.get('year') ? (
                  articles.length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
                      {articles.map((article) => (
                        <div
                          key={article.id}
                          onClick={(e) => {
                            const target = e.target as HTMLElement;
                            if (target.tagName === 'BUTTON' || target.tagName === 'A' || target.closest('button') || target.closest('a')) {
                              return;
                            }
                            router.push(`/articles/${article.id}`);
                          }}
                          style={{
                            padding: '16px 20px',
                            borderRadius: '12px',
                            background: 'linear-gradient(135deg, #f9fafb 0%, #eef2ff 100%)',
                            border: '1px solid #e5e7eb',
                            borderLeft: '3px solid #4f46e5',
                            boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
                            transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.boxShadow = '0 8px 20px rgba(15, 23, 42, 0.12)';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(15, 23, 42, 0.08)';
                            e.currentTarget.style.transform = 'translateY(0)';
                          }}
                        >
                          {article.articleType && (
                            <div style={{
                              display: 'inline-block',
                              alignSelf: 'flex-start',
                              padding: '3px 10px',
                              backgroundColor: '#E0F2FE',
                              color: '#0369A1',
                              borderRadius: '5px',
                              fontSize: '11px',
                              fontWeight: '600',
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px'
                            }}>
                              {article.articleType}
                            </div>
                          )}

                          <h3 style={{
                            fontSize: '18px',
                            fontWeight: '700',
                            color: '#0B3C78',
                            marginBottom: '0',
                            lineHeight: '1.4'
                          }}>
                            <Link href={`/articles/${article.id}`} style={{
                              color: 'inherit',
                              textDecoration: 'none',
                              transition: 'color 0.2s'
                            }} onMouseEnter={(e) => e.currentTarget.style.color = '#1E5DA8'}
                               onMouseLeave={(e) => e.currentTarget.style.color = '#0B3C78'}>
                              {article.title}
                            </Link>
                          </h3>

                          {article.authors && (
                            <div style={{
                              fontSize: '13px',
                              color: '#6B7280',
                              lineHeight: '1.5'
                            }}>
                              <strong style={{ color: '#374151' }}>Authors: </strong>
                              {Array.isArray(article.authors) 
                                ? article.authors.map((author: any) => author.name || author).join(', ')
                                : article.authors
                              }
                            </div>
                          )}

                          {article.doi && (
                            <p style={{
                              fontSize: '13px',
                              color: '#6B7280',
                              lineHeight: '1.6',
                              margin: '0'
                            }}>
                              <strong style={{ color: '#374151' }}>DOI:</strong>{' '}
                              <span style={{ fontFamily: 'monospace' }}>{article.doi}</span>
                            </p>
                          )}

                          {expandedAbstracts.has(article.id) && article.abstract && (
                            <div style={{
                              padding: '12px',
                              backgroundColor: '#F9FAFB',
                              borderRadius: '8px',
                              border: '1px solid #E5E7EB',
                              marginTop: '8px'
                            }}>
                              <p style={{
                                fontSize: '13px',
                                color: '#374151',
                                lineHeight: '1.6',
                                margin: '0'
                              }}>
                                <strong style={{ color: '#1F2937', display: 'block', marginBottom: '8px' }}>Abstract:</strong>
                                {article.abstract}
                              </p>
                            </div>
                          )}

                          {article.keywords && (
                            <div style={{
                              display: 'flex',
                              flexWrap: 'wrap',
                              gap: '6px'
                            }}>
                              {article.keywords.split(',').slice(0, 5).map((keyword: string, idx: number) => (
                                <span key={idx} style={{
                                  padding: '3px 8px',
                                  backgroundColor: '#F3F4F6',
                                  color: '#4B5563',
                                  borderRadius: '4px',
                                  fontSize: '11px',
                                  fontWeight: '500'
                                }}>
                                  {keyword.trim()}
                                </span>
                              ))}
                            </div>
                          )}

                          <div style={{
                            display: 'flex',
                            gap: '10px',
                            marginTop: 'auto',
                            flexWrap: 'wrap'
                          }}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setExpandedAbstracts(prev => {
                                  const newSet = new Set(prev);
                                  if (newSet.has(article.id)) {
                                    newSet.delete(article.id);
                                  } else {
                                    newSet.add(article.id);
                                  }
                                  return newSet;
                                });
                              }}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '8px 16px',
                                backgroundColor: expandedAbstracts.has(article.id) ? '#164a8a' : '#1E5DA8',
                                color: '#FFFFFF',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '13px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                              }}
                            >
                              {expandedAbstracts.has(article.id) ? 'Hide Abstract' : 'Abstract'}
                            </button>

                            {article.pdfUrl && (
                              <a
                                href={getFileUrl(article.pdfUrl)}
                                download
                                onClick={(e) => e.stopPropagation()}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  padding: '8px 16px',
                                  backgroundColor: '#DC2626',
                                  color: '#FFFFFF',
                                  borderRadius: '6px',
                                  textDecoration: 'none',
                                  fontSize: '13px',
                                  fontWeight: '600',
                                  transition: 'all 0.2s'
                                }}
                              >
                                <span>📄</span>
                                Download PDF
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ color: '#6B7280', fontSize: '15px' }}>
                      No articles found for Volume {searchParams.get('volume')}, Issue {searchParams.get('issue')} ({searchParams.get('year')}).
                    </p>
                  )
                ) : archiveIssues.size > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {Array.from(archiveIssues.entries())
                      .sort(([yearA], [yearB]) => yearB - yearA)
                      .map(([year, yearArticles]) => {
                        // Group articles by volume and issue to create unique issue entries
                        const issueMap = new Map<string, any>();
                        yearArticles.forEach((article: any) => {
                          if (article.volumeNo && article.issueNo) {
                            const issueKey = `V${article.volumeNo}-I${article.issueNo}`;
                            if (!issueMap.has(issueKey)) {
                              issueMap.set(issueKey, {
                                volumeNo: article.volumeNo,
                                issueNo: article.issueNo,
                                year: year,
                                firstArticle: article
                              });
                            }
                          }
                        });

                        const issues = Array.from(issueMap.values())
                          .sort((a, b) => {
                            // Sort by volume (descending), then by issue (descending)
                            if (parseInt(a.volumeNo) !== parseInt(b.volumeNo)) {
                              return parseInt(b.volumeNo) - parseInt(a.volumeNo);
                            }
                            return parseInt(b.issueNo) - parseInt(a.issueNo);
                          });

                        return (
                          <div key={year} style={{
                            padding: '20px',
                            border: '1px solid #E5E9F2',
                            borderRadius: '8px',
                            backgroundColor: '#FFFFFF'
                          }}>
                            <h3 style={{
                              fontSize: '18px',
                              fontWeight: '600',
                              color: '#374151',
                              marginBottom: '16px',
                              paddingBottom: '12px',
                              borderBottom: '1px solid #E5E9F2'
                            }}>{year}</h3>
                            <div style={{
                              display: 'grid',
                              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                              gap: '12px'
                            }}>
                              {issues.map((issue, idx) => (
                                <Link
                                  key={idx}
                                  href={`/journals/${shortcode}?section=archive&volume=${issue.volumeNo}&issue=${issue.issueNo}&year=${year}`}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    color: '#2563EB',
                                    textDecoration: 'none',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    padding: '8px 12px',
                                    borderRadius: '4px',
                                    transition: 'all 0.2s',
                                    backgroundColor: 'transparent'
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = '#F3F4F6';
                                    e.currentTarget.style.color = '#1D4ED8';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                    e.currentTarget.style.color = '#2563EB';
                                  }}
                                >
                                  <span style={{
                                    fontSize: '12px',
                                    color: '#6B7280',
                                    display: 'flex',
                                    alignItems: 'center'
                                  }}>&gt;</span>
                                  <span>Volume {issue.volumeNo}, Issue {issue.issueNo}</span>
                                </Link>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                ) : (
                  <p style={{ color: '#6B7280', fontSize: '15px' }}>
                    No archived articles available yet.
                  </p>
                )}
              </div>
            )}

            {/* Guidelines */}
            {!contentLoading && activeSection === 'guidelines' && (
              <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                padding: '32px'
              }}>
                <h2 style={{
                  fontSize: '24px',
                  fontWeight: '600',
                  color: '#0B3C78',
                  marginBottom: '12px',
                  paddingBottom: '12px',
                  borderBottom: '3px solid #1E5DA8'
                }}>
                  Journal Guidelines
                  </h2>
                <div style={{
                  color: '#374151',
                  fontSize: '15px',
                            lineHeight: '1.8'
                }} dangerouslySetInnerHTML={{ __html: sectionContent }} />
                    </div>
                  )}
                </div>

          {/* RIGHT COLUMN - 30% */}
          <div className="journal-right-column" style={{ display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'flex-start' }}>
            {/* Journal Cover Card */}
            <div className="journal-cover-card" style={{
              backgroundColor: 'rgb(255, 255, 255)',
              borderRadius: '8px',
              boxShadow: 'rgba(0, 0, 0, 0.08) 0px 2px 8px',
              padding: '16px',
              maxWidth: '260px',
              width: '100%',
              marginLeft: '50px'
            }}>
              {journal.flyerImage && (
                <img 
                  src={getImageUrl(journal.flyerImage) || ''}
                  alt={`${journal.title} Cover`}
                  style={{
                    width: '100%',
                    height: '320px',
                    borderRadius: '8px',
                    marginBottom: '20px',
                    display: 'block',
                    objectFit: 'cover'
                  }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
              )}
              
              {/* Join Editorial Board Button */}
              <button style={{
                width: '80%',
                backgroundColor: 'rgb(30, 93, 168)',
                color: 'rgb(255, 255, 255)',
                padding: '12px 24px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '15px',
                fontWeight: '600',
                cursor: 'pointer',
                marginBottom: '12px',
                transition: '0.2s',
                display: 'block',
                marginLeft: 'auto',
                marginRight: 'auto'
              }}>
                Join Editorial Board
              </button>

              {/* Join Reviewer Team Button */}
              <button style={{
                width: '80%',
                backgroundColor: 'rgb(255, 255, 255)',
                color: 'rgb(30, 93, 168)',
                padding: '12px 24px',
                borderRadius: '8px',
                border: '2px solid rgb(30, 93, 168)',
                fontSize: '15px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: '0.2s',
                display: 'block',
                marginLeft: 'auto',
                marginRight: 'auto'
              }}>
                Join Reviewer Team
            </button>
          </div>

            {/* Useful Links Card */}
            <div className="journal-useful-links-card" style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
              padding: '24px',
              maxWidth: '260px',
              width: '100%',
              marginLeft: '50px'
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#0B3C78',
                marginBottom: '16px'
              }}>
                Useful Links
              </h3>
              <ul style={{
                listStyle: 'none',
                padding: 0,
                margin: 0
              }}>
                <li style={{ marginBottom: '12px' }}>
                  <Link href={`/journals/${shortcode}?section=peer-review`} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    color: '#374151',
                    textDecoration: 'none',
                    fontSize: '14px',
                    transition: 'color 0.2s'
                  }} onMouseEnter={(e) => e.currentTarget.style.color = '#1E5DA8'}
                     onMouseLeave={(e) => e.currentTarget.style.color = '#374151'}>
                    <span style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      backgroundColor: '#E0F0FF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <i className="pi pi-check" style={{ fontSize: '12px', color: '#1E5DA8' }}></i>
                      </span>
                    Peer Review Procedure
                  </Link>
                </li>
                <li style={{ marginBottom: '12px' }}>
                  <Link href={`/journals/${shortcode}?section=policies`} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    color: '#374151',
                    textDecoration: 'none',
                    fontSize: '14px',
                    transition: 'color 0.2s'
                  }} onMouseEnter={(e) => e.currentTarget.style.color = '#1E5DA8'}
                     onMouseLeave={(e) => e.currentTarget.style.color = '#374151'}>
                    <span style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      backgroundColor: '#E0F0FF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <i className="pi pi-check" style={{ fontSize: '12px', color: '#1E5DA8' }}></i>
                        </span>
                    Journal Policies
                  </Link>
                </li>
                <li style={{ marginBottom: '12px' }}>
                  <Link href={`/journals/${shortcode}?section=ethics`} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    color: '#374151',
                    textDecoration: 'none',
                    fontSize: '14px',
                    transition: 'color 0.2s'
                  }} onMouseEnter={(e) => e.currentTarget.style.color = '#1E5DA8'}
                     onMouseLeave={(e) => e.currentTarget.style.color = '#374151'}>
                    <span style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      backgroundColor: '#E0F0FF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <i className="pi pi-check" style={{ fontSize: '12px', color: '#1E5DA8' }}></i>
                      </span>
                    Publication Ethics
                  </Link>
                </li>
              </ul>
                    </div>
                      </div>
                      </div>
                  </div>
                </div>
  );
}
