#!/usr/bin/env ts-node
/**
 * Data Migration Script
 * 
 * Exports data from source database and imports to target database
 * 
 * Usage:
 *   LOCAL_DATABASE_URL="postgresql://..." PRODUCTION_DATABASE_URL="postgresql://..." ts-node scripts/migrate-data.ts
 */

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const LOCAL_DB = process.env.LOCAL_DATABASE_URL;
const PROD_DB = process.env.PRODUCTION_DATABASE_URL || process.env.DATABASE_URL;

if (!LOCAL_DB) {
  console.error('❌ LOCAL_DATABASE_URL environment variable is required');
  process.exit(1);
}

if (!PROD_DB) {
  console.error('❌ PRODUCTION_DATABASE_URL or DATABASE_URL environment variable is required');
  process.exit(1);
}

const localPrisma = new PrismaClient({
  datasources: {
    db: {
      url: LOCAL_DB,
    },
  },
});

const prodPrisma = new PrismaClient({
  datasources: {
    db: {
      url: PROD_DB,
    },
  },
});

interface ExportData {
  journals: any[];
  articles: any[];
  authors: any[];
  users: any[];
  journalShortcodes: any[];
  boardMembers: any[];
  contacts: any[];
  notifications: any[];
  news: any[];
  webPages: any[];
  messages: any[];
}

async function exportData(): Promise<ExportData> {
  console.log('📤 Exporting data from local database...');

  const data: ExportData = {
    journals: await localPrisma.journal.findMany(),
    articles: await localPrisma.article.findMany({
      include: { authors: true },
    }),
    authors: await localPrisma.author.findMany(),
    users: await localPrisma.user.findMany(),
    journalShortcodes: await localPrisma.journalShortcode.findMany(),
    boardMembers: await localPrisma.boardMember.findMany(),
    contacts: await localPrisma.contact.findMany(),
    notifications: await localPrisma.notification.findMany(),
    news: await localPrisma.news.findMany(),
    webPages: await localPrisma.webPage.findMany(),
    messages: await localPrisma.message.findMany(),
  };

  // Save to file
  const exportPath = path.join(__dirname, '..', 'data-export.json');
  fs.writeFileSync(exportPath, JSON.stringify(data, null, 2));
  console.log(`✅ Data exported to ${exportPath}`);
  console.log(`   Journals: ${data.journals.length}`);
  console.log(`   Articles: ${data.articles.length}`);
  console.log(`   Users: ${data.users.length}`);
  console.log(`   Journal Shortcodes: ${data.journalShortcodes.length}`);

  return data;
}

async function importData(data: ExportData) {
  console.log('\n📥 Importing data to production database...');

  try {
    // Import in order (respecting foreign keys)
    
    // 1. Journals (no dependencies)
    console.log('   Importing journals...');
    for (const journal of data.journals) {
      const { articles, boardMembers, ...journalData } = journal;
      await prodPrisma.journal.upsert({
        where: { id: journal.id },
        update: journalData,
        create: journalData,
      });
    }

    // 2. Users
    console.log('   Importing users...');
    for (const user of data.users) {
      await prodPrisma.user.upsert({
        where: { userName: user.userName },
        update: user,
        create: user,
      });
    }

    // 3. Journal Shortcodes
    console.log('   Importing journal shortcodes...');
    for (const shortcode of data.journalShortcodes) {
      await prodPrisma.journalShortcode.upsert({
        where: { shortcode: shortcode.shortcode },
        update: shortcode,
        create: shortcode,
      });
    }

    // 4. Authors (before articles)
    console.log('   Importing authors...');
    for (const author of data.authors) {
      await prodPrisma.author.upsert({
        where: { id: author.id },
        update: author,
        create: author,
      });
    }

    // 5. Articles (depends on Journals)
    console.log('   Importing articles...');
    for (const article of data.articles) {
      const { authors, ...articleData } = article;
      await prodPrisma.article.upsert({
        where: { id: article.id },
        update: articleData,
        create: {
          ...articleData,
          authors: {
            connect: authors.map(a => ({ id: a.id })),
          },
        },
      });
    }

    // 6. Board Members (depends on Journals)
    console.log('   Importing board members...');
    for (const member of data.boardMembers) {
      await prodPrisma.boardMember.upsert({
        where: { id: member.id },
        update: member,
        create: member,
      });
    }

    // 7. Other tables
    console.log('   Importing contacts...');
    for (const contact of data.contacts) {
      await prodPrisma.contact.upsert({
        where: { id: contact.id },
        update: contact,
        create: contact,
      });
    }

    console.log('   Importing notifications...');
    for (const notification of data.notifications) {
      await prodPrisma.notification.upsert({
        where: { id: notification.id },
        update: notification,
        create: notification,
      });
    }

    console.log('   Importing news...');
    for (const newsItem of data.news) {
      await prodPrisma.news.upsert({
        where: { id: newsItem.id },
        update: newsItem,
        create: newsItem,
      });
    }

    console.log('   Importing web pages...');
    for (const webPage of data.webPages) {
      await prodPrisma.webPage.upsert({
        where: { pageUrl: webPage.pageUrl },
        update: webPage,
        create: webPage,
      });
    }

    console.log('   Importing messages...');
    for (const message of data.messages) {
      await prodPrisma.message.upsert({
        where: { id: message.id },
        update: message,
        create: message,
      });
    }

    console.log('\n✅ Data migration completed successfully!');
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    throw error;
  }
}

async function main() {
  try {
    // Export from local
    const data = await exportData();

    // Confirm before importing
    console.log('\n⚠️  About to import data to production database.');
    console.log('   This will upsert (update or create) records.');
    console.log('   Press Ctrl+C to cancel, or wait 5 seconds to continue...');
    
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Import to production
    await importData(data);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await localPrisma.$disconnect();
    await prodPrisma.$disconnect();
  }
}

main();

