import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { JournalsService } from './journals.service';
import { CreateJournalDto } from './dto/create-journal.dto';

@Controller('journals')
export class JournalsController {
  constructor(private readonly journalsService: JournalsService) {}

  @Post()
  create(@Body() createJournalDto: CreateJournalDto) {
    return this.journalsService.create(createJournalDto);
  }

  @Get()
  async findAll(@Query('forHome') forHome?: string) {
    try {
      if (forHome === 'true' || forHome === '1') {
        return await this.journalsService.findAllForHome();
      }
      return await this.journalsService.findAll();
    } catch (error) {
      console.error('Error in JournalsController.findAll:', error);
      throw error;
    }
  }

  @Get('shortcode/:shortcode')
  findByShortcode(@Param('shortcode') shortcode: string) {
    return this.journalsService.findByShortcode(shortcode);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    // Check if it's a number (ID) or shortcode
    const numId = +id;
    if (!isNaN(numId) && numId > 0) {
      return this.journalsService.findOne(numId);
    } else {
      // Try as shortcode
      return this.journalsService.findByShortcode(id);
    }
  }

  @Get(':id/articles')
  findArticles(@Param('id') id: string) {
    return this.journalsService.findArticles(+id);
  }
}