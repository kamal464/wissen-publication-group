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
            return await this.prisma.journal.findMany({
                include: {
                    _count: {
                        select: { articles: true },
                    },
                },
            });
        }
        catch (error) {
            this.logger.error('Error fetching journals:', error);
            throw error;
        }
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