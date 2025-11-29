const { PrismaClient } = require('@prisma/client');
const { existsSync } = require('fs');
const { join } = require('path');

const prisma = new PrismaClient();

async function checkSubmissions() {
  try {
    console.log('\n=== Checking Submissions in Database ===\n');
    
    // Get all articles/submissions
    const articles = await prisma.article.findMany({
      include: {
        journal: { select: { id: true, title: true } },
        authors: true
      },
      orderBy: { submittedAt: 'desc' },
      take: 10
    });

    console.log(`Found ${articles.length} submissions in database\n`);

    if (articles.length === 0) {
      console.log('❌ No submissions found in database.');
      console.log('💡 Run: npx prisma db seed');
      return;
    }

    articles.forEach((article, index) => {
      console.log(`\n--- Submission ${index + 1} ---`);
      console.log(`ID: ${article.id}`);
      console.log(`Title: ${article.title}`);
      console.log(`Status: ${article.status}`);
      console.log(`PDF URL: ${article.pdfUrl || 'N/A'}`);
      console.log(`Word URL: ${article.wordUrl || 'N/A'}`);
      console.log(`Journal: ${article.journal?.title || 'N/A'}`);
      console.log(`Submitter: ${article.submitterName || article.authors?.[0]?.name || 'N/A'}`);
      
      // Check if files exist
      if (article.pdfUrl && article.pdfUrl.startsWith('/uploads/')) {
        const filename = article.pdfUrl.replace('/uploads/', '');
        const filePath = join(process.cwd(), 'uploads', filename);
        const exists = existsSync(filePath);
        console.log(`PDF File exists: ${exists ? '✅ YES' : '❌ NO'} (${filePath})`);
      }
      
      if (article.wordUrl && article.wordUrl.startsWith('/uploads/')) {
        const filename = article.wordUrl.replace('/uploads/', '');
        const filePath = join(process.cwd(), 'uploads', filename);
        const exists = existsSync(filePath);
        console.log(`Word File exists: ${exists ? '✅ YES' : '❌ NO'} (${filePath})`);
      }
    });

    // Check uploads directory
    console.log('\n\n=== Checking Uploads Directory ===\n');
    const fs = require('fs');
    const uploadsDir = join(process.cwd(), 'uploads');
    
    if (!existsSync(uploadsDir)) {
      console.log('❌ Uploads directory does not exist!');
    } else {
      const files = fs.readdirSync(uploadsDir);
      console.log(`Found ${files.length} files in uploads directory:`);
      files.slice(0, 10).forEach(file => {
        console.log(`  - ${file}`);
      });
      if (files.length > 10) {
        console.log(`  ... and ${files.length - 10} more files`);
      }
    }

    // Find submissions with files that exist
    console.log('\n\n=== Submissions with Valid Files ===\n');
    const submissionsWithFiles = articles.filter(article => {
      if (article.pdfUrl && article.pdfUrl.startsWith('/uploads/')) {
        const filename = article.pdfUrl.replace('/uploads/', '');
        return existsSync(join(process.cwd(), 'uploads', filename));
      }
      return false;
    });

    if (submissionsWithFiles.length > 0) {
      console.log(`✅ Found ${submissionsWithFiles.length} submissions with valid PDF files:`);
      submissionsWithFiles.forEach(sub => {
        console.log(`  - ID ${sub.id}: ${sub.title}`);
        console.log(`    PDF: ${sub.pdfUrl}`);
        console.log(`    Test URL: http://localhost:3001${sub.pdfUrl}`);
      });
    } else {
      console.log('❌ No submissions found with valid PDF files in uploads directory');
      console.log('\n💡 To fix:');
      console.log('   1. Ensure files are uploaded to backend/uploads/');
      console.log('   2. Update database records to point to /uploads/filename.pdf');
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkSubmissions();

