import { PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsString } from 'class-validator';
import { CreateArticleDto } from './create-article.dto';

export class UpdateArticleDto extends PartialType(CreateArticleDto) {
  @IsOptional()
  @IsString()
  fulltextImages?: string;

  @IsOptional()
  @IsString()
  heading1Title?: string;

  @IsOptional()
  @IsString()
  heading1Content?: string;

  @IsOptional()
  @IsString()
  heading2Title?: string;

  @IsOptional()
  @IsString()
  heading2Content?: string;

  @IsOptional()
  @IsString()
  heading3Title?: string;

  @IsOptional()
  @IsString()
  heading3Content?: string;

  @IsOptional()
  @IsString()
  heading4Title?: string;

  @IsOptional()
  @IsString()
  heading4Content?: string;

  @IsOptional()
  @IsString()
  heading5Title?: string;

  @IsOptional()
  @IsString()
  heading5Content?: string;
}
