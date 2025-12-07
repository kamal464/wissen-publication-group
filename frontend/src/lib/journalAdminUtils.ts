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

    // Check if user has journalShort (required for journal-admin login)
    if (!user.journalShort) {
      console.error('[Journal Admin] User has no journalShort assignment. Please update the user record in /admin/users');
      return null;
    }

    // CRITICAL: Check Journal table FIRST for journals with matching shortcode
    // This takes priority because a journal with the shortcode directly is more authoritative
    // Then fall back to JournalShortcode table if no direct match is found
    try {
      const userShortcode = (user.journalShort || '').trim();
      
      // STEP 1: Check Journal table for journal with matching shortcode (HIGHEST PRIORITY)
      // This is the most direct match - the journal has the shortcode directly
      const journalsResponse = await adminAPI.getJournals();
      const journals = (journalsResponse.data as any[]) || [];
      
      const journalWithMatchingShortcode = journals.find((j: any) => {
        const journalShortcode = (j.shortcode || '').trim();
        return journalShortcode === userShortcode;
      });
      
      if (journalWithMatchingShortcode) {
        console.log('[Journal Admin] ✅ Found journal with matching shortcode (HIGHEST PRIORITY):', {
          shortcode: userShortcode,
          journalId: journalWithMatchingShortcode.id,
          journalTitle: journalWithMatchingShortcode.title,
          journalShortcode: journalWithMatchingShortcode.shortcode
        });
        
        // Check if JournalShortcode entry exists and points to a different journal
        const shortcodesResponse = await adminAPI.getJournalShortcodes();
        const shortcodes = (shortcodesResponse.data as any[]) || [];
        const shortcodeEntry = shortcodes.find((sc: any) => {
          return (sc.shortcode || '').trim() === userShortcode;
        });
        
        if (shortcodeEntry && shortcodeEntry.journalId !== journalWithMatchingShortcode.id) {
          console.warn(`[Journal Admin] ⚠️ WARNING: JournalShortcode entry points to journal ID ${shortcodeEntry.journalId}, but journal with matching shortcode is ID ${journalWithMatchingShortcode.id}`);
          console.warn(`[Journal Admin] Using journal ID ${journalWithMatchingShortcode.id} (the one with matching shortcode "${userShortcode}")`);
          console.warn(`[Journal Admin] The JournalShortcode entry should be updated to point to journal ID ${journalWithMatchingShortcode.id}`);
        }
        
        // Return the journal with matching shortcode - this is the correct one
        return {
          journalId: journalWithMatchingShortcode.id,
          journalTitle: journalWithMatchingShortcode.title || ''
        };
      }
      
      // STEP 2: Fallback to JournalShortcode table if no direct match found
      const shortcodesResponse = await adminAPI.getJournalShortcodes();
      const shortcodes = (shortcodesResponse.data as any[]) || [];
      
      const shortcodeEntry = shortcodes.find((sc: any) => {
        return (sc.shortcode || '').trim() === userShortcode;
      });
      
      if (shortcodeEntry && shortcodeEntry.journalId) {
        // Found the journal via JournalShortcode table
        const journalResponse = await adminAPI.getJournal(shortcodeEntry.journalId);
        const journal = journalResponse.data as any;
        
        if (journal) {
          console.log('[Journal Admin] ✅ Found journal via JournalShortcode table (FALLBACK):', {
            shortcode: userShortcode,
            journalId: shortcodeEntry.journalId,
            journalTitle: journal.title,
            journalShortcode: journal.shortcode
          });
          
          return {
            journalId: journal.id,
            journalTitle: journal.title || ''
          };
        }
      }
      
      // If still not found, log error with details
      console.error('[Journal Admin] Journal not found for user:', {
        username: user.userName,
        journalShort: user.journalShort || '(not set)',
        shortcodeEntryFound: !!shortcodeEntry,
        shortcodeEntryJournalId: shortcodeEntry?.journalId || 'N/A'
      });
      console.error('[Journal Admin] Available shortcodes:', shortcodes.map((sc: any) => ({
        shortcode: sc.shortcode,
        journalId: sc.journalId,
        journalName: sc.journalName
      })));
      
      return null;
    } catch (error: any) {
      console.error('[Journal Admin] Error finding journal via shortcode:', error);
      return null;
    }
  } catch (error: any) {
    console.error('[Journal Admin] Error loading journal data:', error.message);
    return null;
  }
}

