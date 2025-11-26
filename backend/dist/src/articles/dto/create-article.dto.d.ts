declare class AuthorDto {
    name: string;
    email: string;
    affiliation?: string;
}
export declare class CreateArticleDto {
    title: string;
    abstract: string;
    authors: AuthorDto[];
    journalId: number;
    status?: string;
    pdfUrl?: string;
}
export {};
