        'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter, usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Dialog } from 'primereact/dialog';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { journalService } from '@/services/api';
import { adminAPI } from '@/lib/api';
import { Journal } from '@/types';
import { getFileUrl } from '@/lib/apiConfig';

interface MenuItem {
  id: string;
  label: string;
  icon: string;
  href: string;
}

export default function JournalDetailPage() {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const shortcode = params?.shortcode as string;
  
  const [journal, setJournal] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeMenu, setActiveMenu] = useState('home');
  const [content, setContent] = useState<string>('');
  const [contentLoading, setContentLoading] = useState(false);
  const [boardMembers, setBoardMembers] = useState<any[]>([]);
  const [articles, setArticles] = useState<any[]>([]);
  const [archiveIssues, setArchiveIssues] = useState<Map<number, any[]>>(new Map());
  const [expandedYears, setExpandedYears] = useState<Set<number>>(new Set());
  const [selectedArchiveIssue, setSelectedArchiveIssue] = useState<any | null>(null);
  const [showArchiveArticlesDialog, setShowArchiveArticlesDialog] = useState(false);

  const menuItems: MenuItem[] = [
    { id: 'home', label: 'Journal Home', icon: 'pi pi-home', href: `/journals/${shortcode}` },
    { id: 'aims-scope', label: 'Aims and Scope', icon: 'pi pi-compass', href: `/journals/${shortcode}?section=aims-scope` },
    { id: 'editorial-board', label: 'Editorial Board', icon: 'pi pi-users', href: `/journals/${shortcode}?section=editorial-board` },
    { id: 'in-press', label: 'In Press', icon: 'pi pi-clock', href: `/journals/${shortcode}?section=in-press` },
    { id: 'current-issue', label: 'Current Issue', icon: 'pi pi-calendar', href: `/journals/${shortcode}?section=current-issue` },
    { id: 'archive', label: 'Archive', icon: 'pi pi-folder-open', href: `/journals/${shortcode}?section=archive` },
    { id: 'guidelines', label: 'Journal Guidelines', icon: 'pi pi-info-circle', href: `/journals/${shortcode}?section=guidelines` },
  ];

  useEffect(() => {
    const fetchJournal = async () => {
      if (!shortcode) {
        setError('Invalid journal shortcode');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // Use the backend API endpoint that properly handles shortcode lookup
        // This endpoint checks both Journal table and JournalShortcode table
        try {
          // Try the shortcode-specific endpoint first: /journals/shortcode/:shortcode
          const shortcodeResponse = await (journalService as any).getByShortcode(shortcode);
          const journalToUse = (shortcodeResponse?.data || shortcodeResponse) as any;
          
          if (journalToUse && journalToUse.id) {
            console.log('✅ Journal found via shortcode API:', {
              id: journalToUse.id,
              title: journalToUse.title,
              shortcode: journalToUse.shortcode
            });
            
            // Fetch full details to ensure we have all content
            try {
              const fullJournalResponse = await adminAPI.getJournal(journalToUse.id) as any;
              const fullJournal = fullJournalResponse?.data as any;
              setJournal({ ...journalToUse, ...fullJournal, shortcode });
            } catch (err) {
              // If full fetch fails, use what we have
              setJournal({ ...journalToUse, shortcode });
            }
            
            setLoading(false);
            return; // Successfully found journal, exit early
          }
        } catch (apiError: any) {
          console.log('Shortcode API call failed, trying fallback method:', apiError.message);
          // Continue to fallback method below
        }
        
        // Fallback: Try to find via JournalShortcode table if API endpoint doesn't work
        const [journalsRes, shortcodesRes] = await Promise.all([
          adminAPI.getJournals(),
          adminAPI.getJournalShortcodes()
        ]);
        
        const journals = Array.isArray(journalsRes.data) 
          ? journalsRes.data 
          : (journalsRes.data as any)?.data || [];
        
        const shortcodes = (shortcodesRes.data || []) as Array<{ 
          shortcode: string; 
          journalName: string; 
          journalId?: number 
        }>;
        
        // Find shortcode entry
        const shortcodeEntry = shortcodes.find(sc => sc.shortcode === shortcode);
        
        if (!shortcodeEntry) {
          setError('Journal shortcode not found');
          setLoading(false);
          return;
        }
        
        // Try to find journal by journal ID from shortcode entry (MOST RELIABLE)
        let foundJournal = null;
        if (shortcodeEntry.journalId) {
          foundJournal = journals.find((j: any) => j.id === shortcodeEntry.journalId);
        }
        
        // If not found by ID, try to find by shortcode field in Journal table
        if (!foundJournal) {
          foundJournal = journals.find((j: any) => j.shortcode === shortcode);
        }
        
        // If still not found, try to match by journal name (last resort)
        if (!foundJournal) {
          const normalizedJournalName = shortcodeEntry.journalName.toLowerCase().trim();
          foundJournal = journals.find((j: any) => {
            const normalizedTitle = j.title?.toLowerCase().trim();
            return normalizedTitle === normalizedJournalName || 
                   (normalizedTitle && normalizedJournalName && 
                    (normalizedTitle.includes(normalizedJournalName) || normalizedJournalName.includes(normalizedTitle)));
          });
        }
        
        // Determine the journal ID to use for fetching full details
        const journalIdToFetch = foundJournal?.id || shortcodeEntry.journalId || null;
        
        let journalToUse: any = null;
        let journalIdForFetch: number | null = null;
        
        if (foundJournal && foundJournal.id > 0) {
          // We found a journal in the list - use its ID
          journalIdForFetch = foundJournal.id;
          console.log('Found journal in list with ID, fetching full details...', foundJournal.id);
        } else if (journalIdToFetch && journalIdToFetch > 0) {
          // We have a journal ID from shortcode entry - use it
          journalIdForFetch = journalIdToFetch;
          console.log('Using journalId from shortcode entry, fetching full details...', journalIdToFetch);
        }
        
        // Try to fetch by ID if we have one
        if (journalIdForFetch) {
          try {
            console.log(`Fetching full journal details for ID: ${journalIdForFetch}`);
            const fullJournalResponse = await adminAPI.getJournal(journalIdForFetch) as any;
            
            // Log the full response to debug
            console.log('Full API response:', {
              status: fullJournalResponse?.status,
              dataType: typeof fullJournalResponse?.data,
              dataKeys: fullJournalResponse?.data ? Object.keys(fullJournalResponse.data) : null,
            });
            
            // Handle different response structures
            let fullJournal: any;
            if (fullJournalResponse?.data) {
              // Check if data is nested
              if ((fullJournalResponse.data as any)?.data) {
                fullJournal = (fullJournalResponse.data as any).data;
              } else {
                fullJournal = fullJournalResponse.data;
              }
            } else {
              fullJournal = fullJournalResponse;
            }
            
            console.log('Parsed journal data:', {
              id: fullJournal?.id,
              title: fullJournal?.title,
              homePageContent: fullJournal?.homePageContent ? fullJournal.homePageContent.substring(0, 50) + '...' : null,
              aimsScope: fullJournal?.aimsScope ? fullJournal.aimsScope.substring(0, 50) + '...' : null,
              guidelines: fullJournal?.guidelines ? fullJournal.guidelines.substring(0, 50) + '...' : null,
              allKeys: Object.keys(fullJournal || {}),
            });
            
            // If we found a journal in the list, merge with full details
            // Otherwise, use the full journal data directly
            journalToUse = foundJournal 
              ? { ...foundJournal, ...fullJournal, shortcode }
              : { ...fullJournal, shortcode };
            
            console.log('Enhanced journal data:', {
              id: journalToUse.id,
              title: journalToUse.title,
              hasHomePageContent: !!journalToUse.homePageContent,
              hasAimsScope: !!journalToUse.aimsScope,
              hasGuidelines: !!journalToUse.guidelines,
              homePageContentLength: journalToUse.homePageContent?.length || 0,
              aimsScopeLength: journalToUse.aimsScope?.length || 0,
              guidelinesLength: journalToUse.guidelines?.length || 0,
            });
          } catch (err) {
            console.error('Error fetching full journal details by ID:', err);
            // Continue to try shortcode fallback
          }
        }
        
        // If we still don't have a journal, try fetching by shortcode directly from database
        if (!journalToUse) {
          console.warn('Journal not found by ID, trying to fetch by shortcode directly from database...', shortcode);
          try {
            // Use the same getJournal endpoint - it handles both IDs and shortcodes
            const shortcodeResponse = await adminAPI.getJournal(shortcode) as any;
            console.log('Shortcode response:', {
              status: shortcodeResponse?.status,
              hasData: !!shortcodeResponse?.data,
            });
            
            let journalByShortcode: any;
            if (shortcodeResponse?.data) {
              if (shortcodeResponse.data?.data) {
                journalByShortcode = shortcodeResponse.data.data;
              } else {
                journalByShortcode = shortcodeResponse.data;
              }
            } else {
              journalByShortcode = shortcodeResponse;
            }
            
            if (journalByShortcode && journalByShortcode.id) {
              console.log('✓ Found journal by shortcode from database:', journalByShortcode.title, 'ID:', journalByShortcode.id);
              
              // Update shortcode entry with journal ID if it's missing (we can't do this from frontend, but log it)
              if (!shortcodeEntry.journalId) {
                console.warn('⚠️ Shortcode entry should be updated with journalId:', journalByShortcode.id);
              }
              
              journalToUse = { ...journalByShortcode, shortcode };
            } else {
              console.warn('Journal fetched by shortcode but no ID found:', journalByShortcode);
            }
          } catch (shortcodeErr: any) {
            console.error('Error fetching journal by shortcode:', {
              message: shortcodeErr.message,
              response: shortcodeErr.response?.data,
              status: shortcodeErr.response?.status,
            });
          }
        }
        
        // If we have a journal, set it and load content
        if (journalToUse && journalToUse.id) {
          setJournal(journalToUse);
          
          const urlParams = new URLSearchParams(window.location.search);
          const section = urlParams.get('section') || 'home';
          setActiveMenu(section);
          
          let contentToShow = '';
          switch (section) {
            case 'home':
              contentToShow = journalToUse.homePageContent || journalToUse.journalDescription || journalToUse.description || 'Welcome to ' + journalToUse.title;
              break;
            case 'aims-scope':
              contentToShow = journalToUse.aimsScope || 'Aims and Scope content will be available soon.';
              break;
            case 'editorial-board':
              contentToShow = journalToUse.editorialBoard || 'Editorial Board information will be available soon.';
              break;
            case 'in-press':
              contentToShow = journalToUse.articlesInPress || 'Articles in Press will be available soon.';
              break;
            case 'current-issue':
              contentToShow = journalToUse.currentIssueContent || 'Current Issue content will be available soon.';
              break;
            case 'archive':
              contentToShow = journalToUse.archiveContent || 'Archive content will be available soon.';
              break;
            case 'guidelines':
              contentToShow = journalToUse.guidelines || 'Journal Guidelines will be available soon.';
              break;
            default:
              contentToShow = journalToUse.description || journalToUse.journalDescription || '';
          }
          setContent(contentToShow);
        } else {
          // If all else fails, create virtual journal
          console.error('Cannot fetch journal: No journal found and no journalId in shortcode entry');
          const virtualJournal = {
            id: -1,
            title: shortcodeEntry.journalName,
            description: 'Journal details will be available after journal admin completes setup.',
            shortcode: shortcode,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          setJournal(virtualJournal);
          
          const urlParams = new URLSearchParams(window.location.search);
          const section = urlParams.get('section') || 'home';
          setActiveMenu(section);
          setContent('Content will be available once the journal is fully configured.');
        }
      } catch (err: any) {
        setError(err.response?.data?.message || err.message || 'Failed to load journal');
      } finally {
        setLoading(false);
      }
    };

    fetchJournal();
  }, [shortcode]);

  const loadSectionContent = useCallback(async (section: string) => {
    if (!journal) {
      setContent('Content will be available once the journal is fully configured.');
      return;
    }

    // If journal has ID <= 0, it's a virtual journal with no content
    if (journal.id <= 0) {
      setContent('Content will be available once the journal is fully configured.');
      return;
    }

    try {
      setContentLoading(true);
      // Clear content immediately to prevent showing stale data
      setContent('');
      
      // Always fetch fresh journal details to ensure we have the latest content
      let journalData = journal;
      if (journal.id > 0) {
        try {
          console.log(`Loading section content for journal ID: ${journal.id}, section: ${section}`);
          // Add timestamp to prevent caching
          const fullJournalResponse = await adminAPI.getJournal(journal.id) as any;
          
          // Handle different response structures
          let fullJournalData: any;
          if (fullJournalResponse?.data) {
            if ((fullJournalResponse.data as any)?.data) {
              fullJournalData = (fullJournalResponse.data as any).data;
            } else {
              fullJournalData = fullJournalResponse.data;
            }
          } else {
            fullJournalData = fullJournalResponse;
          }
          
          // Merge with existing journal data, preserving shortcode
          journalData = { ...journal, ...fullJournalData, shortcode: journal.shortcode || shortcode };
          
          console.log(`Journal data for section ${section}:`, {
            hasHomePageContent: !!journalData.homePageContent,
            hasAimsScope: !!journalData.aimsScope,
            hasGuidelines: !!journalData.guidelines,
            hasJournalDescription: !!journalData.journalDescription,
            homePageContentPreview: journalData.homePageContent?.substring(0, 100),
            aimsScopePreview: journalData.aimsScope?.substring(0, 100),
            guidelinesPreview: journalData.guidelines?.substring(0, 100),
          });
          
          // Update journal state with fresh data
          setJournal(journalData);
        } catch (err) {
          console.error('Error fetching journal details:', err);
          console.error('Error details:', {
            message: (err as any)?.message,
            response: (err as any)?.response?.data,
            status: (err as any)?.response?.status,
          });
          // Use existing journal data but still proceed
        }
      }

      let contentToShow = '';
      
      switch (section) {
        case 'home':
          contentToShow = journalData.homePageContent || journalData.journalDescription || journalData.description || 'Welcome to ' + journalData.title;
          break;
        case 'aims-scope':
          contentToShow = journalData.aimsScope || 'Aims and Scope content will be available soon.';
          break;
        case 'editorial-board':
          // Load board members for editorial board section
          try {
            const membersResponse = await adminAPI.getBoardMembers(journalData.id);
            const members = (membersResponse.data as any[]) || [];
            setBoardMembers(members);
            contentToShow = journalData.editorialBoard || '';
          } catch (err) {
            console.error('Error loading board members:', err);
            setBoardMembers([]);
            contentToShow = journalData.editorialBoard || 'Editorial Board information will be available soon.';
          }
          break;
        case 'in-press':
          // Load articles in press - show articles with status INPRESS and showInInpressCards=true
          try {
            const articlesResponse = await adminAPI.getArticles({ 
              journalId: journalData.id, 
              status: 'INPRESS',
              showInInpressCards: 'true'
            });
            const inPressArticles = (articlesResponse.data as any[]) || [];
            setArticles(inPressArticles);
            contentToShow = journalData.articlesInPress || '';
          } catch (err) {
            console.error('Error loading articles in press:', err);
            setArticles([]);
            contentToShow = journalData.articlesInPress || 'Articles in Press will be available soon.';
          }
          break;
        case 'current-issue':
          // Load current issue articles - show articles with status CURRENT_ISSUE
          try {
            const articlesResponse = await adminAPI.getArticles({ 
              journalId: journalData.id, 
              status: 'CURRENT_ISSUE' 
            });
            const currentArticles = (articlesResponse.data as any[]) || [];
            setArticles(currentArticles);
            contentToShow = journalData.currentIssueContent || '';
          } catch (err) {
            console.error('Error loading current issue articles:', err);
            setArticles([]);
            contentToShow = journalData.currentIssueContent || 'Current Issue content will be available soon.';
          }
          break;
        case 'archive':
          // Load archive articles and organize by year
          // Show articles that have inPressMonth and inPressYear set (moved to months/archive)
          try {
            // Fetch all articles, then filter to show only those with month/year set
            // Set a high limit to get all articles (or fetch in batches if needed)
            const articlesResponse = await adminAPI.getArticles({ 
              journalId: journalData.id,
              limit: 1000, // Get all articles (adjust if you have more than 1000)
              page: 1
              // No status filter - get all articles, then filter client-side
            });
            const allArticles = (articlesResponse.data as any[]) || [];
            // Filter to show articles that have inPressMonth and inPressYear set (archived articles)
            const filteredArticles = allArticles.filter((article: any) => {
              const hasMonth = article.inPressMonth && String(article.inPressMonth).trim() !== '';
              const hasYear = article.inPressYear && String(article.inPressYear).trim() !== '';
              return hasMonth && hasYear;
            });
            setArticles(filteredArticles);
            
            console.log('Loading archive articles for journal:', journalData.id, 'Total articles:', filteredArticles.length);
            
            const issuesByYear = new Map<number, any[]>();
            filteredArticles.forEach((article: any) => {
              // Use inPressYear from article (archived articles use inPressYear)
              let year: number;
              if (article.inPressYear) {
                year = parseInt(String(article.inPressYear));
              } else if (article.year) {
                // Fallback to year if inPressYear not set
                year = parseInt(String(article.year));
              } else if (article.publishedAt) {
                const publishedDate = new Date(article.publishedAt);
                year = publishedDate.getFullYear();
              } else if (article.acceptedAt) {
                const acceptedDate = new Date(article.acceptedAt);
                year = acceptedDate.getFullYear();
              } else {
                return; // Skip articles without year info
              }
              
              // Volume and Issue are now required fields, but provide fallback for existing articles
              // Ensure they are strings (handle numbers from dropdowns)
              const volume = article.volumeNo ? String(article.volumeNo) : '1';
              const issue = article.issueNo ? String(article.issueNo) : '1';
              
              // Skip if volume or issue is missing (shouldn't happen for new articles)
              if (!volume || !issue || volume === 'undefined' || issue === 'undefined') {
                console.warn('Article missing volume or issue:', article.id, article.title);
                return;
              }
              
              if (!issuesByYear.has(year)) {
                issuesByYear.set(year, []);
                setExpandedYears(prev => new Set(prev).add(year));
              }
              
              const yearIssues = issuesByYear.get(year)!;
              const existingIssue = yearIssues.find(
                (i: any) => i.volume === volume && i.issue === issue
              );
              
              if (existingIssue) {
                existingIssue.articleCount++;
                existingIssue.articles.push(article);
              } else {
                yearIssues.push({
                  volume,
                  issue,
                  year,
                  articleCount: 1,
                  articles: [article]
                });
              }
            });
            
            // Sort issues within each year (descending - newest first)
            issuesByYear.forEach((issues) => {
              issues.sort((a: any, b: any) => {
                // Ensure volumes and issues are strings, then convert to numbers for comparison
                const volA = parseInt(String(a.volume || '0'));
                const volB = parseInt(String(b.volume || '0'));
                const volCompare = volB - volA;
                if (volCompare !== 0) return volCompare;
                
                const issueA = parseInt(String(a.issue || '0'));
                const issueB = parseInt(String(b.issue || '0'));
                return issueB - issueA;
              });
            });
            
            console.log('Archive issues organized:', Array.from(issuesByYear.keys()), 'years');
            setArchiveIssues(issuesByYear);
            contentToShow = journalData.archiveContent || '';
          } catch (err) {
            console.error('Error loading archive:', err);
            setArticles([]);
            setArchiveIssues(new Map());
            contentToShow = journalData.archiveContent || 'Archive content will be available soon.';
          }
          break;
        case 'guidelines':
          contentToShow = journalData.guidelines || 'Journal Guidelines will be available soon.';
          break;
        default:
          contentToShow = journalData.description || '';
      }

      setContent(contentToShow);
    } catch (err) {
      console.error('Error loading section content:', err);
      setContent('Content not available.');
    } finally {
      setContentLoading(false);
    }
  }, [journal, shortcode]);

  useEffect(() => {
    // Get section from URL query params when pathname or search changes
    if (journal) {
      const section = searchParams.get('section') || 'home';
      
      // Always update active menu and load content when URL changes
      if (activeMenu !== section) {
        setActiveMenu(section);
        // Clear previous section data to prevent showing stale content
        setContent('');
        setBoardMembers([]);
        setArticles([]);
        setArchiveIssues(new Map());
        
        // Load content for the new section
        if (journal && journal.id > 0) {
          loadSectionContent(section);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams, journal?.id]);

  if (loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <i className="pi pi-spin pi-spinner text-4xl text-blue-600 mb-4"></i>
            <p className="text-gray-600">Loading journal...</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (error && !journal) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="max-w-2xl mx-auto px-4">
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <h1 className="text-2xl font-bold text-red-800 mb-2">Journal Not Found</h1>
              <p className="text-red-600 mb-4">{error || 'The journal you are looking for does not exist.'}</p>
              <Link
                href="/journals"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <i className="pi pi-arrow-left"></i>
                Back to Journals
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!journal) {
    return null;
  }

  const isVirtualJournal = journal.id === -1;
  const getImageUrl = (imagePath: string | undefined) => {
    if (!imagePath) return null;
    return getFileUrl(imagePath);
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        {/* Full Width Container */}
        <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
          {/* Back Button */}
          <Link
            href="/journals"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 text-sm font-medium transition-colors"
          >
            <i className="pi pi-arrow-left"></i>
            <span>Back to Journals</span>
          </Link>

          {/* Enterprise Header Section with Banner Background */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 mb-6 overflow-hidden w-full">
            <div 
              className="relative px-6 md:px-8 py-8 md:py-12"
              style={{
                backgroundImage: journal.bannerImage 
                  ? `url(${getImageUrl(journal.bannerImage)})` 
                  : 'linear-gradient(to right, #2563eb, #1d4ed8, #4338ca)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }}
            >
              {/* Overlay for better text readability */}
              <div 
                className="absolute inset-0"
                style={{
                  backgroundColor: journal.bannerImage ? 'rgba(0, 0, 0, 0.5)' : 'transparent'
                }}
              />
              
              {/* Content */}
              <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                  <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2 drop-shadow-lg">
                    {journal.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-4 text-white/95 text-sm drop-shadow-md">
                    {journal.issn && (
                      <div className="flex items-center gap-2">
                        <i className="pi pi-book text-white/90"></i>
                        <span className="font-medium">ISSN: {journal.issn}</span>
                      </div>
                    )}
                    {journal.publisher && (
                      <div className="flex items-center gap-2">
                        <i className="pi pi-building text-white/90"></i>
                        <span>{journal.publisher}</span>
                      </div>
                    )}
                    {journal.accessType && (
                      <div className="flex items-center gap-2">
                        <i className="pi pi-globe text-white/90"></i>
                        <span>{journal.accessType}</span>
                      </div>
                    )}
                  </div>
                </div>
                {journal.coverImage && (
                  <div className="flex-shrink-0">
                    <img
                      src={getImageUrl(journal.coverImage) || ''}
                      alt={journal.title}
                      className="w-32 h-40 object-cover rounded-lg border-4 border-white shadow-lg"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
            
            {/* Journal Metadata Bar */}
            {(journal.subjectArea || journal.category || journal.discipline || journal.impactFactor) && (
              <div className="px-6 md:px-8 py-4 bg-gray-50 border-t border-gray-200">
                <div className="flex flex-wrap items-center gap-6 text-sm">
                  {journal.subjectArea && (
                    <div className="flex items-center gap-2">
                      <i className="pi pi-tag text-blue-600"></i>
                      <span className="text-gray-700"><span className="font-semibold">Subject:</span> {journal.subjectArea}</span>
                    </div>
                  )}
                  {journal.category && (
                    <div className="flex items-center gap-2">
                      <i className="pi pi-folder text-blue-600"></i>
                      <span className="text-gray-700"><span className="font-semibold">Category:</span> {journal.category}</span>
                    </div>
                  )}
                  {journal.impactFactor && (
                    <div className="flex items-center gap-2">
                      <i className="pi pi-chart-line text-green-600"></i>
                      <span className="text-gray-700"><span className="font-semibold">Impact Factor:</span> {journal.impactFactor}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col lg:flex-row gap-6 w-full">
            {/* Left Sidebar - Menu */}
            <aside className="w-full lg:w-72 flex-shrink-0">
              <div className="bg-white rounded-xl shadow-lg overflow-hidden sticky top-6">
                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <i className="pi pi-bars text-blue-600"></i>
                    <span>Journal Menu</span>
                  </h3>
                    <nav className="space-y-2">
                      {menuItems.map((item) => {
                        const isActive = activeMenu === item.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={async (e) => {
                              e.preventDefault();
                              const section = item.id;
                              
                              // Don't reload if clicking the same section
                              if (activeMenu === section) {
                                return;
                              }
                              
                              // Update URL first
                              const url = section === 'home' 
                                ? `/journals/${shortcode}` 
                                : `/journals/${shortcode}?section=${section}`;
                              router.push(url, { scroll: false });
                              
                              // Update active menu and load content
                              setActiveMenu(section);
                              if (journal && journal.id > 0) {
                                await loadSectionContent(section);
                              }
                            }}
                            className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                              isActive
                                ? 'shadow-md'
                                : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600 hover:shadow-sm'
                            }`}
                            style={{
                              fontWeight: isActive ? '600' : '500',
                              fontSize: '0.95rem',
                              border: 'none',
                              backgroundColor: isActive ? '#2563eb' : 'transparent',
                              backgroundImage: isActive ? 'linear-gradient(to right, #2563eb, #1d4ed8)' : 'none',
                              cursor: 'pointer',
                              color: isActive ? '#ffffff' : '#374151'
                            }}
                          >
                            <i 
                              className={item.icon} 
                              style={{ 
                                fontSize: '1.1rem',
                                color: isActive ? '#ffffff' : '#6b7280'
                              }}
                            ></i>
                            <span style={{ color: isActive ? '#ffffff' : '#374151' }}>{item.label}</span>
                          </button>
                        );
                      })}
                    
                    {/* Submit Manuscript Button */}
                    <Link
                      href="/submit-manuscript"
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-white transition-all duration-200 mt-4 shadow-md hover:shadow-lg font-semibold"
                      style={{
                        backgroundColor: '#10b981',
                        background: 'linear-gradient(to right, #10b981, #059669)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'linear-gradient(to right, #059669, #047857)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'linear-gradient(to right, #10b981, #059669)';
                      }}
                    >
                      <i className="pi pi-upload" style={{ fontSize: '1.1rem' }}></i>
                      <span>Submit Manuscript</span>
                    </Link>
                  </nav>
                </div>
              </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 min-w-0">
              {/* Content Sections - All with consistent styling */}
              {activeMenu === 'home' ? (
                <div className="space-y-6 w-full">
                  {/* Editor & Metrics Card */}
                  {(journal.editorName || journal.impactFactorValue || journal.citationsPercentage || journal.acceptancePercentage) && (
                    <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 w-full">
                      <div className="flex flex-col md:flex-row gap-6 items-start">
                        {/* Editor Info */}
                        {(journal.editorName || journal.editorImage) && (
                          <div className="flex items-start gap-4 flex-1">
                            {journal.editorImage && (
                              <img
                                src={getImageUrl(journal.editorImage) || ''}
                                alt={journal.editorName || 'Editor'}
                                className="w-20 h-20 rounded-full object-cover border-2 border-blue-200"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                              />
                            )}
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 mb-1">Editor-In-Chief</h3>
                              <p className="text-base font-bold text-gray-800">{journal.editorName || 'Not specified'}</p>
                              {journal.editorAffiliation && (
                                <p className="text-sm text-gray-600 mt-1">{journal.editorAffiliation}</p>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Metrics */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-1">
                          {journal.impactFactorValue && (
                            <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                              <div className="flex items-center gap-2 mb-2">
                                <i className="pi pi-chart-line text-blue-600"></i>
                                <span className="text-sm font-semibold text-gray-700">Impact Factor</span>
                              </div>
                              <p className="text-2xl font-bold text-blue-600">{journal.impactFactorValue}</p>
                            </div>
                          )}
                          {journal.citationsPercentage && (
                            <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                              <div className="flex items-center gap-2 mb-2">
                                <i className="pi pi-chart-bar text-green-600"></i>
                                <span className="text-sm font-semibold text-gray-700">Citations</span>
                              </div>
                              <p className="text-2xl font-bold text-green-600">{journal.citationsPercentage}%</p>
                            </div>
                          )}
                          {journal.acceptancePercentage && (
                            <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
                              <div className="flex items-center gap-2 mb-2">
                                <i className="pi pi-check-circle text-purple-600"></i>
                                <span className="text-sm font-semibold text-gray-700">Acceptance</span>
                              </div>
                              <p className="text-2xl font-bold text-purple-600">{journal.acceptancePercentage}%</p>
                            </div>
                          )}
                        </div>

                        {/* Google Analytics */}
                        {journal.googleAnalyticsValue && (
                          <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200 flex-shrink-0">
                            <div className="flex items-center gap-2 mb-2">
                              <i className="pi pi-chart-pie text-yellow-600"></i>
                              <span className="text-sm font-semibold text-gray-700">{journal.googleAnalyticsTitle || 'Google Analytics'}</span>
                            </div>
                            <p className="text-3xl font-bold text-yellow-600 mb-1">{journal.googleAnalyticsValue}</p>
                            {journal.googleAnalyticsUrl && (
                              <p className="text-xs text-gray-600">{journal.googleAnalyticsUrl}</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Journal Description */}
                  {journal.journalDescription && (
                    <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 w-full">
                      <h3 className="text-2xl font-bold text-gray-900 mb-4">About This Journal</h3>
                      <div 
                        className="prose prose-lg max-w-none text-gray-700 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: journal.journalDescription }}
                      />
                    </div>
                  )}

                  {/* Article Formats */}
                  {journal.articleFormats && (
                    <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 w-full">
                      <h3 className="text-2xl font-bold text-gray-900 mb-4">Article Acceptance</h3>
                      <div className="prose max-w-none">
                        <p className="text-gray-700 whitespace-pre-line">{journal.articleFormats}</p>
                      </div>
                    </div>
                  )}

                  {/* PubMed Articles */}
                  {journal.pubmedArticles && (
                    <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 w-full">
                      <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <i className="pi pi-bookmark text-blue-600"></i>
                        Our PubMed Indexed Articles
                      </h3>
                      <div className="space-y-3">
                        {(() => {
                          try {
                            const articles = JSON.parse(journal.pubmedArticles);
                            return articles.map((article: any, index: number) => (
                              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                <div className="flex-1">
                                  <p className="font-medium text-gray-900">{article.title}</p>
                                  {article.pmid && (
                                    <p className="text-sm text-gray-600">PMID: {article.pmid}</p>
                                  )}
                                </div>
                                {article.url && (
                                  <a
                                    href={article.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-700"
                                  >
                                    <i className="pi pi-external-link"></i>
                                  </a>
                                )}
                              </div>
                            ));
                          } catch (e) {
                            return <p className="text-gray-500 italic">Invalid article format</p>;
                          }
                        })()}
                      </div>
                    </div>
                  )}

                  {/* Additional Home Page Content */}
                  {activeMenu === 'home' && (
                    <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 w-full">
                      {contentLoading ? (
                        <div className="flex items-center justify-center py-12">
                          <i className="pi pi-spin pi-spinner text-4xl text-blue-600"></i>
                        </div>
                      ) : content ? (
                        <div 
                          className="prose prose-lg max-w-none text-gray-700 leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br>') }}
                        />
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <i className="pi pi-file-edit text-4xl mb-4"></i>
                          <p className="text-lg">Home page content will be available soon.</p>
                          <p className="text-sm mt-2">Journal admin can add content from the journal admin panel.</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : activeMenu === 'editorial-board' ? (
                /* Editorial Board - Display Board Members */
                <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 w-full">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-4 border-b-2 border-gray-200">
                    Editorial Board
                  </h2>
                  
                  {contentLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <i className="pi pi-spin pi-spinner text-4xl text-blue-600"></i>
                    </div>
                  ) : boardMembers.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6">
                      {boardMembers.map((member) => {
                        const getMemberImageUrl = (imagePath: string | undefined) => {
                          if (!imagePath) return null;
                          
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
                        
                        const imageUrl = getMemberImageUrl(member.imageUrl);
                        
                        return (
                          <div 
                            key={member.id} 
                            className="border-l-4 border-blue-500 bg-gray-50 rounded-lg p-6 hover:shadow-md transition-shadow w-full"
                          >
                            <div className="flex gap-4 items-start w-full">
                              {imageUrl ? (
                                <img 
                                  src={imageUrl} 
                                  alt={member.name}
                                  className="w-24 h-32 object-cover rounded-lg flex-shrink-0"
                                  onError={(e) => {
                                    console.error('Image load error in viewer:', member.imageUrl);
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                  }}
                                  onLoad={() => {
                                    console.log('Image loaded successfully in viewer:', member.imageUrl);
                                  }}
                                />
                              ) : (
                                <div className="w-24 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                  <span className="text-3xl font-bold text-white">
                                    {member.name?.charAt(0).toUpperCase() || 'E'}
                                  </span>
                                </div>
                              )}
                              
                              <div className="flex-1 min-w-0 flex-grow">
                                <h3 className="text-xl font-bold text-gray-900 mb-1 break-words">{member.name}</h3>
                                <p className="text-sm font-semibold text-blue-600 mb-2 break-words">{member.memberType || member.position}</p>
                                {member.editorType && (
                                  <p className="text-xs text-gray-500 mb-2 break-words">{member.editorType}</p>
                                )}
                                {member.affiliation && (
                                  <p className="text-sm text-gray-700 mb-2 flex items-center gap-1">
                                    <i className="pi pi-building text-gray-400 flex-shrink-0"></i>
                                    <span className="break-words">{member.affiliation}</span>
                                  </p>
                                )}
                                {member.email && (
                                  <p className="text-sm text-gray-700 mb-2 flex items-center gap-1">
                                    <i className="pi pi-envelope text-gray-400 flex-shrink-0"></i>
                                    <a 
                                      href={`mailto:${member.email}`} 
                                      className="text-blue-600 hover:underline whitespace-nowrap"
                                    >
                                      {member.email}
                                    </a>
                                  </p>
                                )}
                                {member.description && (
                                  <div 
                                    className="text-sm text-gray-600 mb-2 prose prose-sm max-w-none break-words overflow-wrap-anywhere"
                                    dangerouslySetInnerHTML={{ __html: member.description }}
                                  />
                                )}
                                {member.biography && (
                                  <div 
                                    className="text-sm text-gray-600 mb-2 prose prose-sm max-w-none break-words overflow-wrap-anywhere"
                                    dangerouslySetInnerHTML={{ __html: member.biography }}
                                  />
                                )}
                                {member.profileUrl && (
                                  <a 
                                    href={member.profileUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline text-sm flex items-center gap-1"
                                  >
                                    <i className="pi pi-external-link"></i>
                                    <span>View Profile</span>
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <i className="pi pi-users text-6xl text-gray-300 mb-4"></i>
                      <p className="text-gray-500 text-lg">No editorial board members available yet.</p>
                      {content && (
                        <div 
                          className="prose prose-lg max-w-none text-gray-700 leading-relaxed mt-6"
                          dangerouslySetInnerHTML={{ __html: content }} 
                        />
                      )}
                    </div>
                  )}
                </div>
              ) : activeMenu === 'in-press' || activeMenu === 'current-issue' ? (
                /* Articles in Press / Current Issue - Display Articles */
                <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 w-full">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-4 border-b-2 border-gray-200 flex items-center gap-3">
                    <i className={`pi ${activeMenu === 'in-press' ? 'pi-file-edit' : 'pi-list'} text-blue-600`}></i>
                    <span>{activeMenu === 'in-press' ? 'Articles Inpress' : 'Current Issue Articles'}</span>
                  </h2>
                  
                  {contentLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <i className="pi pi-spin pi-spinner text-4xl text-blue-600"></i>
                    </div>
                  ) : articles.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {articles.map((article: any) => {
                        const formatDate = (dateString?: string) => {
                          if (!dateString) return 'N/A';
                          try {
                            const date = new Date(dateString);
                            return date.toISOString().split('T')[0];
                          } catch {
                            return dateString;
                          }
                        };
                        
                        const formatAuthors = (authors?: Array<{ name: string }>) => {
                          if (!authors || authors.length === 0) return 'No authors listed';
                          return authors.map((a: any) => a.name).join(', ');
                        };
                        
                        const getImageUrl = (imagePath?: string) => {
                          if (!imagePath) return '';
                          return getFileUrl(imagePath);
                        };
                        
                        return (
                          <div 
                            key={article.id} 
                            className="bg-white rounded-xl shadow-lg border-2 border-gray-200 hover:shadow-xl transition-all duration-300 overflow-hidden"
                            style={{ minHeight: '320px' }}
                          >
                            {/* Article Header with Type Badge */}
                            <div className="p-6 pb-4">
                              <div className="flex items-start justify-between mb-3">
                                {article.articleType && (
                                  <span className="inline-block px-4 py-1.5 text-xs font-bold text-white bg-gray-700 rounded-full">
                                    {article.articleType}
                                  </span>
                                )}
                                {article.pdfUrl && (
                                  <a
                                    href={getImageUrl(article.pdfUrl)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-10 h-10 rounded-full border-2 border-red-500 bg-white hover:bg-red-50 flex items-center justify-center transition-colors shadow-sm"
                                    title="Download PDF"
                                  >
                                    <i className="pi pi-file-pdf text-red-600 text-sm"></i>
                                  </a>
                                )}
                              </div>

                              {/* Article Title */}
                              <h3 className="text-lg font-bold text-gray-900 mb-4 leading-tight line-clamp-2" style={{
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                minHeight: '3.5rem'
                              }}>
                                {article.title}
                              </h3>

                              {/* Authors */}
                              {article.authors && article.authors.length > 0 && (
                                <div className="mb-4 flex items-start gap-2">
                                  <i className="pi pi-user text-blue-600 mt-0.5 flex-shrink-0"></i>
                                  <div className="min-w-0">
                                    <span className="text-sm font-semibold text-gray-700">Author(s): </span>
                                    <span className="text-sm text-gray-600 break-words">{formatAuthors(article.authors)}</span>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Dates Section */}
                            <div className="px-6 pb-4 space-y-2">
                              {article.receivedAt && (
                                <div className="flex items-center gap-2 text-sm">
                                  <i className="pi pi-hourglass text-gray-500 flex-shrink-0"></i>
                                  <span className="text-gray-600">
                                    <span className="font-semibold">Received:</span> {formatDate(article.receivedAt)}
                                  </span>
                                </div>
                              )}
                              {article.acceptedAt && (
                                <div className="flex items-center gap-2 text-sm">
                                  <i className={`pi pi-check-circle ${activeMenu === 'in-press' ? 'text-green-600' : 'text-gray-500'} flex-shrink-0`}></i>
                                  <span className="text-gray-600">
                                    <span className="font-semibold">Accepted:</span> {formatDate(article.acceptedAt)}
                                  </span>
                                </div>
                              )}
                              {article.publishedAt && (
                                <div className="flex items-center gap-2 text-sm">
                                  <i className={`pi pi-calendar ${activeMenu === 'current-issue' ? 'text-blue-600' : 'text-gray-500'} flex-shrink-0`}></i>
                                  <span className="text-gray-600">
                                    <span className="font-semibold">Published:</span> {formatDate(article.publishedAt)}
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Action Buttons */}
                            <div className="px-6 pb-6 pt-4 border-t border-gray-100">
                              <div className="flex items-center justify-center gap-3">
                                <button
                                  type="button"
                                  onClick={() => {
                                    // Open full text view or article details
                                    window.open(`/articles/${article.id}`, '_blank');
                                  }}
                                  className="w-12 h-12 rounded-full border-2 border-gray-300 bg-white hover:bg-gray-50 hover:border-gray-400 flex items-center justify-center transition-all shadow-sm"
                                  title="View Full Text"
                                >
                                  <i className="pi pi-file text-gray-600 text-sm"></i>
                                </button>
                                {article.pdfUrl && (
                                  <a
                                    href={getImageUrl(article.pdfUrl)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-12 h-12 rounded-full border-2 border-red-500 bg-white hover:bg-red-50 hover:border-red-600 flex items-center justify-center transition-all shadow-sm"
                                    title="Download PDF"
                                  >
                                    <i className={`pi ${activeMenu === 'current-issue' ? 'pi-file-pdf' : 'pi-download'} text-red-600 text-sm`}></i>
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <i className={`pi ${activeMenu === 'in-press' ? 'pi-file-edit' : 'pi-calendar'} text-6xl text-gray-300 mb-4`}></i>
                      <p className="text-gray-500 text-lg">
                        {activeMenu === 'in-press' 
                          ? 'No articles in press available yet.' 
                          : 'No current issue articles available yet.'}
                      </p>
                      {content && (
                        <div 
                          className="prose prose-lg max-w-none text-gray-700 leading-relaxed mt-6"
                          dangerouslySetInnerHTML={{ __html: content }} 
                        />
                      )}
                    </div>
                  )}
                </div>
              ) : activeMenu === 'archive' ? (
                /* Archive - Display by Year with Issue Cards */
                <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 w-full">
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-gray-200">
                    <i className="pi pi-folder-open text-blue-600"></i>
                    <h2 className="text-2xl font-bold text-gray-900">Archive</h2>
                  </div>
                  
                  {contentLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <i className="pi pi-spin pi-spinner text-4xl text-blue-600"></i>
                    </div>
                  ) : archiveIssues.size > 0 ? (
                    <div className="space-y-6">
                      {/* Vertical Timeline Line */}
                      <div className="relative">
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-500" style={{ marginLeft: '1rem' }}></div>
                        
                        {Array.from(archiveIssues.keys()).sort((a, b) => b - a).map((year) => {
                          const issues = archiveIssues.get(year) || [];
                          const isExpanded = expandedYears.has(year);
                          
                          return (
                            <div key={year} className="relative pl-12 mb-6">
                              {/* Year Header */}
                              <button
                                type="button"
                                onClick={() => {
                                  setExpandedYears(prev => {
                                    const newSet = new Set(prev);
                                    if (newSet.has(year)) {
                                      newSet.delete(year);
                                    } else {
                                      newSet.add(year);
                                    }
                                    return newSet;
                                  });
                                }}
                                className="flex items-center gap-3 mb-4"
                              >
                                <i className={`pi ${isExpanded ? 'pi-chevron-down' : 'pi-chevron-right'} text-blue-600`}></i>
                                <span className="text-xl font-bold text-gray-900">YEAR: {year}</span>
                              </button>

                              {/* Issues Grid */}
                              {isExpanded && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                  {issues.map((issue: any, index: number) => {
                                    // Helper function to get file URL (same as In Press section)
                                    const getImageUrl = (imagePath?: string) => {
                                      if (!imagePath) return '';
                                      return getFileUrl(imagePath);
                                    };
                                    
                                    // Find first article with PDF
                                    const articleWithPdf = issue.articles?.find((article: any) => article.pdfUrl);
                                    
                                    // Debug: Log PDF availability
                                    if (issue.articles && issue.articles.length > 0) {
                                      console.log(`Archive Issue ${issue.volume}-${issue.issue}:`, {
                                        totalArticles: issue.articles.length,
                                        articlesWithPdf: issue.articles.filter((a: any) => a.pdfUrl).length,
                                        firstArticlePdf: issue.articles[0]?.pdfUrl,
                                        foundPdf: !!articleWithPdf?.pdfUrl
                                      });
                                    }
                                    
                                    return (
                                      <div
                                        key={`${issue.volume}-${issue.issue}-${index}`}
                                        className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow text-center"
                                      >
                                        {/* Book Icon */}
                                        <div className="mb-4 flex justify-center">
                                          <i className="pi pi-book text-4xl text-blue-500"></i>
                                        </div>
                                        
                                        {/* Volume and Issue */}
                                        <h3 className="text-lg font-bold text-gray-900 mb-4">
                                          Volume {issue.volume}, Issue {issue.issue}
                                        </h3>
                                        
                                        {/* View Articles Button */}
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setSelectedArchiveIssue(issue);
                                            setShowArchiveArticlesDialog(true);
                                          }}
                                          className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors flex items-center justify-center gap-2 mb-2"
                                        >
                                          <i className="pi pi-eye"></i>
                                          <span>View Articles</span>
                                        </button>
                                        
                                        {/* Action Buttons - Same as dialog (View Full Text + PDF)
                                        {issue.articles && issue.articles.length > 0 && (
                                          <div className="flex items-center justify-center gap-3">
                                            <button
                                              type="button"
                                              onClick={() => {
                                                const firstArticle = issue.articles[0];
                                                if (firstArticle?.id) {
                                                  window.open(`/articles/${firstArticle.id}`, '_blank');
                                                }
                                              }}
                                              className="w-12 h-12 rounded-full border-2 border-gray-300 bg-white hover:bg-gray-50 hover:border-gray-400 flex items-center justify-center transition-all shadow-sm"
                                              title="View Full Text"
                                            >
                                              <i className="pi pi-file text-gray-600 text-sm"></i>
                                            </button>
                                            
                                            {articleWithPdf?.pdfUrl && (
                                              <a
                                                href={getImageUrl(articleWithPdf.pdfUrl)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="w-12 h-12 rounded-full border-2 border-red-500 bg-white hover:bg-red-50 hover:border-red-600 flex items-center justify-center transition-all shadow-sm"
                                                title="Download PDF"
                                              >
                                                <i className="pi pi-file-pdf text-red-600 text-sm"></i>
                                              </a>
                                            )}
                                          </div>
                                        )} */}
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <i className="pi pi-folder-open text-6xl text-gray-300 mb-4"></i>
                      <p className="text-gray-500 text-lg">No archive available yet.</p>
                      {content && (
                        <div 
                          className="prose prose-lg max-w-none text-gray-700 leading-relaxed mt-6"
                          dangerouslySetInnerHTML={{ __html: content }} 
                        />
                      )}
                    </div>
                  )}
                </div>
              ) : (
                /* Other Menu Content */
                <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 w-full">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-4 border-b-2 border-gray-200">
                    {activeMenu === 'aims-scope' && 'Aims and Scope'}
                    {activeMenu === 'guidelines' && 'Journal Guidelines'}
                  </h2>
                  {contentLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <i className="pi pi-spin pi-spinner text-4xl text-blue-600"></i>
                    </div>
                  ) : (
                    <div 
                      className="prose prose-lg max-w-none text-gray-700 leading-relaxed"
                      style={{ 
                        lineHeight: '1.8',
                        fontSize: '1.1rem',
                        color: '#374151'
                      }}
                    >
                      {content ? (
                        <div 
                          dangerouslySetInnerHTML={{ __html: content }} 
                          style={{
                            fontSize: '1.1rem',
                            lineHeight: '1.8'
                          }}
                        />
                      ) : (
                        <p className="text-gray-500 italic text-lg">Content will be available soon.</p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Stats Section */}
              {!isVirtualJournal && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <div className="bg-white rounded-lg shadow-md p-6 text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      {journal._count?.articles || 0}
                    </div>
                    <div className="text-gray-600 flex items-center justify-center gap-2">
                      <i className="pi pi-file"></i>
                      <span>Articles</span>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg shadow-md p-6 text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      <i className="pi pi-check-circle"></i>
                    </div>
                    <div className="text-gray-600">Peer Reviewed</div>
                  </div>

                  <div className="bg-white rounded-lg shadow-md p-6 text-center">
                    <div className="text-3xl font-bold text-purple-600 mb-2">
                      <i className="pi pi-book"></i>
                    </div>
                    <div className="text-gray-600">Open Access</div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Sidebar - Google Indexing Image */}
            {journal.googleIndexingImage && (
              <aside className="w-full lg:w-80 xl:w-96 flex-shrink-0">
                <div className="bg-white rounded-xl shadow-lg overflow-hidden sticky top-6">
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <i className="pi pi-google text-blue-600"></i>
                      <span>Google Indexing</span>
                    </h3>
                    <div className="space-y-4">
                      <img
                        src={getImageUrl(journal.googleIndexingImage) || ''}
                        alt="Google Indexing"
                        className="w-full h-auto object-contain rounded-lg border-2 border-gray-200 shadow-md"
                        style={{ maxHeight: '600px' }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                      {journal.googleAnalyticsValue && (
                        <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                          <div className="flex items-center gap-2 mb-2">
                            <i className="pi pi-chart-pie text-yellow-600"></i>
                            <span className="text-sm font-semibold text-gray-700">{journal.googleAnalyticsTitle || 'Google Analytics'}</span>
                          </div>
                          <p className="text-2xl font-bold text-yellow-600 mb-1">{journal.googleAnalyticsValue}</p>
                          {journal.googleAnalyticsUrl && (
                            <p className="text-xs text-gray-600">{journal.googleAnalyticsUrl}</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </aside>
            )}
          </div>
        </div>
      </main>

      {/* Archive Articles Dialog */}
      <Dialog
        header={selectedArchiveIssue ? `Volume ${selectedArchiveIssue.volume}, Issue ${selectedArchiveIssue.issue} - Articles` : 'Articles'}
        visible={showArchiveArticlesDialog}
        style={{ width: '90vw', maxWidth: '1200px' }}
        contentStyle={{ maxHeight: 'calc(90vh - 120px)', overflow: 'auto' }}
        onHide={() => {
          setShowArchiveArticlesDialog(false);
          setSelectedArchiveIssue(null);
        }}
        footer={
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setShowArchiveArticlesDialog(false);
                setSelectedArchiveIssue(null);
              }}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
            >
              Close
            </button>
          </div>
        }
      >
        {selectedArchiveIssue && selectedArchiveIssue.articles && selectedArchiveIssue.articles.length > 0 ? (
          <div className="space-y-4">
            {selectedArchiveIssue.articles.map((article: any) => {
              const formatDate = (dateString?: string) => {
                if (!dateString) return 'N/A';
                try {
                  const date = new Date(dateString);
                  return date.toISOString().split('T')[0];
                } catch {
                  return dateString;
                }
              };
              
              const formatAuthors = (authors?: Array<{ name: string }>) => {
                if (!authors || authors.length === 0) return 'No authors listed';
                return authors.map((a: any) => a.name).join(', ');
              };
              
              const getImageUrl = (imagePath?: string) => {
                if (!imagePath) return '';
                return getFileUrl(imagePath);
              };
              
              return (
                <div key={article.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  {/* Article Header with Type Badge and PDF Icon */}
                  <div className="flex items-start justify-between mb-3">
                    {article.articleType && (
                      <span className="inline-block px-3 py-1 text-xs font-bold text-white bg-gray-700 rounded-full">
                        {article.articleType}
                      </span>
                    )}
                    <div className="flex items-center gap-2">
                      {article.doi && (
                        <span className="inline-block px-3 py-1 text-xs font-bold text-white bg-orange-500 rounded-full">
                          doi
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Article Title */}
                  <h3 className="text-lg font-bold text-blue-600 mb-3">{article.title}</h3>
                  
                  {/* Authors */}
                  {article.authors && article.authors.length > 0 && (
                    <div className="mb-3 flex items-start gap-2">
                      <i className="pi pi-user text-gray-500 mt-0.5 flex-shrink-0"></i>
                      <span className="text-sm text-gray-700">
                        <span className="font-semibold">Authors: </span>
                        {formatAuthors(article.authors)}
                      </span>
                    </div>
                  )}
                  
                  {/* Dates Section */}
                  <div className="space-y-1 text-sm text-gray-600 mb-4">
                    {article.receivedAt && (
                      <div className="flex items-center gap-2">
                        <i className="pi pi-hourglass text-gray-500"></i>
                        <span><span className="font-semibold">Received:</span> {formatDate(article.receivedAt)}</span>
                      </div>
                    )}
                    {article.acceptedAt && (
                      <div className="flex items-center gap-2">
                        <i className="pi pi-check-circle text-green-600"></i>
                        <span><span className="font-semibold">Accepted:</span> {formatDate(article.acceptedAt)}</span>
                      </div>
                    )}
                    {article.publishedAt && (
                      <div className="flex items-center gap-2">
                        <i className="pi pi-calendar text-blue-600"></i>
                        <span><span className="font-semibold">Published:</span> {formatDate(article.publishedAt)}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Action Buttons - Same as In Press */}
                  <div className="pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          // Open full text view or article details
                          window.open(`/articles/${article.id}`, '_blank');
                        }}
                        className="w-12 h-12 rounded-full border-2 border-gray-300 bg-white hover:bg-gray-50 hover:border-gray-400 flex items-center justify-center transition-all shadow-sm"
                        title="View Full Text"
                      >
                        <i className="pi pi-file text-gray-600 text-sm"></i>
                      </button>
                      {article.pdfUrl && (
                        <a
                          href={getImageUrl(article.pdfUrl)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-12 h-12 rounded-full border-2 border-red-500 bg-white hover:bg-red-50 hover:border-red-600 flex items-center justify-center transition-all shadow-sm"
                          title="Download PDF"
                        >
                          <i className="pi pi-file-pdf text-red-600 text-sm"></i>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <i className="pi pi-file text-4xl mb-4"></i>
            <p>No articles found for this issue.</p>
          </div>
        )}
      </Dialog>

      <Footer />
    </>
  );
}