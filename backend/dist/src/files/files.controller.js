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
exports.FilesController = void 0;
const common_1 = require("@nestjs/common");
const path_1 = require("path");
const fs_1 = require("fs");
let FilesController = class FilesController {
    async serveFile(filename, res) {
        try {
            console.log(`[FilesController] Request for file: ${filename}`);
            if (!/^[a-zA-Z0-9._-]+$/.test(filename)) {
                console.error(`[FilesController] Invalid filename: ${filename}`);
                throw new common_1.NotFoundException('Invalid filename');
            }
            const possiblePaths = [
                (0, path_1.join)('/app', 'uploads', filename),
                (0, path_1.join)(__dirname, '..', '..', 'uploads', filename),
                (0, path_1.join)(__dirname, '..', 'uploads', filename),
                (0, path_1.join)(process.cwd(), 'uploads', filename),
                (0, path_1.join)(process.cwd(), 'backend', 'uploads', filename),
            ];
            console.log(`[FilesController] Current working directory: ${process.cwd()}`);
            console.log(`[FilesController] __dirname: ${__dirname}`);
            console.log(`[FilesController] Searching for file: ${filename}`);
            let filePath = null;
            for (const path of possiblePaths) {
                console.log(`[FilesController] Checking path: ${path}`);
                if ((0, fs_1.existsSync)(path)) {
                    filePath = path;
                    console.log(`[FilesController] ✅ File found at: ${filePath}`);
                    break;
                }
                else {
                    console.log(`[FilesController] ❌ File not found at: ${path}`);
                }
            }
            if (!filePath) {
                console.error(`[FilesController] ❌ File not found in any location. Tried:`, possiblePaths);
                console.error(`[FilesController] Current working directory: ${process.cwd()}`);
                console.error(`[FilesController] __dirname: ${__dirname}`);
                throw new common_1.NotFoundException(`File ${filename} not found. Files may have been lost due to container restart (Cloud Run containers are ephemeral).`);
            }
            const ext = filename.split('.').pop()?.toLowerCase();
            const contentTypeMap = {
                'pdf': 'application/pdf',
                'doc': 'application/msword',
                'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'png': 'image/png',
                'jpg': 'image/jpeg',
                'jpeg': 'image/jpeg',
            };
            const contentType = contentTypeMap[ext || ''] || 'application/octet-stream';
            res.setHeader('Content-Type', contentType);
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.sendFile(filePath);
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            console.error('Error serving file:', error);
            throw new common_1.NotFoundException(`Error serving file: ${error}`);
        }
    }
};
exports.FilesController = FilesController;
__decorate([
    (0, common_1.Get)(':filename'),
    __param(0, (0, common_1.Param)('filename')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], FilesController.prototype, "serveFile", null);
exports.FilesController = FilesController = __decorate([
    (0, common_1.Controller)('uploads')
], FilesController);
//# sourceMappingURL=files.controller.js.map