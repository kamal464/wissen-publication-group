import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateJournalDto } from './dto/create-journal.dto';

@Injectable()
export class JournalsService {
  private readonly logger = new Logger(JournalsService.name);

  constructor(private prisma: PrismaService) {}

  create(createJournalDto: CreateJournalDto) {
    return this.prisma.journal.create({
      data: createJournalDto,
    });
  }

  async findAll() {
    try {
      const journals = await this.prisma.journal.findMany({
        include: {
          _count: {
            select: { articles: true },
          },
        },
        orderBy: [
          { updatedAt: 'desc' }, // Prefer newer journals
          { id: 'desc' }, // Then by ID
        ],
      });

      // Deduplicate by title - prefer journal with more complete data
      const deduplicated = this.deduplicateJournals(journals);
      
      return deduplicated;
    } catch (error) {
      this.logger.error('Error fetching journals:', error);
      throw error;
    }
  }

  /**
   * Deduplicate journals by title, preferring the one with more complete data
   */
  private deduplicateJournals(journals: any[]): any[] {
    const seenByTitle = new Map<string, any>();
    const journalsWithoutTitle: any[] = [];

    for (const journal of journals) {
      const titleKey = journal.title?.toLowerCase().trim();
      
      if (!titleKey) {
        // Keep journals without titles separately (shouldn't happen, but safe)
        journalsWithoutTitle.push(journal);
        continue;
      }

      const existing = seenByTitle.get(titleKey);
      
      if (!existing) {
        // First occurrence with this title - keep it
        seenByTitle.set(titleKey, journal);
      } else {
        // Duplicate title found - prefer the one with more complete data
        const existingScore = this.getJournalCompletenessScore(existing);
        const currentScore = this.getJournalCompletenessScore(journal);
        
        // Prefer journal with higher score (more complete), or newer one if scores are equal
        if (currentScore > existingScore || 
            (currentScore === existingScore && 
             new Date(journal.updatedAt || journal.createdAt || 0) > 
             new Date(existing.updatedAt || existing.createdAt || 0))) {
          seenByTitle.set(titleKey, journal);
        }
      }
    }

    // Return deduplicated journals plus journals without titles
    return [...Array.from(seenByTitle.values()), ...journalsWithoutTitle];
  }

  /**
   * Calculate completeness score for a journal (higher = more complete)
   */
  private getJournalCompletenessScore(journal: any): number {
    let score = 0;
    
    // Count non-null fields that indicate completeness
    if (journal.description && journal.description.trim()) score += 2;
    if (journal.aimsScope && journal.aimsScope.trim()) score += 3;
    if (journal.guidelines && journal.guidelines.trim()) score += 3;
    if (journal.editorialBoard && journal.editorialBoard.trim()) score += 2;
    if (journal.homePageContent && journal.homePageContent.trim()) score += 2;
    if (journal.category && journal.category.trim()) score += 1;
    if (journal.subjectArea && journal.subjectArea.trim()) score += 1;
    if (journal.issn && journal.issn.trim()) score += 1;
    if (journal.coverImage) score += 1;
    if (journal.bannerImage) score += 1;
    if (journal._count?.articles > 0) score += 2;
    
    return score;
  }

  findOne(id: number) {
    return this.prisma.journal.findUnique({
      where: { id },
      include: {
        _count: {
          select: { articles: true },
        },
      },
    });
  }

  async findByShortcode(shortcode: string) {
    // First try to find by shortcode field in Journal table
    let journal = await this.prisma.journal.findUnique({
      where: { shortcode },
      include: {
        _count: {
          select: { articles: true },
        },
      },
    });
    
    // If not found, try to find by matching with JournalShortcode table
    if (!journal) {
      const shortcodeEntry = await this.prisma.journalShortcode.findUnique({
        where: { shortcode },
      });
      
      if (shortcodeEntry && shortcodeEntry.journalId) {
        // Only fetch by journalId - no title-based matching to prevent linking to wrong journal
        journal = await this.prisma.journal.findUnique({
          where: { id: shortcodeEntry.journalId },
          include: {
            _count: {
              select: { articles: true },
            },
          },
        });
      }
    }
    
    return journal;
  }

  findArticles(id: number) {
    return this.prisma.article.findMany({
      where: { journalId: id },
      include: {
        authors: true,
      },
    });
  }
}