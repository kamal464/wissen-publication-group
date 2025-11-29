"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function clearJournals() {
    try {
        console.log('🗑️  Clearing all journals from database...');
        const deletedArticles = await prisma.article.deleteMany({});
        console.log(`✅ Deleted ${deletedArticles.count} articles`);
        const deletedBoardMembers = await prisma.boardMember.deleteMany({});
        console.log(`✅ Deleted ${deletedBoardMembers.count} board members`);
        const deletedJournals = await prisma.journal.deleteMany({});
        console.log(`✅ Deleted ${deletedJournals.count} journals`);
        console.log('✅ Journals cleared successfully!');
        console.log('ℹ️  JournalShortcode and User records are preserved.');
    }
    catch (error) {
        console.error('❌ Error clearing journals:', error);
        throw error;
    }
    finally {
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
//# sourceMappingURL=clear-journals.js.map