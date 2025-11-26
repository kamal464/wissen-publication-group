import { ArticlesService } from './articles.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
export declare class ArticlesController {
    private readonly articlesService;
    constructor(articlesService: ArticlesService);
    create(createArticleDto: CreateArticleDto): Promise<{
        journal: {
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
        };
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
    }>;
    findAll(journalId?: string, search?: string, status?: string, sortBy?: string, sortOrder?: 'asc' | 'desc', page?: string, limit?: string): Promise<{
        data: ({
            journal: {
                id: number;
                issn: string | null;
                title: string;
            };
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
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(id: number): Promise<{
        journal: {
            id: number;
            issn: string | null;
            title: string;
            publisher: string | null;
        };
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
    }>;
    findRelated(id: number, limit?: string): Promise<({
        journal: {
            id: number;
            title: string;
        };
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
    update(id: number, updateArticleDto: UpdateArticleDto): Promise<{
        journal: {
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
        };
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
    }>;
    remove(id: number): Promise<{
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
    }>;
    submitManuscript(title: string, journalId: string, abstract: string, keywords: string, authorsJson: string, file?: Express.Multer.File): Promise<{
        success: boolean;
        message: string;
        article: {
            journal: {
                id: number;
                issn: string | null;
                title: string;
                publisher: string | null;
            };
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
        };
        manuscriptId: number;
    }>;
}
