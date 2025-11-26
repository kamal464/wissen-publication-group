import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateJournalDto } from './dto/create-journal.dto';

@Injectable()
export class JournalsService {
  constructor(private prisma: PrismaService) {}

  create(createJournalDto: CreateJournalDto) {
    return this.prisma.journal.create({
      data: createJournalDto,
    });
  }

  findAll() {
    return this.prisma.journal.findMany({
      include: {
        _count: {
          select: { articles: true },
        },
      },
    });
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