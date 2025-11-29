import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clearJournals() {
  try {
    console.log('🗑️  Clearing all journals from database...');
    
    // Delete all articles first (they reference journals)
    const deletedArticles = await prisma.article.deleteMany({});
    console.log(`✅ Deleted ${deletedArticles.count} articles`);
    
    // Delete all board members
    const deletedBoardMembers = await prisma.boardMember.deleteMany({});
    console.log(`✅ Deleted ${deletedBoardMembers.count} board members`);
    
    // Delete all journals
    const deletedJournals = await prisma.journal.deleteMany({});
    console.log(`✅ Deleted ${deletedJournals.count} journals`);
    
    // Note: We keep JournalShortcode and User records
    console.log('✅ Journals cleared successfully!');
    console.log('ℹ️  JournalShortcode and User records are preserved.');
    
  } catch (error) {
    console.error('❌ Error clearing journals:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

clearJournals()
  .then(() => {
    console.log('✅ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Failed:', error);
    process.exit(1);
  });



