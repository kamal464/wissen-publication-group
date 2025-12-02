import { CreateArticleDto } from './create-article.dto';
declare const UpdateArticleDto_base: import("@nestjs/mapped-types").MappedType<Partial<CreateArticleDto>>;
export declare class UpdateArticleDto extends UpdateArticleDto_base {
    fulltextImages?: string;
    heading1Title?: string;
    heading1Content?: string;
    heading2Title?: string;
    heading2Content?: string;
    heading3Title?: string;
    heading3Content?: string;
    heading4Title?: string;
    heading4Content?: string;
    heading5Title?: string;
    heading5Content?: string;
}
export {};
