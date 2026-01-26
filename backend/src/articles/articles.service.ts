import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { S3Service } from '../aws/s3.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { SubmitManuscriptDto } from './dto/submit-manuscript.dto';

@Injectable()
export class ArticlesService {
  constructor(
    private prisma: PrismaService,
    private s3Service: S3Service,
  ) {}

  async findAll(
    journalId?: number,
    search?: string,
    status?: string,
    showInInpressCards?: boolean,
    inPressMonth?: string,
    inPressYear?: string,
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

    if (showInInpressCards !== undefined) {
      where.showInInpressCards = showInInpressCards;
    }

    if (inPressMonth) {
      where.inPressMonth = inPressMonth;
    }

    if (inPressYear) {
      where.inPressYear = inPressYear;
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

    // Only include fields that exist in the Article model
    const validFields = [
      'title', 'abstract', 'keywords', 'status', 'pdfUrl', 'wordUrl', 'articleType',
      'submittedAt', 'publishedAt', 'submitterName', 'submitterEmail', 'submitterAddress',
      'submitterCountry', 'volumeNo', 'issueNo', 'issueMonth', 'year', 'specialIssue',
      'firstPageNumber', 'lastPageNumber', 'doi', 'correspondingAuthorDetails', 'citeAs',
      'country', 'receivedAt', 'acceptedAt', 'fulltextImages', 'heading1Title', 'heading1Content',
      'heading2Title', 'heading2Content', 'heading3Title', 'heading3Content', 'heading4Title',
      'heading4Content', 'heading5Title', 'heading5Content', 'showInInpressCards', 'inPressMonth',
      'inPressYear', 'issueId'
    ];
    const filteredData: any = {};
    
    for (const key of validFields) {
      if (articleData[key] !== undefined && articleData[key] !== null) {
        filteredData[key] = articleData[key];
      }
    }

    return this.prisma.article.create({
      data: {
        ...filteredData,
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

    // Only include fields that exist in the Article model
    const validFields = [
      'title', 'abstract', 'keywords', 'status', 'pdfUrl', 'wordUrl', 'articleType',
      'submittedAt', 'publishedAt', 'submitterName', 'submitterEmail', 'submitterAddress',
      'submitterCountry', 'volumeNo', 'issueNo', 'issueMonth', 'year', 'specialIssue',
      'firstPageNumber', 'lastPageNumber', 'doi', 'correspondingAuthorDetails', 'citeAs',
      'country', 'fulltextImages', 'heading1Title', 'heading1Content', 'heading2Title',
      'heading2Content', 'heading3Title', 'heading3Content', 'heading4Title', 'heading4Content',
      'heading5Title', 'heading5Content', 'showInInpressCards', 'inPressMonth', 'inPressYear', 'issueId'
    ];
    const filteredData: any = {};
    
    for (const key of validFields) {
      // Allow null for publishedAt to support clearing it when moving articles from Current Issue
      if (articleData[key] !== undefined) {
        if (key === 'publishedAt' && articleData[key] === null) {
          filteredData[key] = null;
        } else if (articleData[key] !== null) {
          filteredData[key] = articleData[key];
        }
      }
    }

    const updateData: any = {
      ...filteredData,
    };

    if (journalId !== undefined) {
      updateData.journal = { connect: { id: journalId } };
    }

    if (authors) {
      // Delete existing authors and create new ones
      await this.prisma.author.deleteMany({ where: { articles: { some: { id } } } });
      updateData.authors = {
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

    // Upload file to S3 if provided
    let pdfUrl = manuscriptData.pdfUrl;
    if (file) {
      try {
        const uploadResult = await this.s3Service.uploadFile(file, 'articles');
        pdfUrl = uploadResult.url;
        console.log('✅ File uploaded to S3:', pdfUrl);
      } catch (error) {
        console.error('❌ Error uploading file to S3:', error);
        throw new InternalServerErrorException('Failed to upload file to S3');
      }
    }

    // Extract submitter info from first author or manuscriptData
    const firstAuthor = authors && authors.length > 0 ? authors[0] : null;

    // Create article with PENDING status and connect to authors
    const article = await this.prisma.article.create({
      data: {
        title: manuscriptData.title,
        abstract: manuscriptData.abstract,
        pdfUrl: pdfUrl,
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
