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
    
    // CRITICAL: Check if a journal already exists for this shortcode
    // If it does, update it instead of creating a new one to prevent duplicates
    // This check MUST happen BEFORE any journal creation logic
    if (journalData.shortcode) {
      const shortcode = String(journalData.shortcode).trim();
      console.log(`🔍 [STEP 1] Checking for existing journal with shortcode: "${shortcode}"`);
      
      // Check JournalShortcode table first - this is the authoritative source
      const existingShortcodeEntry = await this.prisma.journalShortcode.findUnique({
        where: { shortcode }
      });
      
      console.log(`🔍 [STEP 1a] JournalShortcode entry for "${shortcode}":`, existingShortcodeEntry ? {
        shortcode: existingShortcodeEntry.shortcode,
        journalId: existingShortcodeEntry.journalId,
        journalName: existingShortcodeEntry.journalName
      } : 'NOT FOUND');
      
      if (existingShortcodeEntry && existingShortcodeEntry.journalId) {
        // Journal already exists for this shortcode - UPDATE it instead of creating a new one
        console.log(`✅ [STEP 1a] FOUND: Journal already exists for shortcode "${shortcode}" (ID: ${existingShortcodeEntry.journalId})`);
        console.log(`   🔄 UPDATING existing journal instead of creating a new one to prevent duplicates.`);
        console.log(`   ⚠️ If you see a journal created after this message, there's a bug in the code flow!`);
        const updated = await this.updateJournal(existingShortcodeEntry.journalId, journalData);
        console.log(`   ✅ Successfully updated journal ID ${existingShortcodeEntry.journalId}`);
        return updated;
      }
      
      // Also check if a journal exists with this shortcode directly in Journal table
      // This catches cases where JournalShortcode entry might be missing
      const existingJournal = await this.prisma.journal.findUnique({
        where: { shortcode }
      });
      
      console.log(`🔍 [STEP 1b] Journal with shortcode "${shortcode}":`, existingJournal ? {
        id: existingJournal.id,
        title: existingJournal.title,
        shortcode: existingJournal.shortcode
      } : 'NOT FOUND');
      
      if (existingJournal) {
        // Journal exists with this shortcode - UPDATE it instead of creating a new one
        console.log(`✅ [STEP 1b] FOUND: Journal already exists with shortcode "${shortcode}" (ID: ${existingJournal.id})`);
        console.log(`   🔄 UPDATING existing journal instead of creating a new one to prevent duplicates.`);
        console.log(`   Also ensuring JournalShortcode entry points to this journal.`);
        console.log(`   ⚠️ If you see a journal created after this message, there's a bug in the code flow!`);
        
        // CRITICAL: Check if JournalShortcode entry points to a different journal
        // If it does, we need to update it to point to this journal (the one with matching shortcode)
        if (existingShortcodeEntry) {
          if (existingShortcodeEntry.journalId !== existingJournal.id) {
            console.warn(`   ⚠️ JournalShortcode entry points to different journal (ID: ${existingShortcodeEntry.journalId})`);
            console.warn(`   Updating JournalShortcode to point to journal ID ${existingJournal.id} (the one with matching shortcode)`);
            // Update JournalShortcode to point to the journal with matching shortcode
            await this.prisma.journalShortcode.update({
              where: { shortcode },
              data: { 
                journalId: existingJournal.id,
                journalName: existingJournal.title || journalData.title || ''
              }
            });
            console.log(`   ✅ Updated JournalShortcode entry to point to journal ID ${existingJournal.id}`);
          } else {
            console.log(`   ✅ JournalShortcode entry already points to journal ID ${existingJournal.id}`);
          }
        } else {
          // Entry doesn't exist - create it
          await this.prisma.journalShortcode.create({
            data: {
              shortcode: shortcode,
              journalName: existingJournal.title || journalData.title || '',
              journalId: existingJournal.id
            }
          });
          console.log(`   ✅ Created JournalShortcode entry pointing to journal ID ${existingJournal.id}`);
        }
        
        const updated = await this.updateJournal(existingJournal.id, journalData);
        console.log(`   ✅ Successfully updated journal ID ${existingJournal.id}`);
        return updated;
      }
      
      console.log(`❌ [STEP 1] No existing journal found for shortcode "${shortcode}" - will create a new one`);
    } else {
      console.log(`⚠️ [STEP 1] No shortcode provided in journalData - will create a new journal without shortcode`);
      console.log(`   ⚠️ WARNING: Creating journal without shortcode may cause issues with user linking!`);
    }
    
    // Build data object, only including fields that have actual values
    // Title and description are required, so ensure they have values
    const title = journalData.title ? String(journalData.title).trim() : '';
    const description = journalData.description ? String(journalData.description).trim() : '';
    
    if (!title) {
      throw new BadRequestException('Title is required and cannot be empty');
    }

    // CRITICAL: Additional check - if no shortcode was provided, check if a journal with this exact title exists
    // This prevents creating duplicate journals with the same title
    if (!journalData.shortcode || !journalData.shortcode.trim()) {
      const existingByTitle = await this.prisma.journal.findFirst({
        where: {
          title: title,
          shortcode: null // Only match journals without shortcodes
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      
      if (existingByTitle) {
        console.log(`✅ Found existing journal with title "${title}" (no shortcode) - updating instead of creating duplicate`);
        return await this.updateJournal(existingByTitle.id, journalData);
      }
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
    // CRITICAL: Only set shortcode if we've verified no journal exists for it
    // If a shortcode was provided, we should have already checked and updated existing journal above
    // If we reach here, either no shortcode was provided, or no journal exists for it
    if (isValidValue(journalData.shortcode)) {
      const shortcodeToUse = String(journalData.shortcode).trim();
      // Final safety check: Make absolutely sure we're not about to create a duplicate
      // This is a critical safety net to catch race conditions or missed checks
      const finalCheck = await this.prisma.journal.findUnique({
        where: { shortcode: shortcodeToUse }
      });
      if (finalCheck) {
        console.error(`❌ FINAL SAFETY CHECK FAILED: Journal with shortcode "${shortcodeToUse}" already exists (ID: ${finalCheck.id})`);
        console.error(`   This should have been caught by the check at the beginning. Updating existing journal instead.`);
        return await this.updateJournal(finalCheck.id, journalData);
      }
      // Also check JournalShortcode table one more time
      const finalShortcodeCheck = await this.prisma.journalShortcode.findUnique({
        where: { shortcode: shortcodeToUse }
      });
      if (finalShortcodeCheck && finalShortcodeCheck.journalId) {
        console.error(`❌ FINAL SAFETY CHECK FAILED: JournalShortcode entry for "${shortcodeToUse}" already points to journal ID ${finalShortcodeCheck.journalId}`);
        console.error(`   This should have been caught by the check at the beginning. Updating existing journal instead.`);
        return await this.updateJournal(finalShortcodeCheck.journalId, journalData);
      }
      // Also check if a journal with this title was just created (race condition protection)
      const titleCheck = await this.prisma.journal.findFirst({
        where: {
          title: title,
          shortcode: shortcodeToUse // Same shortcode
        }
      });
      if (titleCheck) {
        console.error(`❌ FINAL SAFETY CHECK FAILED: Journal with title "${title}" and shortcode "${shortcodeToUse}" already exists (ID: ${titleCheck.id})`);
        console.error(`   Updating existing journal instead.`);
        return await this.updateJournal(titleCheck.id, journalData);
      }
      // Safe to use this shortcode
      data.shortcode = shortcodeToUse;
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
    
    // CRITICAL: Only update JournalShortcode if it doesn't already point to a journal
    // This prevents overwriting the link to the original journal created when the user was created
    if (journalData.shortcode) {
      try {
        const shortcode = String(journalData.shortcode).trim();
        const existingShortcodeEntry = await this.prisma.journalShortcode.findUnique({
          where: { shortcode }
        });
        
        if (existingShortcodeEntry) {
          // JournalShortcode entry already exists
          if (existingShortcodeEntry.journalId) {
            // It already points to a journal - DON'T overwrite it
            // This means a journal was already created for this shortcode (when user was created)
            // We should have updated that journal instead of creating a new one
            console.error(`❌ ERROR: JournalShortcode "${shortcode}" already points to journal ID ${existingShortcodeEntry.journalId}.`);
            console.error(`   A new journal (ID ${created.id}) was created, but this should not have happened.`);
            console.error(`   The check at the beginning of createJournal should have prevented this.`);
            console.error(`   Deleting duplicate journal ID ${created.id} and returning existing journal ID ${existingShortcodeEntry.journalId}.`);
            
            // Delete the newly created journal since we shouldn't have created it
            await this.prisma.journal.delete({
              where: { id: created.id }
            });
            console.log(`   ✅ Deleted duplicate journal ID ${created.id}`);
            
            // Return the existing journal instead (the one that should be used)
            const existingJournal = await this.prisma.journal.findUnique({
              where: { id: existingShortcodeEntry.journalId }
            });
            console.log(`   ✅ Returning existing journal ID ${existingShortcodeEntry.journalId}`);
            return existingJournal;
          } else {
            // Entry exists but doesn't point to a journal - update it
            await this.prisma.journalShortcode.update({
              where: { shortcode },
              data: { journalId: created.id }
            });
            console.log(`✅ Linked JournalShortcode "${shortcode}" to new journal ID ${created.id}`);
          }
        } else {
          // No entry exists - create one
          await this.prisma.journalShortcode.create({
            data: {
              shortcode: shortcode,
              journalName: created.title || journalData.title || '',
              journalId: created.id
            }
          });
          console.log(`✅ Created JournalShortcode entry "${shortcode}" -> journal ID ${created.id}`);
        }
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
    
    // Handle shortcode update - use provided shortcode directly
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
        // Use the original shortcode directly - no unique generation
        updateData.shortcode = newShortcode;
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
        // If it's a unique constraint error for shortcode, throw error - don't generate unique shortcodes
        if (error?.code === 'P2002' && error?.meta?.target?.includes('shortcode')) {
          throw new ConflictException(`Shortcode "${updateData.shortcode || journalData.shortcode}" already exists. Please use a different shortcode.`);
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

      // CRITICAL: Check if a journal already exists for this shortcode BEFORE creating a new one
      // This prevents duplicate journal creation when users are created
      let existingJournalId: number | null = null;
      
      if (journalName && originalShortcode) {
        // Check if JournalShortcode entry exists and points to a journal
        const existingShortcodeEntry = await this.prisma.journalShortcode.findUnique({
          where: { shortcode: originalShortcode.trim() }
        });
        
        if (existingShortcodeEntry && existingShortcodeEntry.journalId) {
          // Journal already exists for this shortcode - use it
          existingJournalId = existingShortcodeEntry.journalId;
          console.log(`✅ Found existing journal (ID: ${existingJournalId}) for shortcode "${originalShortcode}" - linking user to it instead of creating duplicate`);
        } else {
          // Check if a journal exists with this shortcode directly
          const existingJournal = await this.prisma.journal.findUnique({
            where: { shortcode: originalShortcode.trim() }
          });
          
          if (existingJournal) {
            // Journal exists with this shortcode - use it
            existingJournalId = existingJournal.id;
            console.log(`✅ Found existing journal (ID: ${existingJournalId}) with shortcode "${originalShortcode}" - linking user to it instead of creating duplicate`);
            
            // Ensure JournalShortcode entry exists and points to this journal
            if (!existingShortcodeEntry) {
              await this.prisma.journalShortcode.create({
                data: {
                  shortcode: originalShortcode.trim(),
                  journalName: journalName,
                  journalId: existingJournalId
                }
              });
            } else if (existingShortcodeEntry.journalId !== existingJournalId) {
              // Update existing entry to point to the correct journal
              await this.prisma.journalShortcode.update({
                where: { shortcode: originalShortcode.trim() },
                data: {
                  journalId: existingJournalId,
                  journalName: journalName
                }
              });
            }
          } else {
            // Check if a journal exists with the same title (but different shortcode)
            const existingByTitle = await this.prisma.journal.findFirst({
              where: {
                title: journalName
              },
              orderBy: {
                createdAt: 'desc'
              }
            });
            
            if (existingByTitle) {
              // Journal exists with same title - use it and update shortcode
              existingJournalId = existingByTitle.id;
              console.log(`✅ Found existing journal (ID: ${existingJournalId}) with title "${journalName}" - linking user to it and updating shortcode`);
              
              // Update the journal to use this shortcode (if it doesn't have one)
              if (!existingByTitle.shortcode) {
                await this.prisma.journal.update({
                  where: { id: existingJournalId },
                  data: { shortcode: originalShortcode.trim() }
                });
              }
              
              // Ensure JournalShortcode entry exists
              if (!existingShortcodeEntry) {
                await this.prisma.journalShortcode.create({
                  data: {
                    shortcode: originalShortcode.trim(),
                    journalName: journalName,
                    journalId: existingJournalId
                  }
                });
              } else if (existingShortcodeEntry.journalId !== existingJournalId) {
                await this.prisma.journalShortcode.update({
                  where: { shortcode: originalShortcode.trim() },
                  data: {
                    journalId: existingJournalId,
                    journalName: journalName
                  }
                });
              }
            }
          }
        }
      }

      // Only create a new journal if one doesn't already exist
      let createdJournalId: number | null = existingJournalId;
      
      if (!existingJournalId && journalName) {
        // No existing journal found - create a new one
        console.log(`📝 No existing journal found - creating new journal for shortcode "${originalShortcode}"`);
        
        // Use the original shortcode directly - no unique generation
        const journalData: any = {
          title: journalName,
          description: journalName, // Use journalName as default description
          shortcode: originalShortcode // Use the original shortcode directly
        };

        // Add optional fields ONLY if they exist in validData - do NOT copy from existing journals
        // This ensures the new journal starts completely fresh with no inherited data
        // IMPORTANT: Always set category from user's selected category (don't use default)
        console.log('🔵 Creating journal - validData.category:', validData.category);
        if (validData.category && validData.category.trim()) {
          journalData.category = validData.category.trim();
          console.log('🔵 Setting journal category to:', journalData.category);
        } else {
          // Explicitly set to null if not provided (don't use any default)
          journalData.category = null;
          console.log('⚠️ No category provided for journal - setting to null');
        }
        if (validData.publisher) journalData.publisher = validData.publisher;
        if (validData.subjectArea) journalData.subjectArea = validData.subjectArea;
        if (validData.discipline) journalData.discipline = validData.discipline;
        if (validData.accessType) journalData.accessType = validData.accessType;
        if (validData.impactFactor) journalData.impactFactor = validData.impactFactor;
        // IMPORTANT: Only set ISSN if explicitly provided - do NOT inherit from existing journals
        if (validData.issn) journalData.issn = validData.issn;
        if (validData.coverImage) journalData.coverImage = validData.coverImage;
        if (validData.bannerImage) journalData.bannerImage = validData.bannerImage;
        if (validData.flyerImage) journalData.flyerImage = validData.flyerImage;
        
        // Explicitly set optional fields to null/undefined if not provided to ensure clean state
        // This prevents any accidental data inheritance
        console.log(`📝 Creating journal with data:`, {
          title: journalData.title,
          shortcode: journalData.shortcode,
          category: journalData.category || '(not set)',
          publisher: journalData.publisher || '(not set)',
          issn: journalData.issn || '(not set - will be empty)',
          hasImages: !!(journalData.coverImage || journalData.bannerImage || journalData.flyerImage)
        });

        // Create journal - if shortcode conflict occurs, throw error (no unique generation)
        let newJournal;
        try {
          newJournal = await this.prisma.journal.create({
            data: journalData
          });
        } catch (error: any) {
          // If it's a unique constraint error for shortcode, throw error
          if (error?.code === 'P2002' && error?.meta?.target?.includes('shortcode')) {
            throw new ConflictException(`Journal with shortcode "${originalShortcode}" already exists. Please use a different shortcode or link to the existing journal.`);
          } else {
            // Some other error, re-throw it
            throw error;
          }
        }
        
        if (!newJournal) {
          throw new InternalServerErrorException('Failed to create journal');
        }
        
        createdJournalId = newJournal.id;
        
        
        // Verify the journal is truly new and empty (no inherited data)
        console.log(`✅ Created NEW journal for user:`, {
          journalId: newJournal.id,
          title: newJournal.title,
          shortcode: newJournal.shortcode,
          originalShortcode: originalShortcode,
          userJournalName: journalName,
          issn: newJournal.issn || '(empty - as expected)',
          category: newJournal.category || '(empty - as expected)',
          publisher: newJournal.publisher || '(empty - as expected)'
        });
        
        // CRITICAL: Verify this is a NEW journal, not an existing one
        if (newJournal.issn && newJournal.issn === '1620-7735') {
          console.error(`❌ CRITICAL: New journal has old ISSN! This should not happen!`);
          console.error(`   Journal ID: ${newJournal.id}, ISSN: ${newJournal.issn}`);
        }

        // CRITICAL: Create/update the shortcode entry and link it to the newly created journal
        // Use the shortcode for JournalShortcode table - this is what users will use to login
        try {
          // Ensure JournalShortcode entry exists and points to the new journal
          const shortcodeEntry = await this.prisma.journalShortcode.upsert({
            where: { shortcode: originalShortcode.trim() },
            update: {
              journalId: newJournal.id,
              journalName: journalName
            },
            create: {
              shortcode: originalShortcode.trim(),
              journalName: journalName,
              journalId: newJournal.id
            }
          });
          
          console.log(`✅ JournalShortcode entry ensured: "${originalShortcode}" -> Journal ID ${newJournal.id}`);
        } catch (shortcodeError: any) {
          console.error('❌ ERROR creating/updating journal shortcode entry:', shortcodeError);
          // Try one more time with a direct update
          try {
            await this.prisma.journalShortcode.updateMany({
              where: { shortcode: originalShortcode.trim() },
              data: { journalId: newJournal.id, journalName: journalName }
            });
            console.log(`   Recovery attempt: Updated using updateMany`);
          } catch (recoveryError: any) {
            console.error('   Recovery attempt also failed:', recoveryError);
            throw new InternalServerErrorException(
              `Journal created (ID: ${newJournal.id}) but failed to link shortcode "${originalShortcode}". ` +
              `Error: ${shortcodeError.message}`
            );
          }
        }
      } else if (existingJournalId) {
        // Using existing journal - ensure JournalShortcode entry exists (should already be handled above)
        console.log(`✅ Using existing journal ID ${existingJournalId} for user creation`);
        // IMPORTANT: Update the existing journal's category if user provided one
        if (validData.category && validData.category.trim()) {
          try {
            await this.prisma.journal.update({
              where: { id: existingJournalId },
              data: { category: validData.category.trim() }
            });
            console.log(`✅ Updated existing journal (ID: ${existingJournalId}) category to: ${validData.category.trim()}`);
          } catch (journalUpdateError) {
            console.error(`⚠️ Failed to update journal category:`, journalUpdateError);
            // Don't fail user creation if journal update fails
          }
        }
      }

      // Prepare user data - use the shortcode (what user will login with)
      // The journal and user both use the same shortcode
      // This is linked via JournalShortcode table
      // IMPORTANT: Ensure category is properly set from user input (trimmed, not null if provided)
      const userCategory = validData.category && validData.category.trim() 
        ? validData.category.trim() 
        : null;
      
      let userCreateData: any = {
        userName: validData.userName.trim(),
        password: validData.password || null, // Store password if provided
        journalShort: originalShortcode.trim(), // Use original shortcode for login
        journalName: journalName,
        category: userCategory, // Use the properly processed category
        isActive: validData.isActive !== undefined ? validData.isActive : true,
      };

      // Try to create user - handle shortcode conflicts if they occur
      try {
        console.log('🔵 Backend - Creating user with category:', userCreateData.category);
        console.log('🔵 Backend - Full userCreateData:', JSON.stringify(userCreateData, null, 2));
        const createdUser = await this.prisma.user.create({ data: userCreateData });
        console.log('🔵 Backend - User created, category in DB:', createdUser.category);
        console.log('🔵 Backend - Full created user:', JSON.stringify(createdUser, null, 2));
        return createdUser;
      } catch (userError: any) {
        // Handle Prisma unique constraint errors for user creation
        if (userError?.code === 'P2002') {
          // Check which field caused the unique constraint violation
          const target = userError?.meta?.target;
          if (target && Array.isArray(target) && target.includes('userName')) {
            throw new ConflictException('Username already exists');
          } else if (target && Array.isArray(target) && target.includes('shortcode')) {
            // Shortcode conflict - throw error instead of generating unique shortcode
            throw new ConflictException(`Shortcode "${userCreateData.journalShort}" already exists. Please use a different shortcode.`);
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
      
      // DEBUG: Log received category
      console.log('🔵 updateUser - Received category:', validData.category);
      
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
      // IMPORTANT: Always update category if provided, even if it's an empty string (trim it first)
      if (validData.category !== undefined) {
        userUpdateData.category = validData.category && validData.category.trim() 
          ? validData.category.trim() 
          : null;
        console.log('🔵 updateUser - Setting category to:', userUpdateData.category);
        
        // Also update the associated journal's category if user has one
        if (userUpdateData.category) {
          try {
            // Find the user first to get journalShort
            const user = await this.prisma.user.findUnique({ where: { id } });
            if (user && user.journalShort) {
              // Find the journal by shortcode or journalId from JournalShortcode
              const shortcodeEntry = await this.prisma.journalShortcode.findUnique({
                where: { shortcode: user.journalShort }
              });
              
              if (shortcodeEntry && shortcodeEntry.journalId) {
                await this.prisma.journal.update({
                  where: { id: shortcodeEntry.journalId },
                  data: { category: userUpdateData.category }
                });
                console.log(`✅ Updated journal (ID: ${shortcodeEntry.journalId}) category to: ${userUpdateData.category}`);
              } else {
                // Try to find journal by shortcode directly
                const journal = await this.prisma.journal.findUnique({
                  where: { shortcode: user.journalShort }
                });
                if (journal) {
                  await this.prisma.journal.update({
                    where: { id: journal.id },
                    data: { category: userUpdateData.category }
                  });
                  console.log(`✅ Updated journal (ID: ${journal.id}) category to: ${userUpdateData.category}`);
                }
              }
            }
          } catch (journalUpdateError) {
            console.error(`⚠️ Failed to update journal category during user update:`, journalUpdateError);
            // Don't fail user update if journal update fails
          }
        }
      }
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
    // CRITICAL: Check if shortcode already exists in JournalShortcode table
    const existing = await this.prisma.journalShortcode.findUnique({
      where: { shortcode }
    });
    if (existing) {
      // If it already points to a journal, return it (or update if needed)
      if (existing.journalId) {
        // Shortcode already exists and points to a journal - do not create duplicate
        return existing;
      }
      // If it exists but doesn't point to a journal, we'll update it below
    }

    // CRITICAL: Check if a journal already exists with this shortcode
    const existingJournalByShortcode = await this.prisma.journal.findUnique({
      where: { shortcode }
    });
    if (existingJournalByShortcode) {
      // If journal already exists with this shortcode, link the shortcode entry to it
      if (existing) {
        // Update existing entry to point to the journal
        const updated = await this.prisma.journalShortcode.update({
          where: { shortcode },
          data: {
            journalId: existingJournalByShortcode.id,
            journalName: journalName
          }
        });
        return updated;
      } else {
        // Create new shortcode entry linking to existing journal
        const journalShortcode = await this.prisma.journalShortcode.create({
          data: {
            shortcode,
            journalName,
            journalId: existingJournalByShortcode.id
          }
        });
        return journalShortcode;
      }
    }

    // CRITICAL: Check if a journal with the same title and no shortcode exists
    // This prevents creating duplicate journals when a journal was just created
    const existingJournalByTitle = await this.prisma.journal.findFirst({
      where: {
        title: journalName,
        shortcode: null // Journal exists but has no shortcode assigned yet
      },
      orderBy: {
        createdAt: 'desc' // Get the most recently created one
      }
    });

    if (existingJournalByTitle) {
      // Found a journal with matching title and no shortcode - link to it instead of creating new
      // Update the journal to use this shortcode
      await this.prisma.journal.update({
        where: { id: existingJournalByTitle.id },
        data: { shortcode: shortcode }
      });

      // Create or update the shortcode entry
      if (existing) {
        const updated = await this.prisma.journalShortcode.update({
          where: { shortcode },
          data: {
            journalId: existingJournalByTitle.id,
            journalName: journalName
          }
        });
        return updated;
      } else {
        const journalShortcode = await this.prisma.journalShortcode.create({
          data: {
            shortcode,
            journalName,
            journalId: existingJournalByTitle.id
          }
        });
        return journalShortcode;
      }
    }

    // Only if no existing journal is found, create a new one
    // Use the original shortcode directly - no unique generation
    let newJournal;
    try {
      newJournal = await this.prisma.journal.create({
        data: {
          title: journalName,
          description: journalName, // Use journalName as default description
          shortcode: shortcode // Use the original shortcode directly
        }
      });
    } catch (error: any) {
      // If it's a unique constraint error for shortcode, throw error
      if (error?.code === 'P2002' && error?.meta?.target?.includes('shortcode')) {
        throw new ConflictException(`Journal with shortcode "${shortcode}" already exists. Please use a different shortcode or link to the existing journal.`);
      } else {
        // Some other error, re-throw it
        throw error;
      }
    }

    // Create the shortcode entry using the ORIGINAL shortcode (what users login with)
    if (existing) {
      // Update existing entry to point to new journal
      const updated = await this.prisma.journalShortcode.update({
        where: { shortcode },
        data: {
          journalId: newJournal.id,
          journalName: journalName
        }
      });
      return updated;
    } else {
      // Create new shortcode entry
      const journalShortcode = await this.prisma.journalShortcode.create({
        data: {
          shortcode: shortcode, // Use the ORIGINAL shortcode for login/JournalShortcode table
          journalName,
          journalId: newJournal.id // Link to the journal
        }
      });
      return journalShortcode;
    }
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
