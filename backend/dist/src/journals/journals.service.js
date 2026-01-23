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
var JournalsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.JournalsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let JournalsService = JournalsService_1 = class JournalsService {
    prisma;
    logger = new common_1.Logger(JournalsService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    create(createJournalDto) {
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
                    { updatedAt: 'desc' },
                    { id: 'desc' },
                ],
            });
            const deduplicated = this.deduplicateJournals(journals);
            return deduplicated;
        }
        catch (error) {
            this.logger.error('Error fetching journals:', error);
            throw error;
        }
    }
    deduplicateJournals(journals) {
        const seenByTitle = new Map();
        const journalsWithoutTitle = [];
        for (const journal of journals) {
            const titleKey = journal.title?.toLowerCase().trim();
            if (!titleKey) {
                journalsWithoutTitle.push(journal);
                continue;
            }
            const existing = seenByTitle.get(titleKey);
            if (!existing) {
                seenByTitle.set(titleKey, journal);
            }
            else {
                const existingScore = this.getJournalCompletenessScore(existing);
                const currentScore = this.getJournalCompletenessScore(journal);
                if (currentScore > existingScore ||
                    (currentScore === existingScore &&
                        new Date(journal.updatedAt || journal.createdAt || 0) >
                            new Date(existing.updatedAt || existing.createdAt || 0))) {
                    seenByTitle.set(titleKey, journal);
                }
            }
        }
        return [...Array.from(seenByTitle.values()), ...journalsWithoutTitle];
    }
    getJournalCompletenessScore(journal) {
        let score = 0;
        if (journal.description && journal.description.trim())
            score += 2;
        if (journal.aimsScope && journal.aimsScope.trim())
            score += 3;
        if (journal.guidelines && journal.guidelines.trim())
            score += 3;
        if (journal.editorialBoard && journal.editorialBoard.trim())
            score += 2;
        if (journal.homePageContent && journal.homePageContent.trim())
            score += 2;
        if (journal.category && journal.category.trim())
            score += 1;
        if (journal.subjectArea && journal.subjectArea.trim())
            score += 1;
        if (journal.issn && journal.issn.trim())
            score += 1;
        if (journal.coverImage)
            score += 1;
        if (journal.bannerImage)
            score += 1;
        if (journal._count?.articles > 0)
            score += 2;
        return score;
    }
    findOne(id) {
        return this.prisma.journal.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { articles: true },
                },
            },
        });
    }
    async findByShortcode(shortcode) {
        let journal = await this.prisma.journal.findUnique({
            where: { shortcode },
            include: {
                _count: {
                    select: { articles: true },
                },
            },
        });
        if (!journal) {
            const shortcodeEntry = await this.prisma.journalShortcode.findUnique({
                where: { shortcode },
            });
            if (shortcodeEntry && shortcodeEntry.journalId) {
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
    findArticles(id) {
        return this.prisma.article.findMany({
            where: { journalId: id },
            include: {
                authors: true,
            },
        });
    }
};
exports.JournalsService = JournalsService;
exports.JournalsService = JournalsService = JournalsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], JournalsService);
//# sourceMappingURL=journals.service.js.map