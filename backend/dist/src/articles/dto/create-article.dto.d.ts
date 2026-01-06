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
    wordUrl?: string;
    articleType?: string;
    keywords?: string;
    volumeNo?: string;
    issueNo?: string;
    issueMonth?: string;
    year?: string;
    specialIssue?: string;
    firstPageNumber?: string;
    lastPageNumber?: string;
    doi?: string;
    correspondingAuthorDetails?: string;
    citeAs?: string;
    country?: string;
    publishedAt?: Date;
    submitterName?: string;
    submitterEmail?: string;
    submitterAddress?: string;
    submitterCountry?: string;
    inPressMonth?: string;
    inPressYear?: string;
    showInInpressCards?: boolean;
    issueId?: number;
}
export {};
