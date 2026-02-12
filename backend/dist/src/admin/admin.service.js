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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let AdminService = class AdminService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async login(username, password) {
        let user = await this.prisma.user.findFirst({
            where: {
                OR: [
                    { userName: username },
                    { journalShort: username }
                ]
            }
        });
        if (!user && username === 'admin') {
            try {
                await this.prisma.user.upsert({
                    where: { userName: 'admin' },
                    update: {
                        isActive: true,
                        password: 'Bharath@321'
                    },
                    create: {
                        userName: 'admin',
                        password: 'Bharath@321',
                        isActive: true,
                        journalName: 'Administrator',
                        category: 'System'
                    }
                });
                user = await this.prisma.user.findUnique({ where: { userName: 'admin' } });
            }
            catch (e) {
                user = null;
            }
        }
        else if (user && user.userName === 'admin' && (!user.password || user.password.trim() === '')) {
            user = await this.prisma.user.update({
                where: { id: user.id },
                data: { password: 'Bharath@321', isActive: true }
            });
        }
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid username or password');
        }
        if (!user.isActive) {
            throw new common_1.ForbiddenException('User account is inactive');
        }
        if (!user.password || user.password !== password) {
            throw new common_1.UnauthorizedException('Invalid username or password');
        }
        return {
            success: true,
            token: `admin-token-${user.id}-${Date.now()}`,
            user: {
                id: user.id,
                username: user.userName,
                journalName: user.journalName
            }
        };
    }
    async debugLoginCheck() {
        try {
            const colCheck = await this.prisma.$queryRawUnsafe(`SELECT EXISTS (
             SELECT 1 FROM information_schema.columns 
             WHERE table_name = 'User' OR table_name = 'user'
               AND column_name = 'password'
           ) AS exists`);
            const passwordColumnExists = Array.isArray(colCheck) && colCheck[0]?.exists === true;
            const adminRow = await this.prisma.user.findUnique({
                where: { userName: 'admin' },
                select: { id: true, userName: true, isActive: true, password: true }
            }).catch(() => null);
            return {
                ok: true,
                passwordColumnExists,
                adminRow: adminRow ? {
                    id: adminRow.id,
                    userName: adminRow.userName,
                    isActive: adminRow.isActive,
                    hasPassword: !!adminRow.password
                } : null
            };
        }
        catch (e) {
            return {
                ok: false,
                message: e?.message || 'debug failed'
            };
        }
    }
    async getDashboardStats() {
        const [totalUsers, totalSubmissions, totalShortcodes, pendingFulltexts, totalWebPages, totalBoardMembers] = await Promise.all([
            this.prisma.user.count(),
            this.prisma.article.count(),
            this.prisma.journalShortcode.count(),
            this.prisma.article.count({ where: { status: 'PENDING' } }),
            this.prisma.webPage.count(),
            this.prisma.boardMember.count()
        ]);
        return {
            users: totalUsers,
            onlineSubmissions: totalSubmissions,
            journalShortcodes: totalShortcodes,
            pendingFulltexts: pendingFulltexts,
            webPages: totalWebPages,
            boardMembers: totalBoardMembers
        };
    }
    async getJournalAnalytics() {
        const journals = await this.prisma.journal.findMany({
            include: {
                articles: {
                    select: {
                        id: true,
                        status: true,
                        submittedAt: true,
                        publishedAt: true
                    }
                }
            }
        });
        return journals.map(journal => ({
            id: journal.id,
            title: journal.title,
            totalArticles: journal.articles.length,
            publishedArticles: journal.articles.filter(a => a.status === 'PUBLISHED').length,
            pendingArticles: journal.articles.filter(a => a.status === 'PENDING').length,
            underReviewArticles: journal.articles.filter(a => a.status === 'UNDER_REVIEW').length,
            averageReviewTime: this.calculateAverageReviewTime(journal.articles),
            impactFactor: journal.impactFactor
        }));
    }
    async getArticleAnalytics() {
        const articles = await this.prisma.article.findMany({
            include: {
                authors: true,
                journal: {
                    select: {
                        title: true,
                        category: true
                    }
                }
            },
            orderBy: {
                submittedAt: 'desc'
            }
        });
        const statusCounts = {
            PENDING: articles.filter(a => a.status === 'PENDING').length,
            UNDER_REVIEW: articles.filter(a => a.status === 'UNDER_REVIEW').length,
            ACCEPTED: articles.filter(a => a.status === 'ACCEPTED').length,
            PUBLISHED: articles.filter(a => a.status === 'PUBLISHED').length,
            REJECTED: articles.filter(a => a.status === 'REJECTED').length
        };
        const monthlySubmissions = this.groupByMonth(articles);
        const categoryStats = this.groupByCategory(articles);
        return {
            totalArticles: articles.length,
            statusCounts,
            monthlySubmissions,
            categoryStats,
            recentArticles: articles.slice(0, 10)
        };
    }
    async getSearchAnalytics() {
        return {
            popularTerms: [
                { term: 'machine learning', count: 245 },
                { term: 'artificial intelligence', count: 189 },
                { term: 'sustainable energy', count: 156 },
                { term: 'healthcare technology', count: 134 },
                { term: 'data science', count: 112 }
            ],
            topViewedArticles: [
                { title: 'Machine Learning Applications in Healthcare', views: 1250 },
                { title: 'Sustainable Energy Solutions', views: 980 },
                { title: 'Social Media Impact on Education', views: 756 }
            ]
        };
    }
    async updateArticleStatus(articleId, status, comments) {
        const updateData = { status };
        if (status === 'PUBLISHED') {
            updateData.publishedAt = new Date();
        }
        return await this.prisma.article.update({
            where: { id: articleId },
            data: updateData,
            include: {
                authors: true,
                journal: true
            }
        });
    }
    async createJournal(journalData) {
        console.log('🔵 createJournal - Received data:', JSON.stringify(journalData, null, 2));
        const title = journalData.title ? String(journalData.title).trim() : '';
        const description = journalData.description ? String(journalData.description).trim() : '';
        if (!title) {
            throw new common_1.BadRequestException('Title is required and cannot be empty');
        }
        const data = {
            title: title,
            description: description || title,
        };
        console.log('🔵 createJournal - Prepared data:', JSON.stringify(data, null, 2));
        const isValidValue = (value) => {
            return value !== undefined && value !== null && String(value).trim() !== '';
        };
        if (isValidValue(journalData.issn)) {
            data.issn = String(journalData.issn).trim();
        }
        if (isValidValue(journalData.shortcode)) {
            data.shortcode = String(journalData.shortcode).trim();
        }
        if (isValidValue(journalData.publisher)) {
            data.publisher = String(journalData.publisher).trim();
        }
        if (isValidValue(journalData.accessType)) {
            data.accessType = String(journalData.accessType).trim();
        }
        if (isValidValue(journalData.subjectArea)) {
            data.subjectArea = String(journalData.subjectArea).trim();
        }
        if (isValidValue(journalData.category)) {
            data.category = String(journalData.category).trim();
        }
        if (isValidValue(journalData.discipline)) {
            data.discipline = String(journalData.discipline).trim();
        }
        if (isValidValue(journalData.impactFactor)) {
            data.impactFactor = String(journalData.impactFactor).trim();
        }
        else if (isValidValue(journalData.journalImpactFactor)) {
            data.impactFactor = String(journalData.journalImpactFactor).trim();
        }
        if (isValidValue(journalData.coverImage)) {
            data.coverImage = String(journalData.coverImage).trim();
        }
        if (isValidValue(journalData.bannerImage)) {
            data.bannerImage = String(journalData.bannerImage).trim();
        }
        if (isValidValue(journalData.flyerImage)) {
            data.flyerImage = String(journalData.flyerImage).trim();
        }
        if (isValidValue(journalData.flyerPdf)) {
            data.flyerPdf = String(journalData.flyerPdf).trim();
        }
        if (isValidValue(journalData.googleIndexingImage)) {
            data.googleIndexingImage = String(journalData.googleIndexingImage).trim();
        }
        if (isValidValue(journalData.journalImpactFactor)) {
            data.journalImpactFactor = String(journalData.journalImpactFactor).trim();
        }
        if (isValidValue(journalData.articleProcessingCharge)) {
            data.articleProcessingCharge = String(journalData.articleProcessingCharge).trim();
        }
        if (isValidValue(journalData.icv)) {
            data.icv = String(journalData.icv).trim();
        }
        if (isValidValue(journalData.pubmedId)) {
            data.pubmedId = String(journalData.pubmedId).trim();
        }
        if (isValidValue(journalData.indexingAbstracting)) {
            data.indexingAbstracting = String(journalData.indexingAbstracting).trim();
        }
        if (isValidValue(journalData.email)) {
            data.email = String(journalData.email).trim();
        }
        if (isValidValue(journalData.classification)) {
            data.classification = String(journalData.classification).trim();
        }
        if (isValidValue(journalData.citationsValue)) {
            data.citationsValue = String(journalData.citationsValue).trim();
        }
        if (isValidValue(journalData.acceptanceRate)) {
            data.acceptanceRate = String(journalData.acceptanceRate).trim();
        }
        if (isValidValue(journalData.conferenceUrl)) {
            data.conferenceUrl = String(journalData.conferenceUrl).trim();
        }
        if (isValidValue(journalData.aimsScope)) {
            data.aimsScope = String(journalData.aimsScope).trim();
        }
        if (isValidValue(journalData.guidelines)) {
            data.guidelines = String(journalData.guidelines).trim();
        }
        if (isValidValue(journalData.editorialBoard)) {
            data.editorialBoard = String(journalData.editorialBoard).trim();
        }
        if (isValidValue(journalData.homePageContent)) {
            data.homePageContent = String(journalData.homePageContent).trim();
        }
        if (isValidValue(journalData.currentIssueContent)) {
            data.currentIssueContent = String(journalData.currentIssueContent).trim();
        }
        if (isValidValue(journalData.archiveContent)) {
            data.archiveContent = String(journalData.archiveContent).trim();
        }
        if (isValidValue(journalData.articlesInPress)) {
            data.articlesInPress = String(journalData.articlesInPress).trim();
        }
        if (isValidValue(journalData.indexing)) {
            data.indexing = String(journalData.indexing).trim();
        }
        else if (isValidValue(journalData.indexingAbstracting)) {
            data.indexing = String(journalData.indexingAbstracting).trim();
        }
        const created = await this.prisma.journal.create({
            data
        });
        console.log('🔵 createJournal - Created journal:', JSON.stringify(created, null, 2));
        if (journalData.shortcode) {
            try {
                await this.prisma.journalShortcode.updateMany({
                    where: { shortcode: journalData.shortcode },
                    data: { journalId: created.id }
                });
            }
            catch (e) {
                console.error('Error updating shortcode link:', e);
            }
        }
        return created;
    }
    async updateJournal(journalId, journalData) {
        const updateData = {};
        if (journalData.title !== undefined && journalData.title !== null) {
            updateData.title = journalData.title;
        }
        if (journalData.description !== undefined && journalData.description !== null) {
            updateData.description = journalData.description;
        }
        else if (journalData.title !== undefined && journalData.title !== null) {
            updateData.description = journalData.title;
        }
        if (journalData.issn !== undefined)
            updateData.issn = journalData.issn;
        if (journalData.shortcode !== undefined) {
            const currentJournal = await this.prisma.journal.findUnique({
                where: { id: journalId },
                select: { shortcode: true }
            });
            const newShortcode = journalData.shortcode?.trim() || null;
            const currentShortcode = currentJournal?.shortcode;
            if (newShortcode && newShortcode !== currentShortcode) {
                const uniqueShortcode = await this.generateUniqueShortcode(newShortcode);
                updateData.shortcode = uniqueShortcode;
                if (uniqueShortcode !== newShortcode) {
                    console.log(`🔄 Shortcode "${newShortcode}" already exists, using unique shortcode: ${uniqueShortcode}`);
                }
            }
            else if (newShortcode === currentShortcode) {
            }
            else {
                updateData.shortcode = newShortcode;
            }
        }
        if (journalData.publisher !== undefined)
            updateData.publisher = journalData.publisher;
        if (journalData.accessType !== undefined)
            updateData.accessType = journalData.accessType;
        if (journalData.subjectArea !== undefined)
            updateData.subjectArea = journalData.subjectArea;
        if (journalData.category !== undefined)
            updateData.category = journalData.category;
        if (journalData.discipline !== undefined)
            updateData.discipline = journalData.discipline;
        if (journalData.impactFactor !== undefined) {
            updateData.impactFactor = journalData.impactFactor;
        }
        else if (journalData.journalImpactFactor !== undefined) {
            updateData.impactFactor = journalData.journalImpactFactor;
        }
        if (journalData.coverImage !== undefined)
            updateData.coverImage = journalData.coverImage;
        if (journalData.bannerImage !== undefined)
            updateData.bannerImage = journalData.bannerImage;
        if (journalData.flyerImage !== undefined)
            updateData.flyerImage = journalData.flyerImage;
        if (journalData.flyerPdf !== undefined)
            updateData.flyerPdf = journalData.flyerPdf;
        if (journalData.googleIndexingImage !== undefined)
            updateData.googleIndexingImage = journalData.googleIndexingImage;
        if (journalData.journalImpactFactor !== undefined)
            updateData.journalImpactFactor = journalData.journalImpactFactor;
        if (journalData.articleProcessingCharge !== undefined)
            updateData.articleProcessingCharge = journalData.articleProcessingCharge;
        if (journalData.icv !== undefined)
            updateData.icv = journalData.icv;
        if (journalData.pubmedId !== undefined)
            updateData.pubmedId = journalData.pubmedId;
        if (journalData.indexingAbstracting !== undefined)
            updateData.indexingAbstracting = journalData.indexingAbstracting;
        if (journalData.email !== undefined)
            updateData.email = journalData.email;
        if (journalData.classification !== undefined)
            updateData.classification = journalData.classification;
        if (journalData.citationsValue !== undefined)
            updateData.citationsValue = journalData.citationsValue;
        if (journalData.acceptanceRate !== undefined)
            updateData.acceptanceRate = journalData.acceptanceRate;
        if (journalData.conferenceUrl !== undefined)
            updateData.conferenceUrl = journalData.conferenceUrl;
        if (journalData.editorName !== undefined)
            updateData.editorName = journalData.editorName;
        if (journalData.editorAffiliation !== undefined)
            updateData.editorAffiliation = journalData.editorAffiliation;
        if (journalData.editorImage !== undefined)
            updateData.editorImage = journalData.editorImage;
        if (journalData.impactFactorValue !== undefined)
            updateData.impactFactorValue = journalData.impactFactorValue;
        if (journalData.citationsPercentage !== undefined)
            updateData.citationsPercentage = journalData.citationsPercentage;
        if (journalData.acceptancePercentage !== undefined)
            updateData.acceptancePercentage = journalData.acceptancePercentage;
        if (journalData.googleAnalyticsTitle !== undefined)
            updateData.googleAnalyticsTitle = journalData.googleAnalyticsTitle;
        if (journalData.googleAnalyticsValue !== undefined)
            updateData.googleAnalyticsValue = journalData.googleAnalyticsValue;
        if (journalData.googleAnalyticsUrl !== undefined)
            updateData.googleAnalyticsUrl = journalData.googleAnalyticsUrl;
        if (journalData.articleFormats !== undefined)
            updateData.articleFormats = journalData.articleFormats;
        if (journalData.journalDescription !== undefined)
            updateData.journalDescription = journalData.journalDescription;
        if (journalData.pubmedArticles !== undefined)
            updateData.pubmedArticles = journalData.pubmedArticles;
        if (journalData.homePageContent !== undefined)
            updateData.homePageContent = journalData.homePageContent;
        if (journalData.aimsScope !== undefined)
            updateData.aimsScope = journalData.aimsScope;
        if (journalData.guidelines !== undefined)
            updateData.guidelines = journalData.guidelines;
        if (journalData.editorialBoard !== undefined)
            updateData.editorialBoard = journalData.editorialBoard;
        if (journalData.homePageContent !== undefined)
            updateData.homePageContent = journalData.homePageContent;
        if (journalData.currentIssueContent !== undefined)
            updateData.currentIssueContent = journalData.currentIssueContent;
        if (journalData.archiveContent !== undefined)
            updateData.archiveContent = journalData.archiveContent;
        if (journalData.articlesInPress !== undefined)
            updateData.articlesInPress = journalData.articlesInPress;
        if (journalData.indexing !== undefined)
            updateData.indexing = journalData.indexing;
        if (journalData.indexingAbstracting !== undefined && !journalData.indexing)
            updateData.indexing = journalData.indexingAbstracting;
        if (journalData.isVisibleOnSite !== undefined)
            updateData.isVisibleOnSite = !!journalData.isVisibleOnSite;
        if (Object.keys(updateData).length === 0) {
            return await this.prisma.journal.findUnique({
                where: { id: journalId }
            });
        }
        let updated;
        let retryCount = 0;
        const maxRetries = 3;
        while (retryCount < maxRetries) {
            try {
                updated = await this.prisma.journal.update({
                    where: { id: journalId },
                    data: updateData
                });
                break;
            }
            catch (error) {
                if (error?.code === 'P2002' && error?.meta?.target?.includes('shortcode')) {
                    retryCount++;
                    console.log(`🔄 Shortcode conflict during update (attempt ${retryCount}), generating unique shortcode...`);
                    const attemptedShortcode = updateData.shortcode || journalData.shortcode || 'journal';
                    const uniqueShortcode = await this.generateUniqueShortcode(attemptedShortcode);
                    updateData.shortcode = uniqueShortcode;
                    console.log(`✅ Retrying update with unique shortcode: ${uniqueShortcode}`);
                    if (retryCount >= maxRetries) {
                        throw new common_1.InternalServerErrorException('Failed to update journal after multiple retries due to shortcode conflicts');
                    }
                }
                else {
                    throw error;
                }
            }
        }
        if (!updated) {
            throw new common_1.InternalServerErrorException('Failed to update journal');
        }
        const shortcodeToLink = updated.shortcode || journalData.shortcode;
        if (shortcodeToLink) {
            try {
                await this.prisma.journalShortcode.updateMany({
                    where: { shortcode: shortcodeToLink },
                    data: { journalId: updated.id }
                });
                console.log(`Linked shortcode ${shortcodeToLink} to journal ID ${updated.id}`);
            }
            catch (e) {
                console.error('Error updating shortcode link:', e);
            }
        }
        return updated;
    }
    async deleteJournal(journalId) {
        await this.prisma.article.deleteMany({
            where: { journalId }
        });
        return await this.prisma.journal.delete({
            where: { id: journalId }
        });
    }
    calculateAverageReviewTime(articles) {
        const reviewedArticles = articles.filter(a => a.publishedAt && a.submittedAt);
        if (reviewedArticles.length === 0)
            return 0;
        const totalDays = reviewedArticles.reduce((sum, article) => {
            const days = (new Date(article.publishedAt).getTime() - new Date(article.submittedAt).getTime()) / (1000 * 60 * 60 * 24);
            return sum + days;
        }, 0);
        return Math.round(totalDays / reviewedArticles.length);
    }
    groupByMonth(articles) {
        const monthlyData = {};
        articles.forEach(article => {
            const month = new Date(article.submittedAt).toISOString().substring(0, 7);
            monthlyData[month] = (monthlyData[month] || 0) + 1;
        });
        return Object.entries(monthlyData)
            .map(([month, count]) => ({ month, count }))
            .sort((a, b) => a.month.localeCompare(b.month))
            .slice(-12);
    }
    groupByCategory(articles) {
        const categoryData = {};
        articles.forEach(article => {
            const category = article.journal?.category || 'Unknown';
            categoryData[category] = (categoryData[category] || 0) + 1;
        });
        return Object.entries(categoryData)
            .map(([category, count]) => ({ category, count }))
            .sort((a, b) => b.count - a.count);
    }
    async getUsers(search) {
        try {
            const where = {};
            if (search) {
                where.OR = [
                    { userName: { contains: search, mode: 'insensitive' } },
                    { journalName: { contains: search, mode: 'insensitive' } },
                    { journalShort: { contains: search, mode: 'insensitive' } }
                ];
            }
            return await this.prisma.user.findMany({
                where,
                orderBy: { createdAt: 'desc' }
            });
        }
        catch (error) {
            throw new common_1.InternalServerErrorException('Failed to fetch users');
        }
    }
    async getUser(id) {
        try {
            return await this.prisma.user.findUnique({ where: { id } });
        }
        catch (error) {
            throw new common_1.InternalServerErrorException('Failed to fetch user');
        }
    }
    async generateUniqueShortcode(baseShortcode) {
        let shortcode = baseShortcode;
        let attempts = 0;
        const maxAttempts = 1000;
        while (attempts < maxAttempts) {
            const existingShortcode = await this.prisma.journalShortcode.findUnique({
                where: { shortcode }
            });
            const existingJournal = await this.prisma.journal.findUnique({
                where: { shortcode }
            });
            if (!existingShortcode && !existingJournal) {
                return shortcode;
            }
            const randomSuffix = Math.random().toString(36).substring(2, 8).toLowerCase();
            shortcode = `${baseShortcode}_${randomSuffix}`;
            attempts++;
        }
        const timestamp = Date.now().toString(36);
        return `${baseShortcode}_${timestamp}`;
    }
    async createUser(userData) {
        try {
            const { firstName, lastName, managingJournalName, journalDomainName, journalUrl, journalId, ...validData } = userData;
            if (!validData.userName || !validData.userName.trim()) {
                throw new common_1.BadRequestException('Username is required');
            }
            const existingUser = await this.prisma.user.findUnique({
                where: { userName: validData.userName.trim() }
            });
            if (existingUser) {
                throw new common_1.ConflictException('Username already exists');
            }
            const journalName = (validData.journalName || validData.managingJournalName || '').trim();
            let originalShortcode = (validData.journalShort || validData.managingJournalName || validData.userName || '').trim();
            if (!originalShortcode) {
                originalShortcode = (journalName || validData.userName || 'journal').toLowerCase()
                    .replace(/[^a-z0-9]/g, '')
                    .substring(0, 20) || 'journal';
            }
            let createdJournalId = null;
            if (journalName) {
                const existingJournal = await this.prisma.journal.findFirst({
                    where: {
                        title: {
                            equals: journalName.trim(),
                            mode: 'insensitive'
                        }
                    },
                    orderBy: {
                        updatedAt: 'desc'
                    }
                });
                if (existingJournal) {
                    createdJournalId = existingJournal.id;
                    console.log(`✅ Found existing journal "${journalName}" (ID: ${existingJournal.id}), reusing instead of creating duplicate`);
                }
                else {
                    const uniqueJournalShortcode = await this.generateUniqueShortcode(originalShortcode);
                    const journalData = {
                        title: journalName,
                        description: journalName,
                        shortcode: uniqueJournalShortcode
                    };
                    if (validData.category)
                        journalData.category = validData.category;
                    if (validData.publisher)
                        journalData.publisher = validData.publisher;
                    if (validData.subjectArea)
                        journalData.subjectArea = validData.subjectArea;
                    if (validData.discipline)
                        journalData.discipline = validData.discipline;
                    if (validData.accessType)
                        journalData.accessType = validData.accessType;
                    if (validData.impactFactor)
                        journalData.impactFactor = validData.impactFactor;
                    if (validData.issn)
                        journalData.issn = validData.issn;
                    if (validData.coverImage)
                        journalData.coverImage = validData.coverImage;
                    if (validData.bannerImage)
                        journalData.bannerImage = validData.bannerImage;
                    if (validData.flyerImage)
                        journalData.flyerImage = validData.flyerImage;
                    console.log(`📝 Creating new journal with data:`, {
                        title: journalData.title,
                        shortcode: journalData.shortcode,
                        category: journalData.category || '(not set)',
                        publisher: journalData.publisher || '(not set)',
                        issn: journalData.issn || '(not set)',
                        hasImages: !!(journalData.coverImage || journalData.bannerImage || journalData.flyerImage)
                    });
                    let newJournal;
                    let retryCount = 0;
                    const maxRetries = 5;
                    while (retryCount < maxRetries) {
                        try {
                            newJournal = await this.prisma.journal.create({
                                data: journalData
                            });
                            break;
                        }
                        catch (error) {
                            if (error?.code === 'P2002' && error?.meta?.target?.includes('shortcode')) {
                                retryCount++;
                                const newUniqueShortcode = await this.generateUniqueShortcode(originalShortcode);
                                journalData.shortcode = newUniqueShortcode;
                                console.log(`🔄 Shortcode conflict detected, retrying with new shortcode: ${newUniqueShortcode}`);
                            }
                            else {
                                throw error;
                            }
                        }
                    }
                    if (!newJournal) {
                        throw new common_1.InternalServerErrorException('Failed to create journal after multiple retries');
                    }
                    createdJournalId = newJournal.id;
                    console.log(`✅ Created new journal "${journalName}" (ID: ${newJournal.id}, shortcode: ${newJournal.shortcode})`);
                }
                if (createdJournalId) {
                    try {
                        const shortcodeEntry = await this.prisma.journalShortcode.upsert({
                            where: { shortcode: originalShortcode.trim() },
                            update: {
                                journalId: createdJournalId,
                                journalName: journalName
                            },
                            create: {
                                shortcode: originalShortcode.trim(),
                                journalName: journalName,
                                journalId: createdJournalId
                            }
                        });
                        console.log(`✅ JournalShortcode entry ensured: "${originalShortcode}" -> Journal ID ${createdJournalId}`);
                        const verifyEntry = await this.prisma.journalShortcode.findUnique({
                            where: { shortcode: originalShortcode.trim() }
                        });
                        if (verifyEntry && verifyEntry.journalId !== createdJournalId) {
                            console.error(`❌ CRITICAL ERROR: JournalShortcode entry was NOT updated correctly!`);
                            console.error(`   Expected journalId: ${createdJournalId}, Got: ${verifyEntry.journalId}`);
                            await this.prisma.journalShortcode.update({
                                where: { shortcode: originalShortcode.trim() },
                                data: { journalId: createdJournalId, journalName: journalName }
                            });
                            console.log(`   Forced update completed`);
                        }
                        else {
                            console.log(`✅ Verification passed: JournalShortcode correctly points to Journal ID ${createdJournalId}`);
                        }
                    }
                    catch (shortcodeError) {
                        console.error('❌ CRITICAL ERROR creating/updating journal shortcode entry:', shortcodeError);
                        console.error('   This means the user will not be able to access their journal!');
                        try {
                            await this.prisma.journalShortcode.updateMany({
                                where: { shortcode: originalShortcode.trim() },
                                data: { journalId: createdJournalId, journalName: journalName }
                            });
                            console.log(`   Recovery attempt: Updated using updateMany`);
                        }
                        catch (recoveryError) {
                            console.error('   Recovery attempt also failed:', recoveryError);
                            throw new common_1.InternalServerErrorException(`Journal (ID: ${createdJournalId}) exists but failed to link shortcode "${originalShortcode}". ` +
                                `Error: ${shortcodeError.message}`);
                        }
                    }
                }
            }
            let userCreateData = {
                userName: validData.userName.trim(),
                password: validData.password || null,
                journalShort: originalShortcode.trim(),
                journalName: journalName,
                category: validData.category || null,
                isActive: validData.isActive !== undefined ? validData.isActive : true,
            };
            try {
                return await this.prisma.user.create({ data: userCreateData });
            }
            catch (userError) {
                if (userError?.code === 'P2002') {
                    const target = userError?.meta?.target;
                    if (target && Array.isArray(target) && target.includes('userName')) {
                        throw new common_1.ConflictException('Username already exists');
                    }
                    else if (target && Array.isArray(target) && target.includes('shortcode')) {
                        console.error('Unexpected shortcode conflict during user creation:', userError);
                        const currentShortcode = userCreateData.journalShort || 'user';
                        const newShortcode = await this.generateUniqueShortcode(currentShortcode);
                        userCreateData = {
                            ...userCreateData,
                            journalShort: newShortcode
                        };
                        return await this.prisma.user.create({ data: userCreateData });
                    }
                    else {
                        throw new common_1.ConflictException('A unique constraint violation occurred');
                    }
                }
                throw userError;
            }
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException || error instanceof common_1.ConflictException || error instanceof common_1.InternalServerErrorException) {
                throw error;
            }
            throw new common_1.BadRequestException(error?.message || 'Failed to create user');
        }
    }
    async updateUser(id, userData) {
        try {
            const { firstName, lastName, managingJournalName, journalDomainName, journalUrl, journalId, ...validData } = userData;
            const userUpdateData = {};
            if (validData.userName !== undefined)
                userUpdateData.userName = validData.userName;
            if (validData.password !== undefined && String(validData.password).trim()) {
                userUpdateData.password = String(validData.password).trim();
            }
            if (validData.journalShort !== undefined)
                userUpdateData.journalShort = validData.journalShort;
            if (validData.journalName !== undefined)
                userUpdateData.journalName = validData.journalName;
            if (validData.managingJournalName !== undefined) {
                userUpdateData.journalName = validData.managingJournalName;
                userUpdateData.journalShort = validData.managingJournalName;
            }
            if (validData.category !== undefined)
                userUpdateData.category = validData.category;
            if (validData.isActive !== undefined)
                userUpdateData.isActive = validData.isActive;
            return await this.prisma.user.update({
                where: { id },
                data: userUpdateData
            });
        }
        catch (error) {
            if (error?.code === 'P2002') {
                throw new common_1.ConflictException('Username already exists');
            }
            throw new common_1.BadRequestException(error?.message || 'Failed to update user');
        }
    }
    async deleteUser(id) {
        try {
            return await this.prisma.user.delete({ where: { id } });
        }
        catch (error) {
            throw new common_1.BadRequestException('Failed to delete user');
        }
    }
    async toggleJournalVisibility(journalId) {
        const journal = await this.prisma.journal.findUnique({ where: { id: journalId } });
        if (!journal) {
            throw new common_1.BadRequestException('Journal not found');
        }
        const current = journal.isVisibleOnSite !== false;
        return this.prisma.journal.update({
            where: { id: journalId },
            data: { isVisibleOnSite: !current },
        });
    }
    async toggleUserStatus(id) {
        try {
            const user = await this.prisma.user.findUnique({ where: { id } });
            if (!user) {
                throw new common_1.BadRequestException('User not found');
            }
            return await this.prisma.user.update({
                where: { id },
                data: { isActive: !user.isActive }
            });
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException)
                throw error;
            throw new common_1.BadRequestException('Failed to toggle user status');
        }
    }
    async getSubmissions(search) {
        const where = {};
        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { submitterName: { contains: search, mode: 'insensitive' } },
                { submitterEmail: { contains: search, mode: 'insensitive' } },
                { journal: { title: { contains: search, mode: 'insensitive' } } }
            ];
        }
        return await this.prisma.article.findMany({
            where,
            include: {
                journal: { select: { id: true, title: true } },
                authors: true
            },
            orderBy: { submittedAt: 'desc' }
        });
    }
    async getSubmission(id) {
        return await this.prisma.article.findUnique({
            where: { id },
            include: {
                journal: true,
                authors: true
            }
        });
    }
    async getJournalShortcodes() {
        return await this.prisma.journalShortcode.findMany({
            orderBy: { createdAt: 'desc' }
        });
    }
    async createJournalShortcode(journalName, shortcode) {
        const existing = await this.prisma.journalShortcode.findUnique({
            where: { shortcode }
        });
        if (existing) {
            throw new common_1.ConflictException('Shortcode already exists');
        }
        const existingJournalByShortcode = await this.prisma.journal.findUnique({
            where: { shortcode }
        });
        if (existingJournalByShortcode) {
            const journalShortcode = await this.prisma.journalShortcode.create({
                data: {
                    shortcode,
                    journalName,
                    journalId: existingJournalByShortcode.id
                }
            });
            return journalShortcode;
        }
        const uniqueShortcode = await this.generateUniqueShortcode(shortcode);
        const newJournal = await this.prisma.journal.create({
            data: {
                title: journalName,
                description: journalName,
                shortcode: uniqueShortcode
            }
        });
        const journalShortcode = await this.prisma.journalShortcode.create({
            data: {
                shortcode: shortcode,
                journalName,
                journalId: newJournal.id
            }
        });
        return journalShortcode;
    }
    async deleteJournalShortcode(id) {
        return await this.prisma.journalShortcode.delete({ where: { id } });
    }
    async getNotifications(unreadOnly = false) {
        const where = {};
        if (unreadOnly) {
            where.isRead = false;
        }
        return await this.prisma.notification.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: 20
        });
    }
    async markNotificationAsRead(id) {
        return await this.prisma.notification.update({
            where: { id },
            data: { isRead: true }
        });
    }
    async markAllNotificationsAsRead() {
        return await this.prisma.notification.updateMany({
            where: { isRead: false },
            data: { isRead: true }
        });
    }
    async globalSearch(query) {
        const [users, articles, journals, webPages] = await Promise.all([
            this.prisma.user.findMany({
                where: {
                    OR: [
                        { userName: { contains: query, mode: 'insensitive' } },
                        { journalName: { contains: query, mode: 'insensitive' } }
                    ]
                },
                take: 5
            }),
            this.prisma.article.findMany({
                where: {
                    OR: [
                        { title: { contains: query, mode: 'insensitive' } },
                        { abstract: { contains: query, mode: 'insensitive' } }
                    ]
                },
                take: 5,
                include: { journal: { select: { title: true } } }
            }),
            this.prisma.journal.findMany({
                where: {
                    OR: [
                        { title: { contains: query, mode: 'insensitive' } },
                        { description: { contains: query, mode: 'insensitive' } }
                    ]
                },
                take: 5
            }),
            this.prisma.webPage.findMany({
                where: {
                    OR: [
                        { pageName: { contains: query, mode: 'insensitive' } },
                        { pageDescription: { contains: query, mode: 'insensitive' } }
                    ]
                },
                take: 5
            })
        ]);
        return {
            users,
            articles,
            journals,
            webPages
        };
    }
    async getBoardMembers(journalId) {
        const where = { isActive: true };
        if (journalId) {
            where.journalId = journalId;
        }
        return await this.prisma.boardMember.findMany({
            where,
            orderBy: [
                { memberType: 'asc' },
                { name: 'asc' }
            ]
        });
    }
    async getBoardMember(id) {
        return await this.prisma.boardMember.findUnique({ where: { id } });
    }
    async createBoardMember(journalId, memberData) {
        return await this.prisma.boardMember.create({
            data: {
                name: memberData.name || memberData.editorName,
                position: memberData.position || memberData.memberType || 'Editorial Board Member',
                memberType: memberData.memberType,
                editorType: memberData.editorType,
                affiliation: memberData.affiliation,
                email: memberData.email,
                bio: memberData.bio,
                description: memberData.description || memberData.editorDescription,
                biography: memberData.biography || memberData.editorBiography,
                imageUrl: memberData.imageUrl || memberData.editorPhoto,
                profileUrl: memberData.profileUrl,
                journalId: journalId,
                isActive: true
            }
        });
    }
    async updateBoardMember(id, memberData) {
        const updateData = {};
        if (memberData.name !== undefined)
            updateData.name = memberData.name;
        if (memberData.editorName !== undefined)
            updateData.name = memberData.editorName;
        if (memberData.position !== undefined)
            updateData.position = memberData.position;
        if (memberData.memberType !== undefined)
            updateData.memberType = memberData.memberType;
        if (memberData.editorType !== undefined)
            updateData.editorType = memberData.editorType;
        if (memberData.affiliation !== undefined)
            updateData.affiliation = memberData.affiliation;
        if (memberData.email !== undefined)
            updateData.email = memberData.email;
        if (memberData.bio !== undefined)
            updateData.bio = memberData.bio;
        if (memberData.description !== undefined)
            updateData.description = memberData.description;
        if (memberData.editorDescription !== undefined)
            updateData.description = memberData.editorDescription;
        if (memberData.biography !== undefined)
            updateData.biography = memberData.biography;
        if (memberData.editorBiography !== undefined)
            updateData.biography = memberData.editorBiography;
        if (memberData.imageUrl !== undefined)
            updateData.imageUrl = memberData.imageUrl;
        if (memberData.editorPhoto !== undefined)
            updateData.imageUrl = memberData.editorPhoto;
        if (memberData.profileUrl !== undefined)
            updateData.profileUrl = memberData.profileUrl;
        if (memberData.isActive !== undefined)
            updateData.isActive = memberData.isActive;
        return await this.prisma.boardMember.update({
            where: { id },
            data: updateData
        });
    }
    async deleteBoardMember(id) {
        return await this.prisma.boardMember.delete({ where: { id } });
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AdminService);
//# sourceMappingURL=admin.service.js.map