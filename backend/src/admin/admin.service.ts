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
    // Log incoming data for debugging
    console.log('🔵 createJournal - Received data:', JSON.stringify(journalData, null, 2));
    
    // Build data object, only including fields that have actual values
    // Title and description are required, so ensure they have values
    const title = journalData.title ? String(journalData.title).trim() : '';
    const description = journalData.description ? String(journalData.description).trim() : '';
    
    if (!title) {
      throw new BadRequestException('Title is required and cannot be empty');
    }
    
    const data: any = {
      title: title,
      description: description || title, // Use title as description if description is not provided
    };
    
    console.log('🔵 createJournal - Prepared data:', JSON.stringify(data, null, 2));

    // Helper function to check if a value is valid (not null, not undefined, not empty string)
    const isValidValue = (value: any): boolean => {
      return value !== undefined && value !== null && String(value).trim() !== '';
    };

    // Only add optional fields if they are provided and not empty
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
    } else if (isValidValue(journalData.journalImpactFactor)) {
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
    } else if (isValidValue(journalData.indexingAbstracting)) {
      data.indexing = String(journalData.indexingAbstracting).trim();
    }

    const created = await this.prisma.journal.create({
      data
    });
    
    console.log('🔵 createJournal - Created journal:', JSON.stringify(created, null, 2));
    
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
    
    // Return the created journal with all fields
    return created;
  }

  async updateJournal(journalId: number, journalData: any) {
    const updateData: any = {};
    
    // Only update fields that are explicitly provided (not undefined/null)
    // This allows partial updates for journal-admin content management
    // This prevents overwriting existing required fields with undefined values
    if (journalData.title !== undefined && journalData.title !== null) {
      updateData.title = journalData.title;
    }
    if (journalData.description !== undefined && journalData.description !== null) {
      updateData.description = journalData.description;
    } else if (journalData.title !== undefined && journalData.title !== null) {
      // If title is provided but description is not, use title as fallback
      updateData.description = journalData.title;
    }
    if (journalData.issn !== undefined) updateData.issn = journalData.issn;
    
    // Handle shortcode update - always generate unique shortcode if provided
    if (journalData.shortcode !== undefined) {
      // Get current journal to check if shortcode is actually changing
      const currentJournal = await this.prisma.journal.findUnique({
        where: { id: journalId },
        select: { shortcode: true }
      });
      
      const newShortcode = journalData.shortcode?.trim() || null;
      const currentShortcode = currentJournal?.shortcode;
      
      // Only process if shortcode is actually changing
      if (newShortcode && newShortcode !== currentShortcode) {
        // Always generate a unique shortcode to prevent conflicts
        // This handles race conditions and ensures uniqueness
        const uniqueShortcode = await this.generateUniqueShortcode(newShortcode);
        updateData.shortcode = uniqueShortcode;
        
        // Log if shortcode was modified
        if (uniqueShortcode !== newShortcode) {
          console.log(`🔄 Shortcode "${newShortcode}" already exists, using unique shortcode: ${uniqueShortcode}`);
        }
      } else if (newShortcode === currentShortcode) {
        // Shortcode is not changing, don't include it in updateData to avoid unnecessary update
      } else {
        // newShortcode is null/empty, allow clearing it
        updateData.shortcode = newShortcode;
      }
    }
    
    if (journalData.publisher !== undefined) updateData.publisher = journalData.publisher;
    if (journalData.accessType !== undefined) updateData.accessType = journalData.accessType;
    if (journalData.subjectArea !== undefined) updateData.subjectArea = journalData.subjectArea;
    if (journalData.category !== undefined) updateData.category = journalData.category;
    if (journalData.discipline !== undefined) updateData.discipline = journalData.discipline;
    if (journalData.impactFactor !== undefined) {
      updateData.impactFactor = journalData.impactFactor;
    } else if (journalData.journalImpactFactor !== undefined) {
      updateData.impactFactor = journalData.journalImpactFactor;
    }
    if (journalData.coverImage !== undefined) updateData.coverImage = journalData.coverImage;

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

    // Only perform update if there are fields to update
    // This prevents errors when journal-admin pages only update content fields
    if (Object.keys(updateData).length === 0) {
      // If no fields to update, just return the existing journal
      return await this.prisma.journal.findUnique({
        where: { id: journalId }
      });
    }

    // Try to update journal - handle shortcode conflicts if they occur (race conditions)
    let updated;
    let retryCount = 0;
    const maxRetries = 3;
    
    while (retryCount < maxRetries) {
      try {
        updated = await this.prisma.journal.update({
          where: { id: journalId },
          data: updateData
        });
        break; // Success, exit loop
      } catch (error: any) {
        // If it's a unique constraint error for shortcode, generate a new one and retry
        if (error?.code === 'P2002' && error?.meta?.target?.includes('shortcode')) {
          retryCount++;
          console.log(`🔄 Shortcode conflict during update (attempt ${retryCount}), generating unique shortcode...`);
          // Get the shortcode that was attempted
          const attemptedShortcode = updateData.shortcode || journalData.shortcode || 'journal';
          // Generate a unique shortcode
          const uniqueShortcode = await this.generateUniqueShortcode(attemptedShortcode);
          updateData.shortcode = uniqueShortcode;
          console.log(`✅ Retrying update with unique shortcode: ${uniqueShortcode}`);
          
          if (retryCount >= maxRetries) {
            throw new InternalServerErrorException('Failed to update journal after multiple retries due to shortcode conflicts');
          }
        } else {
          // Some other error, re-throw it
          throw error;
        }
      }
    }
    
    if (!updated) {
      throw new InternalServerErrorException('Failed to update journal');
    }
    
    // Update JournalShortcode to link to the journal if shortcode exists (from update or existing)
    const shortcodeToLink = updated.shortcode || journalData.shortcode;
    if (shortcodeToLink) {
      try {
        await this.prisma.journalShortcode.updateMany({
          where: { shortcode: shortcodeToLink },
          data: { journalId: updated.id }
        });
        console.log(`Linked shortcode ${shortcodeToLink} to journal ID ${updated.id}`);
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

  /**
   * Generate a unique shortcode by appending a random suffix if the base shortcode exists
   */
  private async generateUniqueShortcode(baseShortcode: string): Promise<string> {
    let shortcode = baseShortcode;
    let attempts = 0;
    const maxAttempts = 1000; // Prevent infinite loops
    
    while (attempts < maxAttempts) {
      // Check if shortcode exists in JournalShortcode table
      const existingShortcode = await this.prisma.journalShortcode.findUnique({
        where: { shortcode }
      });
      
      // Check if shortcode exists in Journal table
      const existingJournal = await this.prisma.journal.findUnique({
        where: { shortcode }
      });
      
      // If shortcode doesn't exist, we can use it
      if (!existingShortcode && !existingJournal) {
        return shortcode;
      }
      
      // Generate a new shortcode by appending a random suffix
      const randomSuffix = Math.random().toString(36).substring(2, 8).toLowerCase(); // 6 random alphanumeric chars
      shortcode = `${baseShortcode}_${randomSuffix}`;
      attempts++;
    }
    
    // Fallback: use timestamp if we've tried too many times
    const timestamp = Date.now().toString(36);
    return `${baseShortcode}_${timestamp}`;
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

      // Extract journal information - prioritize journalName, then managingJournalName
      const journalName = (validData.journalName || validData.managingJournalName || '').trim();
      let originalShortcode = (validData.journalShort || validData.managingJournalName || validData.userName || '').trim();
      
      // If no shortcode provided, generate one from journalName or userName
      if (!originalShortcode) {
        originalShortcode = (journalName || validData.userName || 'journal').toLowerCase()
          .replace(/[^a-z0-9]/g, '')
          .substring(0, 20) || 'journal';
      }

      // Check if a journal with the same title already exists to prevent duplicates
      let createdJournalId: number | null = null;
      
      if (journalName) {
        // First, check if a journal with this exact title already exists
        const existingJournal = await this.prisma.journal.findFirst({
          where: {
            title: {
              equals: journalName.trim(),
              mode: 'insensitive'
            }
          },
          orderBy: {
            updatedAt: 'desc' // Prefer the most recently updated one
          }
        });
        
        if (existingJournal) {
          // Journal with same title exists - use it instead of creating duplicate
          createdJournalId = existingJournal.id;
          console.log(`✅ Found existing journal "${journalName}" (ID: ${existingJournal.id}), reusing instead of creating duplicate`);
        } else {
          // No existing journal found - create a new one
          // Generate a unique shortcode for the Journal table - this ensures no conflicts in the database
          // The original shortcode will be used for login and JournalShortcode table
          const uniqueJournalShortcode = await this.generateUniqueShortcode(originalShortcode);
          
          // Create a new journal record with all available fields from userData
          const journalData: any = {
            title: journalName,
            description: journalName, // Use journalName as default description
            shortcode: uniqueJournalShortcode // Use the generated unique shortcode for Journal table
          };

          // Add optional fields ONLY if they exist in validData
          if (validData.category) journalData.category = validData.category;
          if (validData.publisher) journalData.publisher = validData.publisher;
          if (validData.subjectArea) journalData.subjectArea = validData.subjectArea;
          if (validData.discipline) journalData.discipline = validData.discipline;
          if (validData.accessType) journalData.accessType = validData.accessType;
          if (validData.impactFactor) journalData.impactFactor = validData.impactFactor;
          if (validData.issn) journalData.issn = validData.issn;
          if (validData.coverImage) journalData.coverImage = validData.coverImage;
          if (validData.bannerImage) journalData.bannerImage = validData.bannerImage;
          if (validData.flyerImage) journalData.flyerImage = validData.flyerImage;
          
          console.log(`📝 Creating new journal with data:`, {
            title: journalData.title,
            shortcode: journalData.shortcode,
            category: journalData.category || '(not set)',
            publisher: journalData.publisher || '(not set)',
            issn: journalData.issn || '(not set)',
            hasImages: !!(journalData.coverImage || journalData.bannerImage || journalData.flyerImage)
          });

          // Try to create journal - if shortcode conflict occurs, generate a new one and retry
          let newJournal;
          let retryCount = 0;
          const maxRetries = 5;
          
          while (retryCount < maxRetries) {
            try {
              newJournal = await this.prisma.journal.create({
                data: journalData
              });
              break; // Success, exit loop
            } catch (error: any) {
              // If it's a unique constraint error for shortcode, generate a new one
              if (error?.code === 'P2002' && error?.meta?.target?.includes('shortcode')) {
                retryCount++;
                // Generate a new unique shortcode
                const newUniqueShortcode = await this.generateUniqueShortcode(originalShortcode);
                journalData.shortcode = newUniqueShortcode;
                console.log(`🔄 Shortcode conflict detected, retrying with new shortcode: ${newUniqueShortcode}`);
              } else {
                // Some other error, re-throw it
                throw error;
              }
            }
          }
          
          if (!newJournal) {
            throw new InternalServerErrorException('Failed to create journal after multiple retries');
          }
          
          createdJournalId = newJournal.id;
          console.log(`✅ Created new journal "${journalName}" (ID: ${newJournal.id}, shortcode: ${newJournal.shortcode})`);
        }
        
        // Ensure JournalShortcode entry points to the journal (either existing or newly created)
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
            
            // Verify the entry
            const verifyEntry = await this.prisma.journalShortcode.findUnique({
              where: { shortcode: originalShortcode.trim() }
            });
            
            if (verifyEntry && verifyEntry.journalId !== createdJournalId) {
              console.error(`❌ CRITICAL ERROR: JournalShortcode entry was NOT updated correctly!`);
              console.error(`   Expected journalId: ${createdJournalId}, Got: ${verifyEntry.journalId}`);
              // Force update one more time
              await this.prisma.journalShortcode.update({
                where: { shortcode: originalShortcode.trim() },
                data: { journalId: createdJournalId, journalName: journalName }
              });
              console.log(`   Forced update completed`);
            } else {
              console.log(`✅ Verification passed: JournalShortcode correctly points to Journal ID ${createdJournalId}`);
            }
          } catch (shortcodeError: any) {
            // If shortcode entry creation fails, this is critical - log and try to recover
            console.error('❌ CRITICAL ERROR creating/updating journal shortcode entry:', shortcodeError);
            console.error('   This means the user will not be able to access their journal!');
            // Try one more time with a direct update
            try {
              await this.prisma.journalShortcode.updateMany({
                where: { shortcode: originalShortcode.trim() },
                data: { journalId: createdJournalId, journalName: journalName }
              });
              console.log(`   Recovery attempt: Updated using updateMany`);
            } catch (recoveryError: any) {
              console.error('   Recovery attempt also failed:', recoveryError);
              // This is a critical error - the journal exists but can't be linked
              throw new InternalServerErrorException(
                `Journal (ID: ${createdJournalId}) exists but failed to link shortcode "${originalShortcode}". ` +
                `Error: ${shortcodeError.message}`
              );
            }
          }
        }
      }

      // Prepare user data - use the ORIGINAL shortcode (what user will login with)
      // The journal has a unique shortcode, but the user's journalShort is the original
      // This is linked via JournalShortcode table
      let userCreateData: any = {
        userName: validData.userName.trim(),
        password: validData.password || null, // Store password if provided
        journalShort: originalShortcode.trim(), // Use original shortcode for login
        journalName: journalName,
        category: validData.category || null,
        isActive: validData.isActive !== undefined ? validData.isActive : true,
      };

      // Try to create user - handle shortcode conflicts if they occur
      try {
        return await this.prisma.user.create({ data: userCreateData });
      } catch (userError: any) {
        // Handle Prisma unique constraint errors for user creation
        if (userError?.code === 'P2002') {
          // Check which field caused the unique constraint violation
          const target = userError?.meta?.target;
          if (target && Array.isArray(target) && target.includes('userName')) {
            throw new ConflictException('Username already exists');
          } else if (target && Array.isArray(target) && target.includes('shortcode')) {
            // This shouldn't happen since we generate unique shortcodes, but handle it gracefully
            console.error('Unexpected shortcode conflict during user creation:', userError);
            // Generate a new unique shortcode and retry user creation
            const currentShortcode = userCreateData.journalShort || 'user';
            const newShortcode = await this.generateUniqueShortcode(currentShortcode);
            // Update userCreateData with new shortcode
            userCreateData = {
              ...userCreateData,
              journalShort: newShortcode
            };
            // Retry user creation with new shortcode
            return await this.prisma.user.create({ data: userCreateData });
          } else {
            throw new ConflictException('A unique constraint violation occurred');
          }
        }
        // Re-throw if it's not a unique constraint error
        throw userError;
      }
    } catch (error: any) {
      if (error instanceof BadRequestException || error instanceof ConflictException || error instanceof InternalServerErrorException) {
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

    // Check if shortcode already exists in Journal table (to prevent duplicate shortcodes)
    const existingJournalByShortcode = await this.prisma.journal.findUnique({
      where: { shortcode }
    });
    if (existingJournalByShortcode) {
      // If journal already exists with this shortcode, just create the shortcode entry and link it
      const journalShortcode = await this.prisma.journalShortcode.create({
        data: {
          shortcode,
          journalName,
          journalId: existingJournalByShortcode.id
        }
      });
      return journalShortcode;
    }

    // Generate a unique shortcode to prevent conflicts in Journal table
    const uniqueShortcode = await this.generateUniqueShortcode(shortcode);

    // Always create a new journal record, even if the title already exists
    // This ensures each user assignment gets its own independent journal entry
    const newJournal = await this.prisma.journal.create({
      data: {
        title: journalName,
        description: journalName, // Use journalName as default description
        shortcode: uniqueShortcode // Use the generated unique shortcode for Journal table
      }
    });

    // Create the shortcode entry using the ORIGINAL shortcode (what users login with)
    // This entry links the login shortcode to the journal
    // The journal itself has a unique shortcode, but JournalShortcode uses the original for login
    const journalShortcode = await this.prisma.journalShortcode.create({
      data: {
        shortcode: shortcode, // Use the ORIGINAL shortcode for login/JournalShortcode table
        journalName,
        journalId: newJournal.id // Link to the journal with unique shortcode
      }
    });

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
