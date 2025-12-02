import { adminAPI } from './api';

export interface JournalData {
  journalId: number;
  journalTitle: string;
}

/**
 * Loads journal data for the current journal admin user
 * Includes comprehensive debugging and error handling
 */
export async function loadJournalData(): Promise<JournalData | null> {
  try {
    const username = localStorage.getItem('journalAdminUser');
    
    if (!username) {
      console.error('[Journal Admin] No user found in localStorage');
      return null;
    }

    const usersResponse = await adminAPI.getUsers();
    const users = (usersResponse.data as any[]) || [];
    
    const user = users.find((u: any) => {
      return u.userName === username || u.journalShort === username;
    });
    
    if (!user) {
      console.error('[Journal Admin] User not found:', username);
      return null;
    }

    // Check if user has either journalName or journalShort
    if (!user.journalName && !user.journalShort) {
      console.error('[Journal Admin] User has no journal assignment. Please update the user record in /admin/users');
      return null;
    }

    const journalsResponse = await adminAPI.getJournals();
    const journals = (journalsResponse.data as any[]) || [];
    
    // Try multiple matching strategies (in order of reliability):
    // 1. Shortcode match (most reliable)
    // 2. Exact title match (case-insensitive, trimmed)
    // 3. Fuzzy title match (contains)
    // 4. Partial word match
    
    const normalizedJournalName = (user.journalName || '').trim().toLowerCase();
    const userShortcode = (user.journalShort || '').trim().toLowerCase();
    
    let journal: any = null;
    
    // Strategy 1: Try shortcode match first (most reliable)
    if (userShortcode) {
      journal = journals.find((j: any) => {
        const journalShortcode = (j.shortcode || '').trim().toLowerCase();
        return journalShortcode === userShortcode;
      });
    }
    
    // Strategy 2: Exact title match (case-insensitive, trimmed)
    if (!journal && normalizedJournalName) {
      journal = journals.find((j: any) => {
        const normalizedTitle = (j.title || '').trim().toLowerCase();
        return normalizedTitle === normalizedJournalName;
      });
    }
    
    // Strategy 3: Fuzzy match (title contains journalName or vice versa)
    if (!journal && normalizedJournalName) {
      journal = journals.find((j: any) => {
        const normalizedTitle = (j.title || '').trim().toLowerCase();
        return normalizedTitle.includes(normalizedJournalName) || normalizedJournalName.includes(normalizedTitle);
      });
    }
    
    // Strategy 4: Partial word match (check if any word in journalName matches)
    if (!journal && normalizedJournalName) {
      const journalNameWords = normalizedJournalName.split(/\s+/).filter((w: string) => w.length > 2);
      journal = journals.find((j: any) => {
        const normalizedTitle = (j.title || '').trim().toLowerCase();
        const titleWords = normalizedTitle.split(/\s+/);
        return journalNameWords.some((word: string) => 
          titleWords.some((tWord: string) => tWord.includes(word) || word.includes(tWord))
        );
      });
    }
    
    if (!journal) {
      const availableTitles = journals.map((j: any) => j.title).filter(Boolean);
      const availableShortcodes = journals.map((j: any) => j.shortcode).filter(Boolean);
      
      console.error('[Journal Admin] Journal not found for user:', {
        username: user.userName,
        journalName: user.journalName || '(not set)',
        journalShort: user.journalShort || '(not set)'
      });
      console.error('[Journal Admin] Available journals:', {
        titles: availableTitles,
        shortcodes: availableShortcodes
      });
      console.error('[Journal Admin] To fix: Update the user record in /admin/users to link to an existing journal');
      
      return null;
    }
    
    return {
      journalId: journal.id,
      journalTitle: journal.title || ''
    };
  } catch (error: any) {
    console.error('[Journal Admin] Error loading journal data:', error.message);
    return null;
  }
}

