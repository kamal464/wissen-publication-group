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
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const admin_service_1 = require("./admin.service");
const s3_service_1 = require("../aws/s3.service");
let AdminController = class AdminController {
    adminService;
    s3Service;
    constructor(adminService, s3Service) {
        this.adminService = adminService;
        this.s3Service = s3Service;
    }
    async login(credentials) {
        return await this.adminService.login(credentials.username, credentials.password);
    }
    getDashboardStats() {
        return this.adminService.getDashboardStats();
    }
    getJournalAnalytics() {
        return this.adminService.getJournalAnalytics();
    }
    getArticleAnalytics() {
        return this.adminService.getArticleAnalytics();
    }
    getSearchAnalytics() {
        return this.adminService.getSearchAnalytics();
    }
    updateArticleStatus(id, status, comments) {
        return this.adminService.updateArticleStatus(id, status, comments);
    }
    createJournal(journalData) {
        return this.adminService.createJournal(journalData);
    }
    updateJournal(id, journalData) {
        return this.adminService.updateJournal(id, journalData);
    }
    toggleJournalVisibility(id) {
        return this.adminService.toggleJournalVisibility(id);
    }
    deleteJournal(id) {
        return this.adminService.deleteJournal(id);
    }
    getUsers(search) {
        return this.adminService.getUsers(search);
    }
    getUser(id) {
        return this.adminService.getUser(id);
    }
    async createUser(userData) {
        try {
            return await this.adminService.createUser(userData);
        }
        catch (error) {
            if (error.status && error.message) {
                throw error;
            }
            throw new common_1.BadRequestException(error.message || 'Failed to create user');
        }
    }
    async updateUser(id, userData) {
        try {
            return await this.adminService.updateUser(id, userData);
        }
        catch (error) {
            if (error.status && error.message) {
                throw error;
            }
            throw new common_1.BadRequestException(error.message || 'Failed to update user');
        }
    }
    deleteUser(id) {
        return this.adminService.deleteUser(id);
    }
    toggleUserStatus(id) {
        return this.adminService.toggleUserStatus(id);
    }
    getSubmissions(search) {
        return this.adminService.getSubmissions(search);
    }
    getSubmission(id) {
        return this.adminService.getSubmission(id);
    }
    getJournalShortcodes() {
        return this.adminService.getJournalShortcodes();
    }
    createJournalShortcode(journalName, shortcode) {
        return this.adminService.createJournalShortcode(journalName, shortcode);
    }
    deleteJournalShortcode(id) {
        return this.adminService.deleteJournalShortcode(id);
    }
    getNotifications(unreadOnly) {
        const unreadOnlyBool = unreadOnly === 'true' || unreadOnly === '1';
        return this.adminService.getNotifications(unreadOnlyBool);
    }
    markNotificationAsRead(id) {
        return this.adminService.markNotificationAsRead(id);
    }
    markAllNotificationsAsRead() {
        return this.adminService.markAllNotificationsAsRead();
    }
    debugLoginCheck() {
        return this.adminService.debugLoginCheck();
    }
    globalSearch(query) {
        return this.adminService.globalSearch(query);
    }
    async uploadJournalImage(id, file, req) {
        console.log('Upload request received:', {
            id,
            hasFile: !!file,
            reqBody: req.body,
            fileInfo: file ? { name: file.originalname, size: file.size, mimetype: file.mimetype } : null
        });
        if (!file) {
            throw new common_1.BadRequestException('No file uploaded');
        }
        const field = req.body?.field;
        console.log('Extracted field:', field);
        if (!field) {
            console.error('Field parameter missing. Req.body:', req.body);
            throw new common_1.BadRequestException('Field parameter is required. Allowed fields: bannerImage, flyerImage, flyerPdf, googleIndexingImage, editorImage');
        }
        try {
            console.log('Uploading file to S3...', { filename: file.originalname, size: file.size, mimetype: file.mimetype });
            const uploadResult = await this.s3Service.uploadFile(file, 'journals');
            const fileUrl = uploadResult.url;
            console.log('File uploaded to S3:', fileUrl);
            const updateData = {};
            if (field === 'bannerImage')
                updateData.bannerImage = fileUrl;
            else if (field === 'flyerImage')
                updateData.flyerImage = fileUrl;
            else if (field === 'flyerPdf')
                updateData.flyerPdf = fileUrl;
            else if (field === 'googleIndexingImage')
                updateData.googleIndexingImage = fileUrl;
            else if (field === 'editorImage')
                updateData.editorImage = fileUrl;
            else {
                throw new common_1.BadRequestException(`Invalid field: ${field}. Allowed fields: bannerImage, flyerImage, flyerPdf, googleIndexingImage, editorImage`);
            }
            console.log('Updating journal with field:', field, 'URL:', fileUrl);
            const updated = await this.adminService.updateJournal(id, updateData);
            console.log('Journal updated successfully');
            return {
                success: true,
                url: fileUrl,
                field,
                journal: updated
            };
        }
        catch (error) {
            console.error('Error uploading journal image:', error);
            console.error('Error stack:', error.stack);
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            const code = error.Code ?? error.name;
            const isCredentialError = code === 'InvalidAccessKeyId' || code === 'SignatureDoesNotMatch' ||
                error.message?.includes('Access Key') || error.message?.includes('does not exist in our records') ||
                error.message?.includes('authorization header is malformed');
            if (isCredentialError) {
                throw new common_1.InternalServerErrorException('AWS credentials are invalid (e.g. key deleted or wrong). Create a new IAM user access key in AWS Console, then set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in backend/.env (or backend/prod.env for local dev).');
            }
            if (error.name === 'NoSuchBucket') {
                throw new common_1.InternalServerErrorException(`S3 bucket not found: ${process.env.S3_BUCKET_NAME}`);
            }
            throw new common_1.InternalServerErrorException(`Failed to upload image: ${error.message || 'Unknown error'}`);
        }
    }
    getBoardMembers(journalId) {
        const journalIdNum = journalId ? parseInt(journalId) : undefined;
        return this.adminService.getBoardMembers(journalIdNum);
    }
    getBoardMember(id) {
        return this.adminService.getBoardMember(id);
    }
    createBoardMember(memberData) {
        if (!memberData.journalId) {
            throw new common_1.BadRequestException('Journal ID is required');
        }
        return this.adminService.createBoardMember(memberData.journalId, memberData);
    }
    updateBoardMember(id, memberData) {
        return this.adminService.updateBoardMember(id, memberData);
    }
    deleteBoardMember(id) {
        return this.adminService.deleteBoardMember(id);
    }
    async uploadBoardMemberPhoto(id, file) {
        if (!file) {
            throw new common_1.BadRequestException('No file uploaded');
        }
        const uploadResult = await this.s3Service.uploadFile(file, 'board-members');
        const fileUrl = uploadResult.url;
        const updated = await this.adminService.updateBoardMember(id, { imageUrl: fileUrl });
        return {
            success: true,
            path: fileUrl,
            member: updated
        };
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Post)('login'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "login", null);
__decorate([
    (0, common_1.Get)('dashboard/stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getDashboardStats", null);
__decorate([
    (0, common_1.Get)('analytics/journals'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getJournalAnalytics", null);
__decorate([
    (0, common_1.Get)('analytics/articles'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getArticleAnalytics", null);
__decorate([
    (0, common_1.Get)('analytics/search'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getSearchAnalytics", null);
__decorate([
    (0, common_1.Put)('articles/:id/status'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)('status')),
    __param(2, (0, common_1.Body)('comments')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "updateArticleStatus", null);
__decorate([
    (0, common_1.Post)('journals'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "createJournal", null);
__decorate([
    (0, common_1.Put)('journals/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "updateJournal", null);
__decorate([
    (0, common_1.Put)('journals/:id/toggle-visibility'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "toggleJournalVisibility", null);
__decorate([
    (0, common_1.Delete)('journals/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "deleteJournal", null);
__decorate([
    (0, common_1.Get)('users'),
    __param(0, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getUsers", null);
__decorate([
    (0, common_1.Get)('users/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getUser", null);
__decorate([
    (0, common_1.Post)('users'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "createUser", null);
__decorate([
    (0, common_1.Put)('users/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateUser", null);
__decorate([
    (0, common_1.Delete)('users/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "deleteUser", null);
__decorate([
    (0, common_1.Put)('users/:id/toggle'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "toggleUserStatus", null);
__decorate([
    (0, common_1.Get)('submissions'),
    __param(0, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getSubmissions", null);
__decorate([
    (0, common_1.Get)('submissions/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getSubmission", null);
__decorate([
    (0, common_1.Get)('journal-shortcodes'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getJournalShortcodes", null);
__decorate([
    (0, common_1.Post)('journal-shortcodes'),
    __param(0, (0, common_1.Body)('journalName')),
    __param(1, (0, common_1.Body)('shortcode')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "createJournalShortcode", null);
__decorate([
    (0, common_1.Delete)('journal-shortcodes/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "deleteJournalShortcode", null);
__decorate([
    (0, common_1.Get)('notifications'),
    __param(0, (0, common_1.Query)('unreadOnly')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getNotifications", null);
__decorate([
    (0, common_1.Put)('notifications/:id/read'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "markNotificationAsRead", null);
__decorate([
    (0, common_1.Put)('notifications/read-all'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "markAllNotificationsAsRead", null);
__decorate([
    (0, common_1.Get)('_debug/login-check'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "debugLoginCheck", null);
__decorate([
    (0, common_1.Get)('search'),
    __param(0, (0, common_1.Query)('query')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "globalSearch", null);
__decorate([
    (0, common_1.Post)('journals/:id/upload-image'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "uploadJournalImage", null);
__decorate([
    (0, common_1.Get)('board-members'),
    __param(0, (0, common_1.Query)('journalId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getBoardMembers", null);
__decorate([
    (0, common_1.Get)('board-members/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getBoardMember", null);
__decorate([
    (0, common_1.Post)('board-members'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "createBoardMember", null);
__decorate([
    (0, common_1.Put)('board-members/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "updateBoardMember", null);
__decorate([
    (0, common_1.Delete)('board-members/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "deleteBoardMember", null);
__decorate([
    (0, common_1.Post)('board-members/:id/upload-photo'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "uploadBoardMemberPhoto", null);
exports.AdminController = AdminController = __decorate([
    (0, common_1.Controller)('admin'),
    __metadata("design:paramtypes", [admin_service_1.AdminService,
        s3_service_1.S3Service])
], AdminController);
//# sourceMappingURL=admin.controller.js.map