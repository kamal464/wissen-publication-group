import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ArticlesService } from './articles.service';
import { S3Service } from '../aws/s3.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { SubmitManuscriptDto } from './dto/submit-manuscript.dto';

@Controller('articles')
export class ArticlesController {
  constructor(
    private readonly articlesService: ArticlesService,
    private readonly s3Service: S3Service,
  ) {}

  @Post()
  create(@Body() createArticleDto: CreateArticleDto) {
    return this.articlesService.create(createArticleDto);
  }

  @Get()
  findAll(
    @Query('journalId') journalId?: string,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('showInInpressCards') showInInpressCards?: string,
    @Query('inPressMonth') inPressMonth?: string,
    @Query('inPressYear') inPressYear?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const journalIdNum = journalId ? parseInt(journalId, 10) : undefined;
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    const showInInpressCardsBool = showInInpressCards === 'true' ? true : showInInpressCards === 'false' ? false : undefined;

    return this.articlesService.findAll(
      journalIdNum,
      search,
      status,
      showInInpressCardsBool,
      inPressMonth,
      inPressYear,
      sortBy || 'publishedAt',
      sortOrder || 'desc',
      pageNum,
      limitNum,
    );
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.articlesService.findOne(id);
  }

  @Get(':id/related')
  findRelated(
    @Param('id', ParseIntPipe) id: number,
    @Query('limit') limit?: string,
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 5;
    return this.articlesService.findRelated(id, limitNum);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateArticleDto: UpdateArticleDto,
  ) {
    return this.articlesService.update(id, updateArticleDto);
  }

  @Post('manuscripts')
  @UseInterceptors(FileInterceptor('pdf'))
  async submitManuscript(
    @Body('title') title: string,
    @Body('journalId') journalId: string,
    @Body('abstract') abstract: string,
    @Body('keywords') keywords: string,
    @Body('authors') authorsJson: string,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    try {
      console.log('📝 Manuscript submission request received');
      console.log('Title:', title);
      console.log('Journal ID:', journalId);
      console.log('File:', file?.filename);
      console.log('Authors JSON:', authorsJson);

      const authors = JSON.parse(authorsJson || '[]');
      
      const manuscriptDto: SubmitManuscriptDto = {
        title,
        journalId: parseInt(journalId, 10),
        abstract,
        keywords,
        authors,
        pdfUrl: file ? `/uploads/${file.filename}` : undefined,
      };

      console.log('📤 Calling service with DTO:', manuscriptDto);

      const result = await this.articlesService.submitManuscript(manuscriptDto, file);
      
      console.log('✅ Manuscript submitted successfully');
      return result;
    } catch (error) {
      console.error('❌ Error submitting manuscript:', error);
      throw error;
    }
  }

  @Post(':id/upload-pdf')
  @UseInterceptors(FileInterceptor('pdf'))
  async uploadPdf(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new Error('No file uploaded');
    }
    // Upload to S3
    const uploadResult = await this.s3Service.uploadFile(file, 'articles');
    return this.articlesService.update(id, { pdfUrl: uploadResult.url });
  }

  @Post(':id/upload-images')
  @UseInterceptors(FilesInterceptor('files', 10))
  async uploadImages(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    if (!files || files.length === 0) {
      throw new Error('No files uploaded');
    }
    // Upload to S3
    const uploadPromises = files.map(file => this.s3Service.uploadFile(file, 'articles/images'));
    const uploadResults = await Promise.all(uploadPromises);
    const imagePaths = uploadResults.map(result => result.url);
    const fulltextImages = JSON.stringify(imagePaths);
    return this.articlesService.update(id, { fulltextImages });
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.articlesService.remove(id);
  }
}
