import { PrismaService } from '../prisma/prisma.service';
export declare class MessagesService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createMessageDto: {
        content: string;
    }): import("@prisma/client").Prisma.Prisma__MessageClient<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        content: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    findAll(): import("@prisma/client").Prisma.PrismaPromise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        content: string;
    }[]>;
}
