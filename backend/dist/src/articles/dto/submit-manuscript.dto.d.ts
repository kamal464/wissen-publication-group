declare class ManuscriptAuthorDto {
    name: string;
    email: string;
    affiliation?: string;
}
export declare class SubmitManuscriptDto {
    title: string;
    journalId: number;
    abstract: string;
    keywords?: string;
    articleType?: string;
    authors: ManuscriptAuthorDto[];
    pdfUrl?: string;
    submitterName?: string;
    submitterEmail?: string;
    submitterAddress?: string;
    submitterCountry?: string;
}
export {};
