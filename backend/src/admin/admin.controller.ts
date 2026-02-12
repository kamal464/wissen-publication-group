import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, Query, UseInterceptors, UploadedFile, BadRequestException, InternalServerErrorException, Req } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AdminService } from './admin.service';
import { S3Service } from '../aws/s3.service';
import type { Request } from 'express';

@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly s3Service: S3Service,
  ) {}

  @Post('login')
  async login(@Body() credentials: { username: string; password: string }) {
    return await this.adminService.login(credentials.username, credentials.password);
  }

  @Get('dashboard/stats')
  getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  @Get('analytics/journals')
  getJournalAnalytics() {
    return this.adminService.getJournalAnalytics();
  }

  @Get('analytics/articles')
  getArticleAnalytics() {
    return this.adminService.getArticleAnalytics();
  }

  @Get('analytics/search')
  getSearchAnalytics() {
    return this.adminService.getSearchAnalytics();
  }

  @Put('articles/:id/status')
  updateArticleStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: string,
    @Body('comments') comments?: string
  ) {
    return this.adminService.updateArticleStatus(id, status, comments);
  }

  @Post('journals')
  createJournal(@Body() journalData: any) {
    return this.adminService.createJournal(journalData);
  }

  @Put('journals/:id')
  updateJournal(
    @Param('id', ParseIntPipe) id: number,
    @Body() journalData: any
  ) {
    return this.adminService.updateJournal(id, journalData);
  }

  @Put('journals/:id/toggle-visibility')
  toggleJournalVisibility(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.toggleJournalVisibility(id);
  }

  @Delete('journals/:id')
  deleteJournal(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deleteJournal(id);
  }

  // Users endpoints
  @Get('users')
  getUsers(@Query('search') search?: string) {
    return this.adminService.getUsers(search);
  }

  @Get('users/:id')
  getUser(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.getUser(id);
  }

  @Post('users')
  async createUser(@Body() userData: any) {
    try {
      return await this.adminService.createUser(userData);
    } catch (error: any) {
      // Re-throw NestJS exceptions as-is
      if (error.status && error.message) {
        throw error;
      }
      // Convert other errors to BadRequestException
      throw new BadRequestException(error.message || 'Failed to create user');
    }
  }

  @Put('users/:id')
  async updateUser(@Param('id', ParseIntPipe) id: number, @Body() userData: any) {
    try {
      return await this.adminService.updateUser(id, userData);
    } catch (error: any) {
      // Re-throw NestJS exceptions as-is
      if (error.status && error.message) {
        throw error;
      }
      // Convert other errors to BadRequestException
      throw new BadRequestException(error.message || 'Failed to update user');
    }
  }

  @Delete('users/:id')
  deleteUser(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deleteUser(id);
  }

  @Put('users/:id/toggle')
  toggleUserStatus(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.toggleUserStatus(id);
  }

  // Submissions endpoints
  @Get('submissions')
  getSubmissions(@Query('search') search?: string) {
    return this.adminService.getSubmissions(search);
  }

  @Get('submissions/:id')
  getSubmission(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.getSubmission(id);
  }

  // Journal Shortcodes endpoints
  @Get('journal-shortcodes')
  getJournalShortcodes() {
    return this.adminService.getJournalShortcodes();
  }

  @Post('journal-shortcodes')
  createJournalShortcode(
    @Body('journalName') journalName: string,
    @Body('shortcode') shortcode: string
  ) {
    return this.adminService.createJournalShortcode(journalName, shortcode);
  }

  @Delete('journal-shortcodes/:id')
  deleteJournalShortcode(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deleteJournalShortcode(id);
  }

  // Notifications endpoints
  @Get('notifications')
  getNotifications(@Query('unreadOnly') unreadOnly?: string) {
    const unreadOnlyBool = unreadOnly === 'true' || unreadOnly === '1';
    return this.adminService.getNotifications(unreadOnlyBool);
  }

  @Put('notifications/:id/read')
  markNotificationAsRead(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.markNotificationAsRead(id);
  }

  @Put('notifications/read-all')
  markAllNotificationsAsRead() {
    return this.adminService.markAllNotificationsAsRead();
  }

  // TEMP: Debug login environment - remove after diagnosis
  @Get('_debug/login-check')
  debugLoginCheck() {
    return this.adminService.debugLoginCheck();
  }

  // Global Search
  @Get('search')
  globalSearch(@Query('query') query: string) {
    return this.adminService.globalSearch(query);
  }

  // Image Upload endpoint
  @Post('journals/:id/upload-image')
  @UseInterceptors(FileInterceptor('file'))
  async uploadJournalImage(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
  ) {
    console.log('Upload request received:', { 
      id, 
      hasFile: !!file, 
      reqBody: req.body,
      fileInfo: file ? { name: file.originalname, size: file.size, mimetype: file.mimetype } : null
    });
    
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Extract field from req.body - with FileInterceptor, form fields are in req.body
    const field = req.body?.field;
    
    console.log('Extracted field:', field);
    
    if (!field) {
      console.error('Field parameter missing. Req.body:', req.body);
      throw new BadRequestException('Field parameter is required. Allowed fields: bannerImage, flyerImage, flyerPdf, googleIndexingImage, editorImage');
    }

    try {
      console.log('Uploading file to S3...', { filename: file.originalname, size: file.size, mimetype: file.mimetype });
      
      // Upload to S3
      const uploadResult = await this.s3Service.uploadFile(file, 'journals');
      const fileUrl = uploadResult.url;
      
      console.log('File uploaded to S3:', fileUrl);
      
      // Update the specific image field in the journal
      const updateData: any = {};
      if (field === 'bannerImage') updateData.bannerImage = fileUrl;
      else if (field === 'flyerImage') updateData.flyerImage = fileUrl;
      else if (field === 'flyerPdf') updateData.flyerPdf = fileUrl;
      else if (field === 'googleIndexingImage') updateData.googleIndexingImage = fileUrl;
      else if (field === 'editorImage') updateData.editorImage = fileUrl;
      else {
        throw new BadRequestException(`Invalid field: ${field}. Allowed fields: bannerImage, flyerImage, flyerPdf, googleIndexingImage, editorImage`);
      }

      console.log('Updating journal with field:', field, 'URL:', fileUrl);
      const updated = await this.adminService.updateJournal(id, updateData);
      
      console.log('Journal updated successfully');
      
      return {
        success: true,
        url: fileUrl,
        field,
        journal: updated
      };
    } catch (error: any) {
      console.error('Error uploading journal image:', error);
      console.error('Error stack:', error.stack);
      
      if (error instanceof BadRequestException) {
        throw error;
      }
      
      // Check for S3 credential errors (AWS SDK v3 uses error.Code)
      const code = error.Code ?? error.name;
      const isCredentialError = code === 'InvalidAccessKeyId' || code === 'SignatureDoesNotMatch' ||
          error.message?.includes('Access Key') || error.message?.includes('does not exist in our records') ||
          error.message?.includes('authorization header is malformed');
      if (isCredentialError) {
        throw new InternalServerErrorException(
          'AWS credentials are invalid (e.g. key deleted or wrong). Create a new IAM user access key in AWS Console, then set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in backend/.env (or backend/prod.env for local dev).'
        );
      }
      
      if (error.name === 'NoSuchBucket') {
        throw new InternalServerErrorException(`S3 bucket not found: ${process.env.S3_BUCKET_NAME}`);
      }
      
      throw new InternalServerErrorException(`Failed to upload image: ${error.message || 'Unknown error'}`);
    }
  }

  // Board Members endpoints
  @Get('board-members')
  getBoardMembers(@Query('journalId') journalId?: string) {
    const journalIdNum = journalId ? parseInt(journalId) : undefined;
    return this.adminService.getBoardMembers(journalIdNum);
  }

  @Get('board-members/:id')
  getBoardMember(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.getBoardMember(id);
  }

  @Post('board-members')
  createBoardMember(@Body() memberData: any) {
    if (!memberData.journalId) {
      throw new BadRequestException('Journal ID is required');
    }
    return this.adminService.createBoardMember(memberData.journalId, memberData);
  }

  @Post('board-members/reorder')
  reorderBoardMembers(@Body() body: { journalId: number; orderedIds: number[] }) {
    if (!body?.journalId || !Array.isArray(body.orderedIds)) {
      throw new BadRequestException('journalId and orderedIds array are required');
    }
    return this.adminService.reorderBoardMembers(Number(body.journalId), body.orderedIds);
  }

  @Put('board-members/:id')
  updateBoardMember(@Param('id', ParseIntPipe) id: number, @Body() memberData: any) {
    return this.adminService.updateBoardMember(id, memberData);
  }

  @Delete('board-members/:id')
  deleteBoardMember(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deleteBoardMember(id);
  }

  // Board Member Photo Upload
  @Post('board-members/:id/upload-photo')
  @UseInterceptors(FileInterceptor('file'))
  async uploadBoardMemberPhoto(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Upload to S3 (consistent with journal image uploads)
    const uploadResult = await this.s3Service.uploadFile(file, 'board-members');
    const fileUrl = uploadResult.url;
    
    const updated = await this.adminService.updateBoardMember(id, { imageUrl: fileUrl });
    return {
      success: true,
      path: fileUrl,
      member: updated
    };
  }
}
