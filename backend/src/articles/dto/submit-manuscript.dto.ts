import { IsString, IsInt, IsArray, IsOptional, ValidateNested, IsEmail } from 'class-validator';
import { Type } from 'class-transformer';

class ManuscriptAuthorDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  affiliation?: string;
}

export class SubmitManuscriptDto {
  @IsString()
  title: string;

  @IsInt()
  @Type(() => Number)
  journalId: number;

  @IsString()
  abstract: string;

  @IsOptional()
  @IsString()
  keywords?: string;

  @IsOptional()
  @IsString()
  articleType?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ManuscriptAuthorDto)
  authors: ManuscriptAuthorDto[];

  @IsOptional()
  pdfUrl?: string;

  @IsOptional()
  @IsString()
  submitterName?: string;

  @IsOptional()
  @IsEmail()
  submitterEmail?: string;

  @IsOptional()
  @IsString()
  submitterAddress?: string;

  @IsOptional()
  @IsString()
  submitterCountry?: string;
}
