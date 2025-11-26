import { PrismaService } from '../prisma/prisma.service';
import { CreateJournalDto } from './dto/create-journal.dto';
export declare class JournalsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createJournalDto: CreateJournalDto): import("@prisma/client").Prisma.Prisma__JournalClient<{
        id: number;
        issn: string | null;
        shortcode: string | null;
        title: string;
        description: string;
        coverImage: string | null;
        publisher: string | null;
        accessType: string | null;
        subjectArea: string | null;
        category: string | null;
        discipline: string | null;
        impactFactor: string | null;
        aimsScope: string | null;
        guidelines: string | null;
        editorialBoard: string | null;
        homePageContent: string | null;
        currentIssueContent: string | null;
        archiveContent: string | null;
        articlesInPress: string | null;
        metaTitle: string | null;
        metaDescription: string | null;
        metaKeywords: string | null;
        doi: string | null;
        indexing: string | null;
        createdAt: Date;
        updatedAt: Date;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    findAll(): import("@prisma/client").Prisma.PrismaPromise<({
        _count: {
            articles: number;
        };
    } & {
        id: number;
        issn: string | null;
        shortcode: string | null;
        title: string;
        description: string;
        coverImage: string | null;
        publisher: string | null;
        accessType: string | null;
        subjectArea: string | null;
        category: string | null;
        discipline: string | null;
        impactFactor: string | null;
        aimsScope: string | null;
        guidelines: string | null;
        editorialBoard: string | null;
        homePageContent: string | null;
        currentIssueContent: string | null;
        archiveContent: string | null;
        articlesInPress: string | null;
        metaTitle: string | null;
        metaDescription: string | null;
        metaKeywords: string | null;
        doi: string | null;
        indexing: string | null;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    findOne(id: number): import("@prisma/client").Prisma.Prisma__JournalClient<({
        _count: {
            articles: number;
        };
    } & {
        id: number;
        issn: string | null;
        shortcode: string | null;
        title: string;
        description: string;
        coverImage: string | null;
        publisher: string | null;
        accessType: string | null;
        subjectArea: string | null;
        category: string | null;
        discipline: string | null;
        impactFactor: string | null;
        aimsScope: string | null;
        guidelines: string | null;
        editorialBoard: string | null;
        homePageContent: string | null;
        currentIssueContent: string | null;
        archiveContent: string | null;
        articlesInPress: string | null;
        metaTitle: string | null;
        metaDescription: string | null;
        metaKeywords: string | null;
        doi: string | null;
        indexing: string | null;
        createdAt: Date;
        updatedAt: Date;
    }) | null, null, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    findArticles(id: number): import("@prisma/client").Prisma.PrismaPromise<({
        authors: {
            id: number;
            createdAt: Date;
            name: string;
            email: string;
            affiliation: string | null;
        }[];
    } & {
        id: number;
        title: string;
        abstract: string;
        journalId: number;
        status: string;
        pdfUrl: string | null;
        publishedAt: Date | null;
        keywords: string | null;
        wordUrl: string | null;
        articleType: string | null;
        submittedAt: Date;
        submitterName: string | null;
        submitterEmail: string | null;
        submitterAddress: string | null;
        submitterCountry: string | null;
    })[]>;
}
