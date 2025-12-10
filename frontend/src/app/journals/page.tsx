'use client';

import { ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import JournalCard from '@/components/JournalCard';
import { InputText } from 'primereact/inputtext';
import { Dropdown, DropdownChangeEvent } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { Paginator, PaginatorPageChangeEvent } from 'primereact/paginator';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setError, setJournals, setLoading } from '@/store/slices/journalsSlice';
import { Journal } from '@/types';
import { journalService } from '@/services/api';
import { adminAPI } from '@/lib/api';

const SUBJECT_CLASS_MAP: Record<string, string> = {
  'life science': 'life-science',
  'life sciences': 'life-science',
  biology: 'life-science',
  chemistry: 'life-science',
  'social science': 'social-science',
  'social sciences': 'social-science',
  sociology: 'social-science',
  psychology: 'social-science',
  engineering: 'engineering',
  technology: 'engineering',
  medicine: 'medicine',
  medical: 'medicine',
  healthcare: 'medicine',
  economics: 'economics',
  finance: 'economics',
  business: 'economics',
  information: 'information',
  computing: 'information',
  'computer science': 'information',
};

const getSubjectLabel = (journal: Journal, shortcodeToUserCategory?: Map<string, string>): string => {
  // First try journal's own fields
  if (journal.subjectArea) return journal.subjectArea;
  if (journal.category) return journal.category;
  if (journal.discipline) return journal.discipline;
  
  // Fallback to user's category if available
  if (shortcodeToUserCategory && journal.shortcode) {
    const userCategory = shortcodeToUserCategory.get(journal.shortcode);
    if (userCategory) return userCategory;
  }
  
  // Last resort fallback
  return 'General Studies';
};

const getSubjectClass = (subject: string): string => {
  const normalized = subject.trim().toLowerCase();
  return SUBJECT_CLASS_MAP[normalized] ?? '';
};

const extractJournals = (payload: unknown): Journal[] => {
  if (!payload) {
    return [];
  }

  if (Array.isArray(payload)) {
    return payload as Journal[];
  }

  if (typeof payload === 'object') {
    const maybeData = (payload as { data?: unknown; items?: unknown; results?: unknown }).data;
    if (Array.isArray(maybeData)) {
      return maybeData as Journal[];
    }

    const items = (payload as { items?: unknown }).items;
    if (Array.isArray(items)) {
      return items as Journal[];
    }

    const results = (payload as { results?: unknown }).results;
    if (Array.isArray(results)) {
      return results as Journal[];
    }
  }

  return [];
};

type AxiosErrorLike = {
  isAxiosError?: boolean;
  message?: string;
  response?: {
    data?: {
      message?: string;
      error?: string;
    };
  };
};

const isAxiosError = (error: unknown): error is AxiosErrorLike => {
  return typeof error === 'object' && error !== null && 'isAxiosError' in error;
};

