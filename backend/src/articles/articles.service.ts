import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { SubmitManuscriptDto } from './dto/submit-manuscript.dto';

@Injectable()
export class ArticlesService {
  constructor(private prisma: PrismaService) {}

  async findAll(
    journalId?: number,
    search?: string,
    status?: string,
    sortBy: string = 'publishedAt',
    sortOrder: 'asc' | 'desc' = 'desc',
    page: number = 1,
    limit: number = 10,
  ) {
    const where: any = {};

    if (journalId) {
      where.journalId = journalId;
    }

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { abstract: { contains: search, mode: 'insensitive' } },
        {
          authors: {
            some: {
              name: { contains: search, mode: 'insensitive' },
            },
          },
        },
      ];
    }

    const skip = (page - 1) * limit;

    const [articles, total] = await Promise.all([
      this.prisma.article.findMany({
        where,
        include: {
          authors: true,
          journal: {
            select: {
              id: true,
              title: true,
              issn: true,
            },
          },
        },
        orderBy: {
          [sortBy]: sortOrder,
        },
        skip,
        take: limit,
      }),
      this.prisma.article.count({ where }),
    ]);

    return {
      data: articles,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    const article = await this.prisma.article.findUnique({
      where: { id },
      include: {
        authors: true,
        journal: {
          select: {
            id: true,
            title: true,
            issn: true,
            publisher: true,
          },
        },
      },
    });

    if (!article) {
      throw new NotFoundException(`Article with ID ${id} not found`);
    }

    return article;
  }

  async findRelated(id: number, limit: number = 5) {
    const article = await this.findOne(id);
    
    // Find related articles from the same journal
    const relatedArticles = await this.prisma.article.findMany({
      where: {
        journalId: article.journalId,
        id: { not: id },
        status: 'PUBLISHED',
      },
      include: {
        authors: true,
        journal: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: {
        publishedAt: 'desc',
      },
      take: limit,
    });

    return relatedArticles;
  }

  async create(createArticleDto: CreateArticleDto) {
    const { authors, journalId, ...articleData } = createArticleDto;

    return this.prisma.article.create({
      data: {
        ...articleData,
        journal: {
          connect: { id: journalId },
        },
        authors: {
          create: authors,
        },
      },
      include: {
        authors: true,
        journal: true,
      },
    });
  }

  async update(id: number, updateArticleDto: UpdateArticleDto) {
    const { authors, journalId, ...articleData } = updateArticleDto;

    const updateData: any = {
      ...articleData,
    };

    if (journalId !== undefined) {
      updateData.journal = { connect: { id: journalId } };
    }

    if (authors) {
      updateData.authors = {
        set: [],
        create: authors,
      };
    }

    return this.prisma.article.update({
      where: { id },
      data: updateData,
      include: {
        authors: true,
        journal: true,
      },
    });
  }

  async remove(id: number) {
    return this.prisma.article.delete({
      where: { id },
    });
  }

  async submitManuscript(manuscriptDto: SubmitManuscriptDto, file?: any) {
    const { authors, journalId, ...manuscriptData } = manuscriptDto;

    console.log('🔵 Starting manuscript submission');
    console.log('Journal ID:', journalId);
    console.log('Authors:', authors);
    console.log('Manuscript Data:', manuscriptData);

    // Extract submitter info from first author or manuscriptData
    const firstAuthor = authors && authors.length > 0 ? authors[0] : null;

    // Create article with PENDING status and connect to authors
    const article = await this.prisma.article.create({
      data: {
        title: manuscriptData.title,
        abstract: manuscriptData.abstract,
        pdfUrl: manuscriptData.pdfUrl,
        keywords: manuscriptData.keywords,
        articleType: manuscriptData.articleType || null,
        status: 'PENDING',
        // Save submitter information from first author
        submitterName: firstAuthor?.name || manuscriptData.submitterName || null,
        submitterEmail: firstAuthor?.email || manuscriptData.submitterEmail || null,
        submitterAddress: manuscriptData.submitterAddress || firstAuthor?.affiliation || null,
        submitterCountry: manuscriptData.submitterCountry || null,
        journal: {
          connect: { id: journalId },
        },
        authors: {
          create: authors.map(author => ({
            name: author.name,
            email: author.email,
            affiliation: author.affiliation || '',
          })),
        },
      },
      include: {
        authors: true,
        journal: {
          select: {
            id: true,
            title: true,
            issn: true,
            publisher: true,
          },
        },
      },
    });

    console.log('✅ Article created:', article.id);

    // TODO: Send confirmation email to authors
    // TODO: Upload PDF to S3 or file storage

    return {
      success: true,
      message: 'Manuscript submitted successfully',
      article,
      manuscriptId: article.id,
    };
  }
}
