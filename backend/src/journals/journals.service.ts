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

  findArticles(id: number) {
    return this.prisma.article.findMany({
      where: { journalId: id },
      include: {
        authors: true,
      },
    });
  }
}