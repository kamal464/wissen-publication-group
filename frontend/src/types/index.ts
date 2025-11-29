export type Journal = {
  id: number;
  title: string;
  description?: string;
  issn?: string;
  shortcode?: string;
  coverImage?: string;
  publisher?: string;
  accessType?: string;
  subjectArea?: string;
  category?: string;
  discipline?: string;
  impactFactor?: string;
  updatedAt?: string;
  createdAt?: string;
  _count?: {
    articles: number;
  };
};

export type Author = {
  id: number;
  name: string;
  email: string;
  affiliation?: string;
  createdAt?: string;
};

export type Article = {
  id: number;
  title: string;
  abstract: string;
  authors: Author[];
  journal: {
    id: number;
    title: string;
    issn?: string;
    publisher?: string;
  };
  journalId: number;
  status: string;
  pdfUrl?: string;
  submittedAt: string;
  publishedAt?: string;
};

export type NavigationItem = {
  label: string;
  href: string;
};
