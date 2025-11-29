import { Injectable, BadRequestException, ConflictException, InternalServerErrorException, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async login(username: string, password: string) {
    // Allow login by username or by journal shortcode (for journal-admin)
    let user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { userName: username },
          { journalShort: username }
        ]
      }
    });

    // Bootstrap default admin using upsert to avoid unique conflicts
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
      } catch (e) {
        // If seeding fails (e.g., missing column), fall back to standard 401 instead of 500
        user = null as any;
      }
    } else if (user && user.userName === 'admin' && (!user.password || user.password.trim() === '')) {
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: { password: 'Bharath@321', isActive: true }
      });
    }

    if (!user) {
      throw new UnauthorizedException('Invalid username or password');
    }

    if (!user.isActive) {
      throw new ForbiddenException('User account is inactive');
    }

    if (!user.password || user.password !== password) {
      throw new UnauthorizedException('Invalid username or password');
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

  // TEMPORARY DEBUG - will be removed after diagnosis
  async debugLoginCheck() {
    try {
      // Check if password column exists
      const colCheck: Array<{ exists: boolean }> =
        await this.prisma.$queryRawUnsafe(
          `SELECT EXISTS (
             SELECT 1 FROM information_schema.columns 
             WHERE table_name = 'User' OR table_name = 'user'
               AND column_name = 'password'
           ) AS exists`
        );
      const passwordColumnExists = Array.isArray(colCheck) && colCheck[0]?.exists === true;

      // Fetch admin row if present
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
    } catch (e: any) {
      return {
        ok: false,
        message: e?.message || 'debug failed'
      };
    }
  }

  async getDashboardStats() {
    const [
      totalUsers,
      totalSubmissions,
      totalShortcodes,
      pendingFulltexts,
      totalWebPages,
      totalBoardMembers
    ] = await Promise.all([
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
    // Mock search analytics - in real app, you'd track search queries
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

  async updateArticleStatus(articleId: number, status: string, comments?: string) {
    const updateData: any = { status };
    
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

  async createJournal(journalData: any) {
    const created = await this.prisma.journal.create({
      data: {
        title: journalData.title,
        description: journalData.description || journalData.title,
        issn: journalData.issn,
        shortcode: journalData.shortcode,
        publisher: journalData.publisher,
        accessType: journalData.accessType,
        subjectArea: journalData.subjectArea,
        category: journalData.category,
        discipline: journalData.discipline,
        impactFactor: journalData.impactFactor || journalData.journalImpactFactor,
        coverImage: journalData.coverImage,
        bannerImage: journalData.bannerImage,
        flyerImage: journalData.flyerImage,
        flyerPdf: journalData.flyerPdf,
        googleIndexingImage: journalData.googleIndexingImage,
        journalImpactFactor: journalData.journalImpactFactor,
        articleProcessingCharge: journalData.articleProcessingCharge,
        icv: journalData.icv,
        pubmedId: journalData.pubmedId,
        indexingAbstracting: journalData.indexingAbstracting,
        email: journalData.email,
        classification: journalData.classification,
        citationsValue: journalData.citationsValue,
        acceptanceRate: journalData.acceptanceRate,
        conferenceUrl: journalData.conferenceUrl,
        aimsScope: journalData.aimsScope,
        guidelines: journalData.guidelines,
        editorialBoard: journalData.editorialBoard,
        homePageContent: journalData.homePageContent,
        currentIssueContent: journalData.currentIssueContent,
        archiveContent: journalData.archiveContent,
        articlesInPress: journalData.articlesInPress,
        indexing: journalData.indexing || journalData.indexingAbstracting
      }
    });
    
    // Update JournalShortcode to link to the created journal
    if (journalData.shortcode) {
      try {
        await this.prisma.journalShortcode.updateMany({
          where: { shortcode: journalData.shortcode },
          data: { journalId: created.id }
        });
      } catch (e) {
        console.error('Error updating shortcode link:', e);
      }
    }
    
    return created;
  }

  async updateJournal(journalId: number, journalData: any) {
    const updateData: any = {
      title: journalData.title,
      description: journalData.description || journalData.title,
      issn: journalData.issn,
      shortcode: journalData.shortcode,
      publisher: journalData.publisher,
      accessType: journalData.accessType,
      subjectArea: journalData.subjectArea,
      category: journalData.category,
      discipline: journalData.discipline,
      impactFactor: journalData.impactFactor || journalData.journalImpactFactor,
      coverImage: journalData.coverImage
    };

    // Add image fields if provided
    if (journalData.bannerImage !== undefined) updateData.bannerImage = journalData.bannerImage;
    if (journalData.flyerImage !== undefined) updateData.flyerImage = journalData.flyerImage;
    if (journalData.flyerPdf !== undefined) updateData.flyerPdf = journalData.flyerPdf;
    if (journalData.googleIndexingImage !== undefined) updateData.googleIndexingImage = journalData.googleIndexingImage;

    // Add additional journal information fields if provided
    if (journalData.journalImpactFactor !== undefined) updateData.journalImpactFactor = journalData.journalImpactFactor;
    if (journalData.articleProcessingCharge !== undefined) updateData.articleProcessingCharge = journalData.articleProcessingCharge;
    if (journalData.icv !== undefined) updateData.icv = journalData.icv;
    if (journalData.pubmedId !== undefined) updateData.pubmedId = journalData.pubmedId;
    if (journalData.indexingAbstracting !== undefined) updateData.indexingAbstracting = journalData.indexingAbstracting;
    if (journalData.email !== undefined) updateData.email = journalData.email;
    if (journalData.classification !== undefined) updateData.classification = journalData.classification;
    if (journalData.citationsValue !== undefined) updateData.citationsValue = journalData.citationsValue;
    if (journalData.acceptanceRate !== undefined) updateData.acceptanceRate = journalData.acceptanceRate;
    if (journalData.conferenceUrl !== undefined) updateData.conferenceUrl = journalData.conferenceUrl;

    // Add homepage specific fields if provided
    if (journalData.editorName !== undefined) updateData.editorName = journalData.editorName;
    if (journalData.editorAffiliation !== undefined) updateData.editorAffiliation = journalData.editorAffiliation;
    if (journalData.editorImage !== undefined) updateData.editorImage = journalData.editorImage;
    if (journalData.impactFactorValue !== undefined) updateData.impactFactorValue = journalData.impactFactorValue;
    if (journalData.citationsPercentage !== undefined) updateData.citationsPercentage = journalData.citationsPercentage;
    if (journalData.acceptancePercentage !== undefined) updateData.acceptancePercentage = journalData.acceptancePercentage;
    if (journalData.googleAnalyticsTitle !== undefined) updateData.googleAnalyticsTitle = journalData.googleAnalyticsTitle;
    if (journalData.googleAnalyticsValue !== undefined) updateData.googleAnalyticsValue = journalData.googleAnalyticsValue;
    if (journalData.googleAnalyticsUrl !== undefined) updateData.googleAnalyticsUrl = journalData.googleAnalyticsUrl;
    if (journalData.articleFormats !== undefined) updateData.articleFormats = journalData.articleFormats;
    if (journalData.journalDescription !== undefined) updateData.journalDescription = journalData.journalDescription;
    if (journalData.pubmedArticles !== undefined) updateData.pubmedArticles = journalData.pubmedArticles;
    if (journalData.homePageContent !== undefined) updateData.homePageContent = journalData.homePageContent;

    // Add content fields if provided
    if (journalData.aimsScope !== undefined) updateData.aimsScope = journalData.aimsScope;
    if (journalData.guidelines !== undefined) updateData.guidelines = journalData.guidelines;
    if (journalData.editorialBoard !== undefined) updateData.editorialBoard = journalData.editorialBoard;
    if (journalData.homePageContent !== undefined) updateData.homePageContent = journalData.homePageContent;
    if (journalData.currentIssueContent !== undefined) updateData.currentIssueContent = journalData.currentIssueContent;
    if (journalData.archiveContent !== undefined) updateData.archiveContent = journalData.archiveContent;
    if (journalData.articlesInPress !== undefined) updateData.articlesInPress = journalData.articlesInPress;
    if (journalData.indexing !== undefined) updateData.indexing = journalData.indexing;
    if (journalData.indexingAbstracting !== undefined && !journalData.indexing) updateData.indexing = journalData.indexingAbstracting;

    const updated = await this.prisma.journal.update({
      where: { id: journalId },
      data: updateData
    });
    
    // Update JournalShortcode to link to the journal if shortcode is provided
    if (journalData.shortcode) {
      try {
        await this.prisma.journalShortcode.updateMany({
          where: { shortcode: journalData.shortcode },
          data: { journalId: updated.id }
        });
      } catch (e) {
        console.error('Error updating shortcode link:', e);
      }
    }
    
    return updated;
  }

  async deleteJournal(journalId: number) {
    // First delete all articles in this journal
    await this.prisma.article.deleteMany({
      where: { journalId }
    });

    // Then delete the journal
    return await this.prisma.journal.delete({
      where: { id: journalId }
    });
  }

  private calculateAverageReviewTime(articles: any[]) {
    const reviewedArticles = articles.filter(a => a.publishedAt && a.submittedAt);
    if (reviewedArticles.length === 0) return 0;

    const totalDays = reviewedArticles.reduce((sum, article) => {
      const days = (new Date(article.publishedAt).getTime() - new Date(article.submittedAt).getTime()) / (1000 * 60 * 60 * 24);
      return sum + days;
    }, 0);

    return Math.round(totalDays / reviewedArticles.length);
  }

  private groupByMonth(articles: any[]) {
    const monthlyData: { [key: string]: number } = {};
    
    articles.forEach(article => {
      const month = new Date(article.submittedAt).toISOString().substring(0, 7); // YYYY-MM
      monthlyData[month] = (monthlyData[month] || 0) + 1;
    });

    return Object.entries(monthlyData)
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-12); // Last 12 months
  }

  private groupByCategory(articles: any[]) {
    const categoryData: { [key: string]: number } = {};
    
    articles.forEach(article => {
      const category = article.journal?.category || 'Unknown';
      categoryData[category] = (categoryData[category] || 0) + 1;
    });

    return Object.entries(categoryData)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);
  }

  // Users CRUD
  async getUsers(search?: string) {
    try {
      const where: any = {};
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
    } catch (error: any) {
      throw new InternalServerErrorException('Failed to fetch users');
    }
  }

  async getUser(id: number) {
    try {
      return await this.prisma.user.findUnique({ where: { id } });
    } catch (error: any) {
      throw new InternalServerErrorException('Failed to fetch user');
    }
  }

  async createUser(userData: any) {
    try {
      const { firstName, lastName, managingJournalName, journalDomainName, journalUrl, journalId, ...validData } = userData;
      if (!validData.userName || !validData.userName.trim()) {
        throw new BadRequestException('Username is required');
      }

      const existingUser = await this.prisma.user.findUnique({
        where: { userName: validData.userName.trim() }
      });

      if (existingUser) {
        throw new ConflictException('Username already exists');
      }

      const userCreateData: any = {
        userName: validData.userName.trim(),
        password: validData.password || null, // Store password if provided
        journalShort: validData.journalShort || validData.managingJournalName || null,
        journalName: validData.journalName || validData.managingJournalName || null,
        category: validData.category || null,
        isActive: validData.isActive !== undefined ? validData.isActive : true,
      };

      return await this.prisma.user.create({ data: userCreateData });
    } catch (error: any) {
      if (error?.code === 'P2002') {
        throw new ConflictException('Username already exists');
      }
      if (error instanceof BadRequestException || error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException(error?.message || 'Failed to create user');
    }
  }

  async updateUser(id: number, userData: any) {
    try {
      const { firstName, lastName, managingJournalName, journalDomainName, journalUrl, journalId, ...validData } = userData;
      const userUpdateData: any = {};
      
      if (validData.userName !== undefined) userUpdateData.userName = validData.userName;
      if (validData.password !== undefined && String(validData.password).trim()) {
        userUpdateData.password = String(validData.password).trim();
      }
      if (validData.journalShort !== undefined) userUpdateData.journalShort = validData.journalShort;
      if (validData.journalName !== undefined) userUpdateData.journalName = validData.journalName;
      if (validData.managingJournalName !== undefined) {
        userUpdateData.journalName = validData.managingJournalName;
        userUpdateData.journalShort = validData.managingJournalName;
      }
      if (validData.category !== undefined) userUpdateData.category = validData.category;
      if (validData.isActive !== undefined) userUpdateData.isActive = validData.isActive;

      return await this.prisma.user.update({
        where: { id },
        data: userUpdateData
      });
    } catch (error: any) {
      if (error?.code === 'P2002') {
        throw new ConflictException('Username already exists');
      }
      throw new BadRequestException(error?.message || 'Failed to update user');
    }
  }

  async deleteUser(id: number) {
    try {
      return await this.prisma.user.delete({ where: { id } });
    } catch (error: any) {
      throw new BadRequestException('Failed to delete user');
    }
  }

  async toggleUserStatus(id: number) {
    try {
      const user = await this.prisma.user.findUnique({ where: { id } });
      if (!user) {
        throw new BadRequestException('User not found');
      }
      return await this.prisma.user.update({
        where: { id },
        data: { isActive: !user.isActive }
      });
    } catch (error: any) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException('Failed to toggle user status');
    }
  }

  // Submissions (Articles)
  async getSubmissions(search?: string) {
    const where: any = {};
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

  async getSubmission(id: number) {
    return await this.prisma.article.findUnique({
      where: { id },
      include: {
        journal: true,
        authors: true
      }
    });
  }

  // Journal Shortcodes
  async getJournalShortcodes() {
    return await this.prisma.journalShortcode.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }

  async createJournalShortcode(journalName: string, shortcode: string) {
    // Check if shortcode already exists
    const existing = await this.prisma.journalShortcode.findUnique({
      where: { shortcode }
    });
    if (existing) {
      throw new Error('Shortcode already exists');
    }

    // Try to find matching journal
    const journal = await this.prisma.journal.findFirst({
      where: { title: { contains: journalName, mode: 'insensitive' } }
    });

    // Create the shortcode
    const journalShortcode = await this.prisma.journalShortcode.create({
      data: {
        shortcode,
        journalName,
        journalId: journal?.id
      }
    });

    // If journal was found, update it with the shortcode
    if (journal && !journal.shortcode) {
      await this.prisma.journal.update({
        where: { id: journal.id },
        data: { shortcode }
      });
    }

    return journalShortcode;
  }

  async deleteJournalShortcode(id: number) {
    return await this.prisma.journalShortcode.delete({ where: { id } });
  }

  // Notifications
  async getNotifications(unreadOnly: boolean = false) {
    const where: any = {};
    if (unreadOnly) {
      where.isRead = false;
    }
    return await this.prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 20
    });
  }

  async markNotificationAsRead(id: number) {
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

  // Global Search
  async globalSearch(query: string) {
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

  // Board Members
  async getBoardMembers(journalId?: number) {
    const where: any = { isActive: true };
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

  async getBoardMember(id: number) {
    return await this.prisma.boardMember.findUnique({ where: { id } });
  }

  async createBoardMember(journalId: number, memberData: any) {
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

  async updateBoardMember(id: number, memberData: any) {
    const updateData: any = {};
    if (memberData.name !== undefined) updateData.name = memberData.name;
    if (memberData.editorName !== undefined) updateData.name = memberData.editorName;
    if (memberData.position !== undefined) updateData.position = memberData.position;
    if (memberData.memberType !== undefined) updateData.memberType = memberData.memberType;
    if (memberData.editorType !== undefined) updateData.editorType = memberData.editorType;
    if (memberData.affiliation !== undefined) updateData.affiliation = memberData.affiliation;
    if (memberData.email !== undefined) updateData.email = memberData.email;
    if (memberData.bio !== undefined) updateData.bio = memberData.bio;
    if (memberData.description !== undefined) updateData.description = memberData.description;
    if (memberData.editorDescription !== undefined) updateData.description = memberData.editorDescription;
    if (memberData.biography !== undefined) updateData.biography = memberData.biography;
    if (memberData.editorBiography !== undefined) updateData.biography = memberData.editorBiography;
    if (memberData.imageUrl !== undefined) updateData.imageUrl = memberData.imageUrl;
    if (memberData.editorPhoto !== undefined) updateData.imageUrl = memberData.editorPhoto;
    if (memberData.profileUrl !== undefined) updateData.profileUrl = memberData.profileUrl;
    if (memberData.isActive !== undefined) updateData.isActive = memberData.isActive;

    return await this.prisma.boardMember.update({
      where: { id },
      data: updateData
    });
  }

  async deleteBoardMember(id: number) {
    return await this.prisma.boardMember.delete({ where: { id } });
  }
}
