import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, Query } from '@nestjs/common';
import { NewsService } from './news.service';

@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Get('latest')
  async findLatest(@Query('limit') limit?: string) {
    try {
      const limitNum = limit ? parseInt(limit, 10) : 5;
      return await this.newsService.findLatest(limitNum);
    } catch (error) {
      console.error('Error in NewsController.findLatest:', error);
      throw error;
    }
  }

  @Get()
  findAll(@Query('journalId') journalId?: string) {
    const journalIdNum = journalId ? parseInt(journalId, 10) : undefined;
    return this.newsService.findAll(journalIdNum);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.newsService.findOne(id);
  }

  @Post()
  create(@Body() data: {
    title: string;
    content: string;
    link?: string;
    isPinned?: boolean;
    publishedAt?: string;
  }) {
    return this.newsService.create({
      ...data,
      publishedAt: data.publishedAt ? new Date(data.publishedAt) : undefined,
    });
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: {
      title?: string;
      content?: string;
      link?: string;
      isPinned?: boolean;
      publishedAt?: string;
    }
  ) {
    return this.newsService.update(id, {
      ...data,
      publishedAt: data.publishedAt ? new Date(data.publishedAt) : undefined,
    });
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.newsService.delete(id);
  }
}

