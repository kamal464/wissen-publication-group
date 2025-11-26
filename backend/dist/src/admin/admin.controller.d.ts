import { AdminService } from './admin.service';
export declare class AdminController {
    private readonly adminService;
    constructor(adminService: AdminService);
    login(credentials: {
        username: string;
        password: string;
    }): Promise<{
        success: boolean;
        token: string;
        user: {
            id: number;
            username: string;
            journalName: string | null;
        };
    }>;
    getDashboardStats(): Promise<{
        users: number;
        onlineSubmissions: number;
        journalShortcodes: number;
        pendingFulltexts: number;
        webPages: number;
        boardMembers: number;
    }>;
    getJournalAnalytics(): Promise<{
        id: number;
        title: string;
        totalArticles: number;
        publishedArticles: number;
        pendingArticles: number;
        underReviewArticles: number;
        averageReviewTime: number;
        impactFactor: string | null;
    }[]>;
    getArticleAnalytics(): Promise<{
        totalArticles: number;
        statusCounts: {
            PENDING: number;
            UNDER_REVIEW: number;
            ACCEPTED: number;
            PUBLISHED: number;
            REJECTED: number;
        };
        monthlySubmissions: {
            month: string;
            count: number;
        }[];
        categoryStats: {
            category: string;
            count: number;
        }[];
        recentArticles: ({
            journal: {
                title: string;
                category: string | null;
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
    }>;
    getSearchAnalytics(): Promise<{
        popularTerms: {
            term: string;
            count: number;
        }[];
        topViewedArticles: {
            title: string;
            views: number;
        }[];
    }>;
    updateArticleStatus(id: number, status: string, comments?: string): Promise<{
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
    createJournal(journalData: any): Promise<{
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
    }>;
    updateJournal(id: number, journalData: any): Promise<{
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
    }>;
    deleteJournal(id: number): Promise<{
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
    }>;
    getUsers(search?: string): Promise<{
        id: number;
        category: string | null;
        createdAt: Date;
        updatedAt: Date;
        userName: string;
        password: string | null;
        journalShort: string | null;
        journalName: string | null;
        isActive: boolean;
    }[]>;
    getUser(id: number): Promise<{
        id: number;
        category: string | null;
        createdAt: Date;
        updatedAt: Date;
        userName: string;
        password: string | null;
        journalShort: string | null;
        journalName: string | null;
        isActive: boolean;
    } | null>;
    createUser(userData: any): Promise<{
        id: number;
        category: string | null;
        createdAt: Date;
        updatedAt: Date;
        userName: string;
        password: string | null;
        journalShort: string | null;
        journalName: string | null;
        isActive: boolean;
    }>;
    updateUser(id: number, userData: any): Promise<{
        id: number;
        category: string | null;
        createdAt: Date;
        updatedAt: Date;
        userName: string;
        password: string | null;
        journalShort: string | null;
        journalName: string | null;
        isActive: boolean;
    }>;
    deleteUser(id: number): Promise<{
        id: number;
        category: string | null;
        createdAt: Date;
        updatedAt: Date;
        userName: string;
        password: string | null;
        journalShort: string | null;
        journalName: string | null;
        isActive: boolean;
    }>;
    toggleUserStatus(id: number): Promise<{
        id: number;
        category: string | null;
        createdAt: Date;
        updatedAt: Date;
        userName: string;
        password: string | null;
        journalShort: string | null;
        journalName: string | null;
        isActive: boolean;
    }>;
    getSubmissions(search?: string): Promise<({
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
    getSubmission(id: number): Promise<({
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
    }) | null>;
    getJournalShortcodes(): Promise<{
        id: number;
        shortcode: string;
        createdAt: Date;
        updatedAt: Date;
        journalId: number | null;
        journalName: string;
    }[]>;
    createJournalShortcode(journalName: string, shortcode: string): Promise<{
        id: number;
        shortcode: string;
        createdAt: Date;
        updatedAt: Date;
        journalId: number | null;
        journalName: string;
    }>;
    deleteJournalShortcode(id: number): Promise<{
        id: number;
        shortcode: string;
        createdAt: Date;
        updatedAt: Date;
        journalId: number | null;
        journalName: string;
    }>;
    getNotifications(unreadOnly?: string): Promise<{
        id: number;
        title: string;
        createdAt: Date;
        updatedAt: Date;
        message: string;
        type: string;
        isRead: boolean;
        userId: number | null;
    }[]>;
    markNotificationAsRead(id: number): Promise<{
        id: number;
        title: string;
        createdAt: Date;
        updatedAt: Date;
        message: string;
        type: string;
        isRead: boolean;
        userId: number | null;
    }>;
    markAllNotificationsAsRead(): Promise<import("@prisma/client").Prisma.BatchPayload>;
    debugLoginCheck(): Promise<{
        ok: boolean;
        passwordColumnExists: boolean;
        adminRow: {
            id: number;
            userName: string;
            isActive: boolean;
            hasPassword: boolean;
        } | null;
        message?: undefined;
    } | {
        ok: boolean;
        message: any;
        passwordColumnExists?: undefined;
        adminRow?: undefined;
    }>;
    globalSearch(query: string): Promise<{
        users: {
            id: number;
            category: string | null;
            createdAt: Date;
            updatedAt: Date;
            userName: string;
            password: string | null;
            journalShort: string | null;
            journalName: string | null;
            isActive: boolean;
        }[];
        articles: ({
            journal: {
                title: string;
            };
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
        journals: {
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
        }[];
        webPages: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            pageName: string;
            pageUrl: string;
            pageImage: string | null;
            seoTitle: string | null;
            seoDescription: string | null;
            seoKeywords: string | null;
            bannerImage: string | null;
            pageDescription: string | null;
        }[];
    }>;
}
