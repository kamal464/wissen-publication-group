import { OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
export declare class PrismaService extends PrismaClient implements OnModuleInit {
    private readonly logger;
    private modifiedUrl;
    constructor();
    private static ensurePgbouncerCompatibility;
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
}
