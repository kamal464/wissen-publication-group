import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NewsService {
  constructor(private prisma: PrismaService) {}

  async findAll(journalId?: number) {
    return this.prisma.news.findMany({
      orderBy: [
        { isPinned: 'desc' },
        { publishedAt: 'desc' },
        { createdAt: 'desc' },
      ],
    });
  }

  async findLatest(limit: number = 5) {
    return this.prisma.news.findMany({
      where: {
        publishedAt: {
          lte: new Date(),
        },
      },
      orderBy: [
        { isPinned: 'desc' },
        { publishedAt: 'desc' },
      ],
      take: limit,
    });
  }

  async findOne(id: number) {
    return this.prisma.news.findUnique({
      where: { id },
    });
  }

  async create(data: {
    title: string;
    content: string;
    link?: string;
    isPinned?: boolean;
    publishedAt?: Date;
  }) {
    return this.prisma.news.create({
      data: {
        title: data.title,
        content: data.content,
        link: data.link,
        isPinned: data.isPinned || false,
        publishedAt: data.publishedAt || new Date(),
      },
    });
  }

  async update(id: number, data: {
    title?: string;
    content?: string;
    link?: string;
    isPinned?: boolean;
    publishedAt?: Date;
  }) {
    return this.prisma.news.update({
      where: { id },
      data,
    });
  }

  async delete(id: number) {
    return this.prisma.news.delete({
      where: { id },
    });
  }
}