const getErrorMessage = (error: unknown): string => {
  if (isAxiosError(error)) {
    const responseMessage =
      (error.response?.data as { message?: string; error?: string } | undefined)?.message ||
      (error.response?.data as { message?: string; error?: string } | undefined)?.error;

    if (responseMessage) {
      return responseMessage;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Unable to load journals. Please try again later.';
};

export default function JournalsPage() {
  const dispatch = useAppDispatch();
  const { items, loading, error } = useAppSelector((state) => state.journals);

  const [isClient, setIsClient] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [sortBy, setSortBy] = useState<string>('title-asc');
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(9);
  const [allocatedShortcodes, setAllocatedShortcodes] = useState<Set<string>>(new Set());
  const [shortcodeToJournalName, setShortcodeToJournalName] = useState<Map<string, string>>(new Map());
  const [shortcodeToJournalId, setShortcodeToJournalId] = useState<Map<string, number>>(new Map());
  const [shortcodeToUserCategory, setShortcodeToUserCategory] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Fetch shortcodes and users to determine which journals have allocated users
  const fetchAllocatedShortcodes = useCallback(async () => {
    try {
      const [shortcodesRes, usersRes] = await Promise.all([
        adminAPI.getJournalShortcodes(),
        adminAPI.getUsers()
      ]);
      
      const shortcodes = (shortcodesRes.data || []) as Array<{ 
        shortcode: string; 
        journalName: string; 
        journalId?: number | null;
        id?: number;
      }>;
      const users = (usersRes.data || []) as Array<{ 
        journalShort: string | null;
        category: string | null;
      }>;
      
      // Get shortcodes that have active users assigned
      const allocated = new Set<string>();
      const shortcodeMap = new Map<string, string>();
      const shortcodeToJournalId = new Map<string, number>();
      const shortcodeToCategory = new Map<string, string>();
      
      shortcodes.forEach(sc => {
        const user = users.find(u => u.journalShort === sc.shortcode);
        if (user) {
          allocated.add(sc.shortcode);
          shortcodeMap.set(sc.shortcode, sc.journalName);
          if (sc.journalId) {
            shortcodeToJournalId.set(sc.shortcode, sc.journalId);
          }
          // Store user's category for fallback
          if (user.category) {
            shortcodeToCategory.set(sc.shortcode, user.category);
          }
        }
      });
      
      
      setAllocatedShortcodes(allocated);
      setShortcodeToJournalName(shortcodeMap);
      setShortcodeToJournalId(shortcodeToJournalId);
      setShortcodeToUserCategory(shortcodeToCategory);
    } catch (err) {
      console.error('Error fetching allocated shortcodes:', err);
      // Continue with empty set if fetch fails
    }
  }, []);

  const fetchJournals = useCallback(async () => {
    dispatch(setLoading(true));

    try {
      // Add cache-busting timestamp to ensure fresh data
      const cacheBuster = `_t=${Date.now()}`;
      
      // Fetch both journals and shortcodes in parallel
      const [journalsRes, shortcodesRes, usersRes] = await Promise.all([
        journalService.getAll(),
        adminAPI.getJournalShortcodes(),
        adminAPI.getUsers()
      ]);
      
      const normalized = extractJournals(journalsRes.data ?? journalsRes);
      const shortcodes = (shortcodesRes.data || []) as Array<{ 
        shortcode: string; 
        journalName: string; 
        journalId?: number | null;
        id?: number;
      }>;
      const users = (usersRes.data || []) as Array<{ 
        journalShort: string | null;
        category: string | null;
      }>;
      
      // Get allocated shortcodes
      const allocated = new Set<string>();
      const shortcodeMap = new Map<string, string>();
      const shortcodeToJournalId = new Map<string, number>();
      const shortcodeToCategory = new Map<string, string>();
      
      shortcodes.forEach(sc => {
        const user = users.find(u => u.journalShort === sc.shortcode);
        if (user) {
          allocated.add(sc.shortcode);
          shortcodeMap.set(sc.shortcode, sc.journalName);
          if (sc.journalId) {
            shortcodeToJournalId.set(sc.shortcode, sc.journalId);
          }
          // Store user's category for fallback
          if (user.category) {
            shortcodeToCategory.set(sc.shortcode, user.category);
          }
        }
      });
      
      setAllocatedShortcodes(allocated);
      setShortcodeToJournalName(shortcodeMap);
      setShortcodeToJournalId(shortcodeToJournalId);
      setShortcodeToUserCategory(shortcodeToCategory);
      
      // Create virtual journal objects for shortcodes that don't have Journal records yet
      const virtualJournals: Journal[] = [];
      allocated.forEach(shortcode => {
        const journalName = shortcodeMap.get(shortcode) || '';
        const journalId = shortcodeToJournalId.get(shortcode);
        
        // Check if a Journal record already exists for this shortcode
        const existingJournal = normalized.find(j => 
          j.shortcode === shortcode || 
          (journalId && j.id === journalId) ||
          j.title?.toLowerCase() === journalName.toLowerCase()
        );
        
        // If no Journal record exists, create a virtual one
        if (!existingJournal) {
          virtualJournals.push({
            id: -1, // Temporary ID for virtual journals
            title: journalName,
            description: 'Journal details will be available after journal admin completes setup.',
            shortcode: shortcode,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }
      });
      
      // Combine real and virtual journals
      let allJournals = [...normalized, ...virtualJournals];
      
      // Fetch full journal details for all journals with valid IDs to get all content fields
      // Use journal ID (most reliable) or try shortcode as fallback
      const journalsWithDetails = await Promise.all(
        allJournals.map(async (journal) => {
          // Only fetch details for journals with valid IDs (not virtual journals)
          if (journal.id > 0) {
            try {
              // Always use journal ID for fetching (most reliable)
              // Add cache-busting to ensure we get the latest data
              const fullJournalResponse = await adminAPI.getJournal(journal.id);
              const responseData = fullJournalResponse.data as any;
              let fullJournal: any;
              if (responseData) {
                if (responseData.data) {
                  fullJournal = responseData.data;
                } else {
                  fullJournal = responseData;
                }
              } else {
                fullJournal = fullJournalResponse;
              }
              // Merge full journal data with existing journal data
              return { ...journal, ...fullJournal };
            } catch (err) {
              console.error(`Error fetching full details for journal ${journal.id}:`, err);
              // If ID fetch fails, try by shortcode as fallback
              if (journal.shortcode) {
                try {
                  const shortcodeResponse = await adminAPI.getJournal(journal.shortcode);
                  const shortcodeData = shortcodeResponse.data as any;
                  let fullJournal: any;
                  if (shortcodeData) {
                    if (shortcodeData.data) {
                      fullJournal = shortcodeData.data;
                    } else {
                      fullJournal = shortcodeData;
                    }
                  } else {
                    fullJournal = shortcodeResponse;
                  }
                  return { ...journal, ...fullJournal };
                } catch (shortcodeErr) {
                  console.error(`Error fetching by shortcode ${journal.shortcode}:`, shortcodeErr);
                }
              }
              // Return original journal if all fetches fail
              return journal;
            }
          }
          // Return virtual journals as-is
          return journal;
        })
      );
      
      dispatch(setJournals(journalsWithDetails));
    } catch (fetchError) {
      dispatch(setError(getErrorMessage(fetchError)));
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  useEffect(() => {
    fetchJournals();
  }, [fetchJournals]);

  // Refresh data when user returns to the page (e.g., after making changes in admin panel)
  useEffect(() => {
    const handleFocus = () => {
      // Refresh journals when window regains focus (user might have made changes in another tab)
      fetchJournals();
    };

    const handleVisibilityChange = () => {
      // Refresh when tab becomes visible
      if (!document.hidden) {
        fetchJournals();
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchJournals]);

  const subjectOptions = useMemo(() => {
    const uniqueSubjects = new Set<string>();

    items.forEach((journal) => {
      uniqueSubjects.add(getSubjectLabel(journal, shortcodeToUserCategory));
    });

    return [
      { label: 'All Subjects', value: 'all' },
      ...Array.from(uniqueSubjects)
        .filter(Boolean)
        .map((subject) => ({
          label: subject,
          value: subject,
        })),
    ];
  }, [items]);

  const filteredAndSortedJournals = useMemo(() => {
    if (!items.length) return [];
    
    const normalizedSearch = searchTerm.trim().toLowerCase();
    const hasSearch = normalizedSearch.length > 0;
    const hasSubjectFilter = selectedSubject !== 'all';

    // First filter: Only show journals with allocated users (have shortcode and user)
    let filtered = items.filter((journal) => {
      // Method 1: Check if journal has a shortcode field that matches allocated shortcode
      const journalShortcode = journal.shortcode || '';
      if (allocatedShortcodes.has(journalShortcode)) {
        return true;
      }
      
      // Method 2: Check if journal ID matches any allocated shortcode's journalId
      for (const [shortcode, journalId] of shortcodeToJournalId.entries()) {
        if (allocatedShortcodes.has(shortcode) && journal.id === journalId) {
          return true;
        }
      }
      
      // Method 3: Check if journal name matches any allocated shortcode's journal name
      for (const [shortcode, journalName] of shortcodeToJournalName.entries()) {
        if (allocatedShortcodes.has(shortcode) && 
            journal.title?.toLowerCase().trim() === journalName.toLowerCase().trim()) {
          return true;
        }
      }
      
      return false;
    });
    
    
    // Additional filters
    if (hasSearch || hasSubjectFilter) {
      filtered = filtered.filter((journal) => {
        // Subject filter
        if (hasSubjectFilter) {
          const subject = getSubjectLabel(journal, shortcodeToUserCategory);
          if (subject.toLowerCase() !== selectedSubject.toLowerCase()) {
            return false;
          }
        }

        // Search filter
        if (hasSearch) {
          const haystack = [
            journal.title,
            journal.description,
            journal.publisher,
            journal.issn,
            journal.accessType,
            journal.subjectArea,
            journal.category,
          ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();

          return haystack.includes(normalizedSearch);
        }

        return true;
      });
    }

    // Sort
    const sorted = [...filtered];
    const [sortField, sortOrder] = sortBy.split('-');

    sorted.sort((a, b) => {
      let aValue: string | number = '';
      let bValue: string | number = '';

      switch (sortField) {
        case 'title':
          aValue = a.title?.toLowerCase() || '';
          bValue = b.title?.toLowerCase() || '';
          break;
        case 'issn':
          aValue = a.issn || '';
          bValue = b.issn || '';
          break;
        case 'impact':
          aValue = a.impactFactor || 0;
          bValue = b.impactFactor || 0;
          break;
        case 'recent':
          aValue = new Date(a.createdAt || 0).getTime();
          bValue = new Date(b.createdAt || 0).getTime();
          break;
        default:
          aValue = a.title?.toLowerCase() || '';
          bValue = b.title?.toLowerCase() || '';
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [items, searchTerm, selectedSubject, sortBy, allocatedShortcodes, shortcodeToJournalName, shortcodeToJournalId, shortcodeToUserCategory]);

  const paginatedJournals = useMemo(() => {
    return filteredAndSortedJournals.slice(first, first + rows);
  }, [filteredAndSortedJournals, first, rows]);

  const handleSubjectChange = (event: DropdownChangeEvent) => {
    setSelectedSubject(event.value ?? 'all');
    setFirst(0); // Reset to first page
  };

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setFirst(0); // Reset to first page
  };

  const handleSortChange = (event: DropdownChangeEvent) => {
    setSortBy(event.value ?? 'title-asc');
    setFirst(0); // Reset to first page
  };

  const handleRefresh = useCallback(() => {
    fetchJournals();
    setFirst(0);
  }, [fetchJournals]);

  const onPageChange = (event: PaginatorPageChangeEvent) => {
    setFirst(event.first);
    setRows(event.rows);
  };

  const renderCard = useCallback((journal: Journal) => {
    const subject = getSubjectLabel(journal, shortcodeToUserCategory);
    const subjectClass = getSubjectClass(subject);
    
    // Find shortcode for this journal
    let journalShortcode = journal.shortcode || '';
    let journalName = '';
    
    if (!journalShortcode) {
      // Try to find by journal name
      for (const [shortcode, name] of shortcodeToJournalName.entries()) {
        if (journal.title?.toLowerCase() === name.toLowerCase()) {
          journalShortcode = shortcode;
          journalName = name;
          break;
        }
      }
    } else {
      // Get journal name from shortcode map
      journalName = shortcodeToJournalName.get(journalShortcode) || '';
    }
    
    // Enhance journal with shortcode and name if found
    // Only set journalName if it's different from title to avoid duplicates
    const finalJournalName = journalName && journalName.trim().toLowerCase() !== journal.title?.trim().toLowerCase()
      ? journalName
      : '';
    
    const journalWithShortcode = journalShortcode 
      ? { ...journal, shortcode: journalShortcode, journalName: finalJournalName }
      : { ...journal, journalName: finalJournalName };

    return (
      <JournalCard
        key={journal.id}
        journal={journalWithShortcode}
        viewMode={viewMode}
        subjectLabel={subject}
        subjectClass={subjectClass}
      />
    );
  }, [viewMode, shortcodeToJournalName, shortcodeToUserCategory]);

  return (
    <>
      <Header />
      <main className="journals-page px-4 py-12 md:px-8 lg:px-12 flex justify-center">
        <section className="journal-list w-full">
          <div className="journal-list__header">
            <span className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-500">Journals</span>
            <h1 className="journal-list__title">Explore our library of peer-reviewed journals</h1>
            <p className="mt-2 max-w-2xl text-base text-neutral-600">
              Browse journals across multiple disciplines, apply filters to focus on the subjects that matter
              to you, and jump into detailed insights for each publication.
            </p>
          </div>

          <div className="journal-list__controls">
            <div className="flex w-full flex-col gap-4 md:flex-row">
              <div className="relative flex-1">
                <span className="p-input-icon-left w-full">
                  <i className="pi pi-search" aria-hidden="true" />
                  {isClient ? (
                    <InputText
                      value={searchTerm}
                      onChange={handleSearchChange}
                      placeholder="Search journals by title, ISSN, or publisher"
                      className="journal-list__search-input"
                      aria-label="Search journals"
                    />
                  ) : (
                    <input
                      type="search"
                      className="journal-list__search-input"
                      placeholder="Search journals by title, ISSN, or publisher"
                      aria-label="Search journals"
                      disabled
                      aria-hidden="true"
                    />
                  )}
                </span>
              </div>

              <div className="journal-list__subject-dropdown-wrapper">
                {isClient ? (
                  <Dropdown
                    value={selectedSubject}
                    options={subjectOptions}
                    onChange={handleSubjectChange}
                    className="journal-list__subject-dropdown"
                    placeholder="Filter by subject"
                    showClear={selectedSubject !== 'all'}
                    aria-label="Filter journals by subject"
                  />
                ) : (
                  <select
                    className="journal-list__subject-dropdown journal-list__subject-dropdown--fallback"
                    disabled
                    aria-hidden="true"
                    aria-label="Filter journals by subject"
                  >
                    <option>All Subjects</option>
                  </select>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              {isClient && (
                <Dropdown
                  value={sortBy}
                  options={[
                    { label: 'Title (A-Z)', value: 'title-asc' },
                    { label: 'Title (Z-A)', value: 'title-desc' },
                    { label: 'Recently Added', value: 'recent-desc' },
                    { label: 'Impact Factor (High-Low)', value: 'impact-desc' },
                    { label: 'Impact Factor (Low-High)', value: 'impact-asc' },
                  ]}
                  onChange={handleSortChange}
                  placeholder="Sort by"
                  className="w-[200px]"
                />
              )}
              
              <div className="journal-list__view-toggle">
                <button
                  type="button"
                  className={`journal-list__view-btn ${
                    viewMode === 'list' ? 'journal-list__view-btn--active' : ''
                  }`.trim()}
                  onClick={() => setViewMode('list')}
                  aria-label="Show journals in list view"
                  suppressHydrationWarning
                >
                  <i className="pi pi-list" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className={`journal-list__view-btn ${
                    viewMode === 'grid' ? 'journal-list__view-btn--active' : ''
                  }`.trim()}
                  onClick={() => setViewMode('grid')}
                  aria-label="Show journals in grid view"
                  suppressHydrationWarning
                >
                  <i className="pi pi-th-large" aria-hidden="true" />
                </button>
              </div>
              
              <div suppressHydrationWarning>
                <Button
                  label="Refresh"
                  icon="pi pi-refresh"
                  size="small"
                  outlined
                  onClick={handleRefresh}
                  className="ml-2"
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* Results Count */}
          {!loading && filteredAndSortedJournals.length > 0 && (
            <div className="mt-6 flex items-center justify-between text-sm text-neutral-600">
              <span>
                Showing <strong>{first + 1}</strong> to <strong>{Math.min(first + rows, filteredAndSortedJournals.length)}</strong> of{' '}
                <strong>{filteredAndSortedJournals.length}</strong> journal{filteredAndSortedJournals.length !== 1 ? 's' : ''}
              </span>
            </div>
          )}

          {error && (
            <div
              role="alert"
              className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span>{error}</span>
                <div suppressHydrationWarning>
                  <Button
                    label="Try again"
                    icon="pi pi-refresh"
                    size="small"
                    severity="danger"
                    onClick={handleRefresh}
                    disabled={loading}
                  />
                </div>
              </div>
            </div>
          )}

          <div
            className={`mt-8 journal-list__grid ${
              viewMode === 'grid' ? 'journal-list__grid--cards-5' : 'journal-list__grid--list'
            }`}
          >
            {loading && !items.length &&
              Array.from({ length: rows }).map((_, index) => (
                <article key={`placeholder-${index}`} className="journal-card journal-card--loading">
                  <div className="journal-card__image-container" />
                  <div className="journal-card__content">
                    <div className="journal-card__title" />
                    <div className="journal-card__description" />
                  </div>
                </article>
              ))}

            {!loading && paginatedJournals.map((journal) => renderCard(journal))}
          </div>

          {/* Pagination */}
          {!loading && filteredAndSortedJournals.length > rows && (
            <div className="mt-8">
              <Paginator
                first={first}
                rows={rows}
                totalRecords={filteredAndSortedJournals.length}
                rowsPerPageOptions={[9, 18, 27, 36]}
                onPageChange={onPageChange}
                template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
              />
            </div>
          )}

          {!loading && !filteredAndSortedJournals.length && (
            <div className="mt-10 rounded-lg border border-neutral-200 bg-neutral-50 p-8 text-center">
              <h3 className="text-lg font-semibold text-neutral-800">No journals found</h3>
              <p className="mt-2 text-sm text-neutral-600">
                Try adjusting your filters or search keywords to discover more journals.
              </p>
              <div suppressHydrationWarning>
                <Button
                  label="Clear filters"
                  icon="pi pi-filter-slash"
                  className="mt-4"
                  outlined
                  onClick={() => {
                    setSelectedSubject('all');
                    setSearchTerm('');
                    handleRefresh();
                  }}
                />
              </div>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
