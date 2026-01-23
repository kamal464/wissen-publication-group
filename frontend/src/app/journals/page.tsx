'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import JournalCard from '@/components/JournalCard';
import { Button } from 'primereact/button';
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

// Deduplicate journals array - prioritize by title (prefer more complete), then by ID
const deduplicateJournals = (journals: Journal[]): Journal[] => {
  const seenById = new Map<number, Journal>();
  const seenByTitle = new Map<string, Journal>();
  
  // Helper to calculate completeness score
  const getCompletenessScore = (journal: Journal): number => {
    let score = 0;
    if (journal.description?.trim()) score += 2;
    if (journal.aimsScope?.trim()) score += 3;
    if (journal.guidelines?.trim()) score += 3;
    if (journal.editorialBoard?.trim()) score += 2;
    if (journal.homePageContent?.trim()) score += 2;
    if (journal.category?.trim()) score += 1;
    if (journal.subjectArea?.trim()) score += 1;
    if (journal.issn?.trim()) score += 1;
    if (journal.coverImage) score += 1;
    if (journal.bannerImage) score += 1;
    return score;
  };
  
  // First pass: deduplicate by ID
  for (const journal of journals) {
    if (journal.id && journal.id > 0) {
      if (!seenById.has(journal.id)) {
        seenById.set(journal.id, journal);
      } else {
        // If duplicate ID found (shouldn't happen), prefer more complete
        const existing = seenById.get(journal.id)!;
        const existingScore = getCompletenessScore(existing);
        const currentScore = getCompletenessScore(journal);
        if (currentScore > existingScore) {
          seenById.set(journal.id, journal);
        }
      }
    }
  }
  
  // Second pass: deduplicate by title (for journals with same title but different IDs)
  const uniqueById = Array.from(seenById.values());
  for (const journal of uniqueById) {
    const titleKey = journal.title?.toLowerCase().trim();
    if (titleKey) {
      const existing = seenByTitle.get(titleKey);
      if (!existing) {
        seenByTitle.set(titleKey, journal);
      } else {
        // Same title found - prefer more complete journal
        const existingScore = getCompletenessScore(existing);
        const currentScore = getCompletenessScore(journal);
        
        // Prefer more complete, or newer if scores equal
        if (currentScore > existingScore || 
            (currentScore === existingScore && 
             new Date(journal.updatedAt || journal.createdAt || '') > 
             new Date(existing.updatedAt || existing.createdAt || ''))) {
          seenByTitle.set(titleKey, journal);
        }
      }
    }
  }
  
  // Return deduplicated by title (this handles same-title duplicates)
  return Array.from(seenByTitle.values());
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
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
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
      
      // STEP 1: Deduplicate normalized journals first (by ID, then shortcode, then title)
      const deduplicatedNormalized = deduplicateJournals(normalized);
      
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
        
        // Check if a Journal record already exists for this shortcode (use deduplicated array)
        const existingJournal = deduplicatedNormalized.find(j => 
          j.shortcode === shortcode || 
          (journalId && j.id === journalId) ||
          j.title?.toLowerCase().trim() === journalName.toLowerCase().trim()
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
      
      // Combine real and virtual journals, then deduplicate again
      let allJournals = deduplicateJournals([...deduplicatedNormalized, ...virtualJournals]);
      
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
      
      // STEP 2: Deduplicate final journals array before dispatching (safety net)
      const finalJournals = deduplicateJournals(journalsWithDetails);
      
      dispatch(setJournals(finalJournals));
    } catch (fetchError) {
      dispatch(setError(getErrorMessage(fetchError)));
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  useEffect(() => {
    fetchJournals();
  }, [fetchJournals]);

  // Removed auto-refresh on focus/visibility change to prevent unwanted refreshes
  // If you need to refresh data, use the manual "Refresh" button instead

  const displayedJournals = useMemo(() => {
    if (!items.length) return [];
    
    // STEP 3: Deduplicate items first (final safety net)
    const deduplicatedItems = deduplicateJournals(items);
    
    // Only show journals with allocated users (have shortcode and user)
    let filtered = deduplicatedItems.filter((journal) => {
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
    
    // STEP 4: Deduplicate filtered results (in case filtering created duplicates)
    const deduplicatedFiltered = deduplicateJournals(filtered);
    
    // Sort by title alphabetically
    const sorted = [...deduplicatedFiltered].sort((a, b) => {
      const aTitle = a.title?.toLowerCase() || '';
      const bTitle = b.title?.toLowerCase() || '';
      return aTitle.localeCompare(bTitle);
    });

    return sorted;
  }, [items, allocatedShortcodes, shortcodeToJournalName, shortcodeToJournalId]);

  const handleRefresh = useCallback(() => {
    fetchJournals();
  }, [fetchJournals]);

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
      {/* Blue Header Banner */}
      <div className="journals-hero-banner">
        <div className="journals-hero-banner__content">
          <h1 className="journals-hero-banner__title">
            Journals <span className="journals-hero-banner__subtitle">(Leading list of journals)</span>
          </h1>
        </div>
      </div>
      
      <main className="journals-page px-4 py-12 md:px-8 lg:px-12 flex justify-center">
        <section className="journal-list w-full">

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
              viewMode === 'grid' ? 'journal-list__grid--cards-2' : 'journal-list__grid--list'
            }`}
          >
            {loading && !items.length &&
              Array.from({ length: 9 }).map((_, index) => (
                <article key={`placeholder-${index}`} className="journal-card journal-card--loading">
                  <div className="journal-card__image-container" />
                  <div className="journal-card__content">
                    <div className="journal-card__title" />
                    <div className="journal-card__description" />
                  </div>
                </article>
              ))}

            {!loading && displayedJournals.map((journal) => renderCard(journal))}
          </div>

          {!loading && !displayedJournals.length && (
            <div className="mt-10 rounded-lg border border-neutral-200 bg-neutral-50 p-8 text-center">
              <h3 className="text-lg font-semibold text-neutral-800">No journals found</h3>
              <p className="mt-2 text-sm text-neutral-600">
                No journals are currently available. Please check back later.
              </p>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
