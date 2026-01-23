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
var PrismaService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
let PrismaService = PrismaService_1 = class PrismaService extends client_1.PrismaClient {
    logger = new common_1.Logger(PrismaService_1.name);
    modifiedUrl;
    constructor() {
        const originalUrl = process.env.DATABASE_URL;
        const modifiedUrl = originalUrl
            ? PrismaService_1.ensurePgbouncerCompatibility(originalUrl)
            : undefined;
        super({
            datasources: {
                db: {
                    url: modifiedUrl,
                },
            },
        });
        this.modifiedUrl = modifiedUrl;
    }
    static ensurePgbouncerCompatibility(url) {
        if (!url)
            return url;
        try {
            const urlObj = new URL(url);
            if (urlObj.searchParams.has('pgbouncer')) {
                return url;
            }
            const isRDS = urlObj.hostname.includes('.rds.amazonaws.com');
            if (isRDS) {
                if (urlObj.searchParams.has('sslmode')) {
                    return url;
                }
                return url;
            }
            urlObj.searchParams.set('pgbouncer', 'true');
            return urlObj.toString();
        }
        catch (error) {
            if (url.includes('pgbouncer=true')) {
                return url;
            }
            if (url.includes('.rds.amazonaws.com')) {
                return url;
            }
            if (url.includes('?')) {
                return `${url}&pgbouncer=true`;
            }
            return `${url}?pgbouncer=true`;
        }
    }
    async onModuleInit() {
        try {
            const originalUrl = process.env.DATABASE_URL;
            if (originalUrl && this.modifiedUrl && this.modifiedUrl !== originalUrl) {
                const sanitizedUrl = originalUrl.replace(/:[^:@]+@/, ':****@');
                this.logger.log(`🔧 Modified DATABASE_URL for PgBouncer compatibility`);
            }
            await this.$connect();
            this.logger.log('✅ Database connected successfully');
        }
        catch (error) {
            this.logger.error('❌ Failed to connect to database:', error);
            this.logger.warn('⚠️ Application will continue but database operations may fail');
        }
    }
    async onModuleDestroy() {
        await this.$disconnect();
    }
};
exports.PrismaService = PrismaService;
exports.PrismaService = PrismaService = PrismaService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], PrismaService);
//# sourceMappingURL=prisma.service.js.map