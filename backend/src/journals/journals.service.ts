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
      return await this.prisma.journal.findMany({
        include: {
          _count: {
            select: { articles: true },
          },
        },
      });
    } catch (error) {
      this.logger.error('Error fetching journals:', error);
      throw error;
    }
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