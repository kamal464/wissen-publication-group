import { MessagesService } from './messages.service';
export declare class MessagesController {
    private readonly messagesService;
    constructor(messagesService: MessagesService);
    create(createMessageDto: {
        content: string;
    }): import("@prisma/client").Prisma.Prisma__MessageClient<{
        id: number;
        content: string;
        createdAt: Date;
        updatedAt: Date;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    findAll(): import("@prisma/client").Prisma.PrismaPromise<{
        id: number;
        content: string;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
}
