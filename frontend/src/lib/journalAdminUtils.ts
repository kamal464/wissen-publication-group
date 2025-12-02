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
    console.log('=== Starting loadJournalData ===');
    
    const username = localStorage.getItem('journalAdminUser');
    console.log('1. Username from localStorage:', username);
    
    if (!username) {
      console.error('No journal admin user found in localStorage');
      return null;
    }

    console.log('2. Fetching users...');
    const usersResponse = await adminAPI.getUsers();
    console.log('3. Users response:', usersResponse);
    
    const users = (usersResponse.data as any[]) || [];
    console.log('4. Users array:', users);
    console.log('5. Looking for user with userName or journalShort matching:', username);
    
    const user = users.find((u: any) => {
      const matches = u.userName === username || u.journalShort === username;
      if (matches) {
        console.log('6. Found matching user:', u);
      }
      return matches;
    });
    
    if (!user) {
      console.error('7. User not found. Available users:', users.map((u: any) => ({ 
        userName: u.userName, 
        journalShort: u.journalShort,
        journalName: u.journalName 
      })));
      return null;
    }

    console.log('8. Found user:', user);
    console.log('9. User journalName:', user.journalName);

    if (!user.journalName) {
      console.error('10. User has no journal name:', user);
      return null;
    }

    console.log('11. Fetching journals...');
    const journalsResponse = await adminAPI.getJournals();
    console.log('12. Journals response:', journalsResponse);
    
    const journals = (journalsResponse.data as any[]) || [];
    console.log('13. Journals array:', journals.map((j: any) => ({ id: j.id, title: j.title })));
    console.log('14. Looking for journal with title matching:', user.journalName);
    
    const journal = journals.find((j: any) => {
      const matches = j.title === user.journalName;
      if (matches) {
        console.log('15. Found matching journal:', j);
      }
      return matches;
    });
    
    if (!journal) {
      console.error('16. Journal not found. Available journals:', journals.map((j: any) => j.title));
      console.error('17. Looking for:', user.journalName);
      return null;
    }

    console.log('18. Successfully loaded journal:', { id: journal.id, title: journal.title });
    console.log('19. === loadJournalData completed successfully ===');
    
    return {
      journalId: journal.id,
      journalTitle: journal.title || ''
    };
  } catch (error: any) {
    console.error('=== ERROR in loadJournalData ===', error);
    console.error('Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      stack: error.stack
    });
    return null;
  }
}

