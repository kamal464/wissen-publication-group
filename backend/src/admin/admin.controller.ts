import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, Query, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AdminService } from './admin.service';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

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
      throw new Error(error.message || 'Failed to create user');
    }
  }

  @Put('users/:id')
  async updateUser(@Param('id', ParseIntPipe) id: number, @Body() userData: any) {
    try {
      return await this.adminService.updateUser(id, userData);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update user');
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
    @Body('field') field: string,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (!file) {
      throw new Error('No file uploaded');
    }

    const fileUrl = `/uploads/${file.filename}`;
    
    // Update the specific image field in the journal
    const updateData: any = {};
    if (field === 'bannerImage') updateData.bannerImage = fileUrl;
    else if (field === 'flyerImage') updateData.flyerImage = fileUrl;
    else if (field === 'flyerPdf') updateData.flyerPdf = fileUrl;
    else if (field === 'googleIndexingImage') updateData.googleIndexingImage = fileUrl;
    else if (field === 'editorImage') updateData.editorImage = fileUrl;
    else {
      throw new Error(`Invalid field: ${field}`);
    }

    const updated = await this.adminService.updateJournal(id, updateData);
    return {
      success: true,
      url: fileUrl,
      field,
      journal: updated
    };
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
      throw new Error('Journal ID is required');
    }
    return this.adminService.createBoardMember(memberData.journalId, memberData);
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
      throw new Error('No file uploaded');
    }

    const fileUrl = `/uploads/${file.filename}`;
    const updated = await this.adminService.updateBoardMember(id, { imageUrl: fileUrl });
    return {
      success: true,
      path: fileUrl,
      member: updated
    };
  }
}
