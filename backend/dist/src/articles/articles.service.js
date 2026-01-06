"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArticlesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ArticlesService = class ArticlesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(journalId, search, status, showInInpressCards, inPressMonth, inPressYear, sortBy = 'publishedAt', sortOrder = 'desc', page = 1, limit = 10) {
        const where = {};
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
    async findOne(id) {
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
            throw new common_1.NotFoundException(`Article with ID ${id} not found`);
        }
        return article;
    }
    async findRelated(id, limit = 5) {
        const article = await this.findOne(id);
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
    async create(createArticleDto) {
        const { authors, journalId, ...articleData } = createArticleDto;
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
        const filteredData = {};
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
    async update(id, updateArticleDto) {
        const { authors, journalId, ...articleData } = updateArticleDto;
        const validFields = [
            'title', 'abstract', 'keywords', 'status', 'pdfUrl', 'wordUrl', 'articleType',
            'submittedAt', 'publishedAt', 'submitterName', 'submitterEmail', 'submitterAddress',
            'submitterCountry', 'volumeNo', 'issueNo', 'issueMonth', 'year', 'specialIssue',
            'firstPageNumber', 'lastPageNumber', 'doi', 'correspondingAuthorDetails', 'citeAs',
            'country', 'fulltextImages', 'heading1Title', 'heading1Content', 'heading2Title',
            'heading2Content', 'heading3Title', 'heading3Content', 'heading4Title', 'heading4Content',
            'heading5Title', 'heading5Content', 'showInInpressCards', 'inPressMonth', 'inPressYear', 'issueId'
        ];
        const filteredData = {};
        for (const key of validFields) {
            if (articleData[key] !== undefined) {
                if (key === 'publishedAt' && articleData[key] === null) {
                    filteredData[key] = null;
                }
                else if (articleData[key] !== null) {
                    filteredData[key] = articleData[key];
                }
            }
        }
        const updateData = {
            ...filteredData,
        };
        if (journalId !== undefined) {
            updateData.journal = { connect: { id: journalId } };
        }
        if (authors) {
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
    async remove(id) {
        return this.prisma.article.delete({
            where: { id },
        });
    }
    async submitManuscript(manuscriptDto, file) {
        const { authors, journalId, ...manuscriptData } = manuscriptDto;
        console.log('🔵 Starting manuscript submission');
        console.log('Journal ID:', journalId);
        console.log('Authors:', authors);
        console.log('Manuscript Data:', manuscriptData);
        const firstAuthor = authors && authors.length > 0 ? authors[0] : null;
        const article = await this.prisma.article.create({
            data: {
                title: manuscriptData.title,
                abstract: manuscriptData.abstract,
                pdfUrl: manuscriptData.pdfUrl,
                keywords: manuscriptData.keywords,
                articleType: manuscriptData.articleType || null,
                status: 'PENDING',
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
        return {
            success: true,
            message: 'Manuscript submitted successfully',
            article,
            manuscriptId: article.id,
        };
    }
};
exports.ArticlesService = ArticlesService;
exports.ArticlesService = ArticlesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ArticlesService);
//# sourceMappingURL=articles.service.js.map