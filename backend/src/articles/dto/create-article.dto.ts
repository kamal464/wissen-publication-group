import { IsString, IsInt, IsOptional, IsArray, ValidateNested, IsEmail } from 'class-validator';
import { Type } from 'class-transformer';

class AuthorDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  affiliation?: string;
}

export class CreateArticleDto {
  @IsString()
  title: string;

  @IsString()
  abstract: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AuthorDto)
  authors: AuthorDto[];

  @IsInt()
  journalId: number;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  pdfUrl?: string;

  @IsOptional()
  @IsString()
  wordUrl?: string;

  @IsOptional()
  @IsString()
  articleType?: string;

  @IsOptional()
  @IsString()
  keywords?: string;

  @IsOptional()
  @IsString()
  volumeNo?: string;

  @IsOptional()
  @IsString()
  issueNo?: string;

  @IsOptional()
  @IsString()
  issueMonth?: string;

  @IsOptional()
  @IsString()
  year?: string;

  @IsOptional()
  @IsString()
  specialIssue?: string;

  @IsOptional()
  @IsString()
  firstPageNumber?: string;

  @IsOptional()
  @IsString()
  lastPageNumber?: string;

  @IsOptional()
  @IsString()
  doi?: string;

  @IsOptional()
  @IsString()
  correspondingAuthorDetails?: string;

  @IsOptional()
  @IsString()
  citeAs?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  publishedAt?: Date;

  @IsOptional()
  @IsString()
  submitterName?: string;

  @IsOptional()
  @IsString()
  submitterEmail?: string;

  @IsOptional()
  @IsString()
  submitterAddress?: string;

  @IsOptional()
  @IsString()
  submitterCountry?: string;

  @IsOptional()
  @IsString()
  inPressMonth?: string;

  @IsOptional()
  @IsString()
  inPressYear?: string;

  @IsOptional()
  showInInpressCards?: boolean;

  @IsOptional()
  issueId?: number;
}
