"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArticlesModule = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const articles_controller_1 = require("./articles.controller");
const articles_service_1 = require("./articles.service");
const prisma_module_1 = require("../prisma/prisma.module");
const aws_module_1 = require("../aws/aws.module");
let ArticlesModule = class ArticlesModule {
};
exports.ArticlesModule = ArticlesModule;
exports.ArticlesModule = ArticlesModule = __decorate([
    (0, common_1.Module)({
        imports: [
            prisma_module_1.PrismaModule,
            aws_module_1.AwsModule,
            platform_express_1.MulterModule.register({
                storage: (0, multer_1.memoryStorage)(),
                fileFilter: (req, file, cb) => {
                    const allowedMimeTypes = [
                        'application/pdf',
                        'application/msword',
                        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                        'image/png',
                        'image/jpeg',
                    ];
                    if (allowedMimeTypes.includes(file.mimetype)) {
                        cb(null, true);
                    }
                    else {
                        cb(new Error('Only PDF, Word (.doc, .docx), PNG, and JPEG files are allowed'), false);
                    }
                },
                limits: {
                    fileSize: 10 * 1024 * 1024,
                },
            }),
        ],
        controllers: [articles_controller_1.ArticlesController],
        providers: [articles_service_1.ArticlesService],
        exports: [articles_service_1.ArticlesService],
    })
], ArticlesModule);
//# sourceMappingURL=articles.module.js.map