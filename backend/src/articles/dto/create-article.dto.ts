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
}
