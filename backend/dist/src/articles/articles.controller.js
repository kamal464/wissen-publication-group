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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArticlesController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const articles_service_1 = require("./articles.service");
const s3_service_1 = require("../aws/s3.service");
const create_article_dto_1 = require("./dto/create-article.dto");
const update_article_dto_1 = require("./dto/update-article.dto");
let ArticlesController = class ArticlesController {
    articlesService;
    s3Service;
    constructor(articlesService, s3Service) {
        this.articlesService = articlesService;
        this.s3Service = s3Service;
    }
    create(createArticleDto) {
        return this.articlesService.create(createArticleDto);
    }
    findAll(journalId, search, status, showInInpressCards, inPressMonth, inPressYear, sortBy, sortOrder, page, limit) {
        const journalIdNum = journalId ? parseInt(journalId, 10) : undefined;
        const pageNum = page ? parseInt(page, 10) : 1;
        const limitNum = limit ? parseInt(limit, 10) : 10;
        const showInInpressCardsBool = showInInpressCards === 'true' ? true : showInInpressCards === 'false' ? false : undefined;
        return this.articlesService.findAll(journalIdNum, search, status, showInInpressCardsBool, inPressMonth, inPressYear, sortBy || 'publishedAt', sortOrder || 'desc', pageNum, limitNum);
    }
    findOne(id) {
        return this.articlesService.findOne(id);
    }
    findRelated(id, limit) {
        const limitNum = limit ? parseInt(limit, 10) : 5;
        return this.articlesService.findRelated(id, limitNum);
    }
    update(id, updateArticleDto) {
        return this.articlesService.update(id, updateArticleDto);
    }
    async submitManuscript(title, journalId, abstract, keywords, authorsJson, file) {
        try {
            console.log('📝 Manuscript submission request received');
            console.log('Title:', title);
            console.log('Journal ID:', journalId);
            console.log('File:', file?.filename);
            console.log('Authors JSON:', authorsJson);
            const authors = JSON.parse(authorsJson || '[]');
            const manuscriptDto = {
                title,
                journalId: parseInt(journalId, 10),
                abstract,
                keywords,
                authors,
                pdfUrl: file ? `/uploads/${file.filename}` : undefined,
            };
            console.log('📤 Calling service with DTO:', manuscriptDto);
            const result = await this.articlesService.submitManuscript(manuscriptDto, file);
            console.log('✅ Manuscript submitted successfully');
            return result;
        }
        catch (error) {
            console.error('❌ Error submitting manuscript:', error);
            throw error;
        }
    }
    async uploadPdf(id, file) {
        if (!file) {
            throw new Error('No file uploaded');
        }
        const uploadResult = await this.s3Service.uploadFile(file, 'articles');
        return this.articlesService.update(id, { pdfUrl: uploadResult.url });
    }
    async uploadImages(id, files) {
        if (!files || files.length === 0) {
            throw new Error('No files uploaded');
        }
        const uploadPromises = files.map(file => this.s3Service.uploadFile(file, 'articles/images'));
        const uploadResults = await Promise.all(uploadPromises);
        const imagePaths = uploadResults.map(result => result.url);
        const fulltextImages = JSON.stringify(imagePaths);
        return this.articlesService.update(id, { fulltextImages });
    }
    remove(id) {
        return this.articlesService.remove(id);
    }
};
exports.ArticlesController = ArticlesController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_article_dto_1.CreateArticleDto]),
    __metadata("design:returntype", void 0)
], ArticlesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('journalId')),
    __param(1, (0, common_1.Query)('search')),
    __param(2, (0, common_1.Query)('status')),
    __param(3, (0, common_1.Query)('showInInpressCards')),
    __param(4, (0, common_1.Query)('inPressMonth')),
    __param(5, (0, common_1.Query)('inPressYear')),
    __param(6, (0, common_1.Query)('sortBy')),
    __param(7, (0, common_1.Query)('sortOrder')),
    __param(8, (0, common_1.Query)('page')),
    __param(9, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], ArticlesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ArticlesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)(':id/related'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", void 0)
], ArticlesController.prototype, "findRelated", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_article_dto_1.UpdateArticleDto]),
    __metadata("design:returntype", void 0)
], ArticlesController.prototype, "update", null);
__decorate([
    (0, common_1.Post)('manuscripts'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('pdf')),
    __param(0, (0, common_1.Body)('title')),
    __param(1, (0, common_1.Body)('journalId')),
    __param(2, (0, common_1.Body)('abstract')),
    __param(3, (0, common_1.Body)('keywords')),
    __param(4, (0, common_1.Body)('authors')),
    __param(5, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, Object]),
    __metadata("design:returntype", Promise)
], ArticlesController.prototype, "submitManuscript", null);
__decorate([
    (0, common_1.Post)(':id/upload-pdf'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('pdf')),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], ArticlesController.prototype, "uploadPdf", null);
__decorate([
    (0, common_1.Post)(':id/upload-images'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('files', 10)),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Array]),
    __metadata("design:returntype", Promise)
], ArticlesController.prototype, "uploadImages", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ArticlesController.prototype, "remove", null);
exports.ArticlesController = ArticlesController = __decorate([
    (0, common_1.Controller)('articles'),
    __metadata("design:paramtypes", [articles_service_1.ArticlesService,
        s3_service_1.S3Service])
], ArticlesController);
//# sourceMappingURL=articles.controller.js.map